---
title: "Comment j'ai arrêté de chercher l'outil parfait"
date: 2026-09-07
draft: false
description: "Comment j'ai fini par écrire mes runbooks Linux comme des pages de manuel, après avoir essayé Obsidian, Logseq et Joplin. Un retour au texte plat comme choix de conception."
tags: ["linux", "documentation", "runbook", "workflow", "cli", "neovim"]
categories: ["méthode"]
---

Un administrateur système accumule des procédures. Comment remonter un service qui refuse de démarrer, quelles permissions poser sur tel dossier partagé, dans quel ordre relancer une pile qui tient par 4 démons. Ce savoir a une particularité : il ne sert jamais au moment où on l'écrit. Il sert 6 mois plus tard, en urgence, à quelqu'un qui a oublié ce qu'il avait compris, et parfois à quelqu'un d'autre.

D'où une exigence que les outils de prise de notes traitent mal. Ce corpus doit se retrouver vite, rester lisible longtemps, et survivre au logiciel qui l'héberge. Aucune de ces 3 exigences ne se voit le jour où l'on choisit l'outil, et toutes se paient après.

J'ai mis 3 outils et plusieurs mois à comprendre que je posais la mauvaise question. Je cherchais l'application idéale pour ranger mes notes, alors qu'il me manquait une méthode pour les écrire.

La bonne question tient en une ligne, et elle se tranche en 10 minutes : où, et sous quelle forme, cet outil range-t-il ce que je lui donne ? La réponse dit le prix de la sortie.

## 3 outils, 3 réponses à la question

**Obsidian** écrit du Markdown pur et pose son index à côté. La réponse est bonne, et je ne l'ai su qu'après coup. J'y ai passé 3 semaines d'enthousiasme sur les backlinks, le graphe de connaissance et les greffons, pour constater qu'au moment de retrouver une commande 3 mois plus tard, je grepais le dossier. Le graphe, jamais.

**Logseq** écrit du Markdown en lui imposant sa structure. La nuance compte : le modèle par puces promettait une écriture fluide, il rigidifie. Écrire un runbook sur les permissions Linux dans une hiérarchie de puces revient à broyer un texte pour le forcer dans une forme qui ne lui convient pas.

**Joplin** met tout dans un SQLite à lui. C'est la plus mauvaise réponse des 3 : un binaire à maintenir entre mes textes et moi, et une interface qui vieillit plus vite que les notes qu'elle contient.

À chaque abandon, une même expérience. J'ouvrais mes anciennes notes pour en récupérer quelques-unes, et je constatais que le texte tenait tout seul. Le maillage patiemment construit dans l'outil précédent s'était volatilisé avec lui. La valeur avait toujours été dans le fichier : la couche posée autour ne faisait que la cacher.

## La question était mal posée

À force d'échouer, j'ai posé le problème autrement. La question portait désormais sur mon écriture : ce qui lui manquait pour rendre service, quel que soit le logiciel qui l'héberge. J'ai passé plusieurs mois à lire sur le sujet, à regarder comment d'autres praticiens travaillent, à comparer les méthodes qui se sont sédimentées avant les outils logiciels.

2 méthodes m'ont marqué, et aucune des 2 n'est née d'un logiciel.

**PARA**, formalisé par Tiago Forte, range les notes selon ce à quoi elles servent aujourd'hui plutôt que selon leur sujet : un projet en cours, un domaine à tenir, une ressource, une archive. Le critère est l'actionnabilité, ce qui déplace la question du « de quoi ça parle » vers le « qu'est-ce que j'en fais ».

**Zettelkasten** est bien plus ancien que la vogue qui l'entoure. Niklas Luhmann l'a rendu célèbre avec ses milliers de fiches densément reliées, mais le procédé circulait déjà chez Conrad Gessner au XVIᵉ siècle et chez Johann Jacob Moser au XVIIIᵉ. Son principe tient en 2 points : une fiche traite d'une chose et une seule, et les liens sont posés à la main au moment de l'écriture.

Ce détour historique m'a plus servi que les outils. Une méthode qui a traversé 4 siècles sur des fiches en carton ne dépend d'aucun logiciel, ce qui est précisément la propriété que je cherchais.

En parallèle, j'ai regardé sous le capot des outils que j'avais quittés. Chacun enferme la donnée à un degré différent, et chacun rend mes notes dépendantes de son binaire.

De ce va-et-vient entre méthodes et outils, 3 idées ont émergé :

