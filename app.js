/* cybersecurity.codes — Global Cybersecurity Code Authority
   All codes are derived from the UTC date via a seeded PRNG, so every
   visitor on Earth sees the same codes for the same operational day.
   This is the entire security model. */

"use strict";

(() => {
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- seeded RNG (xmur3 hash -> mulberry32) ----------

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function mulberry32(a) {
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rngForDay = (dayStr) => mulberry32(xmur3("GCCA//" + dayStr)());
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

  // ---------- word banks ----------

  const COLOURS = ["CRIMSON", "OBSIDIAN", "COBALT", "VERMILION", "IVORY",
    "SCARLET", "MIDNIGHT", "EMERALD", "AMBER", "VIOLET", "TITANIUM", "NEON"];

  const ANIMALS = ["MONGOOSE", "HERON", "PANGOLIN", "WOLVERINE", "CUTTLEFISH",
    "FALCON", "BADGER", "OCELOT", "MANTIS", "WOMBAT", "VIPER", "ALBATROSS"];

  // Every great hacker film, one word bank.
  const OVERRIDE_WORDS = ["SWORDFISH", "GIBSON", "WOPR", "ZEROCOOL", "ACIDBURN",
    "CRASHOVERRIDE", "JOSHUA", "FALKEN", "PLAGUE", "CEREAL", "MAINFRAME", "TRINITY"];

  const NATO = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF",
    "HOTEL", "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER", "OSCAR",
    "PAPA", "QUEBEC", "ROMEO", "SIERRA", "TANGO", "UNIFORM", "VICTOR",
    "WHISKEY", "XRAY", "YANKEE", "ZULU"];

  const CITIES = ["ZURICH", "GENEVA", "REYKJAVIK", "SINGAPORE", "OSLO",
    "MONTEVIDEO", "WELLINGTON", "HELSINKI", "CASABLANCA", "VLADIVOSTOK"];

  const BAD_PASSWORDS = ["password123", "qwerty", "letmein", "admin", "123456",
    "dragon", "iloveyou", "monkey", "trustno1", "passw0rd"];

  const PHRASES = [
    (r) => `The ${lc(pick(r, COLOURS))} ${lc(pick(r, ANIMALS))} ${pick(r, ["flies", "sleeps", "waits", "sings", "hunts"])} at ${pick(r, ["midnight", "dawn", "dusk", "teatime", "the third bell"])}.`,
    (r) => `Ask the ${pick(r, ["lighthouse keeper", "chess master", "night porter", "florist", "submarine"])} about the ${lc(pick(r, COLOURS))} ${pick(r, ["umbrella", "briefcase", "orchid", "typewriter", "manifest"])}.`,
    (r) => `${pick(r, ["Rain", "Fog", "Snow", "Static", "Silence"])} over ${title(pick(r, CITIES))}; the ${lc(pick(r, ANIMALS))} is ${pick(r, ["safe", "awake", "compromised", "magnificent"])}.`,
    (r) => `Uncle ${pick(r, ["Viktor", "Aldous", "Percival", "Ingrid", "Marlene"])} no longer ${pick(r, ["collects stamps", "trusts the moon", "eats herring", "plays the oboe"])}.`,
  ];

  const lc = (s) => s.toLowerCase();
  const title = (s) => s.charAt(0) + s.slice(1).toLowerCase();

  // ---------- code generation ----------

  const utcDayString = () => new Date().toISOString().slice(0, 10);

  function generateCodes(dayStr) {
    const rng = rngForDay(dayStr);

    const threat = `${pick(rng, COLOURS)} ${pick(rng, ANIMALS)}`;
    const override = `${pick(rng, OVERRIDE_WORDS)}-${pick(rng, NATO)}-${int(rng, 0, 9)}`;
    const hexKey = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => "0123456789ABCDEF"[int(rng, 0, 15)]).join("")
    ).join("-");
    const phrase = pick(rng, PHRASES)(rng);
    const freq = (100 + rng() * 400).toFixed(1);
    const port = int(rng, 1024, 65535);
    const exitCity = title(pick(rng, CITIES));
    const forbidden = pick(rng, BAD_PASSWORDS);

    return [
      { label: "THREAT CONDITION", value: threat,
        note: "All personnel: remain suspicious." },
      { label: "MASTER OVERRIDE CODE", value: override,
        note: "Overrides everything. Use responsibly." },
      { label: "GLOBAL ENCRYPTION KEY", value: hexKey,
        note: "AES-∞. Military grade. Artisanal. Small batch." },
      { label: "SPOKEN AUTHORIZATION PHRASE", value: `“${phrase}”`,
        note: "Deliver calmly to your nearest firewall." },
      { label: "FIREWALL BROADCAST FREQUENCY", value: `${freq} MHz`,
        note: "All firewalls worldwide retune at midnight UTC." },
      { label: "PORT OF THE DAY", value: `PORT ${port}`,
        note: "All other ports are closed. Yes, all of them." },
      { label: "GLOBAL VPN EXIT NODE", value: exitCity,
        note: "Today, the entire internet exits here." },
      { label: "FORBIDDEN PASSWORD OF THE DAY", value: forbidden,
        note: "Anyone still using this today will be found." },
    ];
  }

  function tickerLine(dayStr) {
    const rng = rngForDay("TICKER//" + dayStr);
    const firewalls = int(rng, 11000, 15000).toLocaleString("en");
    const compliance = int(rng, 3, 19);
    return `FIREWALLS SYNCHRONIZED: ${firewalls} ▪ INTRUSIONS (REPORTED): 0 ▪ GLOBAL PATCH COMPLIANCE: ${compliance}% ▪ MORALE: CLASSIFIED`;
  }

  // ---------- rendering + typing effect ----------

  const codesEl = document.getElementById("codes");

  function buildPanels(codes) {
    codesEl.textContent = "";
    return codes.map((code) => {
      const panel = document.createElement("button");
      panel.type = "button";
      panel.className = "panel";
      panel.title = "Copy to clipboard";

      const label = document.createElement("span");
      label.className = "panel-label";
      label.textContent = code.label;

      const value = document.createElement("span");
      value.className = "panel-value";

      const note = document.createElement("span");
      note.className = "panel-note";
      note.textContent = code.note;

      panel.append(label, value, note);
      codesEl.append(panel);

      // Click anywhere on the panel to copy the code (strip decorative quotes).
      const copyText = code.value.replace(/[“”]/g, "");
      panel.addEventListener("click", () => copyCode(panel, note, code.note, copyText));

      return { el: value, text: code.value };
    });
  }

  function copyCode(panel, noteEl, originalNote, text) {
    navigator.clipboard.writeText(text).then(() => {
      panel.classList.add("copied");
      noteEl.textContent = "✓ SECURELY COPIED TO CLIPBOARD. GUARD IT WELL.";
      clearTimeout(panel._copyTimer);
      panel._copyTimer = setTimeout(() => {
        panel.classList.remove("copied");
        noteEl.textContent = originalNote;
      }, 1600);
    }).catch(() => {
      noteEl.textContent = "✗ CLIPBOARD ACCESS DENIED. THE CODES REMAIN SAFE.";
      clearTimeout(panel._copyTimer);
      panel._copyTimer = setTimeout(() => { noteEl.textContent = originalNote; }, 1600);
    });
  }

  function typeInto(el, text, speed) {
    return new Promise((resolve) => {
      const cursor = document.createElement("span");
      cursor.className = "cursor";
      cursor.textContent = "▌";
      const textNode = document.createTextNode("");
      el.append(textNode, cursor);
      let i = 0;
      const timer = setInterval(() => {
        textNode.textContent = text.slice(0, ++i);
        if (i >= text.length) {
          clearInterval(timer);
          cursor.remove();
          resolve();
        }
      }, speed);
    });
  }

  async function renderDay(dayStr) {
    document.getElementById("opday").textContent =
      `${dayStr} — DAY ${Math.floor(Date.now() / 86400000).toLocaleString("en")} OF THE CYBER ERA`;
    document.getElementById("ticker").textContent = tickerLine(dayStr);

    const targets = buildPanels(generateCodes(dayStr));
    if (REDUCED_MOTION || document.visibilityState === "hidden") {
      targets.forEach((t) => { t.el.textContent = t.text; });
      return;
    }
    for (const t of targets) {
      await typeInto(t.el, t.text, 22);
    }
  }

  // ---------- countdown + midnight rollover ----------

  let currentDay = utcDayString();
  const countdownEl = document.getElementById("countdown");
  const rotatingEl = document.getElementById("rotating-notice");

  function msUntilUtcMidnight() {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - now.getTime();
  }

  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const ms = msUntilUtcMidnight();
    const s = Math.floor(ms / 1000);
    countdownEl.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
    countdownEl.classList.toggle("critical", s < 3600);

    const day = utcDayString();
    if (day !== currentDay) {
      currentDay = day;
      rotatingEl.hidden = false;
      renderDay(day).then(() => { rotatingEl.hidden = true; });
    }
  }

  // ---------- boot ----------

  document.addEventListener("DOMContentLoaded", () => {
    renderDay(currentDay);
    tick();
    setInterval(tick, 1000);
  });
})();
