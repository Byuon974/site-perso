(function () {
  const STORAGE_KEY = "theme";
  const docEl = document.documentElement;

  const getPreferredTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const setTheme = (theme) => {
    docEl.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  // Appliquer dès le chargement
  setTheme(getPreferredTheme());

  // Une fois le DOM prêt, câbler le bouton
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
