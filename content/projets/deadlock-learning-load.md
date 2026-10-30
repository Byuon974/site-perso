---
title: "Deadlock Learning Load"
description: "Tableau de bord qui met 21 affirmations sur la difficulté d'un jeu à l'épreuve de 2 sources publiques : les fichiers du client et 11 jeux de statistiques de parties. Chaque chiffre se recalcule dans le navigateur."
date: 2026-10-13
image: "/images/uploads/deadlock-overview.png"
tags: ["Analyse de données", "JavaScript", "Visualisation", "Accessibilité", "Sans dépendance"]
status: "Terminé"
role: "Conception, collecte et développement solo"
period: "2026"
draft: false
---

> Une page web autonome qui teste 21 affirmations sur la difficulté d'apprentissage de Deadlock. Chacune reçoit un verdict, le chiffre qui le décide, la source du chiffre et la limite de ce qu'il prouve. Tout se calcule dans le navigateur, rien ne part ailleurs.

[Ouvrir le tableau de bord](/deadlock/)

Le sujet est un jeu, la matière est de la donnée publique. Ce qui suit décrit comment une question de game design est devenue vérifiable, puis ce que l'exercice a refusé de conclure.

## D'où vient cette page

Un jeu en accès restreint suscite beaucoup de commentaires et presque aucune mesure. Les joueurs parlent d'une courbe d'apprentissage brutale, les défenseurs répondent « skill issue », et les 2 camps avancent sans chiffre. Le désaccord porte pourtant sur des choses qui se comptent. Combien de nombres le jeu affiche. Combien de mécaniques le tutoriel nomme. Combien de temps dure une partie selon le rang.

La question de départ tient en une ligne : est-ce que les reproches tiennent quand on va chercher la donnée ? Elle a produit une soirée de recoupement, puis cette page.

Elle ne juge pas si le jeu est bon. Elle demande s'il est difficile à apprendre. À quel endroit, exactement.

## Les fichiers du jeu contre les parties jouées

Une source unique ne se corrige jamais. Croiser 2 sources indépendantes évite qu'une erreur d'un côté passe pour un résultat.

Les **règles** viennent des fichiers du client, lus dans le dépôt public GameTracking-Deadlock. Elles donnent ce que le jeu contient : les capacités, leurs paliers, les minuteurs, les réglages d'armes, le contenu du tutoriel. Ces fichiers ne bougent qu'à la publication d'une version.

Les **parties** viennent de deadlock-api.com, une API ouverte, en 11 fichiers. Statistiques d'objets, statistiques par héros selon l'expérience, statistiques de partie par rang. S'y ajoutent 2 lots de 10 000 parties récentes, avec le rang des équipes, le vainqueur, la durée et les âmes finales.

L'intérêt du croisement se voit sur le tutoriel. Les fichiers disent que le tutoriel nomme 62 % des 50 mécaniques recensées. Les statistiques de parties disent ce que les joueurs font des 38 % restants. Seule, aucune des 2 ne répond.

## Ce que la page montre

<figure>
  <picture>
    <source srcset="/images/uploads/deadlock-overview.webp" type="image/webp">
    <img src="/images/uploads/deadlock-overview.png" alt="Vue d’ensemble du tableau de bord : les 21 affirmations, leur verdict et le chiffre qui les décide" width="1440" height="900" loading="lazy">
  </picture>
  <figcaption>La vue d’ensemble. Chaque affirmation porte son verdict, le chiffre qui le décide et la limite de ce que ce chiffre prouve.</figcaption>
</figure>

Chaque page répond à une question et une seule. Elle s'ouvre sur le verdict, pose le chiffre qui le porte, puis déroule les preuves. Quelques résultats parmi les 21 :

- le jeu affiche **3 722 nombres**, dont 1 750 pour les seules capacités de héros ;
- **953 mots** de texte dans le jeu servent à recopier une composition d'objets, contre 847 pour tout le tutoriel ;
- **32 objets sur 156** font la moitié des achats, ce qui transforme la composition en routine plutôt qu'en décision ;
- une partie dure **39,9 minutes** au rang le plus bas contre 31,8 au plus haut, et les débutants abandonnent 3,4 fois plus souvent ;
- les nombres de couloirs ou d'objectifs ont été retouchés **56 jours distincts** depuis le 10 août 2024.

## Les 3 affirmations que les chiffres contredisent

Une analyse qui confirme tout n'a rien examiné. Celle-ci retourne 3 reproches populaires.

« Les compositions farfelues qu'on comprend gagnent à bas rang » : l'écart de taux de victoire est plus petit en bas qu'en haut, +0,6 point contre +1,9.

« Standard, c'est 25 % d'écrasements et 25 % d'invendables » : la mesure donne environ 15 % de parties à sens unique. Dans les 2 files d'attente.

