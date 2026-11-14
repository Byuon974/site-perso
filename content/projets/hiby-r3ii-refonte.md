---
title: "HiBy R3 II Refonte"
description: "Refonte du firmware d'un baladeur audio par rétro-ingénierie, en 4 jours : une bibliothèque de 34 294 morceaux rendue fluide, un système allégé de 18,4 Mo, une interface redessinée avec bascule sombre et clair."
date: 2026-11-14
image: "/images/uploads/hiby-r3ii-overview.png"
tags: ["Rétro-ingénierie", "Linux embarqué", "SQLite", "MIPS", "Ghidra", "Interface"]
status: "Terminé"
role: "Analyse, rétro-ingénierie et développement solo"
period: "2026"
draft: false
---

> Le HiBy R3 II est un baladeur audio sous Linux, livré sans code source ni outil de développement : tout son logiciel tient dans un seul programme. Cette refonte le reprend par rétro-ingénierie, en 4 jours et 7 versions. Une bibliothèque de 34 294 morceaux rendue fluide, une barre de lettres qui tombe juste, un système allégé de 18,4 Mo, une interface redessinée avec bascule sombre et clair. Un kit refait le tout depuis le firmware officiel en 5 secondes.

## Ce que j'aime et ce qui gêne

Mon baladeur tient dans une poche et fait presque tout ce que je lui demande. La musique tient sur une carte microSD que je remplis moi-même, sans compte ni synchronisation : l'appareil n'a aucune mémoire interne et accepte des cartes jusqu'à 2 To. En bas, 2 prises, une 3,5 mm et une 4,4 mm symétrique, me laissent brancher le casque ou l'ampli que je veux. Le son, lui, est net et sans souffle. Le HiBy R3 II réussit la partie difficile.

Reste le logiciel. Je touche la lettre X sur la barre de défilement : la liste s'ouvre sur des titres en W. La liste de tous les morceaux ralentit à mesure qu'on descend. Une mise à jour de la bibliothèque prend près de 50 minutes. Ma bibliothèque compte 34 294 morceaux : c'est cette taille qui met l'appareil en difficulté.

D'autres possesseurs du R3 II rencontrent les mêmes gênes. Sur un site spécialisé, l'un en fait le principal défaut du baladeur, un autre lui retire une demi-étoile pour son interface ; une synthèse de 129 avis d'acheteurs conclut que presque toutes les critiques visent le logiciel plutôt que le matériel. Aucune de ces gênes n'a de correction simple côté utilisateur : ni réglage, ni mise à jour. Les bases SQLite du lecteur portent de surcroît des noms de tables et de colonnes en pinyin. J'ai donc pris le problème par le bout qui se corrige.

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-accueil-origine.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-accueil-origine.png" alt="Écran d'accueil d'origine du HiBy R3 II tenu en main : six tuiles turquoise à coins arrondis, libellés en anglais" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>L'accueil d'origine, au déballage : tuiles turquoise arrondies, menus en anglais.</figcaption>
</figure>

Le fabricant ne fournit ni code source ni outil de développement : le logiciel est livré tel quel, en un seul programme. Rien à recompiler, rien à étendre. Reprendre un appareil dans cet état demande une méthode avant d'écrire du code : savoir de quoi il est fait, avant de décider quoi y changer. Les premiers sondages ont confirmé le pari de départ : les corrections les plus utiles tenaient à la base de données et à l'usage de la mémoire, 2 endroits où quelques octets changent tout. Les 4 jours qui suivent ont éprouvé la méthode, de la barre de lettres au mode clair, en passant par une boucle de démarrage qui a coûté 3 h 30.

## Les 5 couches de l'appareil

Avant de corriger quoi que ce soit, il a fallu savoir de quoi l'appareil est fait. Un développeur qui reprend son propre programme dispose déjà de cette carte. En rétro-ingénierie, elle n'existe pas. La dresser est le premier travail : on part de ce qui s'observe, on suppose le reste, on éprouve chaque supposition. Voici celle du R3 II, telle qu'elle s'est dessinée au premier jour et telle qu'elle a tenu jusqu'au bout.

