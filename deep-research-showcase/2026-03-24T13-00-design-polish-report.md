# Deep Research Animation — Design Polish Report

**Reviewed by:** Design audit via /design-review
**Date:** 2026-03-24
**File:** `deep-research-showcase/src/DeepResearchAnimation.tsx`
**Output:** `app/web/public/image/homepage-showcase/deep-research.gif`

---

## First Impression

The animation communicates the right *idea* — a multi-phase research pipeline that produces a structured report. The flow (query → progress → report → sources) is clear and tells the story well.

But it doesn't look like it belongs to Mathos. Compared to the existing `flashcard.gif` and `video.gif` (which are clean, white-background, minimal screen captures of the actual product), this animation looks like a generic tech demo — gray background, oversaturated colors for GIF survival, system fonts, and hardcoded color values that don't match the brand.

**One word: Disconnected.**

---

## Issues & Recommendations

### FINDING-001: Colors are wrong — not using Mathos brand palette
**Impact: High**

The animation hardcodes contrast-boosted colors that don't match Mathos:

| Element | Current (animation) | Mathos brand token | Fix |
|---------|--------------------|--------------------|-----|
| Primary blue | `#1565C0` | `#2196F3` (COLOR_BLUE[500]) | Use brand blue |
| Success green | `#1B5E20` | `#66BB6A` (COLOR_GREEN[500]) | Use brand green |
| Text primary | `#000000` | `rgba(0,0,0,0.87)` (BLACK_GREY[800]) | Use 0.87 opacity |
| Text secondary | `#333333` | `rgba(0,0,0,0.6)` (BLACK_GREY[600]) | Use 0.6 opacity |
| Divider | `#AAAAAA` | `rgba(0,0,0,0.20)` (BLACK_GREY[300]) | Use brand divider |
| Background | `#D6D6D6` | `#FFFFFF` | Use white, or very light gray `#FAFAFA` |
| Header BG | `#E8E8E8` | `#FFFFFF` (background.paper) | Use white |

**Why the colors were oversaturated:** GIF quantization (128 colors) washes out `rgba` transparency. The fix is NOT to change the brand colors — it's to render at higher quality (256 colors) or export as WebP/MP4 instead.

**Recommended replacement block:**
```ts
// Match Mathos theme tokens exactly
const BLUE = "#2196F3";        // COLOR_BLUE[500] — primary.main
const BLUE_LIGHT = "#E5F3FC";  // COLOR_BLUE[100] — background.lightBlue
const GREEN = "#66BB6A";       // COLOR_GREEN[500] — success.main
const TEXT_PRIMARY = "rgba(0,0,0,0.87)";   // BLACK_GREY[800]
const TEXT_SECONDARY = "rgba(0,0,0,0.6)";  // BLACK_GREY[600]
const DIVIDER = "rgba(0,0,0,0.20)";        // BLACK_GREY[300]
const BG = "#FFFFFF";           // background.default (light)
const BG_CANVAS = "#FAFAFA";    // Subtle off-white for canvas behind card
```

---

### FINDING-002: Font doesn't match — should use Inter
**Impact: High**

Current: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
Mathos brand: `Inter, sans-serif` (from `TYPOGRAPHY.fontFamily.default`)

**Fix:** Change fontFamily to `"Inter", sans-serif`. Since Remotion renders in headless Chromium, Inter needs to be available. Options:
1. Install Inter via `@fontsource/inter` npm package in the Remotion project
2. Or use a Google Fonts `<link>` in the component (Remotion supports this)

```bash
cd deep-research-showcase
npm install @fontsource/inter
```

Then in the animation:
```ts
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

// In AbsoluteFill style:
fontFamily: '"Inter", sans-serif',
```

---

### FINDING-003: Font sizes don't follow the Mathos type scale
**Impact: Medium**

Current sizes are arbitrary. Mathos uses a defined scale:

| Element | Current | Mathos scale | Fix |
|---------|---------|-------------|-----|
| Header title | 13px | 14px (`sm`) | Bump to 14px |
| Header query text | 11px | 12px (`xs`) | Bump to 12px |
| Phase labels | 12px | 12px (`xs`) | OK |
| Report headings | 14px | 14px (`sm`) | OK |
| Body text | 12px | 12px (`xs`) | OK — small is intentional for the compact preview |
| Source citations | 11-12px | 12px (`xs`) | Normalize to 12px |
| Source domain | 10px | 10px (`2xs`) | OK |
| Metadata chips | 10px | 10px (`2xs`) | OK |

Font weights should use the Mathos tokens:
- Headings: `600` (semibold) — already correct
- Body: `400` (normal) — already correct
- Chips/labels: `500` (medium) — already correct

---

### FINDING-004: Canvas background should be white, not gray
**Impact: High**

The existing showcase GIFs (`flashcard.gif`, `video.gif`) use **white backgrounds** — they look like screenshots of the actual Mathos UI. The deep research animation uses `#D6D6D6` (medium gray), which makes it look like a generic demo, not a product screenshot.

**Fix:** Change `BG_COLOR` to `#FFFFFF` or `#FAFAFA`. The card should float with its `boxShadow` providing the visual separation — the same way MUI cards look on white backgrounds in the real app.

```ts
const BG_CANVAS = "#FAFAFA";  // Very subtle off-white, or just "#FFFFFF"
```

---

### FINDING-005: Card border radius should match MUI theme
**Impact: Medium**

Current: `borderRadius: 12`. Mathos MUI cards use `borderRadius` from the theme's `shape.borderRadius`. Check the card component:

