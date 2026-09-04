---
title: "Corpus de runbooks CLI"
description: "Ma base de connaissances personnelle : 54 runbooks d'exploitation Linux en ligne de commande, tenus à jour, avec suivi de fraîcheur et validation par exécution. 9 sont publiés ici en extrait ; le reste reste privé, cet index en donne le sommaire."
tags: ["linux", "cli", "runbook", "documentation", "index"]
updated: 2026-09-03
---

_Ma base de connaissances personnelle : 54 runbooks d'exploitation Linux en ligne de commande, tenus à jour, avec suivi de fraîcheur et validation par exécution. Neuf sont publiés ici en extrait ; le reste reste privé, cet index en donne le sommaire._

## Pourquoi ce corpus

J'écris ces runbooks pour moi, d'abord. Quand un problème réapparaît trois mois plus tard, je préfère consulter ma propre note que refouiller Stack Overflow. Le format est stable, la table des matières est stable, la datation est stable, ce qui compte est de retrouver la bonne procédure en trente secondes.

Chaque runbook porte en tête une section « Fraîcheur et maintenance » qui liste la date de dernière mise à jour, la date de dernière validation par exécution, la cible logicielle testée, et les faits volatils à revérifier en priorité. Le corpus entier fait environ 20 000 lignes.

Les neuf documents publiés ci-dessous en extrait sont ceux que je consulte le plus. Ils couvrent le socle d'administration Linux quotidien. Le reste reste privé, à la fois parce qu'il ne rend service qu'à moi et parce que la publication ouverte demanderait un travail éditorial que je préfère consacrer aux notes qui aident vraiment.

## Sommaire complet du corpus

Cinquante-quatre runbooks, regroupés ici par famille d'usage. Les titres cliquables mènent aux extraits publiés ; les autres sont listés pour situer le périmètre.

### Socle et boussole

- **[Shell interactif et environnement Bash](/notes/shell-environnement-bash/)** _(publié)_
- Composition : tubes, redirections et magie du shell (bash et zsh)
- Syntaxe et symboles : déchiffrer une ligne de commande
- Socle GNU et outils modernes (rester en terrain connu)
- Signaux, codes de sortie et interruption d'une commande
- Encodage et temps : deux sources d'erreurs silencieuses

### Fichiers, données, transformations

- **[Archivage et compression sous Linux](/notes/archivage-compression-linux/)** _(publié)_
- **[Affichage et inspection de fichiers](/notes/affichage-inspection-fichiers-linux/)** _(publié)_
- **[Copie, déplacement et synchronisation](/notes/copie-synchronisation-linux/)** _(publié)_
- Liens symboliques, liens durs et résolution de chemins
- Recherche : trouver du texte et des fichiers (grep, ripgrep, find, fd)
- Expressions régulières : le socle commun
- Transformation de flux (sed, awk, sort, uniq, cut, tr, xargs)
- Données structurées (jq, sqlite, pandoc)
- Données tabulaires : CSV, TSV et feuilles de calcul
- Conversion par lots : images, PDF et documents
- Répertoires temporaires : vidages, traces et scripts qu'on peut déboguer

### Système et matériel

- **[Processus : observer, cibler, arrêter, contraindre](/notes/processus-linux/)** _(publié)_
- **[Fichiers d'état du système sous /etc](/notes/fichiers-etat-systeme-linux/)** _(publié)_
- **[Disques, partitions et systèmes de fichiers](/notes/disques-systemes-fichiers-linux/)** _(publié)_
- **[Permissions, comptes et groupes](/notes/permissions-comptes-groupes-linux/)** _(publié)_
- Périphériques et matériel (lsblk, blkid, udev, USB, PCI)
- Stockage persistant : montage, fstab, chiffrement, santé
- Noyau : versions, modules, initramfs et démarrage
- Mesurer, surveiller, comprendre les tampons
- Post-mortem : journaux, plantages et diagnostic après coup

### Multimédia et affichage

- **[Médias et affichage graphique sous Linux](/notes/medias-affichage-linux/)** _(publié)_
- Bluetooth et audio (bluetoothctl, PipeWire)

### Réseau

- Réseau au niveau du lien : associer, obtenir une adresse, diagnostiquer
- Réseau, transfert et accès distant (ssh, scp, sftp, curl, wget, ifconfig, yt-dlp)
- SSH : clés, configuration, tunnels et durcissement
- Partage de fichiers entre machines (SMB, NFS, sshfs)
- Synchronisation continue entre machines : Syncthing

### Automatisation et scripts

- Automatisation : cron, timers systemd et scripts planifiés
- Fichiers de configuration personnels : dépôt nu et coreutils
- Édition : vim et neovim (survie, usage courant, récupération)
- Sessions persistantes : tmux
- Navigation et productivité (yazi, zoxide, wikiman, git)

### Distribution et paquets

- Paquets, formats de distribution et compilation
- Artix et init non-systemd (OpenRC, runit, s6, dinit)
- Mise en service d'une machine et pare-feu
- Se documenter hors ligne : man, tldr, info, wikiman
- Entretien du système et dégraissage

### Sécurité et récupération

- Secrets : mots de passe, clés et chiffrement de fichiers
- Amorçage et confiance : LUKS2, TPM 2.0, FIDO2, Secure Boot
- Clé de secours et réparation hors ligne
- Sauvegarde et restauration
- Revenir en arrière après une mise à jour
- Git : récupérer du travail et sortir d'un état bloqué

### Production documentaire

- Documents : pandoc, LaTeX et production de PDF

### Environnements Windows et jeux

- Wine et préfixes (wineboot, winecfg, WINEDEBUG)
- Composants Windows dans un préfixe (winetricks, protontricks)
- Proton et jeux Steam (ProtonPlus, compatibilitytools.d)
- Machines virtuelles : le banc où répéter les procédures

## Ce que valorise ce format

Un runbook n'est utile que si on le retrouve. La table des matières est donc stricte, chaque document couvre les mêmes sections dans le même ordre : contexte, choix d'outil, opérations courantes, dépannage par symptôme, sécurité, urgence et récupération. Les tableaux sont en colonnes fixes pour rester lisibles au terminal.

Un runbook n'est utile que s'il ne ment pas. Chaque fait volatil (numéro de version, option qui a bougé, comportement d'une commande sur telle distribution) est daté et cité dans la section « Fraîcheur ». Les vérifications sont faites par exécution, jamais par recopie de documentation qu'on croit à jour.

Un runbook n'est utile que s'il pointe vers la suite. Chaque section « dépannage » se termine par les commandes de repli et les runbooks voisins qui prennent le relais. Le corpus est donc un maillage plutôt qu'une collection de fiches isolées.

C'est ce format-là que je réutilise sur les runbooks publiés ici. Les neuf extraits publics en donnent l'idée ; le reste, c'est le même travail répété.
