---
paths:
  - "*/src/*.tsx"
  - "*/src/*.ts"
---

# Remotion Animation Rules

## Component Structure

Every animation component must follow this pattern:

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const MyAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timeline comments at the top — every keyframe documented
  // ...

  return (
    <AbsoluteFill style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* content */}
    </AbsoluteFill>
  );
};
```

## Required Practices

- Always document the full timeline as comments at the top of the component
- Use `interpolate()` for linear animations, `spring()` for physics-based entrances
- Use `Easing.out(Easing.cubic)` for entrances, `Easing.inOut(Easing.cubic)` for scrolls
- Never use CSS `transition` — Remotion re-renders every frame, transitions are meaningless
- Import `@fontsource/inter` weights 400, 500, 600
- Use `staticFile()` for assets in `public/`
- All inline SVG icons — no icon library dependencies
- Composition config (fps, dimensions, duration) lives in `Root.tsx`, not the animation component

## Font Size Scale (from Mathos TYPOGRAPHY tokens)

- `10px` (2xs) — chips, metadata, domain labels
- `11px` — source citations, compact body text
- `12px` (xs) — body text, phase labels, query text
- `13px` — section headings within cards
- `14px` (sm) — card title, primary headings

## Timing Guidelines

- Card entrance: `spring()` over 15-20 frames
- Typewriter: 1 char per frame is natural reading speed
- Phase transitions: 20-30 frames each
- Content fade-in: 25-30 frames
- Scroll: `Easing.inOut(Easing.cubic)` over 100+ frames
- Hold on final state: minimum 20 frames (0.67s at 30fps)
