---
title: "guide-dl"
description: "Outil en ligne de commande qui archive un guide de jeu depuis GameFAQs ou LP Archive, le garde en cache local et le réexporte vers 5 formats sans re-solliciter le site."
date: 2025-09-13
video: "/videos/gamefaqs-scraper.webm"
videoPoster: "/videos/gamefaqs-scraper.jpg"
tags: ["Bash", "CLI", "Web scraping", "Pandoc", "lxml"]
status: "Terminé"
role: "Conception et développement solo"
period: "2025"
draft: false
---

> `guide` est un script en ligne de commande qui archive un guide de jeu publié sur GameFAQs ou LP Archive, puis le rend lisible hors ligne. Il tient dans un fichier bash unique, qui porte son propre nettoyeur Python et son propre filtre Pandoc. Il dépend de curl, de pandoc et de python3-lxml, rien d'autre.

Ce qui suit décrit ce que le script fait d'une URL, dans l'ordre où il le fait. Chaque étape y reçoit la raison de sa forme. Les contraintes qui l'ont façonné viennent moins du code que des sites d'en face : ils se protègent, ils changent, ils vivent du travail bénévole de leurs auteurs.

## L'outil en fonctionnement

{{< video-lite
    src="/videos/gamefaqs-scraper.webm"
    poster="/videos/gamefaqs-scraper.jpg"
    title="guide-dl : d'une URL de guide à un export DOCX" >}}

Une session complète, de la résolution de l'URL au fichier ouvrable. La vidéo montre une version antérieure, en paquet Python : le principe tient, les commandes ont changé.

---

## Ce que le script résout

Un guide de jeu publié sur GameFAQs ou LP Archive représente parfois des semaines de travail d'un joueur, offertes à d'autres joueurs. Ces pages sont précieuses et fragiles : un site ferme, une page change, un lien casse.

Les aspirer n'est pourtant pas le problème intéressant. Le problème, c'est qu'une page de guide arrive noyée dans le site qui l'héberge : menus, bandeaux, tables de mise en page, scripts, cadres YouTube, sommaire maison. Ce qu'on veut lire tient dans une fraction du HTML reçu. Le reste est du décor.

`guide` sépare donc 2 gestes qui n'ont pas le même coût. Prendre les pages sollicite le site : cela se fait une fois. Les rendre lisibles ne sollicite personne : cela se refait autant qu'on veut, à partir de ce qui est déjà sur le disque.

<figure class="schema" role="group" aria-labelledby="schema-pipeline-titre">
  <p id="schema-pipeline-titre" class="schema-titre">D’une URL à un fichier ouvrable, en 3 étapes</p>
  <ol class="schema-flux">
    <li class="schema-etape">
      <span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span>
      <span class="schema-corps"><b>L’URL du guide</b><span class="schema-note">ce qu’on donne au script</span></span>
    </li>
    <li class="schema-operation"><span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg></span><span>curl prend la page, puis celles qu’elle annonce</span></li>
    <li class="schema-etape">
      <span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/></svg></span>
      <span class="schema-corps"><b><code>brut/pages/page-NNN.html</code></b><span class="schema-note">les pages telles que le site les sert, débris compris</span></span>
    </li>
    <li class="schema-operation"><span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg></span><span>le nettoyeur Python, une seule passe sur le DOM</span></li>
    <li class="schema-etape">
      <span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg></span>
      <span class="schema-corps"><b><code>brut/guide.html</code></b><span class="schema-note">le guide seul, ses images devenues locales</span></span>
    </li>
    <li class="schema-operation"><span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg></span><span>pandoc, guidé par le filtre Lua</span></li>
    <li class="schema-etape schema-fin">
      <span class="schema-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1"/><path d="M16 16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1"/><path d="M21 6a2 2 0 0 0-.586-1.414l-2-2A2 2 0 0 0 17 2h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1z"/></svg></span>
      <span class="schema-corps"><b>Le guide, ouvrable</b><span class="schema-note"><code>.txt</code> <code>.md</code> <code>.html</code> <code>.docx</code> <code>.odt</code></span></span>
    </li>
  </ol>
  <figcaption>Seule la première étape sollicite le site. Les 2 suivantes travaillent sur le disque.</figcaption>
</figure>

Une fois `brut/guide.html` écrit, `guide -R ./guides/un-titre` rejoue la seconde moitié sans toucher au réseau. Tester un format, corriger un rendu, ajuster une marge ne coûte plus une requête.

