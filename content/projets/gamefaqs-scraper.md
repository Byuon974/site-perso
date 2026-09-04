---
title: "guide-dl"
description: "Outil en ligne de commande qui télécharge les guides de jeux depuis GameFAQs et LP Archive, les stocke dans un cache local et permet de les réexporter vers plusieurs formats sans re-solliciter le site."
date: 2025-09-13
video: "/videos/gamefaqs-scraper.webm"
videoPoster: "/videos/gamefaqs-scraper.jpg"
tags: ["Python", "CLI", "Web scraping", "Pandoc", "Documentation"]
draft: false
---

## Le projet en une phrase

`guide-dl` est un outil en ligne de commande qui télécharge les guides de jeux depuis GameFAQs et LP Archive, les stocke dans un cache local, et permet de les réexporter à volonté vers plusieurs formats sans avoir à re-télécharger la source.

Concrètement, l'outil transforme une simple URL de guide en une archive locale complète, disponible hors ligne, dans le format qui convient au moment : Markdown pour la lecture rapide, DOCX ou ODT pour l'archivage propre. Il est fonctionnel et utilisé au quotidien ; le code reste privé, par respect pour les sites communautaires dont il exploite les pages.

Cette dernière phrase est le fil de tout ce qui suit. Le respect des sites sources et de leurs auteurs a dicté l'architecture, bien au-delà d'une note en bas de page. Il explique 4 décisions :

- le cache local, qui évite de retélécharger ;
- les 2 réserves de concurrence séparées, qui protègent les pages du guide ;
- la métadonnée en tête de chaque export, qui garde le nom de l'auteur ;
- le dépôt privé.

---

## Ce qui a motivé ce projet

Les guides de jeux publiés sur GameFAQs et LP Archive sont des ressources précieuses mais fragiles : un site peut fermer, une page peut être modifiée, un lien peut se briser. À cela s'ajoute qu'aucun outil existant ne fait proprement ce que je cherchais, à savoir télécharger une fois, stocker une version canonique, puis réexporter à volonté vers plusieurs formats en travaillant entièrement hors ligne une fois la source récupérée.

L'idée de base est donc restée simple. Une commande `fetch` qui télécharge une fois, une commande `render` qui exporte autant de fois qu'on veut à partir du cache. Ce cache est un fichier `.render.json` qui contient le HTML canonique du guide et ses métadonnées ; les images sont téléchargées séparément et leurs URLs réécrites pour pointer vers les fichiers locaux. La conséquence est directe : une fois le guide récupéré, tester un nouveau format, corriger un rendu ou ajuster un template ne coûte plus une seule requête au site source.

---

## Le choix de la stack

| Couche | Détail |
|---|---|
| **CLI** | Typer, avec commandes `fetch`, `render`, `batch`, `info`, `extractors` |
| **HTTP** | httpx (asynchrone), retry exponentiel, rate limiting configurable |
| **Parsing HTML** | BeautifulSoup4 + lxml |
| **Affichage terminal** | Rich (mode interactif) avec fallback `--plain` et `--quiet` |
| **Conversion** | Pandoc (binaire système) pour Markdown, DOCX, ODT |
| **Post-traitement DOCX** | python-docx (bordures de tableaux, en-tête courant, styles) |
| **Post-traitement ODT** | Patching XML direct via `lxml` + `zipfile` |
| **Images** | Téléchargement parallèle, cache conditionnel (ETag, If-Modified-Since) |
| **Extracteurs** | GameFAQs, LP Archive, interface commune extensible |
| **Packaging** | setuptools + setuptools-scm, `pyproject.toml` |

---

## Une architecture en couches

La contrainte se lit d'abord dans la façon dont le code est découpé. Le projet est structuré en couches, chacune avec une responsabilité claire, ce qui permet d'ajouter un nouveau site (un nouvel extracteur) ou un nouveau format (un nouveau chemin dans le pipeline) sans avoir à toucher au reste.

### Extracteurs

Chaque site est adapté à une interface commune, qui isole les particularités du parsing de tout le reste du pipeline.

```python
class Extractor(ABC):
    @classmethod
    def name(cls) -> str
    def matches(cls, url: str) -> bool
    async def inspect(url, client) -> dict
    async def extract(url, client, max_size_mb, progress, ctx) -> RenderCache
    def game_slug_from_url(url) -> str
    def guide_id_from_url(url) -> str
```

