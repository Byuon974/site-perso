---
title: "Auto-Downloader"
description: "Script Python qui automatise la récupération de bandes-son de jeux vidéo depuis un site d'archive communautaire, quand ces OST ne sont vendues nulle part ailleurs légalement."
date: 2024-11-20
image: "/images/uploads/projet-auto-downloader.png"
tags: ["Python", "CLI", "Web scraping", "BeautifulSoup", "requests"]
status: "Terminé"
role: "Projet d'apprentissage solo"
period: "2024"
draft: false
---

## Le projet en une phrase

Un script Python qui récupère des bandes-son de jeux vidéo sur un site d'archive tenu par des fans. On y trouve des OST introuvables ailleurs légalement : plateformes officielles fermées, éditions physiques épuisées, licences perdues dans les limbes.

L'outil remplace une navigation manuelle fastidieuse par une seule commande et une file d'attente. Aller sur le site, cliquer piste par piste, sauvegarder : tout cela disparaît.

Le projet reste privé pour 2 raisons. Le contenu récupéré est protégé par le droit d'auteur. Un outil clé en main donnerait par ailleurs à n'importe qui le moyen de scraper ce site à grande échelle.

C'est le premier outil complet que j'ai écrit, avant que j'emploie une IA pour coder. Il tourne encore, à quelques retouches près. Ce qu'il m'a appris ne vient d'aucun tutoriel : chaque règle que je nomme aujourd'hui a été arrachée à un cas particulier qui cassait le script.

---

## Ce qui a motivé ce projet

Beaucoup de bandes-son de jeux vidéo qui comptent pour moi n'existent tout simplement plus sur les plateformes officielles. Les causes varient. Certaines n'ont jamais été mises en vente numérique. D'autres l'ont été, puis retirées. D'autres encore dépendaient d'une licence expirée, ou n'ont jamais quitté le marché japonais en édition physique. Seuls quelques sites de fans en archivent encore des versions correctes.

Ces sites se consultent au navigateur. Pour un album complet, cela veut dire cliquer piste par piste, sauvegarder chacune dans le bon dossier sous le bon nom, puis recommencer à l'album suivant.

Le besoin tenait donc en une phrase : garder l'usage strictement personnel, mais transformer la corvée en un flux gérable, file d'attente et rythme de requêtes compris.

L'autre motivation compte davantage avec le recul : apprendre à parser du HTML et à écrire un outil en ligne de commande qui tienne. C'est le premier projet où j'ai composé avec le monde réel. Pages qui changent de structure, redirections, encodage des noms de fichiers, délais dépassés : aucun tutoriel ne les présente.

---

## Le choix de la stack

La première règle que je me suis donnée : ne rien ajouter dont le problème n'avait pas besoin. Aucune base de données, aucune interface graphique, aucun asynchrone. Requêtes HTTP synchrones, parsing HTML classique.

Le volume à télécharger justifie cette sobriété. Quelques albums de temps en temps ne demandent ni cache SQLite ni parallélisme. Un script séquentiel se maintient mieux, en risquant moins de saturer le site source.

| Couche | Détail |
|---|---|
| **Langage** | Python 3 |
| **HTTP** | `requests` (synchrone), avec sessions et gestion des redirections |
| **Parsing HTML** | BeautifulSoup4 |
| **CLI** | `argparse` de la bibliothèque standard |
| **Système de fichiers** | `pathlib`, écriture atomique via fichier temporaire puis renommage |
| **Exécution** | Script CLI utilisable depuis un terminal, sans dépendance système hors Python |

---

## Ce que fait concrètement le script

Le script prend une URL d'album sur le site source et effectue une série d'étapes prévisibles :

