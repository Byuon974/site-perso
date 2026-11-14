---
title: "HiBy R3 II Refonte"
description: "Récit de la refonte du firmware d'un baladeur audio par rétro-ingénierie : comprendre avant de modifier, essayer sans risque, mesurer plutôt que supposer, savoir s'arrêter. Une liste de 34 294 morceaux rendue fluide, une barre de lettres enfin juste, un système allégé de 18 Mo."
date: 2026-11-12
image: "/images/uploads/hiby-r3ii-overview.png"
tags: ["Rétro-ingénierie", "Linux embarqué", "SQLite", "MIPS", "Ghidra"]
status: "Terminé"
role: "Analyse, rétro-ingénierie et développement solo"
period: "2026"
draft: false
---

> Je touche la lettre X sur la barre de mon baladeur ; la liste s'ouvre sur des titres en W. Ce petit défaut m'a mené à décompiler tout le lecteur, à corriger un bogue que le fabricant n'a jamais vu, puis à traverser une boucle de démarrage. Ce récit raconte moins le code que la manière de travailler qui a permis d'en venir à bout.

## Le point de départ

Le HiBy R3 II est un petit baladeur haute fidélité sous Linux. Le mien porte une bibliothèque de 34 294 morceaux. C'est précisément cette taille qui le mettait en difficulté. La liste de tous les morceaux ralentissait à mesure qu'on descendait, la barre de lettres envoyait sur la mauvaise lettre, tandis qu'une mise à jour de la bibliothèque prenait près de 50 minutes. Le son, lui, restait irréprochable : c'est tout ce qui l'entourait qui péchait.

Le fabricant ne fournit ni code source ni outil de développement. Tout le logiciel tient dans un seul programme, livré tel quel. Avant de toucher à quoi que ce soit, il fallait donc décider d'une méthode. Elle tient en une phrase : comprendre avant de modifier, essayer sans flasher, ne flasher qu'une fois sûr.

## Comprendre avant de toucher

La première étape a consisté à décompiler le programme pour le rendre lisible. Le résultat compte près de 12 000 fonctions, si bien qu'on ne le lit pas d'un bloc : on y entre par un indice, un texte affiché à l'écran ou un nom de fichier, puis on remonte le fil jusqu'au comportement qui intrigue.

Très vite, une règle s'est imposée : ne rien affirmer qu'on n'a pas prouvé. Chaque trouvaille entre dans un carnet avec sa preuve et son degré de certitude, de ce qui est lu directement dans le code jusqu'à ce qui reste une hypothèse. Au fil des séances, ce carnet a atteint 122 notes. Il a servi de mémoire d'une séance à l'autre ; surtout, il m'a rappelé plus d'une fois l'écart entre ce que je croyais et ce que le code disait vraiment.

## Pouvoir essayer sans risque

Restait à essayer les modifications. Flasher le baladeur à chaque essai aurait été lent et risqué ; il fallait trouver un moyen de lancer une version modifiée sans toucher au système. Les 2 premières tentatives n'ont rien donné de clair : l'une a brouillé l'écran, l'autre semblait fonctionner sans effet visible.

C'est en vérifiant quel programme tournait réellement que j'ai découvert le pire : **tous les essais menés jusque-là avaient fait tourner, sans que je le sache, le lecteur d'origine.** Les défauts observés venaient donc de lui, non de mes modifications. La leçon a été immédiate : avant de juger un résultat, s'assurer qu'on teste bien ce qu'on croit tester. La troisième méthode, elle, a tenu. Un petit script remplace le lecteur pour un seul démarrage, puis s'efface ; au démarrage suivant, l'appareil retrouve son état normal sans intervention. Dès lors, chaque essai devenait sans risque ; tous les suivants sont passés par là.

## Mesurer plutôt que supposer

La barre de lettres a été le premier vrai chantier. Une première correction partait d'une hypothèse visuelle : les lettres semblaient légèrement décalées sur l'image. A et B se sont mis à fonctionner, mais le reste de l'alphabet n'a pas suivi. Plutôt que d'empiler les retouches, j'ai changé d'approche et relevé, lettre par lettre, où la liste s'ouvrait réellement.

Ce relevé a tout changé. L'erreur ne variait pas d'une lettre à l'autre : elle restait constante, d'environ 510 morceaux à chaque fois. Une erreur de calcul sur la lettre aurait varié ; celle-ci tenait forcément à la façon dont la liste était lue. Le code l'a confirmé. Au-delà de 5 000 morceaux, le lecteur prend un raccourci pour aller plus vite, mais ce raccourci rend le mauvais morceau de liste. Sous ce seuil, A et B passaient entre les gouttes, ce qui expliquait le faux succès de la première correction.

Avant de corriger, j'ai simulé le comportement du lecteur sur sa propre base : le défaut retombait exactement sur les mêmes titres. Une fois le raccourci réparé, la barre est tombée juste du premier coup. Elle a gagné au passage un signe # pour les titres qui commencent par un symbole, tout en répondant 3 fois plus vite.

