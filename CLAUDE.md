# Showcase Scripts

Programmatic animation scripts for Mathos product feature showcases using [Remotion](https://www.remotion.dev/).

## Project Structure

```
showcase-scripts/
├── CLAUDE.md                          # This file — project instructions
├── .claude/
│   ├── settings.json                  # Permissions and tool config
│   ├── commands/                      # Custom slash commands
│   │   ├── render.md                  # /project:render — render + optimize
│   │   ├── preview.md                 # /project:preview — open Remotion Studio
│   │   └── deploy.md                  # /project:deploy — copy output to Mathos
│   └── rules/
│       ├── remotion.md                # Remotion animation conventions
│       └── brand.md                   # Mathos brand token rules
├── deep-research-showcase/            # Deep Research feature animation
│   ├── src/                           # Remotion source (TSX components)
│   ├── public/                        # Static assets (logos, images)
│   ├── output/                        # Final rendered output (WebP/GIF)
│   ├── package.json                   # Dependencies
│   └── *.md                           # Timestamped reports
└── README.md                          # Repo overview
```

## Tech Stack

- **Framework:** Remotion 4.x (React-based programmatic video)
- **Language:** TypeScript
- **Font:** Inter via `@fontsource/inter`
- **Render:** `npx remotion render` → GIF/MP4, then optimize with ffmpeg/gif2webp
- **Output target:** Next.js `<Image>` component in Mathos web app

## Build & Render Commands

```bash
# Install deps for a showcase project
cd <showcase-folder> && npm install

# Live preview with timeline scrubber
npx remotion studio

# Render to GIF (raw, large)
npx remotion render <CompositionId> --codec=gif out/raw.gif

# Optimize to WebP (preferred — 60% smaller than GIF)
gif2webp -lossy -q 80 out/raw.gif -o out/final.webp

# Optimize to GIF (when WebP not supported)
ffmpeg -y -i out/raw.gif \
  -vf "fps=8,scale=468:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" \
  -loop 0 out/final.gif
```

## Mathos Brand Tokens

All animations MUST use these exact values from `mathos/app/web/theme/tokens/color.ts`:

| Token | Value | Constant |
|-------|-------|----------|
| Primary blue | `#2196F3` | `COLOR_BLUE[500]` |
| Light blue bg | `rgb(229, 243, 252)` | `COLOR_BLUE[100]` |
| Success green | `#66BB6A` | `COLOR_GREEN[500]` |
| Text primary | `rgba(0,0,0,0.87)` | `BLACK_GREY[800]` |
| Text secondary | `rgba(0,0,0,0.6)` | `BLACK_GREY[600]` |
| Divider | `rgba(0,0,0,0.20)` | `BLACK_GREY[300]` |
| Background | `#FAFAFA` | Canvas behind card |
| Paper | `#FFFFFF` | Card background |
| Font | `"Inter", sans-serif` | `TYPOGRAPHY.fontFamily.default` |

**Never hardcode arbitrary colors.** If GIF quantization washes out rgba values, switch to WebP — don't oversaturate the brand colors.

## Animation Conventions

- **Dimensions:** 468x360px (matches Mathos tool-pills showcase container)
- **Render FPS:** 30fps (downsample in optimization step)
- **Output FPS:** 8-12fps for GIF, 10fps for WebP
- **Format preference:** WebP > GIF > MP4 (WebP needs `unoptimized` on Next.js `<Image>`)
- **Duration:** 8-14 seconds for hover previews
- **Easing:** `Easing.out(Easing.cubic)` for entrances, `Easing.inOut(Easing.cubic)` for scrolls
- **Mathos logo:** Always include in a fixed footer bar, visible from first frame

## File Naming

- Source: `src/<FeatureName>Animation.tsx`
- Composition root: `src/Root.tsx`
- Reports: `YYYY-MM-DDThh-mm-<type>-report.md`
- Output: `output/<feature-name>.<webp|gif>`

## Deploy to Mathos

Copy final output to: `mathos/app/web/public/image/homepage-showcase/<feature-name>.<webp|gif>`

Update `tool-pills.tsx` showcase image path if format changes.