- **le lecteur**, le programme unique qui fait tout, du menu d'accueil au décodage audio : c'est la seule couche qui demande de modifier du code compilé ;
- **le lanceur**, un script qui démarre ce programme à l'allumage : un fichier texte, que l'on remplace en quelques secondes ;
- **le thème**, les images et les fichiers de mise en page chargés au démarrage : tout ce que l'écran affiche en vient, sans une ligne de code ;
- **les textes**, les libellés des menus, logés à part du programme ;
- **la base**, un fichier SQLite qui recense les morceaux de la carte mémoire : lisible et réparable depuis un ordinateur, une fois identifiés ses noms de tables et de colonnes en pinyin.

Au-dessus de ces 5 éléments se trouve le firmware, l'image complète que l'on écrit dans l'appareil. En dessous se tient un mode de secours : une combinaison de touches au démarrage, qui réécrit le firmware officiel même quand plus rien ne s'allume. Je l'ai vérifié avant la première modification : un appareil irrécupérable aurait arrêté le projet au jour 1.

Cette carte a décidé de l'ordre du travail. Chaque défaut rencontré commence par la même question : de quelle couche relève-t-il ? La réponse change tout. Un défaut du thème se corrige en remplaçant une image. Un défaut du lecteur demande de modifier un programme dont je n'ai pas le code. La méthode, elle, ne varie pas d'une couche à l'autre : observer, formuler une hypothèse, la mettre à l'épreuve, trancher. Les enquêtes qui suivent répètent cette boucle. Les plus instructives sont celles où mon hypothèse de départ s'est révélée fausse.

## Rendre le programme lisible puis essayable

Dresser cette carte, au jour 1, est passé par la décompilation. Le résultat compte près de 12 000 fonctions : on ne lit pas ça d'un bloc. On y entre par un indice : un texte affiché à l'écran, un nom de fichier. De là, on remonte le fil jusqu'au comportement qui intrigue. L'objectif fixait la limite du travail : en comprendre assez pour corriger ce qui gênait, pas une fonction de plus.

Une règle s'est imposée très vite : ne rien affirmer qu'on n'a pas prouvé. Chaque trouvaille entre dans un carnet avec sa preuve et son degré de certitude, du lu-dans-le-code jusqu'à l'hypothèse. Le premier soir, ce carnet comptait 30 notes. À la fin du projet, 204. Il a servi de mémoire d'une séance à l'autre et m'a rappelé plus d'une fois l'écart entre ce que je croyais et ce que le code disait.

Un code lisible ne suffit pourtant pas à essayer quoi que ce soit. Flasher le baladeur à chaque essai aurait été lent et risqué : il fallait lancer une version modifiée sans toucher au système. Les 2 premières tentatives n'ont rien donné de clair. L'une a brouillé l'écran. L'autre semblait fonctionner, sans effet visible.

J'ai fini par vérifier quel programme tournait réellement. **Tous les essais menés jusque-là avaient lancé, sans que je le sache, le lecteur d'origine.** Les défauts observés venaient de lui, non de mes modifications. La leçon a été immédiate : avant de juger un résultat, s'assurer qu'on teste bien ce qu'on croit tester.

La troisième méthode, en revanche, a tenu. Un petit script remplace le lecteur pour un seul démarrage puis s'efface : au démarrage suivant, l'appareil retrouve son état normal sans intervention. Dès lors, un essai ne coûtait plus rien. Tous les suivants, jusqu'au dernier soir, sont passés par là.

## La barre de lettres et ce qu'elle a ouvert

Au jour 2, la barre de lettres est devenue le premier vrai chantier. Ma première hypothèse était visuelle : les lettres semblaient décalées sur l'image. J'ai corrigé ce décalage. A et B se sont mis à fonctionner. Le reste de l'alphabet non. J'ai arrêté d'empiler les retouches pour relever, lettre par lettre, où la liste s'ouvrait réellement.

Ce relevé a tout changé. L'erreur ne variait pas d'une lettre à l'autre. Elle restait constante : environ 510 morceaux à chaque fois. Une erreur de calcul sur la lettre aurait varié ; celle-ci tenait forcément à la façon dont la liste était lue. Le défaut relevait donc du lecteur : la seule couche qui demande de toucher au code. Celui-ci a confirmé l'hypothèse : au-delà de 5 000 morceaux, le lecteur prend un raccourci pour aller plus vite ; ce raccourci rend le mauvais morceau de liste. Sous ce seuil, A et B passaient entre les gouttes, ce qui expliquait le faux succès de la première correction.

