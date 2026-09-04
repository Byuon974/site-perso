---
title: "La philosophie Unix : ce que j'en comprends, pour l'instant"
date: 2026-07-14T09:00:00+04:00
draft: false
description: "Ce que j'ai compris, petit à petit, de la philosophie Unix : son histoire, ses principes, pourquoi « Worse is Better » a gagné, et pourquoi je m'en sers pour mes propres scripts."
tags: ["unix", "linux", "philosophie", "scripts", "systemd"]
categories: ["système"]
---

# La philosophie Unix : ce que j'en comprends

Pendant longtemps, j'ai pris la « philosophie Unix » pour une légende urbaine. Un truc que les sysadmins ressortent pour te faire sentir un peu coupable d'utiliser systemd, sans qu'on sache jamais très bien ce qu'il y a derrière. En ligne, il sert d'argument d'autorité pratique ou d'un label qu'on colle pour défendre ou attaquer un programme sans avoir à argumenter davantage.

Je suis donc allé voir d'un peu plus près. J'ai découvert que ce n'est pas une légende : c'est codifié, ça a une histoire précise, née dans les laboratoires Bell dans les années 1970. Plus je lis à ce sujet, moins ça ressemble à une nostalgie de de vieux de la vieille.

Ce qui me trouble, c'est de voir à quel point on s'en éloigne aujourd'hui, en empilant des couches d'abstraction sur des couches de dépendances, moi y compris, sans toujours se demander pourquoi. Je cherche, ici, à poser mes recherches à ce sujet.

Ce n'est pas qu'une curiosité théorique, remarquez : je m'en sers directement pour les scripts Linux que je fais tourner sur mon propre système, ceux qui automatisent mes sauvegardes, mes tâches de fond, mes petits outils du quotidien. Plus je comprends cette philosophie, plus ces scripts deviennent lisibles, faciles à réparer et à faire évoluer 6 mois plus tard, quand j'aurai oublié pourquoi je les ai écrits ainsi.

---

## Une histoire que je commence seulement à connaître

Avant Unix, les systèmes d'exploitation ressemblaient à des cathédrales : monolithiques, propriétaires, coûteux, et à peu près impossibles à bidouiller pour qui n'était pas dans le sérail.

Ken Thompson et Dennis Ritchie, les 2 ingénieurs à l'origine d'Unix, ont fait un pari inverse avec leurs collègues des Bell Labs : préférer le bazar à la cathédrale.

Plutôt qu'un seul programme géant, un ensemble de petits outils, chacun bon dans une seule tâche, pensés pour collaborer entre eux. C'est une idée simple, une qui a tenu cinquante ans.

Doug McIlroy, à qui l'on doit les tubes Unix (ces fameux `|` qu'on tape sans plus y penser), a résumé tout cela en 3 règles que je garde maintenant sous les yeux quand j'écris du code :

> 1. Écris des programmes qui font une chose et qui la font bien.
> 2. Écris des programmes qui travaillent ensemble.
> 3. Écris des programmes qui manipulent des flux textuels, parce que c'est une interface universelle.

3 règles, pas un manuel de 500 pages. Ce qui me frappe, en les relisant, c'est leur modestie : elles ne promettent rien de grandiose, elles demandent juste de ne pas construire d'usine à gaz. Modularité, composabilité et longévité: rien que les garder en tête change déjà ma façon d'écrire.

---

## Quelques principes que j'essaie encore d'intégrer

Ces 3 règles se déclinent en 5 principes, et chacun m'a demandé un exemple pour devenir clair. Je ne les présente pas comme des vérités à graver dans le marbre, plutôt comme des repères que je suis en train d'apprivoiser, avec plus ou moins de succès selon les jours.

### Modularité : une brique à la fois

Un programme fait une chose, et la fait bien. Formulé comme ça, ça a l'air presque trop simple pour être utile. Or, quand je veux chercher un motif dans un fichier, je chaîne `grep` et `wc` plutôt que d'écrire un script qui ferait tout à la fois. Le jour où je veux compter autre chose, je change une brique, pas tout l'édifice.

### Clarté : le code astucieux est l'ennemi

