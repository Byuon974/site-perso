---
title: "Chmod"
description: "Commandes pour gérer les perms."
tags: ["tty", "devops", "cli"]
updated: 2025-10-20
---

# Gestion des droits avec `chmod`

---

## 1. Objectifs et principes fondamentaux de la gestion des permissions

### 1.1. Rationalité de la gestion fine des permissions

Dans les systèmes d'exploitation de la famille Unix et Linux, la commande **`chmod`** (pour _change mode_) constitue le mécanisme fondamental de contrôle d'accès aux ressources du système de fichiers.
Elle détermine avec précision **qui peut lire, écrire ou exécuter** un fichier ou un répertoire, définissant ainsi les frontières de sécurité et de collaboration.

Les objectifs principaux de cette gestion sont multiples : elle permet de **protéger les données sensibles** dans un environnement multi-utilisateur, comme sur un serveur partagé.
Elle facilite également le **travail collaboratif** en autorisant des groupes spécifiques d'utilisateurs à accéder à des ensembles de fichiers communs, tout en en excluant d'autres.

Cette granularité est essentielle pour **prévenir les fuites de données** ou les modifications non autorisées, qu'elles soient accidentelles ou malveillantes.
Elle est indispensable à la **préparation et au durcissement** des environnements d'exécution pour les services (comme un serveur web), les scripts de sauvegarde ou les applications.

> Une maîtrise de `chmod` permet d'appliquer concrètement le principe du **moindre privilège** :
> chaque ressource du système se voit octroyer uniquement les droits strictement nécessaires à son fonctionnement et à son utilisation légitime, réduisant ainsi la surface d'attaque potentielle.

### 1.2. Contextes d'application typiques de `chmod`

L'utilisation de `chmod` intervient dans plusieurs scénarios opérationnels courants.

Un cas élémentaire est le **rendu d'un script exécutable** avec la commande `chmod +x script.sh`, sans lequel le système refuserait de l'interpréter comme un programme.
À l'opposé, pour **sécuriser un fichier contenant des informations critiques** (comme une clé SSH ou un fichier de configuration avec un mot de passe),
on restreint l'accès au seul propriétaire avec `chmod 600 secret.txt`.

Dans un contexte de **travail d'équipe**, la commande permet de configurer un répertoire partagé où les membres d'un groupe pourront lire et créer des fichiers,
tout en empêchant les autres utilisateurs d'y accéder, par exemple avec `chmod 2770 /equipe/projet`.

En administration système, le **durcissement des permissions pour un serveur web** suit des conventions établies :
généralement `chmod 644` pour les fichiers (lecture pour tous, écriture pour le propriétaire) et `chmod 755` pour les répertoires (ajout de l'autorisation d'exécution pour permettre la navigation).

---

## 2. Fondamentaux théoriques des permissions Unix

### 2.1. Les trois catégories d'utilisateurs du système

Le système de permissions Unix repose sur une distinction fondamentale entre trois catégories d'entités pour chaque fichier ou répertoire.
Cette tripartition permet une gestion granulaire des accès en fonction du lien qu'un utilisateur entretient avec la ressource.

La première catégorie est le **propriétaire** (symbolisé par `u` pour _user_), c'est-à-dire l'utilisateur qui a créé le fichier ou à qui il a été explicitement attribué.
Vient ensuite le **groupe** associé (`g`), qui regroupe un ensemble d'utilisateurs partageant des besoins d'accès communs.
La catégorie **autres** (`o` pour _others_) désigne tous les autres utilisateurs du système n'appartenant pas aux deux premières catégories.
Le symbole `a` (pour _all_) est une abréviation pratique représentant simultanément les trois catégories.

|  Catégorie   | Symbole | Description                                          |
| :----------: | :-----: | ---------------------------------------------------- |
| Propriétaire |   `u`   | L'utilisateur propriétaire du fichier                |
|    Groupe    |   `g`   | Le groupe principal associé au fichier               |
|    Autres    |   `o`   | Tous les autres utilisateurs du système              |
|     Tous     |   `a`   | Abréviation combinant `u` (propriétaire), `g` et `o` |

### 2.2. Nature et implications des trois types de permissions