Avant de corriger, j'ai simulé le comportement du lecteur sur sa propre base : le défaut y retombait exactement sur les mêmes titres. L'explication cessait d'être une hypothèse. Une fois le raccourci réparé, la barre est tombée juste du premier coup. Elle a gagné au passage un signe # pour les titres qui commencent par un symbole, tout en répondant 3 fois plus vite.

Lire un programme entier finit par montrer ce que personne ne cherchait. Le firmware d'origine a l'allure d'un produit livré dès qu'il a fonctionné. Une base sans protection contre les coupures. Des opérations répétées à chaque démarrage alors qu'elles échouent depuis longtemps. Des fichiers destinés à un autre modèle, laissés en place.

La journée a servi à reprendre ce qui pouvait l'être sans risque. La liste de tous les morceaux relisait tous les morceaux précédents à chaque page : elle va désormais droit à la bonne ligne ; le défilement reste égal jusqu'au dernier titre. La base a gagné le filet de sécurité qui lui manquait. Le système s'est allégé de 18,4 Mo : des polices, des outils de développement oubliés, des services réseau que je n'utilise pas. L'interface est passée entièrement en français, avec un accès direct à l'égaliseur depuis l'écran d'accueil.

## La boucle de démarrage

En début d'après-midi, il restait à réunir tout cela dans une version complète. Chaque modification avait passé son essai et le flash s'est déroulé normalement. Puis l'appareil a redémarré sur le logo HiBy : encore et encore. Le mode de secours vérifié au jour 1 a servi pour de bon : il a remis le firmware officiel, sans pour autant m'apprendre pourquoi la nouvelle version bouclait.

Deviner n'aurait rien donné de plus : j'ai rendu l'échec observable. Le script qui lance le lecteur note désormais chaque plantage dans un journal ; après 2 échecs de suite, il démarre automatiquement la version précédente, déjà éprouvée. Une boucle devenait impossible. Un plantage laissait une trace. Au flash suivant, l'appareil a redémarré 2 fois avant de s'allumer normalement. Le journal désignait le coupable.

Ce coupable, c'était moi. J'avais ajouté une opération de nettoyage de la base à chaque démarrage. Sur une base propre, elle se terminait aussitôt. Sur la base réelle de l'appareil, marquée par une analyse interrompue, elle rendait un résultat que le lecteur n'attendait pas, jusqu'à le faire planter. Pourquoi les essais n'avaient-ils rien vu ? Parce que je remettais une base de référence propre avant chacun d'eux, pour que les résultats restent comparables. **Le défaut tenait à l'essai autant qu'au code.** Le nettoyage a quitté l'appareil pour s'exécuter sur l'ordinateur, avec une vérification à la clé. À 17 h 32, 3 h 30 après le premier plantage, la version corrigée a démarré du premier coup.

## Le confort, une fois la stabilité acquise

Au jour 3, l'appareil était stable : la version suivante pouvait viser le confort. Les vignettes de pochettes, dans une liste, étaient décodées puis gardées en mémoire par paquets de 16 : au-delà, revenir en arrière obligeait à tout redécoder. Le code montrait où se trouvait ce plafond et comment le lecteur recyclait la plus ancienne vignette une fois ce plafond atteint. Le porter à 48 tenait en 2 octets.

Encore fallait-il que la mémoire suive, sur un appareil qui n'en compte que 58 Mo. Un relevé pendant un défilement soutenu a montré une consommation stable, voire en légère baisse : 18 Mo restaient disponibles. La même version a fermé un risque repéré plus tôt dans le code. À chaque connexion réseau, le baladeur interrogeait le serveur du fabricant, sans vérifier à qui il parlait vraiment. Une mise à jour acceptée aurait effacé tout ce travail. Cette fonction rend désormais la main aussitôt, sans requête. Le menu Réseau, pour finir, n'affiche plus que le Wi-Fi et le Bluetooth, puisque les autres services avaient déjà quitté le système.

