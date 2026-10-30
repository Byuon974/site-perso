---
title: "La philosophie Unix, et ce que j'en fais"
date: 2026-07-14
draft: false
description: "Ce que la philosophie Unix m'a coûté sur mes propres outils, ce qu'elle m'a rendu, et pourquoi coder avec une IA ne m'a pas dispensé du travail de liaison."
tags: ["unix", "linux", "philosophie", "scripts", "systemd"]
categories: ["système"]
---

Je me suis donné une règle, il y a quelques années : avant d'ajouter une dépendance, écrire ce qu'elle m'évite d'écrire. La plupart du temps, la réponse tient en quelques dizaines de lignes, et la dépendance ne passe pas.

Cette règle vient de la philosophie Unix. Elle a un coût, que je paie à chaque projet, et un rendement, que je ne mesure que des mois plus tard. Ce qui suit est le relevé des 2, sur des outils que j'ai écrits.

---

## Le bazar plutôt que la cathédrale

Avant Unix, les systèmes d'exploitation ressemblaient à des cathédrales : monolithiques, propriétaires, coûteux, et à peu près impossibles à bidouiller pour qui n'était pas dans le sérail.

Ken Thompson et Dennis Ritchie, les 2 ingénieurs à l'origine d'Unix, ont fait le pari inverse avec leurs collègues des Bell Labs : préférer le bazar à la cathédrale. Plutôt qu'un seul programme géant, un ensemble de petits outils. Chacun bon dans une seule tâche, tous pensés pour collaborer. Une idée simple, qui a tenu cinquante ans.

La version qu'on cite partout tient en 3 règles, attribuées à Doug McIlroy : faire une chose et la faire bien, travailler ensemble, manipuler des flux textuels. Ce résumé est tardif, puisqu'on le doit à Peter Salus en 1994, puis à Eric Raymond en 2003.

L'original est de 1978, signé McIlroy, Pinson et Tague en avant-propos d'un numéro du *Bell System Technical Journal*. Il compte 4 points, et le deuxième est celui qu'on cite le moins alors qu'il porte tout le reste :

> Partez du principe que la sortie de votre programme deviendra l'entrée d'un autre, encore inconnu. Ne l'encombrez pas d'informations parasites. Évitez les formats colonnaires rigides et les formats binaires. N'exigez pas de saisie interactive.

4 phrases, écrites avant que la question se pose. Elles ne décrivent pas un style, elles décrivent un contrat.

---

## Le contrat qui rend 2 programmes composables

Écrire 2 programmes au lieu d'un ne suffit pas à les rendre composables. Il faut qu'ils respectent un contrat, et ce contrat tient en 4 clauses qu'Unix a fixées il y a cinquante ans.

**La sortie standard porte la donnée, et rien d'autre.** Un seul résultat, dans un format que le programme suivant sait lire. Dès qu'un message de confort s'y glisse, la substitution de commande le ramasse avec le reste et l'enchaînement casse.

**La sortie d'erreur porte le récit.** Les étapes, les compteurs, les avertissements, les échecs : tout ce qu'un humain lit et qu'aucun programme n'a à analyser. La séparation se vérifie d'une ligne, en redirigeant la sortie standard vers un fichier : ce qui reste à l'écran est le récit, ce qui tombe dans le fichier est la donnée.

Le raffinement qui prouve que la clause est tenue pour de bon, c'est la couleur. Un outil qui colore son récit teste d'abord si un terminal le lit :

```python
if sys.stderr.isatty():
    pale, fin = "\033[2m", "\033[m"
```

Sans ce test, les codes d'échappement partent dans le tube et salissent la donnée du suivant.

**Le code de retour porte le verdict.** 0 quand c'est fait, autre chose sinon, avec des valeurs stables d'un outil à l'autre : 2 pour un mauvais usage, 127 pour une dépendance absente. Un appelant décide alors avec `&&` et `||`, sans lire un seul message.

**Ce qui circule est un format documenté.** Un chemin, du texte, un fichier dont la spécification est publique. Jamais une structure interne, jamais un protocole maison.

Ces 4 clauses tenues, la composition se passe de colle. Mes 2 programmes d'archivage, l'un qui capture une page web, l'autre qui la rend lisible hors ligne, s'enchaînent ainsi :

```bash
rendre "$(aspirer --navigateur https://exemple.org/article)"
```

La substitution ne capture que le chemin du WARC, parce que c'est la seule chose que le premier programme a écrite sur sa sortie standard. Le second lit ce chemin, archive hors ligne, et écrit à son tour un chemin. Aucun des 2 ne sait que l'autre existe.