---

## Ce qu'un site sert, ce qu'on en garde

Le nettoyeur fait une seule passe sur le DOM de chaque page, puis les recolle. Il retire les débris par une expression XPath unique : scripts, styles, `nav`, `header`, `footer`, `aside`, formulaires, blocs de pagination, sommaires du site, blocs publicitaires. Le sommaire maison part aussi, Pandoc en reconstruisant un avec `--toc`.

Les tableaux demandent plus qu'un filtre. Un guide de 2003 se met en page avec des `<table>` : l'outil doit distinguer une grille de données d'un échafaudage. La décision se prend sur la seule structure, sans regarder le texte :

- aucune cellule, ou aucun contenu ni image : le tableau est **vide**, il part ;
- une cellule unique contenant 2 liens ou plus : c'est un **menu**, il devient une liste ;
- aucune ligne n'a plus d'une cellule : c'est une **colonne** de mise en page, son contenu redevient des paragraphes ;
- tout le reste est un vrai tableau, laissé intact.

Le script compte ces 3 catégories et les annonce en fin de course. Un guide typique en retire une dizaine. Aucun lecteur ne les regrette.

Un cadre YouTube devient un lien en clair plutôt que de disparaître : hors ligne, l'adresse reste utile. Les autres `iframe`, `embed` et `object` partent sans remplacement. Les attributs `class`, `style` et `id` sont effacés partout, puisque plus rien en aval ne les lit.

**Un piège d'encodage mérite sa ligne.** Sans déclaration de charset dans les 2 premiers kilo-octets, lxml décode en latin-1 et rend du mojibake sur tout un guide. Le nettoyeur cherche donc cette déclaration avant de parser et, à défaut, tente l'UTF-8 puis le CP1252.

---

## Prendre les pages sans se faire fermer la porte

Le script parle à des sites qui filtrent. 3 réglages de curl viennent de là. Chacun a été payé par un échec.

- **`--http1.1`** : le HTTP/2 fait refuser la requête, le protocole fixant aussi les suites TLS et la négociation ALPN, qui trahissent le client ;
- **les en-têtes d'un Chrome 130 complet** : GameFAQs vérifie les `Sec-Fetch-*`, pas seulement l'agent utilisateur, et un `User-Agent` seul ne suffit plus ;
- **des en-têtes différents pour les images** : une image n'est pas un document, elle part avec un `Referer` et un `Sec-Fetch-Dest: image`. Sans cela, le site renvoie une page d'erreur à la place du fichier.

2 réserves de parallélisme séparent les 2 natures de requête. Les pages du guide arrivent en série, les images par 4 au plus. Les sites bridant ce parallélisme, les images manquantes sont reprises une par une : elles passent alors presque toutes. Celles qui résistent sont nommées en fin de course.

L'énumération des pages dépend du site. GameFAQs publie ses guides sous 2 formes, que le script distingue :

- **paginée** : il lit les numéros de la barre de pagination, plus le total annoncé par « Page 1 of N » ;
- **découpée en sections** : il remonte la table des matières, puis tous les liens vers le même identifiant de guide.
 LP Archive se contente d'un motif de lien. Un plafond à 400 pages empêche un énumérateur parti en boucle de remplir le disque.

---

## Ne pas reprendre ce qui n'a pas bougé

Le cache est la pièce qui protège le mieux le site d'en face. Chaque dossier garde dans `brut/cache.yaml` l'adresse d'origine et ses validateurs, ce qui permet de retrouver le dossier d'un guide à partir de son URL.

La première page part donc avec `--etag-compare` et une date de dernière modification. Un `304` met fin à la conversation. Rien n'est retéléchargé. Si le rendu manque, il se refait sur le cache ; sinon le script sort en annonçant que rien n'a changé.

Le nommage du dossier a demandé 2 corrections successives, toutes deux venues de collisions réelles. Un même `<title>` couvre parfois 4 guides du même jeu, quand la troncature à 48 caractères effaçait ce qui les distinguait. Le nom de l'auteur passe donc devant et complète le slug. Reste le cas de 2 guides de même titre et de même auteur : le script refuse alors d'écrire dans un dossier dont le `cache.yaml` porte une autre source : il suffixe `-2`, `-3`.

La plomberie est groupée sous `brut/` pour que le livrable reste seul en surface :