Chaque catégorie d'utilisateurs peut se voir attribuer trois types de permissions fondamentales, dont l'effet diffère sensiblement selon qu'elles s'appliquent à un fichier régulier ou à un répertoire.

La permission de **lecture** (`r`) autorise, pour un fichier, la consultation de son contenu.
Pour un répertoire, elle permet de lister les noms des entrées qu'il contient (via `ls`).
La permission d'**écriture** (`w`) permet de modifier le contenu d'un fichier existant.
Sur un répertoire, elle confère le droit de créer, renommer ou supprimer des fichiers à l'intérieur de celui-ci, indépendamment des permissions sur les fichiers eux-mêmes.
La permission d'**exécution** (`x`) est nécessaire pour exécuter un fichier en tant que programme ou script.

Pour un répertoire, elle est cruciale car elle contrôle la possibilité d'**accéder** à son contenu, c'est-à-dire d'y entrer (`cd`) ou d'accéder aux métadonnées (inodes) des fichiers qu'il contient.

| Permission | Symbole | Effet sur un **fichier**        | Effet sur un **répertoire**                    |
| :--------: | :-----: | ------------------------------- | ---------------------------------------------- |
|  Lecture   |   `r`   | Lire le contenu du fichier      | Lister les noms des entrées du répertoire      |
|  Écriture  |   `w`   | Modifier le contenu du fichier  | Créer, renommer ou supprimer des entrées       |
| Exécution  |   `x`   | Exécuter le fichier (programme) | **Accéder** au répertoire et à ses métadonnées |

> _Pourquoi le bit d'exécution (`x`) est-il indispensable sur un répertoire ?_
> Sans le bit `x` sur un répertoire, même avec la lecture (`r`), vous pouvez voir la liste des fichiers (`ls`),
> mais toute tentative d'accès à leur contenu, de changement de répertoire (`cd`) ou d'utilisation de chemins relatifs échouera. Le bit `x` est la clé qui "ouvre la porte" du répertoire.

### 2.3. Méthodes d'inspection des permissions existantes

Deux commandes principales permettent d'examiner les permissions d'un fichier ou d'un répertoire.

La commande `ls -l` fournit une vue détaillée et est la plus couramment utilisée. Par exemple, `ls -l projets/` pourrait afficher :

```
drwxr-xr-- 2 alice dev 4096 Jan 1 10:00 projets/
```

Le premier caractère indique le type (`d` pour répertoire, `-` pour fichier, `l` pour lien symbolique).
Les neuf caractères suivants se décomposent en trois triplets : `rwx` pour le propriétaire (alice), `r-x` pour le groupe (dev), et `r--` pour les autres.

Pour une sortie plus concise et scriptable, la commande `stat` est préférable.
L'option `-c` permet de formater la sortie. Par exemple, `stat -c "%A %a %n" projets/` produit `drwxr-xr-- 754 projets/`,
affichant respectivement la notation symbolique, la notation octale (voir ci-dessous) et le nom du fichier.

### 2.4. Les deux systèmes de notation : symbolique et octale

#### 2.4.1. La notation symbolique relative

La notation symbolique utilise des lettres pour désigner
les catégories (`u`, `g`, `o`, `a`), les opérations (`+` pour ajouter, `-` pour retirer, `=` pour définir absolument) et les permissions (`r`, `w`, `x`).

Sa syntaxe est `chmod [cible][opération][permissions] fichier`. Elle est dite "relative" car elle modifie les permissions existantes sur la base de leur état courant.

Par exemple, `chmod g+w fichier` ajoute le droit d'écriture pour le groupe, tandis que `chmod o=r` définit les permissions pour les autres à la lecture seule.

#### 2.4.2. La notation octale absolue

La notation octale représente les permissions par une valeur numérique sur trois ou quatre chiffres. Elle est dite "absolue" car elle définit l'état complet des permissions.

Chaque type de permission a une valeur : lecture (`r`) = 4, écriture (`w`) = 2, exécution (`x`) = 1.

Pour chaque catégorie (propriétaire, groupe, autres), on additionne les valeurs des permissions souhaitées, obtenant un chiffre entre 0 (`---`) et 7 (`rwx`).
Ces trois chiffres sont ensuite concaténés.

