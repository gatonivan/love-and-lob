# Love & Lob — Project Instructions

## Project Overview

Love & Lob is a scroll-driven, 3D-first brand website built with React 19, Three.js (via React Three Fiber), and GSAP. A full-screen WebGL canvas renders interactive 3D scenes with DOM overlays for UI. Data (events, blog posts) is fetched at build time and served as static JSON.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| 3D | Three.js, @react-three/fiber, @react-three/drei, postprocessing |
| Animation | GSAP + @gsap/react |
| State | Zustand |
| Styling | Plain CSS (co-located with components) |
| Build | Vite 7, vite-plugin-glsl |
| Package Manager | pnpm |
| Deployment | Vercel (SPA routing) |
| Linting | ESLint (flat config) with TypeScript ESLint, React Hooks, React Refresh |

## Project Structure

```
src/
├── components/
│   ├── canvas/           # Three.js / R3F components
│   │   ├── scenes/       # Scene compositions (HeroScene, CourtScene, etc.)
│   │   ├── models/       # 3D models (GLB loaders, materials, interaction)
│   │   ├── shaders/      # Custom shader materials
│   │   ├── effects/      # Post-processing (bloom, vignette, chromatic aberration)
│   │   └── Experience.tsx # Root canvas wrapper
│   └── ui/               # DOM overlays rendered on top of canvas
│       └── *.css          # Co-located component styles
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
│   └── sceneStore.ts     # Global scene state (scroll, sections, visibility, transitions)
├── types/                # Shared TypeScript interfaces
├── shaders/              # GLSL shader files (.vert, .frag)
├── assets/               # Dev-time assets (fonts, textures, models, data)
├── App.tsx               # Root component
└── main.tsx              # Entry point

public/
├── models/               # GLB files served at runtime
├── events.json           # Build-time generated from Luma API
└── posts.json            # Build-time generated from Substack

scripts/
├── fetch-events.js       # Luma API -> public/events.json
└── fetch-posts.js        # Substack -> public/posts.json
```

## Architecture Patterns

### Component Organization
- **Canvas components** (`components/canvas/`) — R3F components rendered inside `<Canvas>`. Use `useFrame`, `useThree`, `useGLTF` from the R3F/drei ecosystem.
- **UI components** (`components/ui/`) — Standard React DOM components rendered as overlays on top of the canvas. Use GSAP for enter/exit transitions.
- Never mix DOM and canvas rendering in the same component.

### State Management
- Single Zustand store (`sceneStore.ts`) holds all global state: scroll progress/velocity, active section, overlay visibility, transition flags, and UI preferences.
- Use selector subscriptions in components (`useSceneStore(s => s.property)`).
- Use `useSceneStore.getState()` for event handlers and non-reactive reads.
- Keep component-local state in `useState`/`useRef` where it doesn't need to be shared.

### Animation & Transitions
- GSAP for DOM transitions (overlays, opacity, transforms). Use `gsap.to()` with ease functions.
- `useFrame` for per-frame 3D updates (rotation, position, material uniforms).
- Scroll velocity drives 3D interactions via the Zustand store.

### Data Flow
- Events and blog posts are fetched at build time via scripts in `scripts/` to avoid CORS issues.
- Static JSON files in `public/` are loaded at runtime with `fetch()`.
- Environment variables prefixed with `VITE_` (e.g., `VITE_LUMA_API_KEY`).

## Code Conventions

### TypeScript
- Strict mode is enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`).
- All components and hooks must be fully typed — no `any` unless absolutely unavoidable.
- Shared interfaces live in `src/types/index.ts`.

### Components
- Functional components only with arrow function syntax.
- Props interfaces defined inline or in `types/` for shared types.
- Co-locate CSS files with their components (e.g., `Navigation.tsx` + `Navigation.css`).

### Styling
- Plain CSS, no Tailwind or CSS-in-JS.
- BEM-like naming conventions (`.nav`, `.nav-links`, `.nav-links a`).
- Responsive breakpoints: 480px (mobile), scale up from there.
- Color palette: background `#0a0a0a`, text `#F1F0E2`, accent `#d8e84d`.
- Typography: Playfair Display 900 (headings), Inter 400–700 (body).

### Hooks
- Custom hooks in `src/hooks/` — prefix with `use`.
- Hooks should be single-purpose and composable.
- R3F hooks (`useFrame`, `useThree`) only inside canvas components.

### Shaders
- GLSL files in `src/shaders/`, compiled by `vite-plugin-glsl`.
- Use `three-custom-shader-material` for shader integration with Three.js materials.

## Git Conventions

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `perf:`, `style:`
- Imperative mood, present tense: "add overlay" not "added overlay"
- Subject line under 72 characters
- No AI attribution footers

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint |
| `node scripts/fetch-events.js` | Regenerate events.json from Luma API |
| `node scripts/fetch-posts.js` | Regenerate posts.json from Substack |

## Performance Considerations

- **Code splitting**: Three.js, GSAP, and vendor chunks are split manually in `vite.config.ts`.
- **Adaptive rendering**: Uses `<AdaptiveDpr>` and `<PerformanceMonitor>` from drei.
- **Material cleanup**: Strip specular, envMap, and metalness from GLB baked materials to avoid visual artifacts.
- **Mobile scaling**: Models scale responsively based on viewport dimensions.
- **Audio**: Web Audio API synthesized sounds — no audio file downloads.

## Known Patterns & Gotchas

- The canvas is full-screen; UI is layered on top with `pointer-events: none` (toggled to `auto` when overlays are active).
- Overlay transitions (shop, schedule, words) involve both camera zoom (3D) and DOM fade (UI), orchestrated through the Zustand store.
- GLB models are in `public/models/` and loaded with `useGLTF` — paths are relative to the Vite base path.
- Build-time scripts (`fetch-events.js`, `fetch-posts.js`) require `VITE_LUMA_API_KEY` in `.env` for event fetching.
- Vite base path is set to `/love-and-lob/` for GitHub Pages compatibility.
