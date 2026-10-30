"use strict";

const form = document.getElementById("contactForm");
const message = document.getElementById("formMessage");
if (form && message) {
  const venture = new URLSearchParams(location.search).get("venture");
  if (venture) {
    form.elements.venture_id.value = venture;
    document.getElementById("ventureHint").textContent = "Enquiry about: " + venture;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements.website.value) return;

    const button = form.querySelector('button[type="submit"]');
    const original = button.textContent;
    button.disabled = true;
    message.textContent = "Sending your enquiry…";
    message.dataset.state = "pending";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          venture_id: form.elements.venture_id.value,
          name: form.elements.name.value.trim(),
          email: form.elements.email.value.trim(),
          topic: form.elements.topic.value,
          message: form.elements.message.value.trim()
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "The enquiry service is temporarily unavailable.");
      }
      message.textContent = "Thank you — your enquiry has been received and saved.";
      message.dataset.state = "success";
      form.reset();
      form.elements.venture_id.value = venture || "";
    } catch (error) {
      message.textContent = "We couldn't send your enquiry right now. Please try again in a moment.";
      message.dataset.state = "error";
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
}
