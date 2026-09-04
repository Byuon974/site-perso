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
et je cherche l'entreprise qui m'accueillera en alternance. Le rythme est de six
semaines en entreprise pour deux à l'école.

---

## Comment je travaille

Mes outils en ligne de commande disent plus sur ma façon de concevoir que la
plateforme, parce qu'ils sont assez courts pour être lus en entier. Trois règles
y reviennent.

**Un outil doit rester jetable.** Mes enveloppes autour de `yt-dlp` portent en
commentaire la commande native équivalente à chaque option. Quelqu'un qui n'a
pas mes scripts obtient le même résultat en copiant la ligne. Une dépendance
qu'on peut abandonner sans rien perdre n'est plus une dépendance.

**Un essai à blanc doit valider ce qu'il annonce.** Afficher un chemin de
destination sans avoir vérifié qu'il est inscriptible ne prouve rien. Les
dossiers sont donc créés et testés avant l'essai, pas après.

**Un message d'erreur doit dire quoi faire ensuite.** La commande qui montre le
détail, celle qui revient en arrière, celle qui contourne. Sans ça, le lecteur
repart chercher ailleurs ce que le programme sait déjà.

Le reste suit : mode strict, codes de sortie conventionnels, `shellcheck`
propre, et une vérification par exécution plutôt que par affirmation.

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