<figure class="schema arbre" role="group" aria-labelledby="arbre-titre">
  <p id="arbre-titre" class="schema-titre">Ce qu’un guide archivé laisse sur le disque</p>
  <ul class="arbre-racine">
    <li class="arbre-item arbre-racine-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg></span><span class="arbre-corps"><b><code>guides/un-titre/</code></b><span class="arbre-note">le dossier du guide, nommé d’après son titre et son auteur</span></span></li>
    <li>
      <ul class="arbre-enfants">
    <li class="arbre-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg></span><span class="arbre-corps"><b><code>un-titre.txt</code></b><span class="arbre-note">le livrable : le guide, à 79 colonnes</span></span></li>
    <li class="arbre-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></span><span class="arbre-corps"><b><code>images/</code></b><span class="arbre-note">les illustrations rapatriées, renommées en 0001, 0002…</span></span></li>
    <li class="arbre-item arbre-pliant"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></span><span class="arbre-corps"><b><code>brut/</code></b><span class="arbre-note">la plomberie, groupée pour que le livrable reste seul en surface</span></span></li>
        <li>
          <ul class="arbre-enfants">
    <li class="arbre-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/></svg></span><span class="arbre-corps"><b><code>pages/page-000.html …</code></b><span class="arbre-note">les pages telles que le site les a servies</span></span></li>
    <li class="arbre-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/></svg></span><span class="arbre-corps"><b><code>guide.html</code></b><span class="arbre-note">le guide nettoyé, source de tous les formats</span></span></li>
    <li class="arbre-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></span><span class="arbre-corps"><b><code>meta.yaml</code></b><span class="arbre-note">l’œuvre : titre, auteur, date de parution, source</span></span></li>
    <li class="arbre-item"><span class="arbre-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></span><span class="arbre-corps"><b><code>cache.yaml</code></b><span class="arbre-note">la copie : source, date d’aspiration, etag</span></span></li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
  <figcaption>Seul <code>un-titre.txt</code> et le dossier <code>images/</code> intéressent le lecteur. Le reste sert à ne pas redemander au site ce qu’il a déjà donné.</figcaption>
</figure>


Cette séparation entre `meta.yaml` et `cache.yaml` n'est pas cosmétique : le premier décrit l'œuvre, le second décrit la copie. Une date de parution introuvable ne se remplace jamais par la date du jour : la fausseté serait invisible. Le script la cherche dans les métadonnées déclarées, puis dans une étiquette du texte du type « Updated: 03/15/23 ». Faute de la trouver, il renonce et le dit.

---

## Ce que Pandoc ne fait pas tout seul

Pandoc convertit presque tout vers presque tout. À une condition : lui mâcher le travail. Un filtre Lua de 40 lignes corrige 4 comportements, chacun constaté sur un guide réel.

- **une image distante fait échouer la conversion** vers les 3 formats qui incorporent les fichiers, docx, odt et html5 : le filtre retire les images non rapatriées pour ceux-là, et les garde ailleurs, où un lien suffit ;
- **un `<hr>` ne devient pas un saut de page** : dans un guide, la barre horizontale sépare les chapitres, le filtre l'écrit donc en saut de page pour docx et odt ;
- **un en-tête de tableau en gras passe inaperçu** : les guides en produisent beaucoup, et une première ligne dont chaque cellule est en gras devient l'en-tête, qui se répétera d'une page à l'autre ;
- **un `<br>` dans une cellule gonfle la grille markdown** jusqu'à la rendre illisible : il devient un point-virgule.

Le gabarit docx se fabrique au lancement, à partir de celui de Pandoc lui-même. Le script l'extrait avec `--print-default-data-file`, puis patche `styles.xml` : bordures de tableau, en-tête répété, fond alterné, police à chasse fixe. Les marges passent enfin à 2 cm. Ce dernier point vient d'une mesure : à 9 points, la largeur par défaut donne 89 colonnes là où un guide en demande 79. Le gabarit n'est jamais mis en cache, sinon il figerait une base Pandoc périmée.

---

## Les limites et leur coût

Un garde-fou décide seul si l'extraction a réussi : sous 200 caractères utiles, le script considère qu'il a attrapé un bandeau plutôt qu'un guide. Il s'arrête alors en affichant ce qu'il a reçu et la taille de la page, parce que la cause est presque toujours un sélecteur de corps devenu faux.

Les cas qui résistent encore :

