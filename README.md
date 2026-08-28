# cybersecurity.codes

**Live: <https://cybersecurity.codes/>**

The Global Cybersecurity Code Authority issues the daily codes that control everything
cybersecurity, worldwide. New codes every day at 00:00 UTC. Entirely real. Definitely.

(It is a parody. The Authority does not exist and the codes control nothing. Please do not fax
them to your government.)

## What it does

- Presents today's operational codes in a retro terminal, with a countdown to the next issue at
  00:00 UTC and an automatic rollover at midnight.
- Every visitor on Earth sees the same codes for the same day — there is no server involved.
- Installable as an app ("INSTALL FIELD TERMINAL") and works fully offline.

## How it works

- Static page: `index.html`, `style.css`, `app.js`. No backend, no cookies, no tracking, no idea.
- The codes are derived from the UTC date: the date string is hashed (xmur3) to seed a small
  PRNG (mulberry32), and the day's codes are drawn from word banks with that generator. Same
  date in, same codes out, on every device. This is the entire security model.
- Installable PWA: `manifest.webmanifest` and a service worker (`sw.js`) that precaches the
  shell, serves navigations network-first and assets stale-while-revalidate. Codes, countdown and
  midnight rollover all work offline because they are computed client-side from the clock.
- Hosted as static files on S3 behind CloudFront with a strict Content-Security-Policy
  (`script-src 'self'`, no inline scripts or styles).

## Licence

MIT — see [LICENSE](LICENSE).

Built by Adam Woodland with the assistance of AI (Anthropic Claude).
