Deploy a showcase animation output to the Mathos web app.

1. Find the latest output file in the current showcase project's `output/` folder
2. Determine the target path: `mathos/app/web/public/image/homepage-showcase/<feature-name>.<ext>`
3. If $ARGUMENTS is provided, use it as the Mathos repo path. Otherwise default to `~/code/mathos`
4. Copy the output file to the Mathos public assets folder
5. Check if `tool-pills.tsx` references the correct filename and extension
6. Report: file copied, size, and whether tool-pills.tsx needs updating
