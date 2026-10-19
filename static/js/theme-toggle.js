(function () {
  const STORAGE_KEY = "theme";
  const docEl = document.documentElement;

  const setTheme = (theme) => {
    docEl.setAttribute("data-theme", theme);
    // Même garde que le script FOUC : en navigation privée l'écriture lève,
    // et sans try le bouton cesserait de basculer après le premier clic.
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  };

  // Le thème initial est déjà appliqué par le script inline dans <head>.
  // Ce fichier ne gère que le bouton toggle.

  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector("[data-theme-toggle]");
    if (!toggleBtn) return;

    const updateButton = () => {
      const current = docEl.getAttribute("data-theme") || "light";
      const icon = toggleBtn.querySelector("span") || toggleBtn;
      icon.textContent = current === "dark" ? "☀️" : "🌙";
      toggleBtn.setAttribute(
        "aria-label",
        current === "dark"
          ? "Basculer en mode clair"
          : "Basculer en mode sombre"
      );
      toggleBtn.setAttribute(
        "aria-pressed",
        current === "dark" ? "true" : "false"
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
