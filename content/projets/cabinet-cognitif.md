---
title: "Cabinet cognitif"
description: "Dix exercices d'attention et de calcul mental dans une page web autonome, conçue pour des enfants de primaire : aucun compte à créer, rien à installer, fonctionne hors ligne."
date: 2026-08-20
image: "/images/uploads/projet-cabinet-cognitif.png"
tags: ["HTML", "CSS", "JavaScript", "Accessibilité", "Sans dépendance"]
status: "Terminé"
role: "Conception et développement solo"
period: "2026"
draft: false
---

## Le projet en une phrase

Une page web unique qui rassemble dix exercices d'attention et de calcul mental, écrite pour un membre de ma famille qui cherchait un support utilisable par des enfants de primaire.

La demande tenait en peu de mots : quelque chose qui marche tout de suite, qu'on n'ait ni compte à créer ni application à installer, et où aucune publicité ne vienne s'intercaler. J'ai livré un fichier HTML de 5 500 lignes qu'on ouvre d'un double-clic et qui fonctionne hors ligne.

## La contrainte qui a tout décidé

Un enfant de huit ans devant un écran ne lit pas les instructions. Il clique. Si le premier clic ne produit rien de compréhensible, il abandonne et va voir ailleurs.

Cette réalité a écarté d'emblée plusieurs solutions qui auraient été plus confortables pour moi. Une application React aurait demandé un temps de chargement et une installation. Un site avec des comptes aurait imposé une inscription parentale. Un outil en ligne aurait supposé une connexion stable, ce qui n'est pas acquis partout.

Le fichier unique répond à ces trois problèmes d'un coup. On le copie sur une clé, on l'envoie par mail, on le pose sur un bureau. Il s'ouvre.

## Les dix exercices

Cinq travaillent l'attention et la vitesse de traitement : table de Schulte, test de Stroop, Trail Making B, N-back, calcul mental chronométré. Ils viennent de protocoles utilisés en neuropsychologie, adaptés ici en versions courtes et sans enjeu.

Cinq autres travaillent le calcul : addition, soustraction, division, fractions, pourcentages. Chacun propose plusieurs niveaux, du très accessible à l'exigeant, pour qu'un même outil serve à un enfant de CE1 comme à un adulte qui veut s'entretenir.

Chaque exercice porte un rappel de technique consultable à tout moment. Un enfant qui bloque sur une division apprend la méthode au lieu de deviner.

## Ce que j'ai appris sur l'accessibilité

Concevoir pour des enfants m'a obligé à traiter l'accessibilité comme une contrainte de conception plutôt que comme une case à cocher en fin de projet.

Les exercices sont chronométrés et le score change en cours de partie. Sans annonce vocale, un enfant qui utilise un lecteur d'écran ne sait jamais où il en est. J'ai posé dix-sept régions `aria-live` pour que chaque changement d'état soit énoncé au moment où il se produit.

La navigation clavier fonctionne partout, sans exception. Certains enfants tiennent mal une souris, d'autres travaillent sur un poste où le pavé tactile est capricieux. La touche Échap interrompt n'importe quel exercice en cours, ce qui évite le sentiment d'être piégé dans un chronomètre qui tourne.

Les animations se coupent intégralement quand le système le demande. Un enfant sensible aux mouvements rapides peut utiliser l'outil sans que l'écran s'agite.

## Les choix techniques

Aucune dépendance externe. Pas de framework, pas de CDN, pas d'étape de compilation. Le fichier se lit intégralement dans un éditeur de texte et se modifie sans installer quoi que ce soit.

Les records sont enregistrés dans le stockage local du navigateur, avec un numéro de version dans la structure pour pouvoir faire évoluer le format plus tard sans perdre les données existantes. Si le stockage est bloqué, l'outil continue de fonctionner et garde les scores de la session en cours.

Le thème clair ou sombre suit le réglage du système et se change d'un bouton. Le chronomètre utilise `performance.now()` plutôt que `Date.now()`, plus précis et insensible aux ajustements d'horloge.

## Ce que j'en retiens

Un projet pour enfants ressemble à un projet simple. Il ne l'est pas. Toute imprécision qu'un adulte compenserait par déduction devient un blocage. Un libellé ambigu, un bouton qui ne réagit pas visiblement, un score qui apparaît sans explication : chacun de ces détails suffit à faire décrocher.

Cette exigence de clarté m'a servi ailleurs. Depuis, je teste mes interfaces en me demandant ce que ferait quelqu'un qui ne lit pas les instructions. La réponse révèle presque toujours un défaut de conception que j'avais laissé passer.
