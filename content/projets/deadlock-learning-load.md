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

<p class="actions-outil">
  <a class="btn-primary" href="/deadlock/" target="_blank" rel="noopener">Ouvrir le tableau de bord</a>
  <a class="btn-secondary" href="/deadlock/index.html" download="deadlock-learning-load.html">Télécharger le fichier</a>
</p>

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
    <img src="/images/uploads/deadlock-overview.png" alt="Vue d’ensemble du tableau de bord : les 21 affirmations, leur verdict et le chiffre qui les décide" width="1440" height="900" loading="lazy">
  </picture>
  <figcaption>La vue d’ensemble. Chaque affirmation porte son verdict, le chiffre qui le décide et la limite de ce que ce chiffre prouve.</figcaption>
</figure>

Chaque page répond à une question et une seule. Elle s'ouvre sur le verdict, pose le chiffre qui le porte, puis déroule les preuves. Quelques résultats parmi les 21 :

- le jeu affiche **3 722 nombres**, dont 1 750 pour les seules capacités de héros ;
- **953 mots** de texte dans le jeu servent à recopier un build, contre 847 pour tout le tutoriel ;
- **32 objets sur 156** font la moitié des achats, ce qui transforme le build en routine plutôt qu'en décision ;
- une partie dure **39,9 minutes** au rang le plus bas contre 31,8 au plus haut, et les débutants abandonnent 3,4 fois plus souvent ;
- les nombres de couloirs ou d'objectifs ont été retouchés **56 jours distincts** depuis le 10 août 2024.

## Les 3 affirmations que les chiffres contredisent

Une analyse qui confirme tout n'a rien examiné. Celle-ci retourne 3 reproches populaires.

« Les builds farfelus qu'on comprend gagnent à bas rang » : l'écart de taux de victoire est plus petit en bas qu'en haut, +0,6 point contre +1,9.

« Standard, c'est 25 % de victoires écrasantes et 25 % de défaites cuisantes » : la mesure donne environ 15 % de parties à sens unique. Dans les 2 files d'attente.

« Le jeu punit au lieu d'enseigner » : mesuré par rang, les débutants ne meurent pas davantage par minute jouée, et mourir leur coûte moins d'âmes qu'aux joueurs expérimentés. Leurs parties durent simplement plus longtemps.

Ces 3 verdicts sont les plus utiles de la page. Ils coupent contre le sens commun du sujet : c'est ce qui donne du poids aux 18 autres.

## Ce qu'on jette, et pourquoi

Une moyenne cache une décision sur ce qu'on garde. Celles-ci sont écrites dans le code, à côté du calcul.

Les moyennes par rang sont pondérées par le nombre de parties : un palier qui pèse 5 000 parties ne vaut pas un palier qui en pèse 80 000. Les paliers sous 1 000 parties sortent du calcul, leur bruit dépassant leur signal. Le palier 0, celui des joueurs sans rang attribué, est traité à part. Il mélange des comptes neufs et des comptes inactifs : le fondre dans le premier palier le salirait.

Le lien entre le taux de victoire d'un objet et le moment où on l'achète est mesuré sur le classement des objets plutôt que sur leurs valeurs brutes, ce qu'on appelle une corrélation de Spearman. La raison tient en une phrase. On s'attend à ce que l'un monte quand l'autre monte, sans que ce soit une droite, et quelques objets extrêmes suffiraient à fausser la mesure classique.

## Ce que la page refuse de conclure

La vue d'ensemble s'ouvre sur un encadré qui dit ce que la donnée ne montre pas. C'est la partie que je considère comme la plus importante.

Aucun chiffre ici n'établit une cause : ce sont des corrélations sur données agrégées, pas une expérience. Les joueurs qui restent n'apparaissent nulle part. Le jeu a pourtant atteint 262 145 joueurs simultanés le 9 octobre 2026 : beaucoup franchissent le début. Les « novices », enfin, sont nouveaux sur un héros sans être nouveaux dans le jeu. Les écarts mesurés sont donc plus petits que les écarts réels.