- **Ranger n'est pas classer.** Si je passe plus de temps à décider dans quel dossier va la note qu'à l'écrire, le système est cassé.
- **Les liens comptent plus que la hiérarchie.** Un maillage manuel entre documents rend plus service qu'une arborescence à 5 niveaux.
- **La simplicité demande un effort.** Renoncer aux graphes et aux dashboards, c'est renoncer à ce qui fait plaisir à regarder mais ne rend rien.

## La grille compte plus que l’outil

La méthode qui manquait tient dans une grille. Ce qui donne sa valeur à un corpus de notes, c'est moins l'outil qui l'affiche que la forme qui l'organise. J'ai emprunté la mienne aux pages `man`, qui résolvent ce problème depuis cinquante ans.

Leur convention est écrite, et elle tient en peu de chose. `man-pages(7)` liste une vingtaine de sections possibles, en impose 4 et fixe leur ordre : NAME, SYNOPSIS, DESCRIPTION, SEE ALSO. Le reste est facultatif et vient à une place déterminée, dont EXIT STATUS pour les codes de retour et BUGS pour les défauts connus.

Ce qui m'intéresse là-dedans tient moins aux noms de sections qu'au principe : l'ordre est imposé, donc le lecteur sait où regarder avant d'avoir lu. Chaque runbook suit donc la même structure. Un chapô situe le document et sa cible logicielle. Les sections qui suivent vont du général au spécifique, jusqu'aux problèmes connus et à leurs contournements. La grille ne bouge pas d'un runbook à l'autre. Qui en a lu un sait où chercher dans les suivants. Une nouvelle entrée trouve toujours sa section évidente. La rigueur du format libère la rédaction.

Le choix de « dépannage par symptôme » plutôt que « troubleshooting » ou « FAQ » a une conséquence pratique. Je documente ce que l'utilisateur voit à l'écran, au format brut. Un runbook qui liste « la commande retourne exit code 1 » se cherche par recherche textuelle sur le vrai message. Un runbook qui liste « problème d'authentification » demande de traduire le symptôme en catégorie, ce que personne n'a envie de faire à 3 h du matin.

2 dates en frontmatter tiennent la fraîcheur : `updated` pour la dernière modification, `validated` pour la dernière vérification par exécution des commandes. Un runbook mis à jour hier peut avoir été validé il y a 6 mois. La distinction m'oblige à traiter la validation comme une action séparée. Sans elle, un runbook glisse doucement vers l'obsolescence sans qu'on s'en aperçoive.

## Une pile qui ne vaut que par ce qu’elle n’ajoute pas

Une fois la grille fixée, le choix de l'outillage s'est réduit à peu de chose. Des fichiers Markdown dans une arborescence claire. Neovim pour les écrire, Syncthing pour les répandre sur mes machines, ripgrep pour les retrouver.

Cette pile n'a rien d'original. Elle a la même tête que ce qu'on aurait installé il y a 20 ans. Le détour par les autres solutions restait nécessaire pour qu'elle prenne son sens : adoptée par défaut au premier jour, je l'aurais abandonnée aussi vite que les autres.

Sa valeur tient dans ce qu'elle n'ajoute pas. Le format Markdown a survécu à 3 décennies d'informatique et survivra aux suivantes. Neovim aussi. Syncthing suit un protocole documenté que d'autres implémentations reprennent déjà. Si l'un d'eux disparaissait demain, mes notes s'ouvriraient dans `nano`, `vim`, `emacs`, ou n'importe quel éditeur de texte qui existera dans 10 ans. Un `cat` suffit.

## Ce que la question aurait épargné

Les 3 réponses du début tenaient en 3 lignes, et elles disaient déjà tout. Markdown pur, Markdown contraint, base propriétaire. Soit, dans l'ordre, un coût de sortie nul, un coût de sortie en travail de conversion, et un coût de sortie en dépendance à un binaire.

Ce que je ne savais pas encore, c'est qu'un format me dit ce qu'il m'en coûtera de partir. Tant que je l'ignore, je choisis sans savoir ce que je signe.

Ces mois n'ont pas été perdus pour autant, parce qu'ils ont produit la grille. La pile du premier jour, adoptée par défaut, n'aurait pas tenu 6 mois faute d'une méthode pour la remplir.

C'est le même réflexe qui gouverne mon usage de Linux au quotidien. Avant d'installer un outil pour un besoin nouveau, je regarde ce qui est déjà là. La plupart du temps, la réponse existe dans le socle Unix, raffiné par 40 ans d'usage. Ce que j'ajoute par-dessus mérite de l'être une fois seulement que j'ai cherché sérieusement ce qui manquait.