Rob Pike et Brian Kernighan, 2 des ingénieurs qui ont façonné Unix et sa culture aux Bell Labs, l'ont bien posé : « Le code astucieux est l'ennemi. » J'écris pour un humain, pas pour la machine, et cet humain, c'est souvent moi-même, 6 mois plus tard, à 3 heures du matin, en train de me demander ce que j'ai voulu faire. Je continue d'apprendre à résister à la tentation de construire par lubie au lieu de par objectif.

### Composition : le tube, un outil que je sous-estimais

Le `|` est peut-être le caractère le plus discret et le plus puissant de l'informatique. Il permet à des programmes qui s'ignorent totalement de s'assembler en un flux continu, la sortie de l'un devenant l'entrée de l'autre. J'ai mis du temps à comprendre que la vraie complexité intéressante ne vient pas d'un programme compliqué, mais de la composition de programmes simples. Ça change la façon dont j'aborde un problème.

### Séparation : mécanisme et politique

Un principe que j'ai découvert plus tard, et qui m'a semblé éclairant : séparer le *comment* du *quand* et du *pourquoi*. Un éditeur de texte doit savoir écrire sur le disque (le mécanisme), mais c'est à l'utilisateur, ou à un script, de décider du nom du fichier et du moment de la sauvegarde (la politique). Je comprends cette séparation surtout à travers ses ratés : chaque fois qu'un outil m'impose une politique que je n'ai pas choisie, je sens un peu mieux pourquoi ce principe existe.

### Silence, réparation bruyante, économie

Un programme qui réussit ne dit rien. Un échec, en revanche, doit être signalé clairement et tout de suite. Le temps du programmeur compte plus que le temps machine. Ce sont des idées que je trouve évidentes une fois énoncées, et que j'oublie pourtant en pratique. Elles dessinent, je crois, une culture entière : celle de la fiabilité et de la « débogabilité », des mots qui sonnent techniques mais qui, au fond, parlent surtout de respect pour la personne qui viendra après.

---

## Le paradoxe qui m'a le plus dérouté : pourquoi « Worse is Better » semble avoir gagné

C'est en essayant de comprendre pourquoi cette philosophie s'est autant répandue, alors qu'elle est loin d'être parfaite sur le papier, que je suis tombé sur un texte qui a un peu bousculé ce que je croyais savoir.

En 1989, Richard Gabriel, chercheur en informatique et lui-même artisan de systèmes Lisp, a formulé une thèse qui dérange, **« Worse is Better »** (le pire est meilleur), en opposant 2 approches :

- **« The Right Thing »** : la perfection théorique, la complétude à tout prix, l'idéal académique.
- **« Worse is Better »** : la simplicité d'implémentation et la portabilité, quitte à laisser filer quelques cas non gérés.

J'aurais parié, avant de lire ça, que la première approche l'emporterait toujours à long terme. C'est l'inverse qui s'est produit.

La philosophie Unix a fini par l'emporter sur des systèmes qu'on jugeait plus propres, avec son C et son pragmatisme sans grande ambition. Les machines Lisp en sont l'exemple. Ces ordinateurs des années 1980, conçus pour exécuter le langage Lisp jusque dans leur matériel, poussaient l'élégance logicielle jusque dans le silicium. Sur le papier, c'était supérieur à presque tous les égards. Dans les faits, ça n'a pas suffi.

L'explication la plus convaincante que j'ai trouvée tient en un mot : la diffusion. Un système suffisamment bon, facile à porter et à comprendre, se répand plus vite, atteint une masse critique, et finit par s'imposer presque malgré lui. Linux lui-même n'a pas gagné par une perfection d'architecture (son noyau monolithique a été critiqué par les puristes), mais par ce même pragmatisme et cette capacité à être partout.

Je n'en tire pas une leçon définitive, plutôt une question qui me reste : est-ce que je ne confonds pas, moi aussi, parfois, l'exigence de perfection avec la peur de livrer quelque chose d'imparfait mais utile ?

---

## La confrontation avec la modernité : là où je bute encore

