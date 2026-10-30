"use strict";

/* Motion layer: scroll reveals, aurora background, marquee, hero tilt, card spotlight,
   count-up numbers, progress bar, page transitions. Skipped for reduced-motion users. */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  root.classList.add("mo-on");
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* Aurora background + scroll progress bar */
  const aurora = document.createElement("div");
  aurora.className = "aurora";
  aurora.setAttribute("aria-hidden", "true");
  aurora.innerHTML = "<i></i><i></i><i></i>";
  document.body.prepend(aurora);
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);

  /* Scroll reveals */
  const SEL = [
    ".eyebrow", ".section-heading", ".section-intro", ".about-copy", ".link-row", ".status-note",
    ".page-hero h1", ".closing h2", ".closing p", ".closing .btn", ".field", ".principle", ".origin-item",
    ".audience", ".process-step", ".venture-card", ".idea-layout", ".searchbar", ".venture-detail",
    ".footer-brand", ".footer-col", ".footer-bottom",
  ].join(",");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        el.classList.add("mo-in");
        setTimeout(() => el.classList.remove("mo", "mo-in"), 1300);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  function tag(scope) {
    const items = $$(SEL, scope).filter((el) => !el.closest(".hero-copy, .intro-gate") && !el.classList.contains("mo"));
    const seen = new Map();
    items.forEach((el) => {
      const i = seen.get(el.parentNode) || 0;
      seen.set(el.parentNode, i + 1);
      el.style.setProperty("--d", Math.min(i, 9) * 70 + "ms");
      el.classList.add("mo");
      io.observe(el);
    });
  }
  tag(document);
  const grid = $("#ventureList");
  if (grid) new MutationObserver(() => tag(grid)).observe(grid, { childList: true });

  /* Card spotlight that follows the pointer */
  const SPOT = ".venture-card, .process-step, .principle, .origin-item, .audience";
  $$(SPOT).forEach((el) => el.classList.add("spot"));
  if (grid) new MutationObserver(() => $$(SPOT, grid).forEach((el) => el.classList.add("spot"))).observe(grid, { childList: true });
  document.addEventListener(
    "pointermove",
    (e) => {
      const card = e.target.closest && e.target.closest(".spot");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    },
    { passive: true }
  );

  /* Ticker becomes a continuous marquee */
  const tick = $(".ticker-inner");
  if (tick) {
    const items = $$("span", tick).map((s) => s.outerHTML).join("");
    const half = items + items + items;
    tick.classList.add("marq");
    tick.innerHTML = '<div class="ticker-track" aria-hidden="true">' + half + half + "</div>";
  }

  /* Header state, progress bar, hero scroll-parallax */
  const top = $(".topbar");
  const visual = $(".visual");
  let ticking = false;
  let tiltX = 0, tiltY = 0;
  function frame() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (top) top.classList.toggle("scrolled", y > 24);
    if (visual) {
      visual.style.setProperty("--py", Math.min(y, 700) * 0.09 + "px");
      visual.style.setProperty("--rx", tiltX + "deg");
      visual.style.setProperty("--ry", tiltY + "deg");
    }
  }
  function req() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  }
  addEventListener("scroll", req, { passive: true });
  if (visual && matchMedia("(pointer: fine)").matches) {
    addEventListener(
      "pointermove",
      (e) => {
        tiltY = (e.clientX / innerWidth - 0.5) * 12;
        tiltX = (0.5 - e.clientY / innerHeight) * 8;
        req();
      },
      { passive: true }
    );
  }
  frame();

  /* Count-up for venture numbers */
  function countUp(el) {
    const target = parseInt(el.textContent, 10);
    if (!target || el.dataset.counted) return;
    el.dataset.counted = "1";
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / 1100, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  $$(".venture-count, #ventureCount").forEach((el) => {
    new MutationObserver(() => countUp(el)).observe(el, { childList: true });
  });

  /* Soft page transition when following internal links */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = url.href), 230);
  });
  addEventListener("pageshow", () => document.body.classList.remove("leaving"));
})();
