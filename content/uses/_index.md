---
title: "Ce que j'utilise"
description: "Mon environnement de travail au quotidien : distributions Linux, terminal, éditeur, outils CLI, matériel. Page mise à jour quand quelque chose change vraiment."
---

_Mon environnement de travail au quotidien. Mise à jour quand quelque chose change vraiment, pas à chaque nouveauté qui passe._

## Machines

- **Laptop** — ThinkPad E14 Gen 6 (Lenovo 21M3002BFR) sous **Artix Linux**, init OpenRC. Pas de systemd, par choix : je préfère un système où chaque service se lit dans un fichier plat et se démarre à la main quand j'en ai besoin.
- **Tour** — Custom sous **Arch Linux**, rolling release, dépôts AUR. `pacman` comme gestionnaire officiel, `yay` pour l'AUR.

## Environnement graphique

- **Gestionnaire de fenêtres** — `i3` (tiling), workspaces nommés en chiffres romains (I à VIII), navigation clavier exclusive. Aucune souris pour les manipulations de fenêtres.
- **Terminal** — `kitty`, police JetBrains Mono, thème sombre proche de Rose Pine.
- **Multiplexeur** — `tmux`, une session par contexte (perso, code, veille), reload rapide via bindings personnalisés.
- **Bar** — `polybar`, configurée en modules maison, remonte tension batterie, connexion Wi-Fi, notifications en attente, morceau en cours dans `mpd`.

## Shell et édition

- **Shell** — `zsh` avec `zsh-autosuggestions` et `zsh-syntax-highlighting`. Prompt minimal sur deux lignes : chemin sur la première, prompt sur la deuxième pour préserver la largeur.
- **Éditeur** — `neovim`, configuration `lua` maison. LSP quand nécessaire (`pyright`, `lua_ls`, `tsserver`), sinon `treesitter` et grep.
- **Navigation de fichiers** — `yazi`, plus rapide que `ranger` et sans les bugs Unicode que je rencontrais dessus.

## Navigateur

- **Principal** — **Zen Browser**, fork Firefox.
- **Secondaire** — **LibreWolf** pour la veille sans traceurs.

Aucun Chromium sur mes machines.

## Musique, veille, notifications

- **Musique** — `mpd` comme serveur, `rmpc` comme client TUI. Bibliothèque locale, jamais de streaming.
- **Flux RSS** — `newsboat`, lecture au clavier, bookmarks vers un fichier plat que je grepe.
- **Notifications** — `dunst`, historique consultable au clavier.

## Ce que je n'utilise pas, par choix

Aucun IDE lourd, pas de Docker Desktop, pas de suite bureautique graphique par défaut. `pandoc` pour convertir vers `.docx` ou `.pdf` quand un rendu de sortie est demandé.

## Ce site

Construit avec **Hugo**, publié via **GitHub Actions**, hébergé sur **GitHub Pages**. Aucune bibliothèque JavaScript externe, aucune étape de bundling, deux polices auto-hébergées (Instrument Serif, JetBrains Mono).
