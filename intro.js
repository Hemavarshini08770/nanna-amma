"use strict";

/* Login screen: shown when the site is first opened.
   An email address is required to enter. The email and time are saved to
   data/blackspire-data.xlsx by server.js (the password is never stored or
   sent). Access is granted for this browser session only. */
(function () {
  const gate = document.getElementById("introGate");
  if (!gate) return;

  try {
    if (sessionStorage.getItem("blackspireEntered") === "1") {
      gate.remove();
      return;
    }
  } catch (e) {}

  document.body.classList.add("intro-lock");
  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail");
  const pass = document.getElementById("loginPass");
  const error = document.getElementById("loginError");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  setTimeout(() => email.focus({ preventScroll: true }), reduce ? 0 : 2300);

  function enter() {
    try {
      sessionStorage.setItem("blackspireEntered", "1");
    } catch (e) {}
    gate.classList.add("leaving");
    document.body.classList.remove("intro-lock");
    setTimeout(() => gate.remove(), reduce ? 0 : 700);
    window.scrollTo(0, 0);
  }

  function fail(message, field) {
    error.textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.focus();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    email.removeAttribute("aria-invalid");
    pass.removeAttribute("aria-invalid");
    error.textContent = "";
    const value = email.value.trim();
    if (!value) return fail("Enter your email address.", email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return fail("Enter a valid email, like you@example.com.", email);
    if (!pass.value) return fail("Enter your password.", pass);
    // Demo-style entry: any non-empty password is accepted.
    // Try to record the email when the data service exists, but never block entry
    // when deploying as a static site (for example, on Vercel).
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Entering…";
    try {
      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
    } catch (err) {
      // Login remains available even when the optional logging service is offline.
    }
    enter();
    button.disabled = false;
    button.innerHTML = 'Login <span>↗</span>';
  });
})();
