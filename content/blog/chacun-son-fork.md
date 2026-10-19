---
title: "Chacun son fork"
date: 2026-10-19
draft: false
description: "Porter un jeu en 2 jours m'a convaincu que le coût du logiciel sur mesure s'est effondré. Ce que le libre y gagne, ce qu'il risque d'y perdre et ce que ça ouvre à n'importe quelle entreprise."
tags: ["logiciel libre", "FOSS", "portage", "méthode", "IA"]
categories: ["méthode"]
---

Depuis des mois, mon fil d'actualité me répète qu'une IA peut ouvrir n'importe quel programme comme une boîte de conserve. Décompilé, porté, cloné, craqué : les mots circulent sans qu'on prenne la peine de les distinguer et plus le sujet chauffe, moins on en parle précisément. J'ai préféré aller voir par moi-même. Le matériau était sous la main : un jeu que j'avais acheté, vendu pour Windows seulement, alors que je joue sur un PC Linux et sur une console portable Android.

Il a tourné sur les 2 machines au bout de 2 jours. Ce chiffre m'a appris davantage que tout ce que j'avais lu sur le sujet et ce qu'il annonce, je crois, dépasse largement les jeux vidéo.

## Un droit peu connu se démocratise

Le logiciel libre repose sur une promesse simple : quand une décision ne me convient pas, je prends les sources et je pars de mon côté. Ce droit a 40 ans et la plupart des gens qui en bénéficient tous les jours ignorent qu'ils le détiennent.

Ceux qui le savaient butaient sur la facture et elle ne se trouve pas là où on la cherche. La copie du dépôt est gratuite : c'est ce qui vient après qui coûte, un fork se corrigeant et se portant sur chaque version suivante. Cette charge courante faisait le tri.

La décompilation de *Super Mario Galaxy* donne la mesure de ce que ça coûtait : le projet Petari l'a menée à 100 % fin septembre 2026, après près de 7 ans et demi de travail bénévole. Ses auteurs précisent n'avoir employé aucune IA, leur règlement l'interdisant.

Mon portage, lui, a demandé 2 jours.

S'il existe, c'est que personne d'autre n'allait le faire : aucun comité à convaincre, aucun vote qui glisse de trimestre en trimestre, aucune politique de dépôt à faire évoluer, le besoin était le mien et le travail aussi. Là où il m'aurait fallu des semaines il y a encore peu, 2 jours ont suffi.

Je ne suis pas un cas isolé, remarquez. Hakan Seven voulait ouvrir des plans DWG sous Linux : il a écrit Open CAD Studio en Rust, sous licence GPL et il poursuit le développement tant que les dons couvrent le coût de l'IA. Le fork a changé d'unité de mesure, ce qui me paraît être le fait marquant de l'année : il se comptait en années d'un bénévole, il se compte maintenant en facture mensuelle.

## Tout le monde libre et chacun dans son coin

Cette liberté retrouvée a un prix qui devient préoccupant alors que les questions de droit occupent toutes les discussions.

Ce qui me trouble, c'est l'atomisation : le même programme se fractionne en milliers de variantes privées, chacune avec ses propres défauts tandis que les correctifs ne remontent plus vers l'amont. Le modèle qui a bâti l'écosystème ouvert reposait sur l'inverse : la rareté de l'effort forçait la mise en commun. Quand maintenir coûtait cher, contribuer en amont restait la seule voie raisonnable.

Cette contrainte disparaît: Chacun régénère son outil pour lui-même, sans que rien ne l'oblige à le rendre utilisable par d'autres. Un correctif qui dort dans un dépôt privé ne sert jamais qu'une personne.

La friction se voit déjà. Un portage macOS non officiel de Notepad++, écrit avec des agents en avril 2026, a valu à son auteur une plainte pour marque. Don Ho, créateur du programme, l'a désavoué publiquement et le projet s'appelle depuis Nextpad++.

## Où sont passées ces 2 journées ?

Pas dans l'écriture en tout cas. Celle-ci a pris quelques heures et le reste est parti dans une chaîne d'outils et une architecture qui tiennent juridiquement.

