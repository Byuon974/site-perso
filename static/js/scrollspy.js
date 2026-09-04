/**
 * Scrollspy : met en surbrillance l'entrée de la table des matières
 * correspondant à la section actuellement lue dans la page.
 *
 * Fonctionne avec le TOC généré par Hugo dans <nav class="sidebar-toc">.
 * Chaque lien du TOC pointe vers un #slug qui correspond à un id sur un heading.
 *
 * Si le TOC n'existe pas (pages sans .TableOfContents), le script ne fait rien.
 */
(function () {
  "use strict";

  const toc = document.querySelector(".sidebar-toc");
  if (!toc) return;

  const tocLinks = toc.querySelectorAll("a[href^='#']");
  if (tocLinks.length === 0) return;

  // Récupérer les cibles réellement présentes dans la page
  const targets = [];
  tocLinks.forEach((link) => {
    const id = decodeURIComponent(link.getAttribute("href").slice(1));
    const el = document.getElementById(id);
    if (el) targets.push({ id, el, link });
  });

  if (targets.length === 0) return;

  // Utiliser IntersectionObserver pour repérer quelle section est visible
  // La bande de 20% haut / 70% bas déclenche quand un heading entre dans
  // le tiers supérieur du viewport (rythme de lecture naturel).
  const observed = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observed.add(entry.target.id);
        } else {
          observed.delete(entry.target.id);
        }
      });

      // La section active est la première visible (dans l'ordre du document)
      let activeId = null;
      for (const t of targets) {
        if (observed.has(t.id)) {
          activeId = t.id;
          break;
        }
      }

      // Si aucune n'est visible, garder la dernière passée au-dessus du viewport
      if (!activeId) {
        for (const t of targets) {
          const rect = t.el.getBoundingClientRect();
          if (rect.top < 100) activeId = t.id;
        }
      }

      // Appliquer la classe active
      tocLinks.forEach((link) => {
        const id = decodeURIComponent(link.getAttribute("href").slice(1));
        link.parentElement?.classList.toggle("scrollspy-active", id === activeId);
      });
    },
    {
      rootMargin: "-15% 0px -70% 0px",
      threshold: 0,
    }
  );

  targets.forEach((t) => observer.observe(t.el));
})();
