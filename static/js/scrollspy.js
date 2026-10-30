/**
 * Scrollspy : met en surbrillance l'entrée du sommaire correspondant à la
 * section en cours de lecture, dans <nav class="sidebar-toc">.
 *
 * La version précédente reposait sur un IntersectionObserver réglé sur une
 * bande étroite du haut de l'écran. Elle a 2 défauts, mesurés au navigateur :
 *
 *   1. l'observateur ne se déclenche qu'au changement d'intersection. Quand un
 *      titre traverse la bande entre 2 images, au clic sur un lien du sommaire
 *      ou à la molette rapide, l'état ne change pas et la surbrillance se fige
 *      sur la section précédente, parfois pour plusieurs milliers de pixels ;
 *   2. le repli qui devait rattraper ce cas vivait dans le corps de
 *      l'observateur, donc il ne tournait jamais quand celui-ci se taisait.
 *
 * Le calcul direct supprime les 2 : la section active est toujours le dernier
 * titre passé au-dessus de la ligne de lecture, quelle que soit la façon dont
 * on est arrivé là. Il est limité à une image par requestAnimationFrame, et la
 * position des titres n'est relue qu'au redimensionnement.
 *
 * Sans sommaire, le script ne fait rien.
 */
(function () {
  "use strict";

  const toc = document.querySelector(".sidebar-toc");
  if (!toc) return;

  const liens = [...toc.querySelectorAll("a[href^='#']")];
  if (liens.length === 0) return;

  const cibles = [];
  liens.forEach((lien) => {
    const id = decodeURIComponent(lien.getAttribute("href").slice(1));
    const el = document.getElementById(id);
    if (el) cibles.push({ el, lien, haut: 0 });
  });
  if (cibles.length === 0) return;

  // La ligne de lecture : un titre compte comme atteint dès qu'il franchit le
  // quart supérieur de la fenêtre, le point où l'œil reprend après un défilement.
  const ligne = () => window.innerHeight * 0.25;

  const mesurer = () => {
    const origine = window.scrollY;
    cibles.forEach((c) => {
      c.haut = c.el.getBoundingClientRect().top + origine;
    });
  };

  let actif = null;

  const appliquer = () => {
    const seuil = window.scrollY + ligne();
    let courant = null;
    for (const c of cibles) {
      if (c.haut <= seuil) courant = c;
      else break;
    }

    // Tout en bas de page, la dernière section est lue même si son titre
    // n'a pas franchi la ligne : sans cela, un pied de page long laisserait
    // la surbrillance deux sections en arrière.
    const fin = document.documentElement.scrollHeight - window.innerHeight;
    if (fin - window.scrollY < 4) courant = cibles[cibles.length - 1];

    if (courant === actif) return;
    actif = courant;
    cibles.forEach((c) => {
      const vise = c === courant;
      c.lien.classList.toggle("active", vise);
      c.lien.parentElement?.classList.toggle("active", vise);
      if (vise) c.lien.setAttribute("aria-current", "true");
      else c.lien.removeAttribute("aria-current");
    });
  };

  let enAttente = false;
  const planifier = () => {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(() => {
      enAttente = false;
      appliquer();
    });
  };

  mesurer();
  appliquer();

  window.addEventListener("scroll", planifier, { passive: true });
  window.addEventListener("resize", () => {
    mesurer();
    actif = null;
    appliquer();
  });

  // Les images arrivées en différé décalent les titres sous elles.
  window.addEventListener("load", () => {
    mesurer();
    actif = null;
    appliquer();
  });
})();