« Le jeu punit au lieu d'enseigner » : mesuré par rang, les débutants ne meurent pas davantage par minute jouée, et mourir leur coûte moins d'âmes qu'aux joueurs expérimentés. Leurs parties durent simplement plus longtemps.

Ces 3 verdicts sont les plus utiles de la page. Ils coupent contre le sens commun du sujet : c'est ce qui donne du poids aux 18 autres.

## Ce qu'on jette, et pourquoi

Une moyenne cache une décision sur ce qu'on garde. Celles-ci sont écrites dans le code, à côté du calcul.

Les moyennes par rang sont pondérées par le nombre de parties : un palier qui pèse 5 000 parties ne vaut pas un palier qui en pèse 80 000. Les paliers sous 1 000 parties sortent du calcul, leur bruit dépassant leur signal. Le palier 0, celui des joueurs sans rang attribué, est traité à part. Il mélange des comptes neufs et des comptes inactifs : le fondre dans le premier palier le salirait.

La corrélation entre taux de victoire d'un objet et moment de son achat est calculée en rang de Spearman, ex æquo compris. Le choix tient en une phrase. La relation attendue est monotone sans être linéaire, et les valeurs extrêmes d'un catalogue d'objets fausseraient un Pearson.

## Ce que la page refuse de conclure

La vue d'ensemble s'ouvre sur un encadré qui dit ce que la donnée ne montre pas. C'est la partie que je considère comme la plus importante.

Aucun chiffre ici n'établit une cause : ce sont des corrélations sur données agrégées, pas une expérience. Les joueurs qui restent n'apparaissent nulle part. Le jeu a pourtant atteint 262 145 joueurs simultanés le 9 octobre 2026 : beaucoup franchissent le début. Les « novices », enfin, sont nouveaux sur un héros sans être nouveaux dans le jeu. Les écarts mesurés sont donc plus petits que les écarts réels.

Chaque affirmation porte sa limite propre, affichée sous son verdict. Annoncer un chiffre sans dire ce qu'il ne prouve pas, c'est mentir par omission.

## Alimenter la page

<figure>
  <picture>
    <source srcset="/images/uploads/deadlock-sources.webp" type="image/webp">
    <img src="/images/uploads/deadlock-sources.png" alt="Page Sources : le script de collecte, la zone de dépôt du dossier et le rapport des changements" width="1440" height="900" loading="lazy">
  </picture>
  <figcaption>La page Sources. Le script de collecte, la zone où déposer le dossier, et le rapport de ce que le dépôt a changé.</figcaption>
</figure>

La page embarque une copie des données : elle se lit tout de suite. Elle sait aussi se nourrir à nouveau.

La page Sources donne le script de collecte, 11 lignes de `curl` qui écrivent dans un dossier `deadlock-data`. On dépose ensuite ce dossier entier sur la page. Elle descend l'arborescence, ignore ce qui n'est pas du JSON, reconnaît chaque fichier à son contenu et recalcule.

Le rapport qui suit le dépôt répond à la question qu'on se pose vraiment : qu'est-ce qui a bougé ? Il liste les verdicts qui ont changé de statut et les chiffres qui ont changé de valeur, l'avant et l'après côte à côte. Chaque ligne pointe vers la page concernée. Sans lui, recharger 11 fichiers oblige à relire 18 pages pour trouver la différence.

## Les choix techniques

Un fichier HTML unique, sans dépendance ni étape de compilation. Les données voyagent avec la page et les calculs se font dans le navigateur. Aucune requête ne part vers un tiers.

L'accessibilité a été traitée comme une contrainte de conception. La couleur ne porte jamais seule une information : un statut arrive toujours avec un mot et une icône. Chaque graphique SVG expose un tableau de données dépliable, pour que ce qui se lit à l'œil se lise aussi au lecteur d'écran. Les polices sont servies à côté de la page, ce qui conserve la typographie même hors ligne.

Contrôle au navigateur : 0 violation axe-core sur les 18 pages, aucun débordement horizontal de 360 à 1440 pixels, aucune erreur JavaScript.

## Pourquoi la page est en anglais

Les sources primaires sont anglophones : les fichiers du client, l'API, les vidéos et les commentaires analysés. Traduire les citations aurait ajouté une couche d'interprétation entre la preuve et le lecteur.

## Ce que le projet m'a appris

Transformer une opinion en question mesurable est le travail le plus long. Il se fait avant la première ligne de code. « Le jeu est trop difficile » ne se vérifie pas. « Le tutoriel nomme combien de mécaniques sur combien » se vérifie. Il a fallu plusieurs reformulations pour arriver à des questions de cette forme.

Le reste tient en 2 réflexes que je garde. Un chiffre sans sa source ni sa limite ne vaut rien : chacun remonte ici au fichier qui le produit. Un tableau de bord qui promet la vérification doit par ailleurs dire ce que la vérification a changé, sans quoi la promesse reste théorique.