## Refaire l'interface

Dès l'après-midi du jour 3, le dernier chantier s'est ouvert, visuel cette fois. L'interface d'origine, avec ses tuiles arrondies et ses teintes vertes et turquoise, datait. Plutôt que de retoucher écran par écran, j'ai fixé la cible dans une maquette : un bleu acier, des rectangles nets, un mode sombre presque noir et un mode clair gris froid. Restait à rapprocher l'appareil de cette maquette, sans toucher au code chaque fois que c'était possible.

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-lecture-origine.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-lecture-origine.png" alt="Visuel de présentation du HiBy R3 II : écran de lecture d'origine, pochette à coins arrondis sur fond bleu marine" width="800" height="800" loading="lazy">
  </picture>
  <figcaption>L'écran de lecture d'origine, sur le visuel de présentation de HiBy : pochette à coins arrondis, fond bleu marine uni.</figcaption>
</figure>

L'essentiel est en effet passé par le thème. J'ai redessiné 71 panneaux et tuiles à angles droits, avant d'appliquer la palette sombre à 202 images et 47 vues.

Un détail a résisté plus longtemps : la pochette de l'écran de lecture restait arrondie. Tout désignait le code, qui contient bien une fonction de dessin à coins ronds, au point que j'avais préparé un correctif dans ce sens. La pochette est finalement devenue carrée par accident, lors d'un essai qui ne touchait qu'au thème. Le coupable était une image. Un cache posé par-dessus la pochette, dont les 4 coins opaques peignaient l'arrondi : le défaut relevait du thème, pas du lecteur. La remplacer par une image transparente a suffi. Le correctif du code est parti à la corbeille. **Le code expliquait comment l'appareil dessinait ; il ne disait pas ce qu'il dessinait.**

<figure class="figure-paire">
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-accueil-sombre.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-accueil-sombre.png" alt="Écran d'accueil refait en mode sombre : six tuiles rectangulaires bleu acier, libellés en français, une tuile Égaliseur" width="640" height="960" loading="lazy">
  </picture>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-accueil-clair.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-accueil-clair.png" alt="Le même écran d'accueil en mode clair : tuiles gris froid, icônes et libellés sombres" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>L'accueil refait, en mode sombre puis en mode clair. À comparer aux tuiles turquoise arrondies du début : angles droits, libellés en français, égaliseur promu au premier écran à la place de la lecture en réseau.</figcaption>
</figure>

Basculer entre les 2 modes demandait ensuite un bouton. Le firmware sait changer de thème, mais seulement depuis un réglage enfoui dans les menus. D'où l'idée : récupérer un bouton du volet déroulant, celui qu'on ouvre d'un geste depuis le haut de l'écran.

Encore fallait-il savoir quel code s'exécutait au toucher. Dans la soirée, j'ai instrumenté les fonctions qui semblaient gérer ces boutons : 8 au total, dont aucune ne s'est déclenchée. Ajouter une 9e au hasard ne menait nulle part. Je suis remonté d'un cran pour tracer la fonction par laquelle passent tous les réglages. Le relevé est alors tombé du premier coup : le bouton d'alimentation écrit le réglage 9, celui d'AirPlay le réglage 0x34. Intercepter un seul réglage suffisait par conséquent à en faire une bascule de thème, tous les autres continuant leur chemin d'origine.

Le premier essai n'a rien donné. La décompilation a dit pourquoi en quelques minutes : le code appelé pour recharger le thème s'arrêtait dès sa première condition avec les valeurs que je lui passais. Le second a repris la chaîne de rechargement que le firmware emploie lui-même. La bascule a fonctionné, d'abord sur le bouton d'alimentation. Ce bouton devait toutefois garder sa mise en veille : la bascule est passée sur celui d'AirPlay, inutile depuis que ce service avait quitté le système. Une icône mi-lune mi-soleil a remplacé la sienne, avec son état pressé comme les autres boutons.

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-volet-bascule.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-volet-bascule.png" alt="Volet déroulant en mode clair : réglage du volume, boutons Bluetooth, Wi-Fi et alimentation, icône mi-lune mi-soleil à la place d'AirPlay" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>Le volet déroulant en mode clair, à 1 h 11 au jour 4. L'icône mi-lune mi-soleil, en haut à droite, occupe la place d'AirPlay et bascule le thème.</figcaption>
</figure>