J'essaie d'appliquer ce regard des années 1970 à un système que j'utilise tous les jours. Je prends mon ordinateur portable qui change d'état en permanence; Wi-Fi qui se coupe, batterie qui s'épuise, périphériques qu'on branche et débranche sans y penser et écran qu'on replie. On attend de lui que tout « fonctionne tout de suite, tout le temps ». Cette complexité-là, je ne pense pas qu'elle vienne d'une quelconque malice des développeurs. C'est une exigence légitime, à laquelle il fallait bien répondre d'une façon ou d'une autre.

C'est dans ce contexte que des outils comme **systemd** ou les environnements de bureau complets (GNOME, KDE) sont apparus. Je n'irais pas jusqu'à dire qu'ils sont mauvais en soi : ce sont des écosystèmes pensés pour gérer un chaos réel.

Ce qui me pose question, c'est plutôt leur *manière* d'exister.

Un composant peut devenir un ensemble à couplage serré, et 3 signes le trahissent.

- Ses parties se séparent difficilement.
- Ses journaux passent en format binaire, `journald` notamment.
- Ses dépendances forment un labyrinthe que je peine encore à cartographier.

J'ai alors l'impression qu'on enterre la complexité sous des couches d'abstraction au lieu de la résoudre.

Je le dis sans trancher, parce que ce débat oppose depuis quinze ans des ingénieurs qui, eux, connaissent ces systèmes bien mieux que moi. Mon rôle n'est pas de juger à leur place, seulement de comprendre où se situe la ligne.

> Le problème n'est peut-être pas qu'ils existent. Le problème, ce serait plutôt *comment* ils existent.

Ce que j'essaie de me demander, ce n'est pas s'il faudrait revenir à un terminal nu et un noyau recompilé à la main, ce serait absurde et je n'en ai d'ailleurs pas vraiment envie. C'est plutôt si la perte de modularité, de transparence et de composabilité était vraiment le prix à payer ou si on a simplement choisi la facilité : ajouter une couche, puis une autre, en comptant sur l'abondance des ressources. La RAM n'étant plus bon marché et les CPU, bien que rapides, ont leurs limites. Je n'ai pas de certitude là-dessus. Ce que je constate, plus modestement, c'est qu'il devient de plus en plus difficile pour moi de savoir « ce qui se passe en dessous » sans y consacrer un temps que je n'ai pas toujours.

---

## Une boussole, pas un dogme

Je ne pense pas que la philosophie Unix doive devenir un dogme. Vouloir tout réécrire en C ou vivre avec un terminal nu par principe, ça ressemblerait davantage à une posture qu'à une méthode. À l'inverse, accepter toute la complexité actuelle en se disant que « c'est comme ça maintenant », ça m'a longtemps semblé être une façon confortable de ne plus se poser de questions.

Ce que j'essaie de faire, c'est d'utiliser cette philosophie comme une boussole plutôt que comme une règle absolue. Elle m'aide à me poser des questions simples, même si je n'ai pas toujours de réponse satisfaisante :

- Est-ce que ce programme fait une chose, ou en fait 100 sans le dire clairement ?
- Est-ce que je peux retirer une pièce sans que tout s'effondre ?
- Est-ce que je comprends vraiment ce qui se passe en dessous ou est-ce que je fais semblant ?

Quand la réponse est non, je commence à me dire que le problème n'est peut-être pas seulement technique. Il est peut-être aussi, un peu, philosophique.

Je ne crois pas que cette philosophie soit morte. Je la vois plutôt comme enfouie sous des couches de décisions prises par pragmatisme et de fausses bonnes idées. Elle ressurgit chaque fois qu'un développeur écrit un programme qui fait une chose et la fait bien, chaque fois que quelqu'un préfère la simplicité à une fonctionnalité de plus.

Je n'ai pas fini de comprendre cette philosophie, et je m'en méfierais si c'était le cas : le jour où on croit avoir bouclé le sujet, c'est en général qu'on a arrêté de le regarder de près. J'en retiens un point sur lequel je ne compte pas transiger : la complexité est facile, elle s'accumule toute seule si on la laisse faire. La simplicité, elle, se travaille, décision après décision. C'est ce travail-là que je choisis de continuer.
