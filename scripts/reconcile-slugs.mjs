#!/usr/bin/env node
/**
 * Reconcile the curated Sweatpals slug lists with what the host page actually
 * lists, and commit the result.
 *
 * Run by .github/workflows/reconcile-schedule.yml every 3 days, and on demand
 * when /studio fires a workflow_dispatch. Safe to run locally with --dry-run.
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { fetchHostScan, probeSlug } from '../api/_sweatpals.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from '../api/schedule-slugs.js'
import { classify } from '../api/_reconcile.js'
import { renderSlugsFile } from '../api/_slugfile.js'
import { formatReport, sendReport } from '../api/_notify.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = join(ROOT, 'api', 'schedule-slugs.js')
const DRY = process.argv.includes('--dry-run')

const recipients = (process.env.RECONCILE_NOTIFY_TO || '')
  .split(',').map((s) => s.trim()).filter(Boolean)

async function notify(payload) {
  const report = formatReport(payload)
  console.log(`\n--- ${report.subject} ---\n${report.text}\n`)
  if (!DRY) await sendReport(report, { apiKey: process.env.BREVO_API_KEY, to: recipients })
}

async function main() {
  const curated = { special: SPECIAL_EVENT_SLUGS, programs: PROGRAM_SLUGS }
  const expectedCount = curated.special.length + curated.programs.length

  const { aliases: discovered, healthy } = await fetchHostScan(expectedCount)
  console.log(`[reconcile] host page lists ${discovered.length} aliases (healthy: ${healthy})`)

  if (!healthy) {
    console.error('[reconcile] scan unhealthy; skipping classification')
    await notify({ added: [], removed: [], blocked: null, scanOk: false })
    process.exit(1)
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
    process.exit(1)
  }

  if (!result.added.length && !result.removed.length) {
    console.log('[reconcile] no changes')
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

  if (readFileSync(TARGET, 'utf8') === text) {
    console.log('[reconcile] file already current')
    return
  }
  writeFileSync(TARGET, text)

  const summary = [
    result.added.length ? `+${result.added.length}` : null,
    result.removed.length ? `-${result.removed.length}` : null,
  ].filter(Boolean).join(' ')

  const body = [
    ...result.added.map((a) => `Added: ${a.name}`),
    ...result.removed.map((r) => `Removed: ${r.name}`),
  ].join('\n')

  const git = (...args) => execFileSync('git', args, { cwd: ROOT, stdio: 'inherit' })
  git('config', 'user.name', 'love-and-lob-bot')
  git('config', 'user.email', 'info@loveandlob.co')
  git('add', 'api/schedule-slugs.js')
  git('commit', '-m', `chore(schedule): sync Sweatpals programs (${summary})`, '-m', body)
  git('push')

  await notify({ added: result.added, removed: result.removed, blocked: null, scanOk: true })
}

main().catch((err) => {
  console.error('[reconcile] fatal:', err)
  process.exit(1)
})
