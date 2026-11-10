const ratingLabels = ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"];
const checkIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6.5 12.5 3.4 3.4 7.6-8"></path>
  </svg>
`;

const form = document.querySelector("#feedback-form");
const feedbackView = document.querySelector("#feedback-view");
const successView = document.querySelector("#success-view");
const backButton = document.querySelector(".back-button");
const submitButton = document.querySelector(".submit-button");
const submitHint = document.querySelector(".submit-hint");
const ratingLabel = document.querySelector("#rating-label");
const starButtons = [...document.querySelectorAll(".star-button")];
const topicButtons = document.querySelectorAll(".topic-chip");
const resetButton = document.querySelector(".secondary-button");

let rating = 0;

function updateRating(selectedRating) {
  rating = selectedRating;

  starButtons.forEach((button) => {
    const buttonRating = Number(button.dataset.rating);
    const isSelected = buttonRating === rating;

    button.setAttribute("aria-checked", String(isSelected));
    button.querySelector("path").classList.toggle("star-filled", buttonRating <= rating);
  });

  ratingLabel.textContent = ratingLabels[rating - 1];
  ratingLabel.classList.add("is-visible");
  submitButton.disabled = false;
  submitHint.hidden = true;
}

starButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateRating(Number(button.dataset.rating));
  });
});

topicButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isSelected = button.classList.toggle("is-selected");
    button.setAttribute("aria-pressed", String(isSelected));
    button.querySelector(".topic-check").innerHTML = isSelected ? checkIcon : "";
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  feedbackView.hidden = true;
  successView.hidden = false;
  backButton.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

resetButton.addEventListener("click", () => {
  successView.hidden = true;
  feedbackView.hidden = false;
  backButton.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

backButton.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  }
});
