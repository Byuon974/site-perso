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

Comme tout le monde, j'ai commencé par Obsidian. Les backlinks bidirectionnels, le graphe de connaissance, l'écosystème de greffons. Trois semaines d'enthousiasme à configurer l'outil, puis le constat : quand je cherchais une commande précise trois mois plus tard, je grepais mon dossier de notes. Je n'ouvrais jamais le graphe.

Passage à Logseq. Le modèle par bullets promettait une écriture fluide, il rigidifie en pratique. Écrire un runbook sur les permissions Linux dans une hiérarchie de puces revient à broyer un texte pour le forcer dans une forme qui ne lui convient pas.

Puis Joplin. Retour à un modèle classique, mais base SQLite propriétaire au milieu, binaire à mettre à jour, interface qui vieillit plus vite que les notes qu'elle contient.

À chaque abandon, une même expérience. J'ouvrais mes anciennes notes pour en récupérer quelques-unes, et je constatais que le texte tenait tout seul. Le maillage patiemment construit dans l'outil précédent s'était volatilisé avec lui. La valeur avait toujours été dans le fichier, la couche autour ne faisait que la cacher.

## Le déplacement de la question

À force d'échouer, j'ai posé le problème autrement. La question portait désormais sur ce qui manquait à mon écriture pour qu'elle rende service, indépendamment du logiciel qui l'hébergeait. J'ai passé plusieurs mois à lire sur le sujet, à regarder comment d'autres praticiens travaillent, à comparer les méthodes qui se sont sédimentées avant les outils logiciels.

Deux méthodes m'ont marqué. **PARA**, de Tiago Forte : ranger les notes selon ce à quoi elles servent aujourd'hui, plutôt que selon leur sujet. **Zettelkasten**, la méthode allemande des fiches interconnectées : chaque note traite d'une chose et une seule, et les liens explicites font le reste.

En parallèle, j'ai regardé sous le capot des outils que j'avais quittés. Obsidian stocke en Markdown pur avec un cache d'index à côté. Logseq stocke en Markdown mais impose sa structure. Joplin met tout dans SQLite. Chaque outil enferme la donnée à un degré différent, chacun rend mes notes dépendantes de son binaire.

De ce va-et-vient entre méthodes et outils, trois idées ont émergé :

- **Ranger n'est pas classer.** Si je passe plus de temps à décider dans quel dossier va la note qu'à l'écrire, le système est cassé.
- **Les liens comptent plus que la hiérarchie.** Un maillage manuel entre documents rend plus service qu'une arborescence à cinq niveaux.
- **La simplicité demande un effort.** Renoncer aux graphes et aux dashboards, c'est renoncer à ce qui fait plaisir à regarder mais ne rend rien.

## La solution qui ressemblait à un retour en arrière

Après ce parcours, je suis revenu à la solution la plus simple. Des fichiers Markdown dans une arborescence de dossiers claire, édités avec Neovim, synchronisés entre mes machines avec Syncthing, cherchés avec ripgrep depuis le terminal.

Cette pile n'a rien d'original. Elle a la même tête que ce qu'on aurait installé il y a vingt ans. Le détour par les autres solutions a pourtant été nécessaire pour qu'elle prenne son sens : sans ce parcours, je l'aurais adoptée par défaut et abandonnée aussi vite.

Sa valeur tient dans ce qu'elle n'ajoute pas. Le format Markdown a survécu à trois décennies d'informatique et survivra aux suivantes. Neovim aussi. Syncthing suit un protocole documenté que d'autres implémentations reprennent déjà. Si l'un d'eux disparaissait demain, mes notes s'ouvriraient dans `nano`, `vim`, `emacs`, ou n'importe quel éditeur de texte qui existera dans dix ans. Un `cat` suffit.

## Le format des pages de manuel

Ce qui donne sa valeur à ce corpus, c'est moins l'outil qui l'affiche que la grille qui l'organise. Chaque runbook suit la même structure, empruntée aux pages `man` Unix. Un chapô situe le document et sa cible logicielle. Les sections qui suivent vont du général au spécifique, jusqu'aux problèmes connus et à leurs contournements. La grille est stable dans tous les runbooks : un lecteur qui en a lu un sait où chercher dans les autres. Une nouvelle entrée trouve toujours sa section évidente. La rigueur du format libère la rédaction.

Le choix de « dépannage par symptôme » plutôt que « troubleshooting » ou « FAQ » a une conséquence pratique. Je documente ce que l'utilisateur voit à l'écran, au format brut. Un runbook qui liste « la commande retourne exit code 1 » se cherche par recherche textuelle sur le vrai message. Un runbook qui liste « problème d'authentification » demande de traduire le symptôme en catégorie, ce que personne n'a envie de faire à 3 h du matin.

Deux dates en frontmatter tiennent la fraîcheur : `updated` pour la dernière modification, `validated` pour la dernière vérification par exécution des commandes. Un runbook mis à jour hier peut avoir été validé il y a six mois. La distinction m'oblige à traiter la validation comme une action séparée. Sans elle, un runbook glisse doucement vers l'obsolescence sans qu'on s'en aperçoive.

## Ce que j'en retire

Trois attitudes ont fait la différence dans ce parcours, plus que n'importe quel choix d'outil.

**La curiosité** de regarder sous le capot. Comprendre où et comment Obsidian, Logseq et Joplin rangeaient ma donnée a plus fait pour ma décision que trois mois d'usage. Tant que je ne sais pas comment un outil range mes données, je ne peux pas anticiper la difficulté d'en sortir.

**La discipline** de ne pas m'arrêter au premier outil séduisant. Chaque abandon m'a appris quelque chose que je n'aurais pas vu en restant. Le temps passé à essayer n'a pas été perdu.

**Le refus de la solution rapide.** Ce qui a fini par s'imposer, je l'ai construit après avoir compris ce que je cherchais. Le choix par défaut du début n'a pas tenu six mois.

C'est le même principe qui gouverne mon usage de Linux au quotidien. Avant d'installer un outil pour un besoin nouveau, je regarde ce qui est déjà là. La plupart du temps, la réponse existe déjà dans le socle Unix, raffiné par quarante ans d'usage. Ce que j'ajoute par-dessus mérite d'être ajouté seulement quand j'ai cherché sérieusement ce qui manquait.
