# Vice Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Ikball53/gta6-cover-art-01-v11/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Ikball53/gta6-cover-art-01-v11/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline multi-panel cover maker: drop in your own photos, arrange them in a
classic grid, hero-plus-duo, or triptych, grade them vice sunset, neon night,
or clean, letter a gradient title with a script subtitle and a license-plate
badge, then export a PNG at 1080 × 1080, 1080 × 1350, or 1920 × 1080.
Photos are read locally in the browser and never uploaded.

Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## Run locally

Serve the `app/` folder with any static file server and open `index.html` in
desktop Chrome. `node serve.ts` does this on http://localhost:8080.

## Entry program

`node main.ts` copies `app/` and `screenshots/` to the output folder and
writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`.
Set `MAKEFUN_OUTPUT_DIR` to choose the output folder outside the grader.