C'est là que se trouve le vrai rendement. Le jour où je veux filtrer les captures avant de les rendre lisibles, ou garder les WARC dans un dépôt plutôt que sur le disque, le 3ᵉ programme se glisse entre les 2 sans que ni l'un ni l'autre change d'une ligne. Un programme qui fait les 2 gestes à la fois m'aurait demandé de le rouvrir.

---

## Ce que la règle coûte

Elle coûte du code que je n'aurais pas eu à écrire.

Tenir la clause du format documenté m'a valu un parseur HTML de 80 lignes embarqué dans un script bash, là où une bibliothèque d'extraction aurait fait le travail en 3 lignes. Tenir celle de la sortie standard m'oblige à séparer ce que j'affiche de ce que je rends, alors qu'un seul `print` suffirait à me satisfaire sur le moment.

Elle coûte aussi des fonctionnalités que je refuse. Une base de données qui me dispenserait de penser au format, un parallélisme dont le volume ne me donne pas besoin, une interface graphique pour un outil qui tourne une fois par semaine. Ces renoncements ne se voient pas. Ils se paient en temps, au moment précis où il aurait été plus rapide d'installer quelque chose.

Elle coûte enfin une forme d'inconfort. Un outil qui fait une chose vous laisse faire le reste.

---

## Ce qu'elle rend

Le rendement arrive plus tard, et il arrive sous 3 formes.

**La durée.** Mes plus vieux scripts ont 2 ans et tournent encore, à quelques retouches près, malgré les changements des sites qu'ils interrogent. Rien dans leur pile n'a eu besoin d'être migré, parce qu'il n'y a rien à migrer.

**La réparation.** La clause du récit sur la sortie d'erreur a une conséquence que je n'avais pas prévue : elle laisse de la place pour dire quoi faire. Un échec de capture n'y rend pas un numéro, il nomme le code HTTP reçu et propose l'option qui le contourne. Le diagnostic vit dans l'outil, pas dans ma mémoire.

**La sortie.** Un WARC est un format documenté que d'autres programmes lisent. Un Markdown s'ouvre dans n'importe quel éditeur. Le jour où j'abandonne mes propres scripts, les archives restent lisibles sans eux. C'est le même calcul que pour mes notes : un format que je sais lire est un coût de sortie que je connais d'avance.

---

## Mesurer avant de construire

La règle a une contrepartie, sans quoi elle devient un dogme : chercher ce qui existe déjà, et le mesurer sur le cas réel.

Avant d'écrire l'extraction de `rendre`, j'ai passé la même page à trafilatura et à readability. Trafilatura en gardait 17 % du texte, readability 1 %. Ma méthode, qui retient le bloc le plus dense après avoir rétabli les `div` qui jouent le rôle de tableau, en garde 99 %.

Sans ces 3 chiffres, je n'aurais eu qu'une préférence. Avec eux, j'ai une raison. Le jour où une bibliothèque fera mieux, le chiffre me le dira et je la prendrai.

---

## Pourquoi le moins bon l'a emporté

En 1989, Richard Gabriel a formulé une thèse qui dérange, **« Worse is Better »**, dans un essai sur Lisp qu'il n'a jamais vraiment publié. Le texte a circulé 2 ans plus tard parce qu'un collègue l'a trouvé dans ses fichiers et l'a envoyé par courriel. Il oppose 2 approches :

- **« The Right Thing »** : la perfection théorique, la complétude à tout prix, l'idéal académique.
- **« Worse is Better »** : la simplicité d'implémentation et la portabilité, quitte à laisser filer quelques cas non gérés.

J'aurais parié que la première l'emporterait à long terme. C'est l'inverse qui s'est produit. Les machines Lisp, ces ordinateurs des années 1980 conçus pour exécuter Lisp jusque dans leur silicium, étaient supérieures à presque tous les égards. Ça n'a pas suffi.

L'explication tient en un mot : la diffusion. Un système suffisamment bon, facile à porter et à comprendre, se répand plus vite, atteint une masse critique et finit par s'imposer. Linux n'a pas gagné par une perfection d'architecture, son noyau monolithique ayant été critiqué par les puristes, mais par cette même capacité à être partout.

Gabriel lui-même a fini par se contredire. En 2000, il a écrit la réfutation de son propre texte, « Worse Is Better Is Worse », sous un pseudonyme. Celui qui a nommé l'idée est aussi celui qui l'a attaquée le plus sérieusement, ce qui en dit long sur son statut : une observation, pas une loi.

