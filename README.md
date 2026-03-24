# Showcase Scripts

Programmatic animation scripts for Mathos product feature showcases. Built with [Remotion](https://www.remotion.dev/) — React-based video framework.

## Projects

| Folder | Feature | Output | Status |
|--------|---------|--------|--------|
| `deep-research-showcase/` | Deep Research hover animation | GIF (468x360, 9s) | v4 shipped |

## Quick Start

```bash
cd deep-research-showcase
npm install
npx remotion studio    # Live preview at localhost:3000
npx remotion render DeepResearch --codec=gif out/deep-research.gif  # Render
```

## Workflow

1. Edit the React animation in `src/`
2. Preview with `npx remotion studio`
3. Render with `npx remotion render`
4. Optimize with ffmpeg (see implementation reports for exact commands)
5. Copy final output to `mathos/app/web/public/image/homepage-showcase/`