| Chiffre | Calcul | Permissions symboliques | Signification                  |
| :-----: | :----: | :---------------------: | ------------------------------ |
|   `0`   |   0    |          `---`          | Aucune permission              |
|   `1`   |   1    |          `--x`          | Exécution uniquement           |
|   `2`   |   2    |          `-w-`          | Écriture uniquement            |
|   `3`   |  2+1   |          `-wx`          | Écriture et exécution          |
|   `4`   |   4    |          `r--`          | Lecture uniquement             |
|   `5`   |  4+1   |          `r-x`          | Lecture et exécution           |
|   `6`   |  4+2   |          `rw-`          | Lecture et écriture            |
|   `7`   | 4+2+1  |          `rwx`          | Lecture, écriture et exécution |

Ainsi, `chmod 755 script.sh` attribue `rwxr-xr-x` : tous les droits au propriétaire, lecture et exécution aux autres.
`chmod 640 config.cfg` donne `rw-r-----` : lecture/écriture au propriétaire, lecture seule au groupe, aucun droit aux autres.

> _Pourquoi `755` pour les scripts partagés ?_
> Le propriétaire (`7` = `rwx`) peut lire, modifier et exécuter le script.
> Le groupe et les autres (`5` = `r-x`) peuvent le lire et l'exécuter, mais pas le modifier, ce qui est idéal pour distribuer des outils tout en empêchant leur altération accidentelle ou malveillante.

### 2.5. Les bits de permission spéciaux : setuid, setgid et sticky

Au-delà des permissions de base, trois bits spéciaux étendent les fonctionnalités du système, principalement pour les besoins de l'administration système.

Le bit **setuid** (Set User ID), noté `u+s` en symbolique ou par un quatrième chiffre `4` en octal (ex: `4755`),
fait en sorte qu'un programme s'exécute avec les privilèges de son **propriétaire**, et non de l'utilisateur qui le lance.

Il est utilisé pour des commandes comme `passwd` qui nécessitent des privilèges temporaires.
Le bit **setgid** (Set Group ID), noté `g+s` ou `2xxx`, a un double effet : sur un fichier exécutable, il fait s'exécuter le programme avec les privilèges du **groupe** propriétaire ;
sur un répertoire, il force tous les nouveaux fichiers et sous-répertoires créés à hériter du groupe du répertoire parent, facilitant le travail collaboratif.

Le bit **sticky** (ou "bit collant"), noté `o+t` ou `1xxx`, lorsqu'il est appliqué à un répertoire comme `/tmp`,
empêche les utilisateurs de supprimer ou renommer les fichiers dont ils ne sont pas propriétaires, même s'ils ont le droit d'écriture sur le répertoire.

|  Bit   | Notation symbolique | Notation octale (4ᵉ chiffre) | Effet principal                                                                               |
| :----: | :-----------------: | :--------------------------: | --------------------------------------------------------------------------------------------- |
| setuid |        `u+s`        |     `4xxx` (ex: `4755`)      | Le programme s'exécute avec l'identité du **propriétaire** du fichier                         |
| setgid |        `g+s`        |     `2xxx` (ex: `2775`)      | Exécution avec l'identité du **groupe** ; héritage du groupe parent sur les nouveaux fichiers |
| sticky |        `o+t`        |     `1xxx` (ex: `1777`)      | Dans un répertoire : seul le propriétaire d'un fichier peut le supprimer ou le renommer       |

> Les bits setuid et setgid, s'ils sont mal attribués, peuvent créer des **failles de sécurité critiques**.
> Ils ne doivent être utilisés que sur des binaires de confiance et après une analyse minutieuse.
> L'attribution de ces bits sur des scripts interprétés est généralement déconseillée.

---

## 3. Procédure opérationnelle de gestion des permissions

### 3.1. Phase initiale : diagnostic des permissions existantes

Toute modification des permissions doit être précédée d'une analyse précise de l'état actuel.
La commande fondamentale est `ls -l fichier.txt`, qui produit une sortie détaillée comme `-rw-rw-r-- 1 user group 0 Jan 1 12:34 fichier.txt`.
Cette ligne révèle le type de fichier, les permissions symboliques pour les trois catégories d'utilisateurs, ainsi que le propriétaire et le groupe associé.