- les tableaux imbriqués, que le classement par structure range mal ;
- les guides d'un seul très long fichier, dont le parsing pèse sur la mémoire ;
- les sites inconnus, traités par un profil générique qui ne prend qu'une page et le dit.

**Un sélecteur est une dépendance envers une page qu'on ne contrôle pas.** Le jour où GameFAQs renomme une classe, l'extraction tombe. Le garde-fou transforme cette panne silencieuse en message clair, ce qui est tout ce qu'un script de cette taille peut offrir. Ajouter un site se réduit à un cas dans la fonction `selecteurs()`, avec son XPath de corps, de pages, d'images, de titre et d'auteur.

---

## Le rôle de l'IA

J'ai utilisé Claude Code sur ce projet. La frontière s'est révélée nette.

L'IA a servi sur ce que je connaissais mal : la coordination des requêtes, la forme des XPath, la structure du filtre Lua. Elle m'a fait gagner les heures de documentation que coûte un domaine qu'on aborde.

Elle n'a rien pu faire sur le reste. Les règles de classement des tables se sont écrites cas par cas, sur des guides réels. Le réglage des en-têtes curl s'est obtenu par échecs successifs contre un site qui refusait la connexion. La marge à 2 cm vient d'une page imprimée et comptée. Ce travail-là ne se génère pas. Il s'observe.

---

## Ce qui est délibérément absent

Le code n'est pas publié. GameFAQs et LP Archive sont des sites communautaires qui vivent de leur trafic et de leurs bénévoles, pas des fournisseurs d'API. Un outil clé en main qui aspire un guide entier en une commande les pousserait à durcir leurs protections, au détriment des lecteurs qui viennent simplement consulter une page.

Cette position se tient dans le code autant que dans le discours. Le cache conditionnel évite les requêtes inutiles, le plafond de pages borne les dégâts d'une erreur, les auteurs sont crédités en tête de chaque fichier produit. Montrer l'outil et expliquer ses choix me paraît compatible avec ce respect ; en distribuer le binaire ne l'est pas.

---

## Ce qu'on tape

L'en-tête du fichier sert d'aide : `guide -h` en imprime les 16 premières lignes. Une seule source de vérité, impossible à désynchroniser du code.

```bash
# Un guide, en texte 79 colonnes dans ./guides/<titre>/
guide "https://gamefaqs.gamespot.com/pc/206086-ys-viii/faqs/75520"

# Plusieurs formats en un seul passage
guide -f md,docx,html "https://lparchive.org/Persona-4/"

# Un lot d'URL, tous les formats
guide -i urls.txt -f all

# Re-rendre depuis le cache, sans réseau
guide -R ./guides/ys-viii-lacrimosa-of-dana -f docx -O

# Montrer ce qui serait fait, sans rien écrire
guide -n "https://lparchive.org/Persona-4/"
```

Stdout ne porte que les chemins des dossiers produits, le récit passe par stderr : `guide URL | xargs ...` fonctionne. Les codes de sortie suivent la convention : 0 fait, 1 échec, 2 usage, 127 outil absent, 130 interrompu.

---

## Ce que le projet m'a appris

**Séparer selon le coût réel, pas selon les étapes.** Le découpage ne suit pas les phases du traitement : il suit ce qui coûte au site d'en face. Prendre les pages est cher et se fait une fois, les rendre est gratuit et se refait à volonté. Toute l'architecture tient dans cette asymétrie : elle seule rend un essai de format indolore.

**Un script de cette taille doit échouer en parlant.** Sous 200 caractères extraits, le script nomme ce qu'il a reçu plutôt que de livrer un fichier vide. Une date introuvable ne devient pas la date du jour. Une image perdue est comptée et affichée. Chaque renoncement est annoncé, parce qu'une panne silencieuse coûte plus cher qu'un arrêt net.

**Le travail est dans les cas particuliers.** Les en-têtes qui passent, les tableaux de 2003, les encodages non déclarés, le gabarit docx reconstruit à chaque lancement : aucune de ces corrections ne se déduisait d'une lecture de la documentation. Elles viennent d'un guide sorti de travers.

**Une dépendance envers un site qu'on ne contrôle pas se borne, elle ne se supprime pas.** Les sélecteurs casseront, c'est entendu. Le plafond de pages, le garde-fou de taille et le profil générique ne l'empêchent pas : ils rendent la panne lisible et la réparation locale.
