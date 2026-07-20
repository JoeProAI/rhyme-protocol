# rhyme-protocol

Joe's (JoeProAI) AI music platform — rhymeprotocol.com. Songs made in Suno, AI music films generated shot-by-shot, published to X and the site. Next.js app with Firebase; video generation lives in `lib/video-gen/` and `lib/clipchain/`.

## Image/vision models — current versions (verified July 2026)

Use these, not the older IDs still hardcoded in parts of the lib:

- **GPT Image 2** — `gpt-image-2` (snapshot `gpt-image-2-2026-04-21`). Replaces `gpt-image-1` / `gpt-image-1.5`. Supports 1K/2K/4K, 3:1–1:3 aspect ratios, reliable in-image text, multi-image character continuity.
- **Nano Banana 2** — `gemini-3.1-flash-image`. The generalist workhorse; 4K, good text rendering.
- **Nano Banana 2 Lite** — `gemini-3.1-flash-lite-image`. Fastest/cheapest; use for high-volume frame work.
- **Nano Banana Pro** — `gemini-3-pro-image`. Premium; best world knowledge and precision control.
- Legacy `gemini-2.5-flash-image` and especially `gemini-2.0-flash-exp` references in `lib/video-gen/*` are outdated — migrate on touch.

## Video pipeline map

- `lib/clipchain/engine.ts` — **ClipChain**: prompt → chained multi-shot **Seedance 2.0** clip via OpenRouter (one `OPENROUTER_API_KEY` for video, storyboard LLM, and dual vision analyzers: GPT Omni + Nano Banana). Serverless-safe: job state in Redis, client polls tick the state machine, output concat + Firebase Storage upload. Resilient billing-fair failure model (added 2026-07-17): per-shot bounded resubmit (3 attempts) incl. 15-min hang timeout, 5-consecutive-transient-error budget before parking as `failed`, parked jobs resumable from last completed shot via `POST /api/clipchain/resume/[jobId]` (free — completed shots never regenerate), actual provider cost metered per shot into `trackSpend` (global daily ceiling + session monthly), zero-delivery failures auto-refund the daily allowance (re-counted on resume).
- `lib/video-gen/` — earlier keyframe-chaining pipelines (V1–V5): GPT Image keyframes + Nano Banana scene prediction + Luma Ray-2 segments, ffmpeg frame extraction for continuity. `PIPELINE_STATUS.md` there documents the evolution. Model IDs in these files are stale (see above).
- `C:\Projects\AI_Projects\music-video-pipeline` — separate older experiment (GPT Image 1 stills / Grok video). NOT the canonical pipeline; this repo is.

## Restored Claude workflow context (Seedance-era creative development)

Hash-verified restore at:
`C:\Users\Joseph\.claude\projects\C--Projects-Claude\a4352871-f765-421d-9bdf-51241426ec75`

Workflow journals in `workflows\` (each JSON has the full script, agent outputs, final result):

- `wf_4fd92846-16d.json` — **next-song-concepts** (key one). Five complete song+film concepts with lyrics, Suno style prompts, film worlds, palettes, sample shots: ANTIPHON (IT COMES BACK GOLD), SAY IT BACK, SLIPSTREAM, OUT LOUD, HOLD THE LINE. Judge ranked **ANTIPHON #1**. None produced yet — SIGNAL BLOOM (Sodium Shift re-shoot, via ClipChain) is the last video made; these five are candidates for the NEXT release.
- `wf_a0135f0b-c34.json` — **signal-bloom-art-direction**: production bible for SIGNAL BLOOM.
- `wf_b2bccdc9-a27.json` — **sodium-shift-board**: 25-shot board for the SIGNAL BLOOM re-shoot (`wf_caf7167d-ef5.json` is a killed earlier run).
- `wf_abd066af-dbf.json` — **clipchain-review**: adversarial review of the ClipChain engine.
- `wf_3af411d6-052.json` — **audiograph-review**: review of the AudioGraph audio→infographic pipeline.

Parent chat JSONL was not recovered; these journals are the source of truth.

## Catalog

1. **FIRE IN THE WORLD MODEL** — LED-veined heart in a server cathedral. Motif: HEART.
2. **SIGNAL BLOOM** — builders-and-AI anthem, 1974-documentary treatment. Motif: HANDS.
3. Next release closes the trilogy on an organ of connection (voice/breath); color line red → silver → gold.

## The aesthetic law (hard-won over two films — do not relitigate)

Target is **HEIGHTENED REALITY**. Not AI-trope neon dreamscapes (banned), not documentary vérité ("too real"). Every world = one **real physical medium anchor** (a named stock/craft/era/technique with a massive real photographic tradition) + exactly **ONE impossible rule** that embodies the song's thesis, staged theatrically. The impossible rule must be cheap for a video model to render consistently.

**Fusion rule:** conceive song and film together; pick song subjects whose natural imagery is already stylized and photogenic, or the imagery drifts toward cyberpunk slop shot by shot.

## Seedance production constraints

- Seedance 2.0 Fast, 720p24, 15s shots, seed frames via image model.
- One medium-anchor sentence opens every prompt.
- No readable generated text anywhere. No identifiable frontal faces (behind/silhouette/hands/stylized).
- ~25 shots for a ~6min song, ~12 for ~3min.
- Seed frames are the continuity control point: build and freeze 3-4 master seed frames per film (with GPT Image 2 / Nano Banana 2) before generating any video; derive every shot's seed from those masters.
