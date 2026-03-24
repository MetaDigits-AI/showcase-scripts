Render and optimize a showcase animation.

1. Find the Remotion project in the current directory or the directory specified by $ARGUMENTS
2. Run `npm install` if node_modules is missing
3. Run `npx remotion render <CompositionId> --codec=gif out/raw.gif`
4. Optimize to WebP: `gif2webp -lossy -q 80 out/raw.gif -o out/final.webp`
5. Also create an optimized GIF fallback:
   ```
   ffmpeg -y -i out/raw.gif \
     -vf "fps=10,scale=468:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=diff[p];[s1][p]paletteuse=dither=floyd_steinberg" \
     -loop 0 out/final.gif
   ```
6. Report file sizes for both outputs
7. Show the WebP preview using the Read tool
