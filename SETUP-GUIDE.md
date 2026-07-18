# Snake & Ladder — Setup Guide

Your download has these files:

- `index.html` — the whole game (works standalone, no build step)
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — makes it installable (PWA)
- `robots.txt`, `sitemap.xml` — basic SEO plumbing
- `SETUP-GUIDE.md` — this file

Everything works out of the box for **Pass & Play** and **vs AI**. Two things need
a few minutes of your own setup because they need a real backend: **online
multiplayer** and the **global/daily/weekly leaderboard**. Both use the same
Firebase project.

## 1. Hosting it

Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or your
own server. Just upload all the files to the same folder — nothing to build.

## 2. Turning on Online Multiplayer + Global Leaderboard (Firebase)

1. Go to https://console.firebase.google.com and create a project (free).
2. **Build → Realtime Database → Create Database.** Choose a region, start in
   **test mode** for now (rules below tighten this up).
3. **Project settings (gear icon) → General → Your apps → Web app (`</>`).**
   Register the app, then copy the `firebaseConfig` object it gives you.
4. Open `index.html`, find this near the top of the main `<script>` block:

   ```js
   var FIREBASE_CONFIG = {
     apiKey: "YOUR_API_KEY",
     ...
   };
   ```

   Replace it with the config you copied. Save and re-upload `index.html`.
5. That's it — Online Friends mode, and the Global/Daily/Weekly leaderboard
   tabs, now light up automatically.

### Recommended database rules (apply once things work in test mode)

```json
{
  "rules": {
    "rooms": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['hostId','status','players'])"
      }
    },
    "leaderboard_global": { ".read": true, "$id": { ".write": true } },
    "leaderboard_daily":  { ".read": true, "$day": { "$id": { ".write": true } } },
    "leaderboard_weekly": { ".read": true, "$week": { "$id": { ".write": true } } }
  }
}
```

These are intentionally open (no auth) so anyone can create a room or record a
win without signing in — good for a casual game, but it does mean a determined
person could write junk data. If this becomes a problem, add Firebase
Anonymous Auth and require `auth != null` in the rules, or move writes behind a
Cloud Function.

**Room cleanup:** rooms aren't automatically deleted. For a hobby project this
is usually fine (rooms are tiny), but if you want auto-expiry, the clean way is
a scheduled Cloud Function that deletes rooms older than, say, 24 hours —
that's server-side and outside what a static HTML file can do on its own.

## 3. Turning on Google AdSense

Placeholder ad slots are already in the page (`ad-slot-top`, the sidebar slot
in the game screen, and `ad-slot-footer`). Once your AdSense account is
approved:

1. Add this once in `<head>`, replacing `ca-pub-XXXXXXXXXXXXXXXX`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
2. Inside each `.ad-slot` div, replace the placeholder text with:
   ```html
   <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="YOUR_SLOT_ID" data-ad-format="auto" data-full-width-responsive="true"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   ```
3. Add an `ads.txt` file at your domain root (AdSense gives you the exact
   line to put in it).

## 4. Updating SEO placeholders

Search `index.html`, `robots.txt`, and `sitemap.xml` for `your-domain.example`
and replace with your real domain. Also swap the `og:image`/`twitter:image`
URL for a real 1200×630 screenshot of the game.

## What's intentionally not included yet

To keep this build solid rather than shipping a pile of half-working stubs,
these are documented as next steps rather than faked:

- Supabase / raw WebSocket multiplayer (Firebase Realtime Database was used
  instead — it needs no server of your own and covers the same use case)
- Tournament / Family / Kids modes, dice skins, full multi-language coverage
  beyond the EN/HI toggle already included

Everything else from the request — AI opponents, online rooms, leaderboards,
avatars, dark mode, achievements, stats, daily challenge, install-as-app,
fullscreen, vibration, save/resume, share score, board themes, and the SEO/ad
scaffolding — is live in `index.html`.