Un joueur fantôme venu de l'accéléromètre de la console, un écran noir dont la cause m'échappe encore (je n'ai pas renoncé, j'ai seulement arrêté de chercher), un écran de configuration dont la correction consistait à ne rien corriger. Ces 3 pannes ne se déduisaient d'aucune lecture des sources, aucun agent ne me les aurait signalées avant que je branche l'appareil.

Les licences ont pesé autant que les lignes. Une seule bibliothèque propriétaire au cœur du son fermait d'avance toute possibilité de distribution ouverte et ce genre de vérification se fait au début d'un chantier ou se paie à la fin.

Le jugement reste entier, lui aussi : décider qu'un programme mérite d'être maintenu, puis tenir le dépôt sur la durée. Si je devais résumer ces 2 jours en une phrase, ce serait celle-là : le goulot d'étranglement s'est desserré au niveau de la production.

## Ce que ça ouvre à une entreprise

Un particulier qui porte un programme devine tout : les sources lui manquent, la documentation aussi et les ingénieurs qui l'ont écrit ne répondront pas. L'entreprise qui détient ces 3 ressources part de bien plus haut avec les mêmes outils. 

Les démonstrations s'accumulent depuis l'automne 2026. Brandon Thomas a publié ArtCraft, une suite graphique écrite en Rust avec un assistant, qu'il présente lui-même comme très préliminaire, puis l'a doublée de CADCraft, annoncé comme une réimplémentation d'AutoCAD en salle blanche. Rick Brewster, de son côté, a fait écrire environ 180 000 lignes de Direct2D selon la même méthode, pour que Paint.NET tourne sous Wine.

Ces résultats restent grossiers et je ne les présente pas autrement : les programmes tombent en panne, certains fichiers DWG produits demeurent illisibles par les outils d'Autodesk. La demande, elle, est ancienne : les forums d'Autodesk réclament Fusion sous Linux depuis des années, quelques utilisateurs se disant même prêts à rendre leur licence pour l'obtenir. La capacité manquait, pas l'envie.

Une entreprise dont toute la valeur repose sur la difficulté de programmer son produit se retrouve exposée, cette difficulté étant son seul fossé. Celle dont la valeur tient à ses serveurs, à son catalogue ou à sa communauté l'est beaucoup moins. Réécrire une interface de streaming ne donne accès à aucun catalogue et les accords signés avec les ayants droit ne se clonent pas.

La question se pose alors : un produit tient-il à la difficulté de le refaire ou à ce qu'un clone n'aurait pas ?

## Ceux qui ont choisi l'inverse

On peut jouer autre chose que le verrouillage: Mojang a annoncé en octobre 2025 cesser d'obscurcir le code de *Minecraft: Java Edition*, précisément pour faciliter la vie des moddeurs. Gabe Newell, lui, répète depuis 2011 que le piratage relève d'un problème de service avant d'être un problème de prix. Steam a prospéré en rendant l'achat plus simple que le téléchargement illégal.

Le raisonnement vaut au-delà du jeu, me semble-t-il : les mêmes outils qui menacent une entreprise abaissent ses propres coûts et elle avance avec ses sources et ses droits, que personne d'autre ne possède.

## Le plus dur commence après

Ce portage m'a montré un métier où produire cesse d'être le facteur limitant. J'y vois une invitation à viser plus haut : les chantiers qu'on écartait d'un revers de main pour leur coût méritent un second examen.

La responsabilité change de place en même temps. Produire du jetable n'a jamais été aussi facile. Or un dépôt abandonné au bout d'un mois rend un moins bon service qu'un outil qui n'aurait jamais existé. Le maintenir en le rendant réutilisable par d'autres devient le vrai marqueur de sérieux.

Pour le libre, l'enjeu se déplace vers ce qu'on met en commun. Les spécifications et les tests, les formats de fichiers, les listes de compatibilité qu'on tient à jour pendant des années : tout cela vaut désormais plus que les sources elles-mêmes. Celles-ci se régénèrent à la demande, ce patrimoine partagé qui décide si la régénération vaut quelque chose.

La difficulté de programmer protégeait beaucoup de monde mais à partir de quand un outil qu'on garde pour soi devient-il un outil qu'on doit aux autres ?