## Le halo et ce que le mode clair a imposé

Il manquait encore un élément de la maquette : un halo de couleur derrière la pochette, sur l'écran de lecture. Dans la nuit du jour 3 au jour 4, une image plein écran, posée derrière tous les autres éléments, a donné le résultat attendu en mode sombre. Le halo suit même la couleur d'accent que l'on règle dans les menus, sans une ligne de code.

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-halo-sombre.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-halo-sombre.png" alt="Écran de lecture en mode sombre : pochette carrée sur un halo bleu qui fonce vers le bas, barre d'état sombre" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>Le mode sombre de la v7 flashée, à 3 h 58 au jour 4. La couleur d'accent, réglée ici en bleu dans les menus, teinte aussi le halo.</figcaption>
</figure>

Le mode clair, lui, a résisté à plusieurs essais. Chaque dégradé que je proposais sortait délavé, presque blanc : le même fichier s'affichait pourtant correctement sur l'ordinateur. J'ai retouché les teintes plusieurs fois avant d'en venir à ce que j'aurais dû faire d'emblée : lire la fonction qui recolore les images. Elle remplace la teinte de chaque pixel par la couleur d'accent, en conservant sa luminosité. Un pixel sombre devient donc une couleur saturée. Un pixel clair reste clair : presque blanc, quelle que soit sa teinte de départ.

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-clair-delave.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-clair-delave.png" alt="Écran de lecture du mode clair : fond presque blanc, dégradé à peine visible derrière la pochette" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>À 2 h 37 au jour 4, un des dégradés clairs essayés : le moteur de couleur garde la luminosité de chaque pixel, si bien que le fond ressort presque blanc.</figcaption>
</figure>

Aucun réglage de dégradé ne pouvait corriger cela. J'ai alors rendu l'écran de lecture du mode clair immersif comme le sombre : texte clair sur dégradé bleu nuit. Les menus et les listes, eux, restent clairs. À 3 h 03, au jour 4, le résultat était enfin cohérent avec la maquette.

<figure>
  <picture>
    <source srcset="/images/uploads/hiby-r3ii-clair-immersif.webp" type="image/webp">
    <img src="/images/uploads/hiby-r3ii-clair-immersif.png" alt="Écran de lecture du mode clair, immersif : barre d'état claire, pochette sur un dégradé bleu nuit, titre et commandes en clair sur une bande sombre" width="640" height="960" loading="lazy">
  </picture>
  <figcaption>Le mode clair de la v7 flashée, à 3 h 56 au jour 4 : la barre d'état reste claire, alors que l'écran de lecture passe au bleu nuit jusqu'à la bande des commandes.</figcaption>
</figure>

## Rendre le travail refaisable puis s'arrêter

Avant de construire la dernière version, j'ai ajouté un détail que l'on attend aujourd'hui d'un logiciel : son numéro. La page « À propos » affiche désormais « v7 20261114 » là où figurait la date de compilation d'origine. On sait d'un coup d'œil quelle version tourne.

La version 7 flashée et validée, il restait à rendre ce travail refaisable. Un firmware modifié qui n'existe que sous forme d'image ne se corrige pas : on ne sait plus ce qu'il contient, ni pourquoi. J'ai donc réduit tout le travail à un kit qui part du firmware officiel et le transforme en une commande.

Encore faut-il tenir ce firmware officiel. HiBy ne le propose pas au téléchargement : l'appareil va le chercher lui-même, au moment de sa mise à jour en ligne. La fonction qui prépare ce téléchargement porte en clair l'adresse du serveur et les 4 paramètres qu'elle lui envoie : le nom du produit, la version installée, l'identifiant de l'appareil et la langue.

Depuis un ordinateur, il suffit de poser la même question, en annonçant une version très ancienne : le serveur répond avec la dernière disponible, son adresse, sa taille et son empreinte. L'empreinte sert à vérifier le fichier obtenu : c'est lui que le kit exige. La fonction qui me l'a indiqué est celle que la version 6 neutralise sur l'appareil : coupée côté baladeur, elle reste interrogeable depuis un ordinateur.