Chaque affirmation porte sa limite propre, affichée sous son verdict. Annoncer un chiffre sans dire ce qu'il ne prouve pas, c'est mentir par omission.

## Alimenter la page

<figure>
  <picture>
    <source srcset="/images/uploads/deadlock-sources.webp" type="image/webp">
    <img src="/images/uploads/deadlock-sources.png" alt="Page Sources : le script de collecte, la zone de dépôt du dossier et le rapport des changements" width="1440" height="900" loading="lazy">
  </picture>
  <figcaption>La page Sources. Le script de collecte, la zone où déposer le dossier, et le rapport de ce que le dépôt a changé.</figcaption>
</figure>

La page embarque une copie des données : elle se lit tout de suite. Elle sait aussi se nourrir à nouveau.

La page Sources donne le script de collecte, 11 lignes de `curl` qui écrivent dans un dossier `deadlock-data`. On dépose ensuite ce dossier entier sur la page. Elle ouvre les sous-dossiers, laisse de côté ce qui n'est pas une donnée, reconnaît chaque fichier à son contenu plutôt qu'à son nom, et recalcule.

Le rapport qui suit le dépôt répond à la question qu'on se pose vraiment : qu'est-ce qui a bougé ? Il liste les verdicts qui ont changé de statut et les chiffres qui ont changé de valeur, l'avant et l'après côte à côte. Chaque ligne pointe vers la page concernée. Sans lui, recharger 11 fichiers oblige à relire 18 pages pour trouver la différence.

Un garde-fou est venu d'un incident réel. L'API a cessé de répondre sur un des 11 fichiers, celui des joueurs expérimentés. Rien n'empêchait alors de rafraîchir les débutants seuls et de comparer des données du jour à des données figées, ce qui aurait mesuré un écart de dates autant qu'un écart d'expérience. La page refuse désormais la demi-paire : elle remet les 2 fichiers dans leur état précédent et explique pourquoi.

Reste un dernier maillon. Un dépôt ne change les chiffres que dans l'onglet ouvert : la copie embarquée dans le fichier, elle, ne bouge pas. La page sait donc se réécrire. Elle relit sa propre source, remplace le bloc de données entre ses 2 bornes et rend un fichier à redéposer tel quel. Le cycle se referme ainsi : on collecte, on dépose, on lit ce qui a changé, on republie.

## Les choix techniques

Une seule page, qui ne dépend de rien et ne se compile pas. Les données voyagent avec elle et tous les calculs se font sur la machine du lecteur. Rien n'est envoyé nulle part, et aucun service extérieur n'est appelé au passage.

L'accessibilité a été décidée en amont plutôt qu'ajoutée à la fin. La couleur ne porte jamais seule une information : un statut arrive toujours avec un mot et un pictogramme, lisible par quelqu'un qui distingue mal le rouge du vert. Sous chaque graphique, un tableau se déplie avec les mêmes chiffres, pour que ce qui se lit à l'œil se lise aussi à voix haute. Les polices accompagnent la page, qui garde donc son allure même ouverte sans connexion.

Les 18 pages ont été vérifiées dans un vrai navigateur, du téléphone au grand écran. Rien ne déborde sur les côtés, rien ne casse, et un outil d'audit d'accessibilité ne relève aucun manquement.

## Pourquoi la page est en anglais

Les sources primaires sont anglophones : les fichiers du client, l'API, les vidéos et les commentaires analysés. Traduire les citations aurait ajouté une couche d'interprétation entre la preuve et le lecteur.

## Ce que le projet m'a appris

Transformer une opinion en question mesurable est le travail le plus long. Il se fait avant la première ligne de code. « Le jeu est trop difficile » ne se vérifie pas. « Le tutoriel nomme combien de mécaniques sur combien » se vérifie. Il a fallu plusieurs reformulations pour arriver à des questions de cette forme.

Le reste tient en 2 réflexes que je garde. Un chiffre sans sa source ni sa limite ne vaut rien : chacun remonte ici au fichier qui le produit. Un tableau de bord qui promet la vérification doit par ailleurs dire ce que la vérification a changé, sans quoi la promesse reste théorique.
