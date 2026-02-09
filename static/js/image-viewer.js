(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const fullscreen = document.getElementById("fullscreen");
    if (!fullscreen) return;

    function closeViewer() {
      fullscreen.classList.remove("active");
      fullscreen.innerHTML = "";
      document.body.style.overflow = "";
    }

    // Rendre les images cliquables
    document.querySelectorAll(".prose-content img, article img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        const clone = document.createElement("img");
        clone.src = img.src;
        clone.alt = img.alt || "";
        fullscreen.innerHTML = "";
        fullscreen.appendChild(clone);
        fullscreen.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    // Fermer au clic
    fullscreen.addEventListener("click", closeViewer);

    // Fermer avec Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && fullscreen.classList.contains("active")) {
        closeViewer();
      }
    });
  });
})();
