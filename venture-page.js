"use strict";

/* Single venture page: venture.html?slug=reviveev */
const slug = new URLSearchParams(location.search).get("slug");

/* Put text into an element. If the text is empty, hide the element
   (or its parent block when hideParent is true). */
function fill(id, text, hideParent) {
  const el = document.getElementById(id);
  el.textContent = text;
  if (!text) (hideParent ? el.parentElement : el).hidden = true;
}

loadVentures()
  .then((all) => {
    const i = all.findIndex((v) => v.slug === slug);
    if (i === -1) {
      document.getElementById("vIndex").textContent = "Venture not found.";
      return;
    }
    const v = all[i];

    document.title = v.name + " — BLACKSPIRE";
    document.querySelector('meta[name="description"]').content = v.summary;

    document.getElementById("vIndex").textContent =
      "VENTURE / " + String(v.id).padStart(2, "0") + " — " + v.status.toUpperCase();
    document.getElementById("vStatus").textContent = v.status;
    document.getElementById("vCategory").textContent = v.sector + " · " + v.category;
    document.getElementById("vName").textContent = v.name;

    fill("vSummary", v.summary);
    fill("vOffers", v.offers);
    fill("vProblem", v.problem, true);
    fill("vDirection", v.direction, true);
    fill("vDomain", v.domain || "To be decided", true);
    fill(
      "vPages",
      v.pages
        .split(";")
        .map((p) => p.trim())
        .join(" · "),
      true,
    );
    fill("vFeatures", v.features, true);
    fill("vNote", [v.guardrail, v.note].filter(Boolean).join(" "), true);

    document.getElementById("enquireLink").href = "contact.html?venture=" + encodeURIComponent(v.slug);

    const prev = all[i - 1];
    const next = all[i + 1];
    if (prev) {
      const link = document.getElementById("prevLink");
      link.href = ventureHref(prev);
      link.hidden = false;
    }
    if (next) {
      const link = document.getElementById("nextLink");
      link.href = ventureHref(next);
      link.hidden = false;
    }
  })
  .catch(() => {
    document.getElementById("vIndex").textContent = "Could not load venture.";
  });
