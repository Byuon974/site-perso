# Refonte complète — nexus-tvs.xyz

À dézipper à la racine du projet Hugo :

    unzip -o refonte-css.zip

## Inventaire

### Architecture CSS (7 nouveaux fichiers, ~1600 lignes)

    static/css/main.css         orchestrateur @layer
    static/css/reset.css        reset moderne
    static/css/tokens.css       tokens couleur/type/espace + light-dark()
    static/css/base.css         éléments HTML sans classe
    static/css/layout.css       primitives Every Layout
    static/css/components.css   tous les composants (sun-avatar 3D inclus)
    static/css/utilities.css    classes utilitaires

### Layouts modifiés

    layouts/partials/head.html         charge main.css uniquement
    layouts/partials/sun-avatar.html   SVG refondu, rayons émergents, core 3D
    layouts/partials/footer.html       liens LinkedIn + RSS
    layouts/index.html                 tagline retapée, timeline exacte
    layouts/blog/list.html             date au format FR
    layouts/notes/list.html            date FR + filtres stylés
    layouts/projets/list.html          grille de cartes + cartouche statut

### Contenu modifié

    content/about/_index.md            retapé (accord + tricolon Je)
    content/uses/_index.md             format liste, deux-points, yay
    content/blog/arreter-chercher-outil-parfait.md
    content/blog/pragmatisme-contre-purete.md
    content/blog/tech-analyse-philosophie-unix.md      date ISO

### Config

    config.yaml    languageCode fr-FR + email + LinkedIn + description IA & Big Data

## Après dézippage

    hugo server                                       # vérifier en local
    rm static/css/{systeme,style,portfolio}.css       # après validation
    git add -A && git commit -m "refonte totale"
    git push
