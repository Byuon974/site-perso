---
title: "Comment j'ai arrêté de chercher l'outil parfait"
date: 2026-09-07
draft: false
description: "Comment j'ai fini par écrire mes runbooks Linux comme des pages de manuel, après avoir essayé Obsidian, Logseq et Joplin. Un retour au texte plat comme choix de conception."
tags: ["linux", "documentation", "runbook", "workflow", "cli", "neovim"]
categories: ["méthode"]
---

Il m'a fallu essayer plusieurs outils avant de comprendre que je m'étais trompé de question. Je cherchais l'application idéale pour ranger mes notes techniques. Ce qu'il me fallait, c'était une méthode pour les écrire.

## L'enthousiasme, puis l'abandon

Comme tout le monde, j'ai commencé par Obsidian. Les backlinks bidirectionnels, le graphe de connaissance, l'écosystème de greffons. 3 semaines d'enthousiasme à configurer l'outil, puis le constat : quand je cherchais une commande précise 3 mois plus tard, je grepais mon dossier de notes. Je n'ouvrais jamais le graphe.

Passage à Logseq. Le modèle par puces promettait une écriture fluide : il rigidifie. Écrire un runbook sur les permissions Linux dans une hiérarchie de puces revient à broyer un texte pour le forcer dans une forme qui ne lui convient pas.

Puis Joplin. Retour à un modèle classique, mais base SQLite propriétaire au milieu, binaire à mettre à jour, interface qui vieillit plus vite que les notes qu'elle contient.

À chaque abandon, une même expérience. J'ouvrais mes anciennes notes pour en récupérer quelques-unes, et je constatais que le texte tenait tout seul. Le maillage patiemment construit dans l'outil précédent s'était volatilisé avec lui. La valeur avait toujours été dans le fichier : la couche posée autour ne faisait que la cacher.

## La question était mal posée

À force d'échouer, j'ai posé le problème autrement. La question portait désormais sur mon écriture : ce qui lui manquait pour rendre service, quel que soit le logiciel qui l'héberge. J'ai passé plusieurs mois à lire sur le sujet, à regarder comment d'autres praticiens travaillent, à comparer les méthodes qui se sont sédimentées avant les outils logiciels.

2 méthodes m'ont marqué. **PARA**, de Tiago Forte : ranger les notes selon ce à quoi elles servent aujourd'hui, plutôt que selon leur sujet. **Zettelkasten**, la méthode allemande des fiches interconnectées : chaque note traite d'une chose et une seule, et les liens explicites font le reste.

En parallèle, j'ai regardé sous le capot des outils que j'avais quittés. Chacun enferme la donnée à un degré différent, et chacun rend mes notes dépendantes de son binaire.

De ce va-et-vient entre méthodes et outils, 3 idées ont émergé :

- **Ranger n'est pas classer.** Si je passe plus de temps à décider dans quel dossier va la note qu'à l'écrire, le système est cassé.
- **Les liens comptent plus que la hiérarchie.** Un maillage manuel entre documents rend plus service qu'une arborescence à 5 niveaux.
- **La simplicité demande un effort.** Renoncer aux graphes et aux dashboards, c'est renoncer à ce qui fait plaisir à regarder mais ne rend rien.

## La grille compte plus que l’outil

La méthode qui manquait tient dans une grille. Ce qui donne sa valeur à un corpus de notes, c'est moins l'outil qui l'affiche que la forme qui l'organise. Chaque runbook suit la même structure, empruntée aux pages `man` Unix. Un chapô situe le document et sa cible logicielle. Les sections qui suivent vont du général au spécifique, jusqu'aux problèmes connus et à leurs contournements. La grille ne bouge pas d'un runbook à l'autre. Qui en a lu un sait où chercher dans les suivants. Une nouvelle entrée trouve toujours sa section évidente. La rigueur du format libère la rédaction.

Le choix de « dépannage par symptôme » plutôt que « troubleshooting » ou « FAQ » a une conséquence pratique. Je documente ce que l'utilisateur voit à l'écran, au format brut. Un runbook qui liste « la commande retourne exit code 1 » se cherche par recherche textuelle sur le vrai message. Un runbook qui liste « problème d'authentification » demande de traduire le symptôme en catégorie, ce que personne n'a envie de faire à 3 h du matin.

2 dates en frontmatter tiennent la fraîcheur : `updated` pour la dernière modification, `validated` pour la dernière vérification par exécution des commandes. Un runbook mis à jour hier peut avoir été validé il y a 6 mois. La distinction m'oblige à traiter la validation comme une action séparée. Sans elle, un runbook glisse doucement vers l'obsolescence sans qu'on s'en aperçoive.

## Une pile qui ne vaut que par ce qu’elle n’ajoute pas

Une fois la grille fixée, le choix de l'outillage s'est réduit à peu de chose. Des fichiers Markdown dans une arborescence claire. Neovim pour les écrire, Syncthing pour les répandre sur mes machines, ripgrep pour les retrouver.

Cette pile n'a rien d'original. Elle a la même tête que ce qu'on aurait installé il y a 20 ans. Le détour par les autres solutions restait nécessaire pour qu'elle prenne son sens : adoptée par défaut au premier jour, je l'aurais abandonnée aussi vite que les autres.

Sa valeur tient dans ce qu'elle n'ajoute pas. Le format Markdown a survécu à 3 décennies d'informatique et survivra aux suivantes. Neovim aussi. Syncthing suit un protocole documenté que d'autres implémentations reprennent déjà. Si l'un d'eux disparaissait demain, mes notes s'ouvriraient dans `nano`, `vim`, `emacs`, ou n'importe quel éditeur de texte qui existera dans 10 ans. Un `cat` suffit.

## Le coût de sortie se lit dans le format

Une seule question m'a fait avancer plus que 3 mois d'usage : où, et comment, cet outil range-t-il ma donnée ? Obsidian écrit du Markdown pur et pose son index à côté. Logseq écrit du Markdown en lui imposant sa structure. Joplin met tout dans un SQLite à lui.

Un format me dit ce qu'il m'en coûtera de partir. Tant que je l'ignore, j'ai choisi sans savoir ce que je signais.

Le reste du parcours a coûté des mois et n'a rien appris que le format ne disait déjà. Je ne regrette pas ces mois, puisque la pile du début, adoptée par défaut, n'aurait pas tenu 6 mois faute de méthode pour la remplir. La question se posait pourtant dès le premier jour, et elle tient en une ligne.

C'est le même réflexe qui gouverne mon usage de Linux au quotidien. Avant d'installer un outil pour un besoin nouveau, je regarde ce qui est déjà là. La plupart du temps, la réponse existe dans le socle Unix, raffiné par 40 ans d'usage. Ce que j'ajoute par-dessus mérite de l'être une fois seulement que j'ai cherché sérieusement ce qui manquait.
