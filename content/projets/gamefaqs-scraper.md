---
title: "GameFAQs Scraper"
description: "Outil d’archivage hors-ligne de guides GameFAQs avec conversion via Pandoc."
date: 2025-11-15
video: "/videos/gamefaqs-scraper.webm"
videoPoster: "/videos/gamefaqs-scraper.jpg"
tags: ["Python", "Web Scraping", "Pandoc", "Automatisation"]
draft: false
---

## GameFAQs – Archivage hors-ligne de documentation

### Objectif

L’objectif de ce projet était de disposer d’une **documentation consultable hors-ligne**
pour un usage strictement personnel, tout en approfondissant mes compétences en
**traitement de contenu web et automatisation**.

---

### Fonctionnalités principales

- Récupération de contenus depuis des pages web
- Traitement de formats hétérogènes (ASCII et HTML)
- Nettoyage et restructuration des données
- Conversion automatisée de documents volumineux
- Intégration de métadonnées

---

### Stack technique

- **Python**
- **BeautifulSoup** (extraction et nettoyage HTML)
- **Pandoc** (conversion de documents)
- Outils CLI

---

### Contexte et démarche

Le projet m’a permis d’explorer différents formats de contenus utilisés par le site GameFAQs,
allant de **guides ASCII historiques** à des pages **HTML modernes**.

Utilisant régulièrement **Pandoc** pour formater des notes techniques (ODT, PDF), j’ai souhaité
mettre cet outil à l’épreuve dans un contexte automatisé afin de :

- Éviter toute manipulation manuelle de documents très volumineux (jusqu’à ~90 pages)
- Préserver la structure et la lisibilité du contenu
- Respecter le travail des auteurs via l’intégration de métadonnées

---

### Ce que j’ai appris

- Gérer des formats de données hétérogènes
- Automatiser des chaînes de traitement de documents
- Nettoyer et restructurer du contenu web
- Concevoir un outil d’archivage hors-ligne maintenable
- Appliquer des bonnes pratiques de scraping responsable

---

### Diffusion du projet

Une attention particulière a été portée au :

- Respect du fichier **robots.txt**
- Contrôle du volume de requêtes
- Comportement non intrusif

Le projet n’est **pas destiné à être diffusé**, en raison de la nature des contenus protégés par
le droit d’auteur et afin d’éviter toute utilisation abusive.

Il s’agit d’un **outil personnel**, conçu à des fins pédagogiques et techniques.
