# Deep Research Showcase Animation — Implementation Report

## Overview

This document explains the full process of creating the Deep Research hover animation using [Remotion](https://www.remotion.dev/), a React-based programmatic video framework. The output is an 8-second looping GIF displayed when users hover over the "Deep Research" pill on the Mathos homepage.

**Final output:** `deep-research.gif` (546KB, 468x360px, 10fps, 8s loop)
**Location in Mathos:** `app/web/public/image/homepage-showcase/deep-research.gif`

---

## Project Structure

```
mathos-deep-research-animation/
└── deep-research-showcase/
    ├── package.json          # Dependencies (remotion, react, typescript)
    ├── tsconfig.json         # TypeScript config
    ├── src/
    │   ├── index.ts          # Remotion entry point (registerRoot)
    │   ├── Root.tsx           # Composition registry (dimensions, fps, duration)
    │   └── DeepResearchAnimation.tsx  # The actual animation component
    └── out/                  # Rendered output files
        ├── deep-research.gif          # Raw render (1.5MB, 30fps)
        ├── deep-research-v3.gif       # Final raw render (1.6MB, 30fps)
        └── deep-research-v3-opt.gif   # Optimized (546KB, 10fps) ← this is what ships
```

---

## Step-by-Step Process

### Step 1: Project Setup

Created a standalone npm project (not inside the Mathos repo) with minimal Remotion deps:

```bash
mkdir -p mathos-deep-research-animation/deep-research-showcase
cd mathos-deep-research-animation/deep-research-showcase
npm init -y
npm install remotion @remotion/cli @remotion/renderer react react-dom @types/react typescript
```

**Why standalone?** Remotion pulls in heavy deps (~50MB including Chromium for rendering). We don't want this in the Mathos project — we only need the final GIF output.

### Step 2: Remotion Boilerplate (3 files)

**`src/index.ts`** — Entry point that registers the root component:
```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```

**`src/Root.tsx`** — Defines the composition (canvas size, duration, framerate):
```tsx
import { Composition } from "remotion";
import { DeepResearchAnimation } from "./DeepResearchAnimation";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DeepResearch"
    component={DeepResearchAnimation}
    durationInFrames={240}   // 240 frames ÷ 30fps = 8 seconds
    fps={30}
    width={468}              // Matches tool-pills showcase container
    height={360}
  />
);
```

**Key decisions:**
- **468px width** — matches the Popper container in `tool-pills.tsx` (`width={468}`)
- **360px height** — enough to show header + progress + report + sources
- **30fps** — smooth for rendering, downsampled to 10fps in the optimization step
- **240 frames** — 8 seconds total, enough to show the full research flow

### Step 3: Animation Design (`DeepResearchAnimation.tsx`)

The animation is a single React component that uses `useCurrentFrame()` to drive all motion. No external animation libraries — pure Remotion `interpolate()` and `spring()`.

#### Architecture

```
Frame 0-10:     Card fades in + scales from 0.95→1.0 (spring)
Frame 10-45:    Query text types in character by character
Frame 45-75:    Phase 1 "Planning search queries" → spinner → checkmark
Frame 75-105:   Phase 2 "Searching the web" → spinner → checkmark
Frame 105-130:  Phase 3 "Analyzing 12 sources" → spinner → checkmark
Frame 130-155:  Phase 4 "Synthesizing report" → spinner → checkmark
Frame 155-170:  Progress phases cross-fade out
Frame 155-175:  Report content fades in + slides up
Frame 190-210:  Sources section fades in
Frame 215-230:  Metadata chips fade in + slide up
Frame 230-240:  Hold on final state
```

#### Key Remotion APIs Used

1. **`useCurrentFrame()`** — returns the current frame number (0-239). This is the clock that drives everything.

2. **`interpolate(frame, inputRange, outputRange, options)`** — maps frame numbers to CSS values:
   ```ts
   // Fade in over frames 0-10
   const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

   // Progress bar fills from 0% to 100% over frames 45-155
   const progressWidth = interpolate(frame, [45, 155], [0, 100], {
     easing: Easing.out(Easing.cubic), // Decelerating curve
   });
   ```

3. **`spring({ frame, fps, from, to })`** — physics-based animation (used for the card entrance scale):
   ```ts
   const cardScale = spring({ frame, fps, from: 0.95, to: 1, durationInFrames: 20 });
   ```

#### Sub-Components

All inline SVGs (no icon library dependency):
- **`CheckIcon`** — green circle with white checkmark
- **`Spinner`** — rotating arc (rotation driven by `frame * 8 % 360`)
- **`SearchIcon`** — magnifying glass for the header
- **`SourceLink`** — numbered citation with title and domain

#### Color Constants

```ts
const BLUE = "#1565C0";       // Primary accent (links, spinner, progress bar)
const GREEN = "#1B5E20";      // Success checkmarks
const GRAY_TEXT = "#333333";   // Body text, secondary content
const DARK_TEXT = "#000000";   // Headings, phase labels
const LIGHT_BG = "#FFFFFF";    // Card background
const DIVIDER = "#AAAAAA";    // Borders
const BG_COLOR = "#D6D6D6";   // Canvas background (behind card)
const HEADER_BG = "#E8E8E8";  // Card header strip
```

**Note:** These are intentionally higher contrast than the actual Mathos theme because GIF color quantization (reducing to 128 colors) washes out subtle differences. You'll want to adjust these to match your brand — see "Customization Guide" below.

### Step 4: Rendering

```bash
npx remotion render DeepResearch --codec=gif out/deep-research-v3.gif
```

This opens a headless Chromium, renders each of the 240 frames as a screenshot, and encodes them into a GIF. Takes ~20 seconds on an M-series Mac.

**Output:** 1.6MB GIF at 30fps — too large for a hover preview.

### Step 5: Optimization with ffmpeg

The raw GIF is 1.6MB because it's 30fps with 256 colors per frame. We optimize by:
1. Reducing to 10fps (8s ÷ 10fps = 80 frames instead of 240)
2. Using a global 128-color palette with Floyd-Steinberg dithering

```bash
ffmpeg -y \
  -i out/deep-research-v3.gif \
  -vf "fps=10,scale=468:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=floyd_steinberg" \
  -loop 0 \
  out/deep-research-v3-opt.gif
```

**ffmpeg filter breakdown:**
- `fps=10` — downsample from 30fps to 10fps
- `scale=468:-1:flags=lanczos` — keep width, auto-height, high-quality scaling
- `split[s0][s1]` — duplicate the stream for palette generation
- `palettegen=max_colors=128:stats_mode=diff` — generate palette from frame differences (better for animations)
- `paletteuse=dither=floyd_steinberg` — apply palette with dithering to reduce banding

**Output:** 546KB — reasonable for a hover preview. The existing showcase GIFs are 84-94KB, but they're simpler (fewer colors/motion). For comparison, `flashcard.gif` is 94KB.

### Step 6: Deploy to Mathos

```bash
cp out/deep-research-v3-opt.gif /path/to/mathos/app/web/public/image/homepage-showcase/deep-research.gif
```

Referenced in `tool-pills.tsx`:
```ts
{
  translationKey: 'deepResearch',
  icon: SearchOutlined,
  featureType: FeatureType.DEEP_RESEARCH,
  isHot: true,
  showcaseImage: '/image/homepage-showcase/deep-research.gif',
}
```

---

## How to Reproduce / Modify

### Preview in browser (live editing)

```bash
cd mathos-deep-research-animation/deep-research-showcase
npx remotion studio
```

Opens `http://localhost:3000` with a Remotion Studio where you can:
- Scrub through the timeline frame by frame
- Edit the component and see changes instantly (hot reload)
- Adjust timing, colors, content without re-rendering

### Re-render after changes

```bash
# Raw render
npx remotion render DeepResearch --codec=gif out/deep-research.gif

# Optimize
ffmpeg -y \
  -i out/deep-research.gif \
  -vf "fps=10,scale=468:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=floyd_steinberg" \
  -loop 0 \
  out/deep-research-opt.gif

# Copy to Mathos
cp out/deep-research-opt.gif /path/to/mathos/app/web/public/image/homepage-showcase/deep-research.gif
```

### Alternative: Render as MP4 (better quality, smaller size)

```bash
npx remotion render DeepResearch --codec=h264 out/deep-research.mp4
```

MP4 would be ~50KB with perfect quality, but the tool-pills component uses `<Image>` with `unoptimized` for GIFs. To use MP4, you'd need to change the showcase to a `<video>` element.

---

## Customization Guide

### Matching Mathos Brand Colors

The current colors are intentionally oversaturated for GIF rendering. To match your actual theme, edit the constants at the top of `DeepResearchAnimation.tsx`:

```ts
// Replace these with your actual Mathos theme values:
const BLUE = "#1565C0";      // → theme.vars.palette.primary.main
const GREEN = "#1B5E20";     // → theme.vars.palette.success.main
const GRAY_TEXT = "#333333";  // → theme.vars.palette.text.secondary
const DARK_TEXT = "#000000";  // → theme.vars.palette.text.primary
const LIGHT_BG = "#FFFFFF";   // → theme.vars.palette.background.paper
const DIVIDER = "#AAAAAA";   // → theme.vars.palette.divider
const BG_COLOR = "#D6D6D6";  // → theme.vars.palette.background.default
const HEADER_BG = "#E8E8E8"; // → slightly darker than paper
```

**Tip:** GIF quantization will wash out colors. Test your brand colors, and if they look too faint in the GIF, bump saturation/contrast up ~20%. Preview with `npx remotion studio` before rendering.

### Mathos actual theme values (from `app/web/theme/color.ts`):
- Primary blue: `#2196F3` (COLOR_BLUE[500])
- Light blue: `rgba(51, 154, 240, 1)` (COLOR_BLUE[300])
- Background default (light): `#FFFFFF`
- Background default (dark): `#272728`
- Text primary (light): `rgba(0, 0, 0, 0.87)`
- Text secondary (light): `rgba(0, 0, 0, 0.6)`

### Changing the Content

Edit the hardcoded text in `DeepResearchAnimation.tsx`:
- **Query text** (line ~116): `"What are the latest breakthroughs in fusion energy?"`
- **Report summary** (line ~307-311): The paragraph text
- **Key findings** (lines ~326-334): The bullet points
- **Source citations** (lines ~368-384): Title and domain pairs
- **Metadata chips** (line ~398): `["2 rounds", "5 queries", "12 sources"]`

### Changing Timing

All timing is in the `// Timeline` comment block (lines 100-109). Adjust frame ranges:
```ts
// Make phases faster (20 frames each instead of 25-30):
const phaseStarts = [45, 65, 85, 105];
const phaseDurations = [20, 20, 20, 20];

// Make report appear sooner:
const reportOpacity = interpolate(frame, [125, 145], [0, 1], ...);
```

### Changing Dimensions

Edit `Root.tsx`:
```tsx
<Composition
  id="DeepResearch"
  component={DeepResearchAnimation}
  durationInFrames={180}  // shorter: 6 seconds
  fps={30}
  width={468}             // must match tool-pills container
  height={300}            // shorter card
/>
```

---

## Optimization Cheatsheet

| Goal | ffmpeg command modification |
|------|---------------------------|
| Smaller file | `max_colors=64` (from 128) — more banding but ~30% smaller |
| Smoother motion | `fps=15` (from 10) — ~50% larger file |
| Sharper text | `dither=none` — no dithering, hard edges |
| Softer look | `dither=sierra2_4a` — gentler dithering |
| Even smaller | Add `-vf "fps=8"` — 8fps is minimum for readable animation |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `remotion` | ^4.0.438 | Core animation framework |
| `@remotion/cli` | ^4.0.438 | CLI for `render` and `studio` commands |
| `@remotion/renderer` | ^4.0.438 | Headless rendering engine |
| `react` | ^19.2.4 | React (peer dep) |
| `react-dom` | ^19.2.4 | React DOM (peer dep) |
| `typescript` | ^6.0.2 | TypeScript compilation |
| `ffmpeg` (system) | any | Post-processing optimization (brew install ffmpeg) |

---

## References

- [Remotion Docs](https://www.remotion.dev/docs/)
- [Remotion + Claude Code guide](https://www.remotion.dev/docs/ai/claude-code)
- [Remotion interpolate() API](https://www.remotion.dev/docs/interpolate)
- [Remotion spring() API](https://www.remotion.dev/docs/spring)
- [ffmpeg GIF optimization guide](https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/)
