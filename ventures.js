"use strict";

/* ------------------------------------------------------------------
   ventures.js - shared by every page that shows ventures.

   Data comes from ventures.csv. To use a Google Sheet instead,
   publish it as CSV (File > Share > Publish to web > CSV) and paste
   the link into SHEET_URL below.
------------------------------------------------------------------- */
const SHEET_URL = "ventures.csv";

/* Turn CSV text into an array of rows.
   Cells can contain commas inside "quotes", so we walk the text
   one character at a time instead of using split(","). */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'; // "" inside quotes is a literal quote
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }

  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/* Where the data came from (shown in small print on the directory). */
let ventureSource = "";

/* Load all ventures. First row of the CSV = column names, and every
   other row becomes an object like { id: "1", name: "ReviveEV", ... }.
   If the CSV cannot be fetched (e.g. file opened by double-click),
   fall back to VENTURES_BACKUP from ventures-data.js. */
async function loadVentures() {
  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const rows = parseCSV(await res.text());
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    ventureSource = SHEET_URL.startsWith("http") ? "Google Sheet (live)" : "ventures.csv";

    return rows
      .slice(1)
      .filter((r) => r.some((c) => c.trim() !== ""))
      .map((r) => {
        const venture = {};
        headers.forEach((h, i) => {
          venture[h] = (r[i] || "").trim();
        });
        return venture;
      });
  } catch (err) {
    console.warn("Using backup data:", err);
    ventureSource = "local backup (ventures-data.js)";
    return VENTURES_BACKUP;
  }
}

/* Link to a venture's own page. */
function ventureHref(v) {
  return "venture.html?slug=" + encodeURIComponent(v.slug);
}

/* Build one venture card (used on the home page and the directory). */
function createVentureCard(v, showDomain) {
  const card = document.createElement("a");
  card.className = "venture-card";
  card.href = ventureHref(v);

  const meta = document.createElement("small");
  meta.textContent = v.sector + " · " + v.status;

  const name = document.createElement("b");
  name.textContent = v.name;

  const index = document.createElement("span");
  index.className = "card-index";
  index.textContent = String(v.id).padStart(2, "0");

  card.append(meta, name);

  if (showDomain && v.domain) {
    const domain = document.createElement("div");
    domain.className = "domain";
    domain.textContent = v.domain;
    card.append(domain);
  }

  card.append(index);
  return card;
}