1. **Récupération de la page de l'album** : une requête HTTP, avec User-Agent réaliste et Referer défini.
2. **Parsing du HTML** : BeautifulSoup extrait le titre de l'album, la liste des pistes et les URLs de téléchargement.
3. **Résolution des URLs de téléchargement** : certaines pistes sont sur des pages intermédiaires qu'il faut visiter pour obtenir le lien direct au fichier audio.
4. **Téléchargement séquentiel** : chaque fichier arrive dans un `.part`, renommé une fois complet. Une interruption laisse alors un fichier absent plutôt qu'un fichier à moitié écrit.
5. **Nommage propre** : les caractères problématiques dans les noms de fichiers (Unicode exotique, caractères réservés selon l'OS) sont nettoyés selon une règle simple et reproductible.

Les erreurs classiques, délai dépassé, 503, 429, valent une reprise courte. La machinerie s'arrête là : quand un serveur commence à rejeter, mieux vaut s'arrêter et revenir plus tard.

---

## Ce que le projet m'a appris

Les règles suivantes ont coûté plus cher. Ce projet est le premier où j'ai buté sur les cas particuliers du parsing web : il a fallu apprendre à les traiter sans laisser le script casser.

**Les structures de page changent.** Un sélecteur CSS valable aujourd'hui peut tomber 2 mois plus tard, sans préavis. Le code dit donc explicitement où le parsing s'accroche et sur quoi. Un changement se corrige alors sans tout relire.

**Les URLs directes sont parfois protégées.** Certains téléchargements exigent un Referer précis, un cookie de session ou un User-Agent de navigateur. J'ai appris à comprendre ces mécanismes avant de les contourner. Un site qui protège ses URLs a généralement une raison de le faire.

**Le nommage des fichiers est un problème en soi.** Caractères réservés selon le système, Unicode qui casse sur certains systèmes de fichiers, collisions, homoglyphes : il faut une règle nette, appliquée partout. Un mode strictement ASCII couvre les rares cas où le fichier doit rester portable vers du FAT32.

**Écriture atomique.** Écrire dans `foo.mp3.part`, renommer en `foo.mp3` une fois complet : une interruption ne laisse jamais de fichier corrompu qui aurait l'air valide. Le procédé est resté dans tous mes projets suivants.

---

## Le rôle de l'IA sur ce projet

Une dernière chose distingue ce projet des suivants : elle explique le reste. Il est antérieur à mon usage régulier de Claude Code. Il a été écrit à la main, avec ChatGPT en appoint pour comprendre une erreur ou débloquer un point de syntaxe. Aucune génération de code à l'échelle. La sobriété de la stack en découle : je n'employais que ce que je comprenais entièrement.

Le contraste avec les projets suivants, `guide-dl` puis TAP, se lit dans le code lui-même. L'IA y prend une place structurante dans le flux de travail, ce qui autorise une architecture plus ambitieuse. L'Auto-Downloader garde la trace d'une méthode antérieure, celle où l'on résolvait les problèmes en cherchant sur Stack Overflow et en lisant la documentation.

---

## Ce qui est délibérément absent

**Pas de diffusion du code.** Le script récupère du contenu protégé par le droit d'auteur. Le distribuer donnerait un outil clé en main pour scraper le site source. Ce site est une archive communautaire gratuite dont dépendent beaucoup d'amateurs de musiques de jeux vidéo. S'il durcissait ses protections face à un afflux de robots, toute la communauté y perdrait, moi compris.

**Pas de fonctionnalités avancées.** Pas de cache de résolution, pas de base d'archive, pas d'intégration ID3 automatique, pas de génération de playlist. Ces briques sont arrivées plus tard, dans `guide-dl`. L'Auto-Downloader est resté à son périmètre initial : télécharger proprement, une fois, sans effets de bord.

---

## Ce qui en reste

3 règles survivent à ce projet. Je les applique encore. Une analyse qui s'accroche à une page qu'on ne contrôle pas se documente, pour que sa panne se répare au lieu de se diagnostiquer. Une écriture devient atomique dès qu'une interruption est possible. Un site source se ménage, par le rythme des requêtes autant que par le refus de diffuser l'outil.

Pas une seule ne vient d'un cours. Chacune vient d'un cas qui a cassé le script.

---

## Compétences mobilisées

Ce projet, plus ancien, figure ici pour ce qu'il documente d'une trajectoire, pas pour son ampleur technique. 3 acquis en sortent, que je réutilise depuis.

**Écrire un outil CLI qui tient face à un site réel.**
Défi : un site sans API, dont la structure HTML change sans préavis et dont les URLs directes exigent parfois un Referer ou un User-Agent particulier.
Réponses : parsing tolérant aux évolutions de structure, sélecteurs CSS documentés dans le code pour que les futurs correctifs soient rattrapables, gestion des retry courts sur 429 et 5xx sans machinerie sophistiquée, User-Agent réaliste et Referer explicite.
Résultat : un script utilisé depuis plusieurs mois, à peine retouché malgré des changements de structure côté site.

**Adopter les réflexes de fiabilité qui deviendront un standard personnel.**
Écriture atomique via fichier `.part` renommé après complétion (aucun fichier corrompu qui aurait l'air valide en cas d'interruption), nettoyage des noms de fichiers selon une règle unique et documentée avec mode ASCII strict pour la portabilité FAT32, respect explicite du site source (délai entre requêtes, absence de parallélisme agressif).

**Reconnaître les limites de sa propre méthode.**
Ce projet est antérieur à mon usage régulier de l'IA générative : sa stack synchrone en `requests` + BeautifulSoup en garde la trace : je m'en suis tenu à ce que je maîtrisais entièrement. Les briques que j'aurais aujourd'hui envie d'ajouter (cache SQLite de résolution, intégration ID3, archive de suivi) ont été construites dans le projet suivant, `guide-dl`, une fois que je les avais réellement comprises.