## Ce qui a changé sur l'appareil

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-barre.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-barre.png" alt="Liste « All songs » avec la barre de lettres redessinée, le signe # en haut" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>La liste « All songs » et sa barre de lettres. Le signe # mène en haut de la liste, où sont rangés les titres qui commencent par un symbole.</figcaption>
</figure>

La barre n'était qu'un début. La même logique, lire le code puis vérifier sur l'appareil, a permis de rendre la liste fluide. Elle relisait jusque-là tous les morceaux précédents à chaque page ; elle va désormais droit à la bonne ligne, si bien que le défilement reste égal jusqu'au dernier morceau. La base des morceaux a gagné un filet de sécurité contre les coupures, qui manquait à l'origine.

Le système, de son côté, s'est allégé de 18,4 Mo. On y trouvait des polices destinées à un autre modèle, des outils de développement oubliés, ainsi que des services réseau que je n'utilise pas. L'interface, enfin, est désormais entièrement en français, avec un accès direct à l'égaliseur depuis l'écran d'accueil.

## Quand tout casse

Vint le moment de réunir tout cela dans une version complète. Chaque modification avait passé son essai ; le flash s'est déroulé normalement, puis l'appareil a redémarré sur le logo HiBy, encore et encore. Le mode de secours, vérifié bien avant ce flash, a permis de remettre le firmware officiel, mais je ne savais pas pourquoi la nouvelle version bouclait.

Plutôt que de deviner, j'ai d'abord rendu l'échec observable. Le script qui lance le lecteur note désormais chaque plantage dans un journal ; après 2 échecs de suite, il démarre automatiquement la version précédente, déjà éprouvée. Une boucle devenait impossible, alors qu'un plantage laissait une trace. Au flash suivant, l'appareil a redémarré 2 fois avant de s'allumer normalement. Le journal désignait clairement le coupable.

Ce coupable, c'était moi. J'avais ajouté une opération de nettoyage de la base à chaque démarrage. Sur une base propre, elle se terminait aussitôt ; sur la base réelle de l'appareil, marquée par une analyse interrompue, elle produisait un résultat que le lecteur n'attendait pas, jusqu'à le faire planter. Pourquoi les essais n'avaient-ils rien vu ? Parce que je remettais une base de référence propre avant chacun d'eux, pour que les résultats restent comparables. **Le défaut tenait à l'essai autant qu'au code.** Le nettoyage a donc quitté l'appareil pour se faire sur l'ordinateur, avec une vérification à la clé. Flashée le soir même, la version corrigée a démarré du premier coup.

## Savoir s'arrêter

Une refonte se juge aussi à ce qu'elle refuse. En cours de route, 4 pistes ont été ouvertes puis refermées, toujours selon le même critère : un gain sûr, pour un risque et un effort raisonnables.

Le Bluetooth à la demande promettait de libérer de la mémoire. J'ai eu le tort de faire tenter l'essai avant de lire le code, qui donnait déjà la réponse : la fonction n'existait pas sous une forme qu'on pouvait simplement activer, si bien qu'il aurait fallu l'écrire de zéro. L'accélération de l'analyse de la bibliothèque a été mesurée avant d'être touchée : le baladeur lisait déjà la carte mémoire à pleine vitesse, alors que chaque essai coûtait près d'une heure. Quant au cache de pochettes, il demandait lui aussi du code neuf, pour un gain que la bibliothèque peut obtenir autrement, avec des images de taille raisonnable.

Restait une dernière tentation : remplacer tout le logiciel par Rockbox, un lecteur libre qui tourne déjà sur des modèles voisins. Le port était faisable, mais il aurait coûté le Bluetooth et l'interface tactile pour reconstruire ce qui marchait déjà. Pas gagnant. Chacune de ces décisions est notée avec sa raison, de sorte qu'aucune piste ne sera rouverte par oubli.

## Ce que la lecture a révélé

À force de lire un programme entier, on finit par voir ce que personne ne cherchait. Le firmware d'origine avait l'allure d'un produit livré dès qu'il a fonctionné : une base sans protection contre les coupures, des opérations répétées à chaque démarrage alors qu'elles échouent depuis longtemps, des fichiers d'un autre modèle laissés en place.

Un détail a pesé sur la suite. À chaque connexion réseau, le baladeur interroge le serveur du fabricant sans vérifier à qui il parle vraiment ; or une mise à jour acceptée effacerait tout ce travail. La consigne est donc simple : la refuser. De même, moderniser les briques internes, qui datent de plusieurs années, ne rapporterait rien d'utile alors que l'opération risquerait tout ; elles restent en l'état.

## Ce que le projet m'a appris

Un essai ne vaut que son état de départ. Repartir d'une base propre rendait mes résultats comparables, mais masquait le cas que l'appareil rencontre tous les jours : une base qui a vécu. Désormais, je teste aussi sur l'état réel, pas seulement sur l'état idéal.

Le reste tient en 2 réflexes que je garde. Le premier consiste à lire avant de demander un essai, puisque le Bluetooth m'a coûté une manipulation pour une réponse que le code donnait déjà. Le second consiste à prévoir l'échec avant de flasher : le filet qui a sauvé la version complète est arrivé après la boucle, alors qu'il aurait dû la précéder.