Le lecteur n'y figure pas en binaire : il tient en 723 octets de correctifs, répartis en 49 plages. Chacune porte son adresse, son contenu d'avant et une phrase d'explication. Le kit vérifie chaque plage avant de l'écrire et refuse tout autre firmware que l'officiel. Le reste se range en modules que l'on retire ou que l'on ajoute : allègement, lecteur, lanceur, textes, interface. Reconstruire la version 7 prend 5 secondes. Le résultat est identique, fichier pour fichier, à celui qui tourne sur l'appareil.

Cette vérification a d'ailleurs corrigé une erreur de ma part. Pendant l'assemblage, j'avais pris pour un fichier abîmé la police Ubuntu de la maquette, près de 80 fois plus légère que celle d'origine. Je l'avais remplacée par l'originale. Elle avait pourtant passé l'essai la veille. Faute de contenir les caractères chinois et japonais, elle devient une option du kit, à essayer avant de l'adopter.

Une refonte se juge aussi à ce qu'elle refuse. En cours de route, 4 pistes ont été ouvertes puis refermées, toujours selon le même critère : un gain sûr, pour un risque et un effort raisonnables. Le Bluetooth à la demande promettait de libérer de la mémoire. J'ai eu le tort de tenter l'essai avant de lire le code, qui donnait déjà la réponse : la fonction n'existait pas sous une forme activable ; il aurait fallu l'écrire de zéro. L'accélération de l'analyse de la bibliothèque, à l'inverse, a été mesurée avant d'être touchée. Or le baladeur lisait déjà la carte mémoire à pleine vitesse, alors que chaque essai coûtait près d'une heure.

Le cache de pochettes sur la carte demandait du code neuf, pour un gain que la bibliothèque obtient autrement, avec des images de taille raisonnable. Agrandir le cache en mémoire, déjà présent, a suffi. Les briques internes du système, pour finir, datent de plusieurs années. Les moderniser risquerait tout pour ne rien rapporter d'utile : elles restent en l'état.

Restait une dernière tentation : remplacer tout le logiciel par Rockbox, un lecteur libre qui tourne déjà sur des modèles voisins. Le port était faisable, le lecteur HiBy restant disponible au démarrage ; il aurait toutefois fallu partir d'un portage encore instable, conçu pour d'autres appareils. Chacune de ces décisions est notée avec sa raison, de sorte qu'aucune piste ne sera rouverte par oubli.

Le projet s'arrête à la version 7, au petit matin du jour 4. D'autres idées restent ouvertes : une liseuse qui adapte la taille du texte à l'écran, une entrée blanche dans le sélecteur de couleur. Chacune demanderait du code neuf pour un confort marginal. Le gain ne justifie plus l'effort : c'est le bon moment pour s'arrêter.

## Ce que le projet m'a appris

Un essai ne vaut que son état de départ. Repartir d'une base propre rendait mes résultats comparables, mais masquait le cas que l'appareil rencontre tous les jours : une base qui a vécu. Désormais, je teste aussi sur l'état réel, pas seulement sur l'état idéal.

Au-delà de cette leçon, je garde 3 réflexes. Le premier consiste à lire avant d'essayer. Le Bluetooth m'a coûté une manipulation pour un résultat que le code annonçait. Le halo du mode clair m'a coûté plusieurs allers-retours pour une règle que la fonction de couleur énonçait en quelques lignes. Le deuxième demande de prévoir l'échec avant de flasher : le filet qui a sauvé la version complète est arrivé après la boucle, alors qu'il aurait dû la précéder. Le troisième impose de remonter d'un cran quand une recherche s'enlise : 8 fonctions instrumentées pour rien ; une seule ensuite, celle par laquelle tout passe, qui a répondu du premier coup.

Entre la lettre X qui ouvrait sur des W et l'écran de lecture qui suit la couleur de mon choix, il s'est écoulé 4 jours. À chaque étape, le plus long a été de comprendre ce qu'il fallait corriger ; la correction, elle, suivait vite.
