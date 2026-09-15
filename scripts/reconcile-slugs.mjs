#!/usr/bin/env node
/**
 * Reconcile the curated Sweatpals slug lists with what the host page actually
 * lists, and commit the result.
 *
 * Run by .github/workflows/reconcile-schedule.yml every 3 days, and on demand
 * when /studio fires a workflow_dispatch. Safe to run locally with --dry-run.
 *
 * A non-dry-run refuses to write unless the current branch is `main` (pass
 * --allow-any-branch to override) — this only ever writes/commits/pushes on
 * the branch CI actually runs on.
 */
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { fetchHostScan, probeSlug } from '../api/_sweatpals.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from '../api/_schedule-slugs.js'
import { classify } from '../api/_reconcile.js'
import { renderSlugsFile } from '../api/_slugfile.js'
import { formatReport, sendReport } from '../api/_notify.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = join(ROOT, 'api', '_schedule-slugs.js')
const DRY = process.argv.includes('--dry-run')
const ALLOW_ANY_BRANCH = process.argv.includes('--allow-any-branch')

const recipients = (process.env.RECONCILE_NOTIFY_TO || '')
  .split(',').map((s) => s.trim()).filter(Boolean)

async function sendNotification(report) {
  console.log(`\n--- ${report.subject} ---\n${report.text}\n`)
  if (DRY) return
  // sendReport() never throws — a missing key, empty recipients, a Brevo
  // 401, rate limiting, or a network failure all come back as `false`
  // rather than an exception, so a failed notification can never fail a run
  // that already committed a good change. But that return value must not be
  // discarded either: a self-healing job that goes quiet when it breaks is
  // worse than no job. If the send failed, say so loudly and mark the run
  // red so a human notices the notification path is broken, not just the
  // one email that went missing.
  const sent = await sendReport(report, { apiKey: process.env.BREVO_API_KEY, to: recipients })
  if (!sent) {
    console.error(
      '[reconcile] notification failed to send (missing BREVO_API_KEY/RECONCILE_NOTIFY_TO, ' +
        'an unauthorized/rate-limited Brevo response, or a network failure)',
    )
    process.exitCode = 1
  }
}

async function notify(payload) {
  await sendNotification(formatReport(payload))
}

async function main() {
  const curated = { special: SPECIAL_EVENT_SLUGS, programs: PROGRAM_SLUGS }
  const expectedCount = curated.special.length + curated.programs.length

  const { aliases: discovered, healthy, rejected } = await fetchHostScan(expectedCount)
  console.log(`[reconcile] host page lists ${discovered.length} aliases (healthy: ${healthy})`)

  if (!healthy) {
    console.error('[reconcile] scan unhealthy; skipping classification')
    await notify({ added: [], removed: [], blocked: null, scanOk: false, rejected })
    process.exitCode = 1
    return
  }

  const all = [...new Set([...curated.special, ...curated.programs, ...discovered])]
  const probes = Object.fromEntries(
    await Promise.all(all.map(async (s) => [s, await probeSlug(s)])),
  )

  const result = classify({ curated, discovered, probes, now: new Date() })

  if (result.blocked) {
    console.error(`[reconcile] BLOCKED (${result.blocked.guard}): ${result.blocked.reason}`)
    await notify({
      added: result.added,
      removed: result.removed,
      blocked: result.blocked,
      scanOk: result.blocked.guard !== 'empty-scan',
    })
    process.exitCode = 1
    return
  }

  if (!result.added.length && !result.removed.length) {
    // The curated list itself isn't changing, but a slug can still be
    // `orphan` (delisted while it still has a future instance) — classify()
    // keeps it unconditionally, so it never shows up as added/removed and
    // would otherwise go completely unreported. That is the exact
    // early-warning signal this project exists to surface, so it must not
    // exit quietly just because nothing was written.
    const orphans = result.verdicts.filter((v) => v.verdict === 'orphan')
    if (orphans.length) {
      console.log(`[reconcile] no list changes, but ${orphans.length} delisted-but-scheduled program(s) to flag`)
      await notify({
        added: [],
        removed: [],
        blocked: null,
        scanOk: true,
        verdicts: result.verdicts,
      })
    } else {
      console.log('[reconcile] no changes')
    }
    return
  }

  for (const a of result.added) console.log(`  + ${a.name}`)
  for (const r of result.removed) console.log(`  - ${r.name}`)

  const text = renderSlugsFile({
    special: result.next.special,
    programs: result.next.programs,
    updatedAt: new Date().toISOString(),
  })

  if (DRY) {
    console.log('\n[reconcile] --dry-run, not writing\n')
    console.log(text)
    return
  }

  // Refuse to write/commit/push from anywhere but the branch CI runs on —
  // otherwise a stray local `pnpm reconcile` pushes to a feature branch.
  const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).trim()
  if (branch !== 'main' && !ALLOW_ANY_BRANCH) {
    console.error(
      `[reconcile] refusing to write on branch '${branch}' (use --dry-run, or ` +
        '--allow-any-branch to override)',
    )
    process.exitCode = 1
    return
  }

  writeFileSync(TARGET, text)

  const summary = [
    result.added.length ? `+${result.added.length}` : null,
    result.removed.length ? `-${result.removed.length}` : null,
  ].filter(Boolean).join(' ')

  const subject = `chore(schedule): sync Sweatpals programs (${summary})`
  const body = [
    ...result.added.map((a) => `Added: ${a.name}`),
    ...result.removed.map((r) => `Removed: ${r.name}`),
  ].join('\n')

  const git = (...args) => execFileSync('git', args, { cwd: ROOT, stdio: 'inherit' })

  // -c scopes the identity to this one invocation instead of rewriting the
  // clone's permanent git config. --only commits exactly this path
  // regardless of anything else sitting in the index.
  git(
    '-c', 'user.name=love-and-lob-bot',
    '-c', 'user.email=info@loveandlob.co',
    'commit', '--only', 'api/_schedule-slugs.js', '-m', subject, '-m', body,
  )

  try {
    git('push')
  } catch (err) {
    console.error('[reconcile] push failed, retrying after pull --rebase:', String(err))
    try {
      git('pull', '--rebase')
      git('push')
    } catch (retryErr) {
      console.error('[reconcile] push retry failed:', String(retryErr))
      await sendNotification({
        subject: 'Schedule: commit succeeded but push failed',
        text: [
          'The reconcile job committed a schedule update locally but could not',
          'push it to the repository, even after retrying once with a rebase.',
          '',
          String(retryErr),
          '',
          'The commit is sitting in the CI checkout and the site is still',
          'serving the last known-good program list, but this needs a human',
          'to resolve the push manually.',
        ].join('\n'),
      })
      process.exitCode = 1
      return
    }
  }

  await notify({
    added: result.added,
    removed: result.removed,
    blocked: null,
    scanOk: true,
    verdicts: result.verdicts,
  })
}

main().catch((err) => {
  console.error('[reconcile] fatal:', err)
  process.exitCode = 1
})
