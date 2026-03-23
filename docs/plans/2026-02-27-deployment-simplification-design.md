# Deployment Simplification Design

**Date:** 2026-02-27
**Status:** Approved
**Goal:** Make 360 Gym deployable to cPanel with a single command, fix browser compatibility, and untangle the directory structure.

## Context

The 360 Gym app is an Angular 20 SPA with a PHP REST API and MySQL database. It runs on cPanel shared hosting (FTP only, no SSH). The current deployment process requires building locally and manually uploading files via FTP/cPanel File Manager — slow, error-prone, and painful.

Additional issues:
- The project is nested inside a `360-ng/` subdirectory that breaks when moved
- Tailwind CSS v4 uses modern CSS features that fail on older browsers (Safari 12, Chrome 60s-era)
- The Next.js app in the repo root is a secondary/prototype version — not deployed

## Constraints

- **Must run on cPanel** shared hosting with MySQL
- **FTP only** — no SSH access available
- **Older browser support** — Safari 12+, Chrome 60+
- **Preserve all existing features** — admin panel, public site, API

## Design

### 1. Flatten the Project Structure

**Current structure:**
```
360gym/
├── 360-ng/           ← Angular app + API trapped here
│   ├── src/
│   ├── api/
│   ├── angular.json
│   └── package.json
├── app/              ← Next.js (unused for production)
├── components/       ← Next.js components
└── package.json      ← Next.js package.json
```

**Target structure:**
```
360gym/
├── src/                  ← Angular source (moved up from 360-ng/)
├── api/                  ← PHP API (moved up from 360-ng/)
├── angular.json          ← Reconfigured output paths
├── package.json          ← Merged/cleaned up
├── tailwind.config.js
├── .env                  ← FTP credentials (gitignored)
├── deploy.sh             ← One-command deploy script
├── dist/                 ← Build output (gitignored)
│   ├── browser/          ← Angular compiled SPA
│   └── api/              ← API files copied for deploy
└── docs/
```

**Changes required:**
- Move `360-ng/src/` → `src/`
- Move `360-ng/api/` → `api/`
- Move `360-ng/angular.json` → `angular.json` (update paths inside)
- Move `360-ng/package.json` → `package.json` (merge with root, drop Next.js deps)
- Update `angular.json`: set `outputPath` to `dist/browser`, `baseHref` to `/`
- Update `environment.prod.ts`: set `apiUrl` to `/api` (relative)
- Delete all Next.js files: `app/`, `components/`, `next.config.js`, `next-env.d.ts`, `postcss.config.mjs`, root `package.json`, root `tailwind.config.js`, root `tsconfig.json`, and any other Next.js artifacts

### 2. Downgrade Tailwind v4 → v3

**Why:** Tailwind v4 uses `@layer`, `oklch()`, native CSS nesting, and `@property` — none of which work in Safari 12 or Chrome 60s. Tailwind v3 compiles to standard CSS via PostCSS.

**Steps:**
- Remove: `@tailwindcss/postcss`, `tailwindcss` v4
- Install: `tailwindcss@3`, `postcss`, `autoprefixer`
- Create `tailwind.config.js` with the existing theme (colors, fonts, spacing)
- Update `styles.scss` to use v3 directives (`@tailwind base; @tailwind components; @tailwind utilities;`)
- Audit templates for any v4-only syntax and adjust
- Test in Safari 12 / older Chrome via BrowserStack or similar

**Risk:** Low. The project hasn't been on v4 long, and v3/v4 template syntax is nearly identical for utility classes.

### 3. GitHub Actions FTP Deploy

Deploy via GitHub Actions — no local tooling required. Credentials stored in GitHub Secrets.

**Trigger options:**
- **Manual:** workflow_dispatch (click "Run workflow" in GitHub)
- **Automatic:** on push to `main` branch

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy to cPanel

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Angular (production)
        run: npx ng build --configuration=production

      - name: Copy API to dist
        run: rsync -a --delete api/ dist/api/

      - name: Deploy SPA via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASS }}
          local-dir: ./dist/browser/
          server-dir: ${{ secrets.FTP_REMOTE_PATH }}/
          exclude: |
            **/.git*
            **/.git*/**

      - name: Deploy API via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASS }}
          local-dir: ./dist/api/
          server-dir: ${{ secrets.FTP_REMOTE_PATH }}/api/
          exclude: |
            **/.git*
            **/.git*/**
            config/database.php
```

**GitHub Secrets to configure (one-time):**
- `FTP_HOST` — e.g. `ftp.example.com`
- `FTP_USER` — FTP username
- `FTP_PASS` — FTP password
- `FTP_REMOTE_PATH` — e.g. `/public_html`

**Key behaviors:**
- Uses `SamKirkland/FTP-Deploy-Action` — a well-maintained action that tracks file state and only uploads changes
- `config/database.php` is excluded so production DB credentials on the server are never overwritten
- Push to `main` auto-deploys; or trigger manually from the Actions tab
- No local tools to install — everything runs in CI

### 4. Environment Configuration

**`environment.ts` (development):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**`environment.prod.ts` (production):**
```typescript
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

The production API URL is relative — the SPA and API both live under `public_html/`, so `/api` resolves correctly.

### 5. Server-Side Requirements

The following must exist on the cPanel server (one-time setup):

**`public_html/.htaccess`:**
```apache
RewriteEngine On

# Don't rewrite API requests — let PHP handle them
RewriteRule ^api/ - [L]

# Don't rewrite files that exist
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Route everything else to Angular's index.html
RewriteRule ^ index.html [L]
```

**`public_html/api/config/database.php`:**
Production database credentials — lives only on the server, never in the repo.

## What This Does NOT Change

- All Angular components, services, and templates stay as-is
- All PHP API controllers, models, and routes stay as-is
- The MySQL database schema stays as-is
- The admin panel stays as-is
- Authentication (JWT) stays as-is

## Implementation Order

1. Flatten directory structure (move files, update angular.json paths)
2. Downgrade Tailwind v4 → v3 (install, configure, verify)
3. Verify local dev still works (`ng serve`, API)
4. Create deploy script and .env template
5. Test a deploy to cPanel
6. Delete all Next.js files (`app/`, `components/`, `next.config.js`, root `package.json`, root `tsconfig.json`, `postcss.config.mjs`, etc.)
