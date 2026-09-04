(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const viewer = document.getElementById("fullscreen");
    if (!viewer || typeof viewer.showModal !== "function") return;

    // <dialog> fournit nativement le piégeage du focus, la fermeture par
    // Échap, l'inertie du fond et le retour du focus à l'élément d'origine.
    // Rien de tout cela n'a à être écrit à la main.

    document.querySelectorAll(".prose-content img, article img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        const clone = document.createElement("img");
        clone.src = img.currentSrc || img.src;
        clone.alt = img.alt || "";
        viewer.replaceChildren(clone);
        viewer.showModal();
      });
    });

    // Un clic hors de l'image ferme la visionneuse. Le test porte sur la
    // cible pour ne pas fermer quand on clique l'image elle-même.
    viewer.addEventListener("click", (e) => {
      if (e.target === viewer) viewer.close();
    });

    viewer.addEventListener("close", () => viewer.replaceChildren());
  });
})();
