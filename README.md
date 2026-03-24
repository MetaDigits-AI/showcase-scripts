# Showcase Scripts

Programmatic animation scripts for [Mathos AI](https://mathos.ai) product feature showcases. Built with [Remotion](https://www.remotion.dev/) — React-based video framework.

## Projects

| Folder | Feature | Output | Format | Size |
|--------|---------|--------|--------|------|
| `deep-research-showcase/` | Deep Research hover animation | 468x360, 12s | WebP | 1.1MB |

## Quick Start

```bash
cd deep-research-showcase
npm install
npx remotion studio    # Live preview at localhost:3000
```

## Claude Code Commands

When working in this repo with Claude Code:

| Command | What it does |
|---------|-------------|
| `/project:render` | Render + optimize the current showcase to WebP and GIF |
| `/project:preview` | Open Remotion Studio for live editing |
| `/project:deploy` | Copy final output to the Mathos web app |

## Workflow

1. Edit the React animation in `src/`
2. Preview with `npx remotion studio`
3. Render with `/project:render` (or manually: `npx remotion render`)
4. Deploy with `/project:deploy` (copies to `mathos/app/web/public/image/homepage-showcase/`)

## Adding a New Showcase

1. Create a new folder: `<feature-name>-showcase/`
2. Copy `deep-research-showcase/package.json` and `tsconfig.json` as templates
3. Create `src/Root.tsx` with a `<Composition>` (468x360, 30fps)
4. Create `src/<FeatureName>Animation.tsx` — follow the brand rules in `.claude/rules/brand.md`
5. Add `@fontsource/inter` and logo assets to `public/`
6. Render, optimize, deploy

See `CLAUDE.md` for full conventions and brand token reference.
