# BKAM – Egypt's Smart Price Guide | بكام؟

Compare grocery and pharmacy prices across Egypt's top stores in Arabic and English.

Firebase Project: hertsu-452a6

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — Firestore auto-seeds on first visit.

## Admin Account

Register at /auth/register with email: admin@bkam.eg (any password ≥6 chars).
The system auto-grants admin role to this email.

## Pages
- /               Home
- /search         Product search & browse
- /product/[id]   Price comparison + chart
- /auth/login     Sign in (Email / Google / Apple)
- /auth/register  Create account
- /dashboard      Store owner dashboard
- /admin          Admin panel (admin@bkam.eg only)

## Firebase Setup
1. Enable Authentication: Email/Password + Google + Apple
2. Deploy rules: firebase deploy --only firestore:rules,firestore:indexes

## Branding
- Primary Green: #22C55E
- Charcoal: #1F2937
- Background: #F9FAFB
- Accent Orange: #F97316