Pour obtenir une vue d'ensemble sur plusieurs fichiers, utilisez `ls -l /chemin/*`.
Cette approche est particulièrement utile pour vérifier la cohérence des permissions au sein d'un répertoire.
Lorsque vous avez besoin d'intégrer ces vérifications dans des scripts ou de traiter la sortie de manière programmatique, la commande `stat` avec l'option de formatage `-c` est plus adaptée.

Par exemple, `stat -c "%A %a %n" fichier.txt` retourne simultanément la notation symbolique, la valeur octale et le nom du fichier, fournissant ainsi une représentation complète et exploitable.

### 3.2. Application de modifications avec la notation symbolique relative

La notation symbolique permet d'ajuster les permissions de manière incrémentale, en se basant sur leur état courant.

Pour **octroyer le droit d'exécution au propriétaire** d'un script, utilisez `chmod u+x script.sh`.
Cette commande ajoute (`+`) le bit d'exécution (`x`) spécifiquement à la catégorie du propriétaire (`u`), sans affecter les autres permissions.

Pour **restreindre l'accès en écriture** sur un document sensible,
la commande `chmod go-w rapport.pdf` retire (`-`) la permission d'écriture (`w`) à la fois pour le groupe (`g`) et les autres utilisateurs (`o`),
tout en laissant les droits du propriétaire intacts.

Dans le cadre d'une **normalisation stricte des accès**, par exemple pour un répertoire contenant des documents à consulter sans modification possible, la syntaxe `chmod a=rx dossier/` est employée.
L'opérateur `=` définit explicitement les permissions à lecture et exécution (`rx`) pour toutes les catégories (`a`), remplaçant ainsi toute configuration antérieure.

Une forme abrégée courante, `chmod +x fichier`, équivaut à `chmod a+x fichier` et ajoute systématiquement le bit d'exécution pour toutes les catégories.

### 3.3. Définition absolue des permissions via la notation octale

La notation octale est privilégiée lorsqu'il s'agit de définir un état de permissions connu et complet, indépendant de l'état précédent.
Elle est également plus concise pour décrire des configurations standard.

La valeur `755`, appliquée avec `chmod 755 script.sh`, est emblématique pour les **programmes et scripts partagés**.
Elle correspond à `rwxr-xr-x`, autorisant le propriétaire à tout faire, tandis que les autres peuvent lire et exécuter le fichier, mais pas le modifier.

C'est la configuration typique des binaires dans `/usr/bin`.

