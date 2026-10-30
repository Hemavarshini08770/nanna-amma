"use strict";

/* Home page: show a short preview of the portfolio. */
const PREVIEW_COUNT = 8;

loadVentures()
  .then((ventures) => {
    const list = document.getElementById("ventureList");
    ventures.slice(0, PREVIEW_COUNT).forEach((v) => list.append(createVentureCard(v, false)));

    document.querySelectorAll(".venture-count").forEach((el) => {
      el.textContent = ventures.length;
    });
  })
  .catch(() => {
    document.getElementById("ventureList").textContent = "Ventures could not be loaded.";
  });