2 extracteurs sont livrés à ce stade : `gamefaqs` pour les URLs de la forme `gamefaqs.gamespot.com/.../faqs/NNNNN`, et `lparchive` pour `lparchive.org/Game-Name/`. Ajouter un troisième site se résume à écrire une nouvelle classe qui implémente cette même interface.

### Client HTTP

Une enveloppe autour de `httpx.AsyncClient` centralise 3 mécanismes : la reprise exponentielle, le délai minimum entre requêtes, et 2 réserves de concurrence distinctes pour les pages HTML et pour les images. Cette séparation est ce qui compte. Elle permet de télécharger une centaine d'images en parallèle sans jamais dépasser 2 ou 3 requêtes par seconde sur les pages du guide.

### Modèles

Toutes les structures de données passent par un petit ensemble de dataclasses : `GuideMetadata`, `GuidePart`, `ImageInfo`, `ImageManifest`, `RenderCache`. Ces modèles servent à la fois de contrat entre les couches et de format de sérialisation JSON du cache.

### Pipeline de rendu

C'est le cœur du projet, et c'est là que se joue l'essentiel du travail. Le HTML brut du guide, tel que capté par l'extracteur, est loin d'être directement exportable : il traîne des menus, des tables de mise en page, des scripts, des iframes YouTube, des tables de matières parasites. Le pipeline le nettoie, l'assemble, le convertit via Pandoc, puis post-traite le résultat pour compenser les limites de Pandoc sur les formats bureautiques.

Le traitement se fait en 4 étapes.

- **Nettoyage HTML** dans `cleaner.py` : les scripts et les styles sautent, les tables de mise en page deviennent des listes lisibles.
- **Rendu monolithique** : toutes les pages du guide se rassemblent en un document unique, avec métadonnées et sommaire.
- **Conversion Pandoc** vers Markdown, DOCX ou ODT.
- **Post-traitement** : styles de tableaux, en-tête courant, et correction des défauts connus de Pandoc.

### Images et affichage

Le téléchargement des images fonctionne en parallèle avec cache conditionnel (les images déjà téléchargées ne sont pas retéléchargées si elles n'ont pas changé côté serveur), reprise sur `Range` en cas d'interruption, et une politique explicite (`missing`, `refresh`, `reuse`) pour choisir le comportement. Un manifeste JSON garde trace de tout.

Côté affichage, Rich est utilisé en terminal interactif avec progress bars ; en mode `--plain` (ou quand `NO_COLOR` est défini, ou quand la sortie est pipée), c'est du texte brut sur stderr, avec stdout réservé aux données pipeables (`--json` pour l'inspection).

---

## Le respect des auteurs comme contrainte de conception

Ce qui précède décrivait la mécanique. Reste à dire pourquoi elle a cette forme. Les guides publiés sur GameFAQs et LP Archive sont écrits par des joueurs qui y consacrent parfois des semaines, gratuitement, pour d'autres joueurs. Un outil qui les archive doit au minimum ne pas les effacer, et si possible les remettre en avant. Le rendu des métadonnées, aussi discret soit-il visuellement, occupe donc une part importante du code.

La métadonnée du guide (titre, auteur, date de mise à jour, URL source) ouvre chaque format de sortie, sans exception.

| Format | Métadonnée affichée |
|---|---|
| **Markdown** | Front matter YAML complet (`title`, `author`, `updated`, `source`) |
| **HTML** | En-tête en `<pre>` en haut de page, avant le corps du guide |
| **DOCX / ODT** | En-tête courant répété sur chaque page : titre / par auteur / mis à jour |
| **TXT** | Bloc encadré ASCII en haut du fichier |

Peu visible côté utilisateur, cette couche est celle qui a demandé le plus d'itérations. Les fonctions `render_metadata()`, `apply_docx_header()` et `_patch_styles_xml()` ont été retravaillées à la main sur des dizaines de guides réels avant de produire un résultat systématiquement propre, quel que soit le format.

---

## Les limites de Pandoc, et comment le projet les contourne

Pandoc est un outil remarquable, capable de convertir presque n'importe quoi vers presque n'importe quoi d'autre, mais il a des limites bien documentées sur les formats bureautiques. Une bonne partie du pipeline consiste précisément à travailler autour de ces limites.

