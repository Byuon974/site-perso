/* Agrandissement d'image au clic.

   Deux corrections par rapport à la version précédente.

   1. Le sélecteur prenait « .prose-content img, article img », donc TOUTES
      les images de l'article, y compris le poster du lecteur vidéo, qui est
      déjà dans un lien. Un clic déclenchait les 2 actions : la visionneuse
      s'ouvrait et la vidéo démarrait derrière. Une image qui vit dans un
      lien, un bouton ou tout autre élément interactif appartient à ce
      contrôle, et rien d'autre ne doit lui prendre son clic.

   2. L'écouteur était posé sur l'<img> elle-même. Une image n'est pas
      focalisable : la visionneuse ne s'ouvrait qu'à la souris, jamais au
      clavier. Chaque image éligible est donc enveloppée dans un vrai
      <button>, qui apporte le focus, la touche Entrée, la barre d'espace
      et l'annonce par les lecteurs d'écran.

   Le <dialog> couvre déjà nativement le reste : piégeage du focus,
   fermeture par Échap, inertie du fond, retour du focus à l'origine. */
(function () {
  "use strict";

  // Un élément interactif revendique le clic de ce qu'il contient.
  const INTERACTIF = "a, button, summary, label, [role='button'], [role='link']";

  document.addEventListener("DOMContentLoaded", () => {
    const viewer = document.getElementById("fullscreen");
    if (!viewer || typeof viewer.showModal !== "function") return;

    document.querySelectorAll(".prose-content img, article img").forEach((img) => {
      if (img.closest(INTERACTIF)) return;

      // Une image décorative n'a rien à montrer en grand, et le bouton qui
      // l'enveloppe n'aurait aucun nom accessible.
      const alt = (img.getAttribute("alt") || "").trim();
      if (!alt) return;

      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "image-zoom";
      bouton.setAttribute("aria-label", `Agrandir l’image : ${alt}`);
      img.replaceWith(bouton);
      bouton.appendChild(img);

      bouton.addEventListener("click", () => {
        const clone = document.createElement("img");
        clone.src = img.currentSrc || img.src;
        clone.alt = alt;
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
