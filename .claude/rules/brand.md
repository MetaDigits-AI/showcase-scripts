---
paths:
  - "*/src/*.tsx"
---

# Mathos Brand Rules

## Color Constants

Every animation file must define brand colors at the top as named constants.
Never use raw hex values inline. Always reference the Mathos token name in a comment.

```tsx
// Mathos Brand Tokens (from theme/tokens/color.ts)
const BLUE = "#2196F3";                    // COLOR_BLUE[500] — primary.main
const BLUE_LIGHT = "rgb(229, 243, 252)";   // COLOR_BLUE[100]
const BLUE_ALPHA_15 = "rgba(33,150,243,0.15)"; // Spinner/progress tracks
const GREEN = "#66BB6A";                   // COLOR_GREEN[500] — success.main
const TEXT_PRIMARY = "rgba(0,0,0,0.87)";   // BLACK_GREY[800]
const TEXT_SECONDARY = "rgba(0,0,0,0.6)";  // BLACK_GREY[600]
const DIVIDER = "rgba(0,0,0,0.20)";       // BLACK_GREY[300]
const BG_PAPER = "#FFFFFF";               // background.paper
const BG_CANVAS = "#FAFAFA";              // background.default
```

## Forbidden

- No hardcoded hex colors without a token comment
- No system font stacks — always `"Inter", sans-serif`
- No arbitrary font sizes — use the Mathos type scale (10/11/12/13/14px)
- No oversaturating colors to "survive GIF quantization" — switch to WebP instead
- No emoji in animations
- No purple/violet gradients (AI slop pattern)

## Logo

- Always include Mathos logo in a fixed footer bar
- Use `mathos-logo-full.png` (cube + "Mathos AI" text) via `staticFile()`
- Display at 14-16px height, 0.5 opacity
- Logo must be visible from the first frame of the animation
