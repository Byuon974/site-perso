(function () {
  const STORAGE_KEY = "theme";
  const docEl = document.documentElement;

  const setTheme = (theme) => {
    docEl.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  // Le thème initial est déjà appliqué par le script inline dans <head>.
  // Ce fichier ne gère que le bouton toggle.

  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector("[data-theme-toggle]");
    if (!toggleBtn) return;

    const updateButton = () => {
      const current = docEl.getAttribute("data-theme") || "light";
      toggleBtn.textContent = current === "dark" ? "☀️" : "🌙";
      toggleBtn.setAttribute(
        "aria-label",
        current === "dark"
          ? "Basculer en mode clair"
          : "Basculer en mode sombre"
      );
    };

    updateButton();

    toggleBtn.addEventListener("click", () => {
      const current = docEl.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
      updateButton();
    });
  });
})();
