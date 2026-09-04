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

Un script Python qui récupère des bandes-son de jeux vidéo sur un site d'archive tenu par des fans, où traînent des OST introuvables ailleurs légalement : plateformes officielles fermées, éditions physiques épuisées, licences perdues dans les limbes.

Concrètement, c'est un outil personnel en ligne de commande qui remplace une navigation manuelle fastidieuse (aller sur le site, cliquer piste par piste, sauvegarder) par une seule commande et une file d'attente. Le projet reste privé, autant parce que le contenu récupéré est protégé par le droit d'auteur que parce qu'un outil clé en main donnerait à n'importe qui le moyen de scraper ce site à grande échelle, ce que je préfère éviter.

C'est le premier outil complet que j'ai écrit, avant que j'emploie une IA pour coder, et il tourne encore sans avoir été retouché. Ce qu'il m'a appris ne vient d'aucun tutoriel : chaque réflexe que je nomme aujourd'hui a été arraché à un cas particulier qui cassait le script.

---

## Ce qui a motivé ce projet

Beaucoup de bandes-son de jeux vidéo qui comptent pour moi n'existent tout simplement plus sur les plateformes officielles. Elles n'ont jamais été mises en vente numérique, ou l'ont été puis retirées, ou dépendaient d'une licence qui a expiré, ou n'ont jamais quitté le marché japonais en édition physique. Seuls quelques sites de fans continuent à en archiver des versions correctes.

Le mode d'utilisation normal de ces sites, c'est le navigateur. Ça fonctionne, mais pour un album complet, ça veut dire cliquer piste par piste, sauvegarder chacune dans le bon dossier avec le bon nom, et recommencer sur le prochain album. Le besoin qui a motivé le projet était donc simple : garder l'usage strictement personnel, mais transformer une corvée répétitive en un flux gérable, avec une file d'attente et un rythme de requêtes correct.

L'autre motivation, plus intéressante rétrospectivement, était d'apprendre pour de vrai à parser du HTML et à écrire un outil CLI robuste. C'est le premier projet où j'ai composé avec les cas particuliers du monde réel : pages qui changent de structure, redirections, encodage des noms de fichiers, timeouts. Autant de cas qu'on ne rencontre pas dans les tutoriels.

---

## Le choix de la stack

