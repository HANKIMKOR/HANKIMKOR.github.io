document.addEventListener("DOMContentLoaded", function () {
  const currentLang = localStorage.getItem("blogLanguage") || "ko";
  document.documentElement.setAttribute("lang", currentLang);

  // Initial layout
  updatePostLayout(currentLang);

  // Setup language switcher dropdown handlers
  document.querySelectorAll(".dropdown-item[data-lang]").forEach((element) => {
    element.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");
      setLanguage(lang);
    });
  });
});

function setLanguage(lang) {
  const prevLang = localStorage.getItem("blogLanguage");

  if (prevLang !== lang) {
    localStorage.setItem("blogLanguage", lang);
    document.documentElement.setAttribute("lang", lang);
    updatePostLayout(lang);
  }
}

function updatePostLayout(lang) {
  const container = document.querySelector(".row");
  const cards = Array.from(document.querySelectorAll(".card[data-lang]"));

  // First, hide all cards and remove them from the flow
  cards.forEach((card) => {
    const cardLang = card.getAttribute("data-lang");
    const parentCol = card.closest(".col-md-6");

    if (cardLang === lang) {
      parentCol.classList.remove("d-none");
      parentCol.style.order = "initial";
    } else {
      parentCol.classList.add("d-none");
    }
  });

  // Force a reflow
  container.offsetHeight;

  // Update the grid layout
  const visibleCards = Array.from(
    document.querySelectorAll(".col-md-6:not(.d-none)")
  );
  visibleCards.forEach((card, index) => {
    card.style.gridRow = `auto`;
    card.style.gridColumn = `auto`;
  });
}
