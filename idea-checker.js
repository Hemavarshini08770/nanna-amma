"use strict";

/* "Pressure-test your idea": five yes/no prompts and a short message. */
const prompts = [
  "I can state the problem in one sentence.",
  "I know the customer and have spoken to them.",
  "I have tested the idea cheaply before building.",
  "Someone owns each next step.",
  "I can see how it could sustain itself.",
];

// advice[n] = [title, text] shown when n prompts are ticked
const advice = [
  ["Start at Discover.", "Describe the problem in one sentence before you begin building."],
  ["Find the customer.", "Identify who experiences the problem and talk to them directly."],
  ["Test your assumptions.", "Use a small, low-cost experiment before investing in a full build."],
  ["Make ownership clear.", "Decide who is responsible for the next step and when it will happen."],
  ["Explore sustainability.", "Consider how the idea can create lasting value and cover its costs."],
  [
    "Ready for a deeper conversation.",
    "You have considered all five prompts. Share your thinking and the assumptions you still need to test.",
  ],
];

const questionList = document.getElementById("questions");
const gaugeFill = document.getElementById("gaugeFill");
const gaugeCount = document.getElementById("gaugeCount");
const verdict = document.getElementById("verdict");
const verdictCopy = document.getElementById("verdictCopy");

const ticked = new Set();

function update() {
  const n = ticked.size;
  gaugeFill.style.height = (n / prompts.length) * 100 + "%";
  gaugeCount.textContent = n + " of " + prompts.length + " considered true";
  verdict.textContent = advice[n][0];
  verdictCopy.textContent = advice[n][1];
}

prompts.forEach((text, i) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "question";
  button.setAttribute("aria-pressed", "false");

  const box = document.createElement("span");
  box.className = "boxmark";
  const label = document.createElement("span");
  label.textContent = text;
  button.append(box, label);

  button.addEventListener("click", () => {
    if (ticked.has(i)) ticked.delete(i);
    else ticked.add(i);
    button.setAttribute("aria-pressed", String(ticked.has(i)));
    update();
  });

  questionList.append(button);
});

update();