Looking at `app/web/theme/component/card.ts`, the standard MUI card border-radius in Mathos should be consistent. 12px is reasonable, but verify it matches. If the actual rendered deep research component uses a different radius (e.g., 8px from the theme), match that.

**Recommendation:** Keep 12px but verify against the actual rendered component.

---

### FINDING-006: Spinner stroke track is too bright
**Impact: Polish**

The spinner background track uses `#90C4EE` — a strong blue tint. In MUI's `CircularProgress`, the track is typically a very faint version of the primary color or transparent.

**Fix:**
```ts
// Spinner track
stroke: "rgba(33, 150, 243, 0.15)"  // 15% of BLUE — matches MUI CircularProgress light track
```

---

### FINDING-007: Progress bar track color too visible
**Impact: Polish**

Same issue — `#90C4EE` is too saturated for the progress bar background. MUI `LinearProgress` uses a very faint primary tint.

**Fix:**
```ts
// Progress bar track
backgroundColor: "rgba(33, 150, 243, 0.12)"  // Matches MUI LinearProgress buffer
```

---

### FINDING-008: Missing Mathos logo/branding in the animation
**Impact: Medium**

The `video.gif` showcase includes a "Mathos AI" watermark in the bottom-right corner. The deep research animation has none. This makes it feel unbranded compared to other showcases.

**Fix:** Add a subtle Mathos logo or "Mathos AI" text in the bottom-right corner of the card or the canvas. Use the same style as `video.gif`.

---

### FINDING-009: Timing feels rushed in the report phase
**Impact: Medium**

The progress phases take 110 frames (~3.7s) which feels right — the user sees each phase animate. But the report content (summary + findings + sources + chips) all appears in ~85 frames (~2.8s) which is tight for the amount of content.

**Recommended timing adjustment:**
```ts
// Current: report appears frame 155-240 (85 frames = 2.8s)
// Better: extend total to 270 frames (9s) for breathing room

// Adjusted timeline:
// 155-180: Report summary fades in (25 frames)
// 180-200: Key findings fade in (20 frames)
// 200-225: Sources fade in (25 frames)
// 225-250: Metadata chips appear (25 frames)
// 250-270: Hold on final state (20 frames = 0.67s lingering)
```

In `Root.tsx`:
```tsx
durationInFrames={270}  // Was 240
```

---

### FINDING-010: Report content should show markdown-style formatting hints
**Impact: Polish**

The report section uses plain text. Adding subtle visual cues that this is a *structured report* would make it clearer what the feature produces:

- Use a slightly bolder weight or blue tint on `[1][2]` inline citations
- Add a subtle left-border or indent to the Key Findings bullet list
- Consider a faint background tint (`COLOR_BLUE[100]`) behind the report section to visually separate it from the progress area

---

## Summary of Changes

### Priority 1 (Must fix — brand mismatch)
1. **FINDING-001:** Replace all color constants with Mathos brand tokens
2. **FINDING-002:** Switch font to Inter
3. **FINDING-004:** Change canvas background to white/off-white

### Priority 2 (Should fix — polish)
4. **FINDING-003:** Align font sizes to Mathos type scale
5. **FINDING-008:** Add Mathos branding watermark
6. **FINDING-009:** Extend duration to 9s for better pacing

### Priority 3 (Nice to have)
7. **FINDING-005:** Verify border-radius matches theme
8. **FINDING-006:** Fix spinner track opacity
9. **FINDING-007:** Fix progress bar track opacity
10. **FINDING-010:** Add markdown formatting hints

### Export optimization
Instead of rendering at 30fps → downsampling to 10fps with 128 colors (which destroys the `rgba` brand colors), consider:
- **Option A:** Render directly at 15fps with 256 colors → better color fidelity, ~600-800KB
- **Option B:** Export as WebP animation (lossless, much smaller, supported by all modern browsers) → requires changing the `<Image>` component to support WebP
- **Option C:** Export as MP4 (~50KB, perfect quality) → requires `<video>` element instead of `<Image>` in tool-pills

**Recommendation:** Option A is the fastest path. Option B is ideal if you want the best quality/size ratio.

---

## Quick Reference: Updated Color Map

Copy this block into `DeepResearchAnimation.tsx` to fix FINDING-001:

```ts
// ============================================
// Mathos Brand Tokens (from theme/tokens/color.ts)
// ============================================
const BLUE_PRIMARY = "#2196F3";           // COLOR_BLUE[500] — primary.main
const BLUE_LIGHT_BG = "rgb(229,243,252)"; // COLOR_BLUE[100] — background.lightBlue
const BLUE_ALPHA_15 = "rgba(33,150,243,0.15)"; // Spinner/progress track
const GREEN_SUCCESS = "#66BB6A";          // COLOR_GREEN[500] — success.main
const TEXT_PRIMARY = "rgba(0,0,0,0.87)";  // BLACK_GREY[800] — text.primary
const TEXT_SECONDARY = "rgba(0,0,0,0.6)"; // BLACK_GREY[600] — text.secondary
const TEXT_DISABLED = "rgba(0,0,0,0.38)"; // BLACK_GREY[500] — pending phase labels
const DIVIDER = "rgba(0,0,0,0.20)";      // BLACK_GREY[300] — divider
const BG_PAPER = "#FFFFFF";               // background.paper
const BG_CANVAS = "#FAFAFA";              // Subtle off-white canvas
```

---

**STATUS: DONE**
All findings are design-only — no code changes were made to the Mathos project. This report provides exact values and code snippets for engineers to implement.
