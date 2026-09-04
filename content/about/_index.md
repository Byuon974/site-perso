---
title: "À propos"
description: "Ce que je conçois, comment je travaille, et pourquoi ce site existe."
---

## Ce que je fais

Je conçois et je développe des applications métier de bout en bout, de
l'architecture à la mise en service, avec une culture d'infrastructure Linux
derrière.

Sur ma dernière alternance, seul informaticien du service, j'ai conçu et
développé une plateforme SaaS de régulation de transport médico-social pour des
sociétés de taxis conventionnées CGSS. Traduire un besoin métier en architecture
applicative, intégrer des contraintes réglementaires dès la conception, rendre
compte à un interlocuteur qui n'est pas du domaine, et documenter chaque
décision structurante pour que le projet reste reprenable : ces quatre choses ne
s'apprennent pas en contribuant à un projet existant.

Avant cela, trois ans au Conseil Départemental de La Réunion sur
l'infrastructure. Administration Linux, réseau et sécurité, automatisation de
déploiements avec Ansible, modélisation de bases de données, refonte applicative
en PHP.

J'entre en dernière année du MSc Intelligence Artificielle et Big Data à Epitech
pour élargir mon socle vers la donnée à grande échelle, et je cherche
l'entreprise qui m'accueillera en alternance. Le rythme est de six semaines en
entreprise pour deux à l'école.

---

## Comment je travaille

Un script qui sert vraiment vaut mieux qu'un discours sur ma façon de concevoir. Celui qui a servi à retirer la dépendance Google Fonts de ce site est court, il est dans le dépôt, et il illustre ce que j'essaie de faire à chaque fois : `recuperer-polices.sh`.

Le script télécharge les `woff2` de Google, récrit les chemins vers l'arborescence locale, et affiche à la fin ce qu'il reste à faire à la main. En quarante lignes, on retrouve les choses qui comptent pour moi.

Il déclare ses codes de sortie en tête (0 succès, 1 erreur d'exécution, 2 dépendance absente), il vérifie la présence de `curl` avant de commencer, et il crée le dossier de destination avant de télécharger dedans plutôt qu'après avoir tenté d'y écrire. La ligne `curl` porte en commentaire pourquoi l'en-tête `User-Agent` d'un navigateur récent est nécessaire, sans quoi Google renvoie du `ttf`. Les messages d'aide sortent sur `stderr`, les données pipeables sur `stdout`, ce qui permet de rediriger la sortie sans avoir à filtrer le bavardage. Et à la toute fin, plutôt qu'un `Done!` creux, le script énumère les trois actions restantes que l'automatisation n'a volontairement pas prises en charge : coller le bloc `@font-face` généré, retirer les balises Google Fonts du `<head>`, ajouter les préchargements listés en sortie.

Le principe qui tient tout ça ensemble tient en une phrase : un outil doit prouver ce qu'il annonce par ce qu'il exécute, pas par ce qu'il affiche. Le reste (mode strict bash, `shellcheck` propre, `set -euo pipefail`, `IFS` désarmé) suit naturellement quand cette exigence est posée.

---

## Pourquoi ce site

Deux usages, et le second explique la forme du premier.

**Un portfolio.** Les projets, ce qu'ils résolvent, et les arbitrages qu'ils ont
demandés.

**Une base de connaissances.** Mes notes techniques, écrites d'abord pour moi.
Elles ressemblent à des pages de manuel parce que c'est ainsi que je les
consulte : une commande, ses options, le cas qui pose problème.

Le site est bâti en conséquence. Aucune dépendance à un tiers, polices servies
depuis la même origine, système de design documenté dans une feuille unique, et
un CSS dont chaque valeur littérale a été ramenée à un jeton nommé.

---

## Ce que le site emploie

- Hugo, générateur de site statique
- HTML, CSS et JavaScript sans bibliothèque ni étape de construction
- GitHub Actions pour la publication
- Deux familles typographiques, servies depuis le site
