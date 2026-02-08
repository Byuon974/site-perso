(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const fullscreen = document.getElementById("fullscreen");
    if (!fullscreen) return;

    // Rendre les images cliquables
    document.querySelectorAll(".prose-content img, article img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        fullscreen.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" />`;
        fullscreen.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    // Fermer au clic
    fullscreen.addEventListener("click", () => {
      fullscreen.classList.remove("active");
      fullscreen.innerHTML = "";
      document.body.style.overflow = "";
    });

    // Fermer avec Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && fullscreen.classList.contains("active")) {
        fullscreen.classList.remove("active");
        fullscreen.innerHTML = "";
        document.body.style.overflow = "";
      }
    });
  });
})();