**Tables sans bordures ni en-tête répétée.** Pandoc génère des tableaux DOCX sans bordures, dont l'en-tête ne se répète pas sur les pages suivantes et dont les largeurs de colonnes sont souvent inégales. Le projet post-traite les fichiers avec `python-docx` pour ajouter les bordures, colorier l'en-tête, marquer la première ligne comme en-tête à répéter, et redistribuer les largeurs. Pour l'ODT, c'est plus radical : `odfpy` a des bugs sur les fichiers produits par Pandoc, donc le code patche directement le XML via `zipfile` et `lxml`.

**Templates de référence limités.** L'option `--reference-doc` de Pandoc ne permet de personnaliser que les styles, pas le contenu, et Pandoc peut ajouter des entrées invalides dans `[Content_Types].xml` qui rendent le fichier corrompu à l'ouverture dans Word. Le projet utilise des templates de référence intégrés dans `guide_dl/templates/` pour les styles de base, et le post-traitement corrige les fichiers générés.

**Style `TableCaption` absent en ODT.** Le template ODT par défaut de Pandoc ne le contient pas ; le post-traitement l'injecte.

**Tableaux complexes.** Les `rowspan` et `colspan` ne sont pas entièrement supportés dans tous les formats. Les extracteurs simplifient les structures de tables complexes en amont lorsque c'est possible, et le nettoyage HTML réduit les tables de mise en page en listes.

---

## Le rôle de l'IA sur ce projet

J'ai utilisé Claude Code sur `guide-dl`, mais pas partout, et pas de la même manière selon les couches.

L'IA a servi sur les branchements techniques que je connaissais peu.

- La concurrence asynchrone : réserve de travailleurs, limiteur de débit, coordination entre requêtes HTML et requêtes d'images.
- La structure de l'interface en ligne de commande avec Typer et ses sous-commandes partagées.
- Le squelette des extracteurs, des modèles et de la chaîne de traitement.

Le projet ne tient pas sur le terrain grâce à l'IA. Le reste s'est obtenu par ajustements successifs sur du contenu réel, pas par génération.

- Le gabarit et le rendu des métadonnées.
- Les heuristiques de classification des tables : distinguer une table de données d'une table de mise en page dans un guide GameFAQs demande des règles écrites au cas par cas.
- Le post-traitement ODT par manipulation directe du XML.
- Les dizaines de guides réels téléchargés pour valider les cas particuliers.

Ce dernier point a pris le plus de temps et n'apparaît nulle part dans le code.

---

## L'observation terrain

Le projet a été testé sur des guides réels, choisis pour couvrir les cas typiques et les cas limites.

| Type de guide | Nombre | Observations |
|---|---|---|
| GameFAQs, guides texte simples | 5 | Fonctionne sans intervention |
| GameFAQs, guides avec tableaux de données | 8 | Classification des tables correcte, parfois trop agressive sur les cas ambigus |
| GameFAQs, guides avec crédits ou menus | 4 | Menus bien reconvertis en listes propres |
| LP Archive, guides avec images | 6 | Images téléchargées, URLs réécrites vers le local |
| LP Archive, guides avec iframes YouTube | 3 | Iframes transformées en liens texte, plus lisibles à l'export |

Les cas qui posent encore problème sont rares : guides avec des tableaux imbriqués, structures HTML non standard, ou guides d'un seul très long fichier qui saturent la mémoire au parsing.

---

## Ce qui est délibérément absent

La même contrainte explique ce que ce projet ne fait pas. Le projet n'est pas publié sur GitHub. GameFAQs et LP Archive sont des sites communautaires qui vivent de leur trafic direct et de leurs bénévoles, pas des fournisseurs d'API. Un outil clé en main qui télécharge un guide entier en une commande présente un risque net pour ces sites. Trop visible, il les pousserait à durcir leurs protections, au détriment des lecteurs qui viennent simplement consulter un guide. D'autres projets similaires ont été retirés ou gardés confidentiels pour la même raison.

L'outil reste donc à usage personnel : je peux le montrer, en parler, en expliquer les choix, mais je n'en distribue pas le code. La cohérence avec ce que le projet dit du respect des auteurs et des ressources se joue précisément là.

---

## Aperçu de l'interface

