"use strict";

/* Ventures directory: search box + sector filter buttons. */
const list = document.getElementById("ventureList");
const filterBar = document.getElementById("ventureFilters");
const searchBox = document.getElementById("ventureSearch");

let ventures = [];
let activeSector = "All";

function renderFilters() {
  const sectors = ["All", ...new Set(ventures.map((v) => v.sector))];
  filterBar.replaceChildren();

  sectors.forEach((sector) => {
    const button = document.createElement("button");
    button.className = "filter";
    button.type = "button";
    button.textContent = sector;
    button.setAttribute("aria-pressed", String(sector === activeSector));
    button.addEventListener("click", () => {
      activeSector = sector;
      renderFilters();
      renderList();
    });
    filterBar.append(button);
  });
}

function renderList() {
  const term = searchBox.value.trim().toLowerCase();

  const matches = ventures.filter((v) => {
    const inSector = activeSector === "All" || v.sector === activeSector;
    const text = [v.name, v.sector, v.category, v.summary, v.domain].join(" ").toLowerCase();
    return inSector && (!term || text.includes(term));
  });

  list.replaceChildren();

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No ventures match that search. Try another name or sector.";
    list.append(empty);
    return;
  }

  matches.forEach((v) => list.append(createVentureCard(v, true)));
}

loadVentures()
  .then((data) => {
    ventures = data;
    renderFilters();
    renderList();
    document.getElementById("ventureCount").textContent = data.length;
    document.getElementById("dataSource").textContent =
      "Data source: " + ventureSource + " · " + data.length + " ventures";
  })
  .catch(() => {
    list.textContent = "Ventures could not be loaded. Check SHEET_URL in ventures.js.";
  });

searchBox.addEventListener("input", renderList);
