/* Lecteur vidéo différé : la vidéo n'est téléchargée qu'au clic.
   Déplacé depuis le shortcode, qui l'injectait en ligne dans la page.
   Sans ce script, le lien du poster ouvre la vidéo directement. */
(function(){
  function upgradeVideoLite(root){
    if (!root || root.dataset.upgraded === "1") return;
    root.dataset.upgraded = "1";

    const btn = root.querySelector('[data-video-lite-button]');
    if (!btn) return;

    btn.addEventListener('click', function(ev){
      // Le lien reste la cible sans JavaScript ; ici on l'intercepte.
      ev.preventDefault();
      const src = root.dataset.src;
      const type = root.dataset.type || 'video/webm';
      const title = root.dataset.title || 'Vidéo';

      // Remplace le poster par le lecteur seulement AU CLIC (différé réel).
      // Construction par méthodes DOM : aucune chaîne n'est interprétée
      // comme du balisage, donc aucune valeur ne peut s'échapper.
      const player = document.createElement('div');
      player.className = 'video-lite__player';

      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', title);
      // Pas de poster sur le lecteur : la lecture démarre au clic, et si
      // elle est bloquée le navigateur affiche la première image. Le
      // poster n'y servait qu'à retélécharger le JPG déjà remplacé par
      // sa version WebP dans le <picture> ci-dessous.

      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      video.appendChild(source);
      video.appendChild(document.createTextNode(
        'Votre navigateur ne supporte pas la lecture vidéo.'
      ));

      player.appendChild(video);

      // Vide le contenu cliquable puis insère le lecteur.
      root.replaceChildren(player);

      // Tente de lancer la lecture (autoplay peut être bloqué, c’est ok)
      const vid = root.querySelector('video');
      if (vid) {
        const p = vid.play();
        if (p && typeof p.catch === 'function') p.catch(function(){ /* autoplay bloqué */ });
      }
    }, { once:true });
  }

  // Auto-init (et support de contenu chargé dynamiquement)
  function init(){
    document.querySelectorAll('[data-video-lite]').forEach(upgradeVideoLite);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