```bash
# Télécharger un guide depuis GameFAQs (Markdown par défaut)
guide-dl fetch "https://gamefaqs.gamespot.com/pc/206086-ys-viii/faqs/75520"

# Depuis LP Archive, avec plusieurs formats en une passe
guide-dl fetch "https://lparchive.org/Persona-4/" -f md,html,docx

# Réexporter depuis le cache local, sans re-solliciter le site
guide-dl render ./guides/ys-viii-lacrimosa-of-dana/75520 -f docx -O

# Inspecter un guide sans le télécharger
guide-dl info "https://lparchive.org/Persona-4/" --json

# Traitement par lots
guide-dl batch urls.txt -f md --no-images
```

Chaque guide téléchargé produit une arborescence stable :

```
guides/
└── game-slug/
    └── guide-id/
        ├── game-slug-guide-id.md         # Markdown
        ├── game-slug-guide-id.html       # HTML autonome
        ├── game-slug-guide-id.docx       # Word (si Pandoc installé)
        ├── game-slug-guide-id.txt        # Texte brut
        ├── metadata.json                 # Métadonnées du guide
        ├── .render.json                  # Cache HTML interne
        └── images/
            ├── image1.jpg
            └── image2.png
```

---

## Perspectives

Le socle est stable, les grands cas sont couverts. 3 axes d'évolution me semblent naturels.

- Ajouter des extracteurs selon les besoins, StrategyWiki ou les wikis communautaires, tant que cela reste faisable proprement.
- Améliorer le post-traitement DOCX et ODT sur les tableaux imbriqués, qui restent un cas limite.
- Alléger le traitement sur les guides de plus de 100 pages, où l'analyse monolithique commence à peser.

Le projet reste un outil personnel, et le restera.

---

## Compétences mobilisées

**Concevoir une architecture qui protège la ressource source.**
Défi : télécharger sans jamais retélécharger, permettre de tester n'importe quel format de sortie sans une seule requête supplémentaire au site source.
Réponse : séparation `fetch` / `render` autour d'un cache HTML immuable (`.render.json`), 2 réserves de concurrence distincts (HTML et images), délai minimum entre requêtes configurable, cache d'images conditionnel via ETag et If-Modified-Since.
Résultat : une fois un guide récupéré, ajuster un template ou tester un format supplémentaire coûte zéro requête au site.

**Contourner les limites documentées d'un outil de conversion.**
Défi : Pandoc produit des DOCX et ODT dont les tableaux n'ont ni bordures ni en-têtes répétées, des largeurs de colonnes inégales, et parfois un `[Content_Types].xml` corrompu à l'ouverture dans Word.
Réponses : post-traitement `python-docx` pour les DOCX (styles de tableau, en-tête courant, colonnes équilibrées), manipulation directe du XML par `zipfile` et `lxml` pour les ODT (`odfpy` étant cassé sur les fichiers Pandoc), templates de référence intégrés au projet pour piloter les styles de base.
Résultat : fichiers Office ouvrables sans warning, tableaux lisibles en impression, métadonnées d'auteur affichées en en-tête sur chaque page.

**Étendre proprement un système à de nouvelles sources.**
Défi : les guides ne vivent pas tous sur GameFAQs. Prévoir l'ajout de futures sources sans casser l'existant.
Réponse : interface `Extractor` unique (`matches`, `inspect`, `extract`, `game_slug_from_url`, `guide_id_from_url`) que chaque site implémente, isolant les particularités de parsing du reste du pipeline.
Résultat : 2 sites livrés (GameFAQs, LP Archive), l'ajout d'un troisième se réduit à écrire une nouvelle classe.

**Distinguer ce que l'IA peut faire de ce qu'elle ne peut pas.**
Réponse : Claude Code utilisé pour la concurrence asynchrone, le squelette CLI Typer et l'ossature des modèles ; heuristiques de classification des tables, templating des métadonnées et post-traitement ODT ajustés à la main sur des dizaines de guides réels, faute d'exemples génériques exploitables par l'IA.
Résultat : le projet fonctionne sur les cas particuliers, pas seulement sur les cas d'école.

**Assumer une posture publique.**
Défi : un outil clé en main de téléchargement expose ses sites cibles à un renforcement des protections qui nuirait à toute la communauté qui les fréquente légitimement.
Réponse : projet privé assumé, argumenté par le respect des ressources plutôt que par la peur d'un contentieux, cohérent avec le crédit systématique des auteurs affiché en tête de chaque fichier généré.