Je m'applique la thèse à moi-même. `aspirer` n'a pas de moteur JavaScript, donc il rate les pages qui construisent leur contenu au chargement. Il le déclare dans l'en-tête du WARC qu'il écrit, plutôt que de prétendre le contraire. Un script bash avec un trou documenté m'a rendu plus de service qu'un navigateur sans tête que je n'aurais jamais fini de configurer.

---

## L'IA n'a pas supprimé la chaîne

Je code avec Claude Code au quotidien. L'objection est évidente : défendre les outils qui font une chose, en s'appuyant sur un outil généraliste qui prétend tout faire.

Elle ne tient pas, et pour une raison qui est elle-même une règle d'Unix. L'IA produit du texte. Elle s'insère donc dans une chaîne, elle ne la remplace pas. Elle écrit des morceaux ; décider lesquels existent, ce qu'ils s'envoient et où passe la frontière entre eux reste mon travail, et c'est ce travail-là qui fait l'architecture.

`aspirer` et `rendre` sont 2 programmes séparés parce que j'ai décidé qu'archiver et rendre lisible étaient 2 gestes de coût différent. Aucun assistant ne prend cette décision à ma place : il écrit très bien le programme unique que je ne veux pas.

Ce que j'écris avant de générer, les contraintes et les décisions d'architecture consignées, sert exactement à ça : obtenir d'un outil non déterministe quelque chose que je peux relire et reconduire. L'IA génère, je relis, je reconduis. La séparation du mécanisme et de la politique, vieille de cinquante ans, décrit assez bien la répartition.

---

## Là où je bute encore

Mon ordinateur portable change d'état en permanence : le Wi-Fi se coupe, la batterie s'épuise, on branche et débranche des périphériques sans y penser, on replie l'écran. On attend de lui que tout fonctionne tout de suite, tout le temps. Cette complexité est une exigence légitime, à laquelle il fallait bien répondre.

C'est dans ce contexte que des outils comme **systemd** ou les environnements de bureau complets sont apparus. Ce sont des écosystèmes pensés pour gérer un chaos réel.

Ce qui me pose question, c'est leur *manière* d'exister. Un composant peut devenir un ensemble à couplage serré. 3 signes le trahissent.

- Ses parties se séparent difficilement.
- Ses journaux passent en format binaire, `journald` notamment.
- Ses dépendances forment un labyrinthe que je peine à cartographier.

Le deuxième signe est celui que je touche du doigt le plus souvent. Mes runbooks se cherchent sur le message d'erreur brut, celui que l'utilisateur voit à l'écran. Un journal binaire interdit ce geste : il faut un outil pour le lire, et cet outil décide de ce que je vois. La troisième règle de McIlroy est ce qui rend un système inspectable par quelqu'un qui ne l'a pas écrit.

Je ne suis pas le premier à le relever, et les noms qui l'ont fait avant moi valent mieux que mon avis. Patrick Volkerding reproche à systemd de piloter quantité de services depuis un seul démon, ce qui contredit la règle du programme qui fait une chose. McIlroy, qui a écrit la formulation de 1978, a critiqué l'enflure de Linux en la comparant aux outils taillés court des premières versions de Research Unix. Dès 1984, enfin, Kernighan et Pike s'alarmaient de l'accumulation de fonctions dans 4.2BSD et System V.

Le reproche inverse existe aussi, et il est ancien. En 1981 déjà, Don Norman reprochait à Unix de négliger l'interface au point que l'utilisateur ne peut pas s'en faire un modèle mental juste, ce qui rend l'erreur coûteuse facile. Un système composable n'est pas automatiquement un système utilisable.

Je ne tranche pas à leur place. Ce que je cherche, c'est où passe la ligne.

---

## Une boussole

Prise pour un dogme, cette philosophie devient une posture : vouloir tout réécrire en C ou vivre avec un terminal nu par principe ne tient pas lieu de méthode. À l'inverse, accepter toute la complexité actuelle en se disant que « c'est comme ça maintenant » est une façon confortable de ne plus se poser de questions.

Je m'en sers comme d'une boussole. Elle me fait poser 3 questions avant d'écrire :

- Est-ce que ce programme fait une chose, ou 10 autres sans le dire ?
- Est-ce que je peux retirer une pièce sans que tout s'effondre ?
- Est-ce que ce qui sort est lisible par un programme que je n'ai pas écrit ?

Cette philosophie est vivante, enfouie sous des couches de décisions prises par pragmatisme et de fausses bonnes idées. Elle ressurgit chaque fois que quelqu'un préfère la simplicité à une fonctionnalité de plus.

Je m'y tiens la plupart du temps, et le point par lequel j'ai commencé est celui sur lequel je ne transige pas. La complexité s'accumule toute seule. La simplicité, jamais. C'est ce travail-là que je choisis de continuer.