Pour un **fichier de configuration contenant des informations sensibles** (comme des mots de passe ou clés d'API), `chmod 640 config.cfg` est approprié.
Cela donne `rw-r-----`, permettant au propriétaire de lire et écrire, au groupe de seulement lire, et n'accordant aucun droit aux autres utilisateurs.

L'activation du **bit sticky sur un répertoire commun** comme `/tmp` se fait avec `chmod 1777`.
Le préfixe `1` active le bit sticky, et `777` accorde tous les droits de base, mais le bit sticky empêche quiconque de supprimer les fichiers d'un autre utilisateur.

### 3.4. Application récursive des modifications

La modification des permissions sur une arborescence complète de fichiers et de répertoires nécessite l'option récursive `-R`.

Par exemple, `chmod -R 750 ~/backup/` applique systématiquement les permissions `rwxr-x---` au répertoire `~/backup` et à tout son contenu.
L'ajout de l'option `-v` (verbeux) avec `chmod -Rv 755 /chemin/` permet de visualiser en temps réel chaque fichier modifié, ce qui est utile pour le débogage.

> L'usage récursif de `chmod` est une opération puissante qui peut causer des dommages systémiques si elle est mal ciblée.
> La commande `chmod -R 777 /` rendrait l'intégralité du système de fichiers lisible, modifiable et exécutable par n'importe quel utilisateur, compromettant gravement la sécurité.
> **Toujours vérifier le chemin cible et tester sur un sous-répertoire isolé si possible.**

### 3.5. Configuration de scénarios d'usage standards

#### 3.5.1. Mise en place d'un répertoire de travail collaboratif

L'objectif est de créer un espace (`/equipe/`) où tous les membres d'un groupe (`dev`) peuvent librement créer et modifier des fichiers, tout en excluant les autres utilisateurs.
La procédure se déroule en deux temps :

```bash
chown root:dev /equipe/   # Définit le groupe propriétaire sur 'dev'
chmod 2770 /equipe/       # Applique rwx pour le propriétaire et le groupe, et active le bit setgid
```

Le bit setgid (indiqué par le `2` en notation octale) est crucial :
il garantit que tout nouveau fichier ou sous-répertoire créé dans `/equipe/` héritera automatiquement du groupe `dev`, assurant la cohérence des permissions et facilitant la collaboration.

#### 3.5.2. Sécurisation d'un script ou d'un fichier privé

Pour un script contenant des opérations sensibles (comme une sauvegarde avec des identifiants), il est impératif de le restreindre au seul propriétaire.

Après sa création (`touch backup.sh`), la commande `chmod 700 backup.sh` établit les permissions `rwx------`.
Seul le propriétaire pourra alors lire, modifier ou exécuter ce fichier.

#### 3.5.3. Configuration des permissions pour un serveur web

La sécurisation d'une arborescence web suit des conventions établies pour équilibrer fonctionnalité et sécurité.
Les fichiers statiques (HTML, CSS, images) sont généralement configurés en `644` (`rw-r--r--`) :
lisibles par tous, modifiables uniquement par le propriétaire.

Les répertoires, eux, nécessitent le bit d'exécution pour être parcourus, d'où la permission `755` (`rwxr-xr-x`).

Un répertoire comme `uploads/`, où l'application web doit pouvoir écrire des fichiers envoyés par les utilisateurs, présente un cas particulier.
Une configuration courante est `chmod 733 /var/www/uploads/` (`rwx-wx-wx`). Le serveur (généralement exécuté sous l'identité d'un utilisateur spécifique comme `www-data`) bénéficie de tous les droits.

Les autres utilisateurs peuvent entrer dans le répertoire et lister son contenu, mais ne peuvent pas y créer directement des fichiers.

> **Ces paramètres doivent impérativement être adaptés au modèle de sécurité et aux exigences précises du serveur web utilisé (Apache, Nginx, etc.).**

---

## 4. Exemples avancés et techniques complémentaires

### 4.1. Implémentation d'un répertoire collaboratif sécurisé

La création d'un espace de travail partagé nécessite une configuration précise pour assurer à la fois la collaboration et la sécurité.

La première étape consiste à définir le groupe propriétaire du répertoire, par exemple en utilisant `sudo chown :dev /equipe`,
qui associe le groupe `dev` au répertoire `/equipe` tout en conservant l'utilisateur propriétaire actuel.

La seconde étape, cruciale, applique les permissions avec la commande `sudo chmod 2770 /equipe`.
Cette configuration octroie tous les droits (lecture, écriture, exécution) au propriétaire et au groupe, mais aucun aux autres utilisateurs.

Le préfixe `2` active le **bit setgid**, garantissant que tout nouveau fichier ou sous-répertoire créé dans `/equipe` héritera automatiquement du groupe `dev`,
préservant ainsi la cohérence des accès et facilitant la gestion collaborative.

### 4.2. Comprendre et configurer le masque de création de fichiers (`umask`)

Le paramètre `umask` (user file creation mask) détermine les **permissions par défaut** pour les nouveaux fichiers et répertoires créés par un utilisateur.
Il fonctionne comme un filtre soustractif appliqué aux permissions maximales par défaut.

Par exemple, avec `umask 022`, la valeur est soustraite des permissions de base (666 pour les fichiers, 777 pour les répertoires).

Ainsi, un nouveau fichier aura les permissions `644` (`rw-r--r--`) et un nouveau répertoire aura `755` (`rwxr-xr-x`).

> _Comment "réinitialiser" ou uniformiser les permissions ?_
> Il n'existe pas de commande magique de réinitialisation globale.
> La stratégie la plus efficace consiste à **définir une valeur `umask` appropriée** (comme `022` pour un env ouvert ou `027` pour un env plus restreint, où les autres n'ont aucun droit)
> dans le profil de l'utilisateur ou du système. Cela garantit une base cohérente pour toutes les créations futures, évitant ainsi l'accumulation de configurations erronées.

### 4.3. Application ciblée de permissions avec `find` et `chmod`

Pour des opérations de maintenance ou de correction à grande échelle, la combinaison des commandes `find` et `chmod` permet une gestion précise et automatisée des permissions sur
un ensemble de fichiers répondant à des critères spécifiques.

Par exemple, pour rendre exécutable tous les scripts shell dans une arborescence de projets, on utilise :

```bash
find /projets -name "*.sh" -exec chmod 755 {} \;
```

Cette commande recherche récursivement tous les fichiers terminant par `.sh` et applique la permission `755` (exécutable par tous) à chacun d'eux.

De même, pour retirer le droit d'écriture aux "autres" sur tous les fichiers de configuration `.conf` dans `/etc`, afin de renforcer la sécurité système :

```bash
find /etc -name "*.conf" -exec chmod o-w {} \;
```

Ici, l'option `-exec` exécute la commande `chmod o-w` sur chaque fichier trouvé, retirant (`-`) le droit d'écriture (`w`) pour la catégorie "autres" (`o`).

### 4.4. Audit et inspection des permissions spéciales

La détection et l'audit des fichiers possédant des bits de permission spéciaux (setuid, setgid, sticky) sont essentiels pour la sécurité du système.
Ces bits, lorsqu'ils sont mal attribués, peuvent représenter des vecteurs de privilège escaladation.

La commande suivante identifie tous les fichiers réguliers dans `/usr/bin` possédant l'un de ces bits spéciaux activé :

```bash
find /usr/bin -type f -perm /7000 -ls
```

L'option `-perm /7000` recherche les fichiers dont **au moins un** des bits spéciaux (setuid = 4000, setgid = 2000, sticky = 1000) est positionné.
Le résultat, formaté par `-ls`, fournit des détails complets permettant d'analyser chaque occurrence.

Une revue régulière de cette liste est une bonne pratique d'administration pour s'assurer qu'aucun programme n'a reçu ces privilèges de manière inappropriée.

---

## 5. Considérations avancées, écueils courants et bonnes pratiques

### 5.1. Implication des bits spéciaux sur la sécurité système

Les bits de permission spéciaux confèrent des capacités étendues aux exécutables et aux répertoires, mais leur mauvaise utilisation constitue un risque majeur pour l'intégrité du système.

Le bit **setuid** (valeur octale `4xxx`) modifie le comportement d'un programme en le faisant s'exécuter avec les privilèges de son **propriétaire**, et non de l'utilisateur qui l'invoque.

Ce mécanisme est indispensable pour des commandes système comme `/usr/bin/passwd`, qui nécessitent d'écrire dans des fichiers protégés (`/etc/shadow`).
Le bit **setgid** (`2xxx`) opère de manière similaire pour les privilèges de groupe.
Lorsqu'il est appliqué à un **répertoire**, il garantit que les nouveaux fichiers créés à l'intérieur héritent du groupe parent, facilitant ainsi la cohérence dans un espace de travail collaboratif.

Le **sticky bit** (`1xxx`), historiquement sur des programmes, est aujourd'hui principalement utilisé sur des répertoires partagés comme `/tmp`.
Il impose qu'un fichier ne puisse être supprimé ou renommé que par son propriétaire,
le propriétaire du répertoire, ou l'utilisateur root, et ce, même si les permissions du répertoire autorisent l'écriture à tous.

> Les programmes avec les bits setuid ou setgid, surtout s'ils sont propriété de root, peuvent devenir des vecteurs d'élévation de privilège. Il est recommandé d'effectuer régulièrement un audit à l'aide de la commande `find` pour identifier et vérifier la légitimité de tels fichiers sur les systèmes sensibles.

### 5.2. Pièges fréquents et leurs conséquences

Certaines erreurs courantes dans l'utilisation de `chmod` peuvent entraîner une perte de données, une compromission de la sécurité ou une indisponibilité de services.

L'utilisation excessive de **`chmod 777`** est un anti-modèle sécuritaire.
Bien que cela résolve rapidement les problèmes d'accès, elle octroie à tout utilisateur du système la possibilité de lire, modifier ou supprimer les fichiers concernés,
exposant les données à des altérations accidentelles ou malveillantes.

L'application récursive (`-R`) sur des chemins trop larges ou critiques est un autre écueil majeur.
La commande `chmod -R` modifie irréversiblement les permissions de toute une arborescence.
Appliquée par inadvertance sur un répertoire système comme `/etc` ou `/usr`, elle peut **rendre le système inopérant** en cassant
les permissions nécessaires au fonctionnement des démons et des applications.

Un oubli plus subtil concerne le bit d'**exécution (`x`) sur un répertoire**.
Sans ce bit, un utilisateur disposant du droit de lecture (`r`) pourra lister
le contenu du répertoire avec `ls`, mais toute tentative d'accéder aux fichiers (`cd`, ouverture d'un fichier avec un chemin relatif) échouera,
ce qui peut être source de confusion lors du diagnostic de problèmes d'accès.

### 5.3. Commandes complémentaires pour une gestion complète des accès

La maîtrise de `chmod` s'inscrit dans un écosystème plus large de commandes de gestion des fichiers. Leur combinaison permet une administration fine des droits et propriétés.

| Commande  | Rôle principal                                                                                                            |
| :-------: | ------------------------------------------------------------------------------------------------------------------------- |
|  `chown`  | Modifie le **propriétaire** (user) et/ou le **groupe** associé à un fichier.                                              |
|  `chgrp`  | Modifie **uniquement le groupe** associé à un fichier.                                                                    |
| `getfacl` | Affiche les **Listes de Contrôle d'Accès (ACL)** étendues, offrant une granularité supérieure au modèle standard `u/g/o`. |
|  `umask`  | Définit le **masque de création** qui soustrait des permissions par défaut pour les nouveaux fichiers et répertoires.     |

> Lorsque le modèle traditionnel à trois catégories (`u/g/o`) est insuffisant (par exemple, pour accorder des droits différents à plusieurs utilisateurs ou groupes spécifiques),
> les **Listes de Contrôle d'Accès (ACL)** accessibles via `setfacl` et `getfacl` offrent la précision nécessaire.

### 5.4. Principes directeurs pour une politique de permissions robuste

1.  **Principe du moindre privilège** : Accordez systématiquement les permissions les plus restrictives possibles, n'élargissant les droits qu'en cas de nécessité fonctionnelle avérée.
    Évitez à tout prix les permissions globales de type `777`.

2.  **Utilisation stratégique des groupes** : Privilégiez l'octroi de permissions via des **groupes** (`g`) plutôt que la catégorie "autres" (`o`).
    Cela permet de circonscrire les accès à des ensembles d'utilisateurs définis.

3.  **Traçabilité des changements** : Documentez les modifications de permissions critiques, surtout sur des répertoires partagés ou des binaires système.
    Des outils comme `auditd` peuvent automatiser cette journalisation.

4.  **Audit régulier des points sensibles** : Planifiez des vérifications périodiques des fichiers setuid/setgid, des répertoires d'upload web, et des chemins contenant
    des données sensibles pour détecter toute dérive de configuration.

### 5.5. Synthèse des notations et commandes essentielles

- **Notation symbolique (modification relative)** :

  ```bash
  chmod u+x script.sh      # Ajoute l'exécution pour le propriétaire
  chmod go-w fichier       # Retire l'écriture pour le groupe et les autres
  chmod a=rx dossier       # Définit pour tous : lecture et exécution uniquement
  ```

- **Notation octale (définition absolue)** :

  ```bash
  chmod 755 script.sh      # rwxr-xr-x (standard pour un exécutable partagé)
  chmod 640 config.cfg     # rw-r----- (configuration sensible)
  chmod 2770 /equipe       # rwxrws--- (répertoire collaboratif avec setgid)
  chmod 1777 /tmp          # rwxrwxrwt (répertoire temporaire avec sticky bit)
  ```

- **Ciblage avancé avec `find`** :
  ```bash
  find . -name "*.sh" -exec chmod 755 {} \; # Rend exécutable tous les scripts shell
  ```

> La maîtrise de `chmod` ne se résume pas à la mémorisation de combinaisons numériques.

Elle repose sur :

- la compréhension de la **triade utilisateur/propriétaire-groupe-autres**;
- des **trois actions lecture-écriture-exécution**;
- la distinction critique entre **fichiers et répertoires**.

Cette compréhension doit ensuite être appliquée en équilibrant constamment les impératifs de **collaboration fonctionnelle** et de **sécurité système**.
Une configuration réfléchie des permissions est l'un des piliers d'une administration système robuste.
