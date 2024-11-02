document.addEventListener("DOMContentLoaded", function () {
  const currentLang = localStorage.getItem("blogLanguage") || "ko";
  document.documentElement.setAttribute("lang", currentLang);

  const cards = document.querySelectorAll(".card[data-lang]");
  cards.forEach((card) => {
    const cardLang = card.getAttribute("data-lang");
    if (cardLang === currentLang) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  document.querySelectorAll(".dropdown-item[data-lang]").forEach((element) => {
    element.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");
      setLanguage(lang, true);
    });
  });
});

function setLanguage(lang, reload = false) {
  const prevLang = localStorage.getItem("blogLanguage");
  console.log("=== Language Change ===");
  console.log("Previous:", prevLang, "New:", lang);

  if (prevLang !== lang) {
    localStorage.setItem("blogLanguage", lang);
    document.documentElement.setAttribute("lang", lang);

    const cards = document.querySelectorAll(".card[data-lang]");
    let visibleIndex = 0;

    cards.forEach((card, index) => {
      const cardLang = card.getAttribute("data-lang");
      console.log(
        `Card ${index + 1}: lang=${cardLang}, order=${card.style.order}`
      );

      if (cardLang === lang) {
        card.style.display = "block";
        card.style.order = visibleIndex;
        console.log(`-> Set visible, new order: ${visibleIndex}`);
        visibleIndex++;
      } else {
        card.style.display = "none";
        card.style.order = cards.length;
        console.log(`-> Set hidden, new order: ${cards.length}`);
      }
    });
  }
}