Le premier de ces réflexes a été de ne rien ajouter dont le problème n'avait pas besoin. Aucune base de données, aucune interface graphique, aucun asynchrone : requêtes HTTP synchrones et parsing HTML classique. Le volume à télécharger, quelques albums de temps en temps, ne justifie ni cache SQLite ni parallélisme, et un script séquentiel reste plus simple à maintenir tout en risquant moins de saturer le site source.

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
2. **Parsing du HTML** : BeautifulSoup extrait le titre de l'album, la liste des pistes, et les URLs de téléchargement de chaque piste.
3. **Résolution des URLs de téléchargement** : certaines pistes sont sur des pages intermédiaires qu'il faut visiter pour obtenir le lien direct au fichier audio.
4. **Téléchargement séquentiel** : chaque fichier est téléchargé dans un fichier `.part`, puis renommé une fois complet. Ça permet de reprendre proprement en cas d'interruption plutôt que de se retrouver avec des fichiers à moitié écrits.
5. **Nommage propre** : les caractères problématiques dans les noms de fichiers (Unicode exotique, caractères réservés selon l'OS) sont nettoyés selon une règle simple et reproductible.

Le script gère les erreurs classiques (timeout, 503, 429) par un retry court, mais sans machinerie sophistiquée : si un serveur commence à rejeter, mieux vaut s'arrêter et reprendre plus tard que d'insister.

---

## Ce que le projet m'a appris

Les réflexes suivants ont coûté plus cher. C'est le premier projet où j'ai vraiment buté sur les cas particuliers du parsing web, et où j'ai dû apprendre à les traiter sans laisser mon script casser.

**Les structures de page changent.** Les sélecteurs CSS qui fonctionnaient un jour peuvent ne plus fonctionner 2 mois plus tard, sans préavis. J'ai appris à documenter clairement dans le code où le parsing s'accroche à quoi, pour qu'un changement puisse être corrigé sans avoir à tout relire.

**Les URLs directes sont parfois protégées.** Certains téléchargements nécessitent un Referer précis, un cookie de session, ou un User-Agent qui ressemble à un navigateur. J'ai appris à comprendre ces mécanismes plutôt qu'à les contourner en aveugle ; quand un site protège ses URLs, il y a en général une raison.

**Le nommage des fichiers est un problème en soi.** Entre les caractères réservés selon l'OS, l'Unicode qui casse sur certains systèmes de fichiers, les collisions de noms et les caractères qui ressemblent visuellement à d'autres, il faut une règle nette et l'appliquer partout. J'ai aussi ajouté un mode strictement ASCII pour les rares cas où le fichier doit être portable vers du FAT32 ou similaire.

**Écriture atomique.** Écrire dans `foo.mp3.part` puis renommer en `foo.mp3` une fois le fichier complet évite qu'une interruption laisse un fichier corrompu qui a l'air valide. Le pattern est resté dans tous mes projets suivants.

---

## Le rôle de l'IA sur ce projet

Une dernière chose distingue ce projet des suivants, et elle explique le reste. Ce projet est antérieur à mon usage régulier de Claude Code. Il a été écrit à la main, avec ChatGPT ponctuellement en support pour comprendre une erreur ou débloquer un point de syntaxe précis, sans génération de code à l'échelle. La sobriété de la stack en découle directement : je n'utilisais que ce que je comprenais entièrement.

Le contraste avec les projets suivants, `guide-dl` puis TAP, se lit dans le code lui-même. L'IA y prend une place structurante dans le flux de travail, ce qui autorise une architecture plus ambitieuse. L'Auto-Downloader garde la trace d'une méthode antérieure, celle où l'on résolvait les problèmes en cherchant sur Stack Overflow et en lisant la documentation.

---

## Ce qui est délibérément absent

**Pas de diffusion du code.** 2 raisons : le script récupère du contenu protégé par le droit d'auteur, et le distribuer donnerait un outil clé en main pour scraper le site source à grande échelle. Le site en question est une archive communautaire gratuite dont dépendent beaucoup d'amateurs de musiques de jeux vidéo ; s'il devait durcir ses protections face à un afflux de bots, l'ensemble de la communauté serait perdant, moi y compris. Le code reste donc chez moi.

**Pas de fonctionnalités avancées.** Pas de cache de résolution, pas de base d'archive, pas d'intégration ID3 automatique, pas de génération de playlist. Ces briques sont arrivées plus tard, dans `guide-dl`. L'Auto-Downloader est resté à son périmètre initial : télécharger proprement, une fois, sans effets de bord.

---

## En résumé

L'Auto-Downloader est un projet personnel qui tient depuis des mois sans avoir eu à être retouché. Ce projet est un point de départ. Premier outil complet en ligne de commande écrit face à un problème réel, il m'a fait découvrir par la pratique 3 réflexes que je sais nommer aujourd'hui : une analyse qui tolère les pannes, une écriture atomique, et le respect du site source.

---

## Compétences mobilisées

Ce projet, plus ancien, est présenté ici pour ce qu'il documente d'une trajectoire, pas pour son ampleur technique. 2 acquis en sortent, que je réutilise depuis dans tous mes projets.

**Écrire un outil CLI qui tient face à un site réel.**
Défi : un site sans API, dont la structure HTML change sans préavis et dont les URLs directes exigent parfois un Referer ou un User-Agent particulier.
Réponses : parsing tolérant aux évolutions de structure, sélecteurs CSS documentés dans le code pour que les futurs correctifs soient rattrapables, gestion des retry courts sur 429 et 5xx sans machinerie sophistiquée, User-Agent réaliste et Referer explicite.
Résultat : un script utilisé depuis plusieurs mois, retouché de façon très marginale, malgré des changements de structure côté site.

**Adopter les réflexes de fiabilité qui deviendront un standard personnel.**
Écriture atomique via fichier `.part` renommé après complétion (aucun fichier corrompu qui aurait l'air valide en cas d'interruption), nettoyage des noms de fichiers selon une règle unique et documentée avec mode ASCII strict pour la portabilité FAT32, respect explicite du site source (délai entre requêtes, absence de parallélisme agressif).

**Reconnaître les limites de sa propre méthode.**
Ce projet est antérieur à mon usage régulier de l'IA générative, et sa stack synchrone en `requests` + BeautifulSoup en garde la trace : je m'en suis tenu à ce que je maîtrisais entièrement. Les briques que j'aurais aujourd'hui envie d'ajouter (cache SQLite de résolution, intégration ID3, archive de suivi) ont été construites dans le projet suivant, `guide-dl`, une fois que je les avais réellement comprises.
