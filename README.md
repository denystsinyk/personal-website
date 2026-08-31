# Denys Tsinyk — personal website

A fresh, independent portfolio repository. The original `denys_tsinyk` repository and its deployment are unchanged.

## Run locally in Ubuntu / WSL2

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

If WSL inherits an unusable Windows temporary directory, run `TMPDIR=/tmp npm run dev`.

```sh
npm run build
npm run lint
```

## Edit

- `app/page.tsx`: bio, experience, projects, links, and theme toggle.
- `app/globals.css`: responsive layout and light/dark theme.
- `app/layout.tsx`: page metadata.
- `public/me.jpg`: existing personal photo.

Built with React, TypeScript, Vinext/Vite, Tailwind, and a shadcn Button primitive. No database, contact-form backend, analytics, or API keys are needed. The contact link opens the visitor’s email client.

## Design and content

Original implementation inspired by the compact, monospace notebook direction of Shreyash Ranjan’s portfolio. No source code or assets were copied from that repository. Personal content and portrait come from Denys’s existing website; project descriptions come from his public GitHub repositories.

Before publishing, confirm the Character.AI internship wording, graduation date, and the roles currently labeled “present.” The previous site had no resume PDF, so no broken download link is included. Social previews retain the existing public portrait URL; replace it with the new deployment’s asset URL when publishing.

## Deployment

No deployment is configured or enabled. This repository was created as private. The generated `.openai/hosting.json` contains only empty capability declarations; it is not connected to a hosted site. GitHub Pages cannot serve the Vinext server build directly; choose a compatible host or adapt to a static export before deploying.
