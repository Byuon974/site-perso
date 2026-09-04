---
title: "Permissions, comptes et groupes"
description: "Runbook d'exploitation de la gestion des droits et des identités sous Linux : chmod, chown, chgrp, useradd, groupadd, gpasswd, who/w. Opérations courantes, dépannage, sécurité et pièges classiques."
tags: ["linux", "cli", "chmod", "chown", "useradd", "runbook", "permissions", "securite"]
updated: 2026-06-18
validated: 2026-06-18
owner: "opérateur du système"
target: "Linux (Arch/Artix, Debian, RHEL), shadow-utils"
---

_Référence d'exploitation de la gestion des droits et des identités sous Linux : permissions de fichiers (chmod), propriété (chown, chgrp), comptes utilisateurs (useradd), groupes (groupadd, groupmod, gpasswd), et surveillance des sessions (who, w). Couvre les opérations courantes, le dépannage par symptôme, la sécurité et les pièges classiques. Cible un usage en ligne de commande sur systèmes Linux._

## Principes fondamentaux

> Trois  entités, trois  permissions,  lues en  octal ou  en symbolique.  Chaque
> fichier porte des droits pour le propriétaire (u), le groupe (g) et les autres
> (o),  chacun en lecture  (r=4),  écriture (w=2),  exécution (x=1).  Le triplet
> octal (par exemple 755) résume les trois ; la forme symbolique (rwxr-xr-x) les
> détaille. chmod accepte les deux notations.

> Sur un répertoire, x veut dire « traverser »,  pas « exécuter ». Le bit x d'un
> répertoire autorise l'accès à son contenu (cd, accès aux fichiers par chemin),
> tandis que r  autorise le listing des noms.  Un répertoire en r  sans x laisse
> voir   les  noms   sans   y  accéder,    source   classique  de   « Permission
> denied » déroutants.

> Les bits  spéciaux changent le comportement  d'exécution et de  groupe. setuid
> (4000) exécute un binaire avec l'identité  du propriétaire, setgid (2000) avec
> celle du groupe ou force l'héritage du groupe sur un répertoire, le sticky bit
> (1000) sur un répertoire (comme /tmp) empêche chacun de supprimer les fichiers
> des autres. Ces bits sont sensibles en sécurité.

> Propriété  et  permissions  sont deux  choses  distinctes.  chown  change  qui
> possède, chmod change ce que chacun peut faire. Modifier l'un sans l'autre est
> une cause  fréquente d'accès  refusé : un fichier  bien permissionné  mais mal
> possédé reste inaccessible.

> Groupe primaire et groupes  secondaires ne jouent pas le même  rôle. Le groupe
> primaire  est  celui  des  fichiers  créés  par  l'utilisateur ;  les  groupes
> secondaires  ouvrent des  accès supplémentaires.  Une  modification de  groupe
> secondaire  ne prend  effet qu'à  la prochaine  ouverture de  session (ou  via
> `newgrp` ), car les groupes sont fixés au login.

> Toujours garder une session privilégiée ouverte lors d'un changement de droits
> massif.  Un chmod  ou chown récursif  erroné sur  /etc, /usr  ou le  home peut
> verrouiller le système ou la connexion. Avant un changement large, vérifier la
> cible, préférer une approche réversible et conserver un terminal root actif.

## Opérations standard

### Modifier les permissions (chmod)

```bash
chmod 755 fichier                  # rwxr-xr-x (octal)
chmod u+x script.sh                # ajoute exécution au propriétaire (symbolique)
chmod go-w fichier                 # retire écriture au groupe et aux autres
chmod -R u+rwX,go+rX dossier/      # récursif ; X = x seulement sur dossiers et exécutables
chmod 2775 dossier/                # setgid : héritage du groupe dans le dossier
chmod 1777 /tmp                    # sticky bit : chacun ne supprime que ses fichiers
chmod --reference=modele fichier   # copie les permissions d'un autre fichier
```

État attendu :  les permissions changent.  Le `X`  majuscule en récursif  est la
bonne pratique : il pose x sur les répertoires et les fichiers déjà exécutables,
sans rendre exécutable chaque fichier de données.

### Changer la propriété (chown, chgrp)

```bash
chown utilisateur fichier          # change le propriétaire
chown utilisateur:groupe fichier   # propriétaire et groupe
chgrp groupe fichier               # change seulement le groupe
chown -R www-data:www-data /var/www/   # récursif
chown --reference=modele fichier   # copie propriétaire et groupe d'un autre fichier
chown :groupe fichier              # change seulement le groupe (syntaxe chown)
```

État attendu :  propriétaire et/ou groupe changent. Sur  un changement récursif,
vérifier d'abord  la cible (un chemin  erroné est destructeur). chgrp  ne touche
jamais au propriétaire, utile quand seule l'appartenance de groupe doit bouger.

### Gérer les comptes utilisateurs (useradd, usermod, userdel)

```bash
useradd -m -s /bin/bash alice           # crée le compte avec home et shell
useradd -r -s /usr/sbin/nologin svc      # compte de service (système, sans login)
passwd alice                             # définit le mot de passe
usermod -aG docker alice                 # AJOUTE au groupe docker (-a indispensable)
usermod -L alice                         # verrouille le compte
usermod -s /bin/zsh alice                # change le shell
userdel -r alice                         # supprime le compte ET son home
```

État attendu : le compte est créé, modifié ou supprimé. Le `-a` de `usermod -aG`
est critique :  sans lui,  l'utilisateur est retiré  de tous ses  autres groupes
secondaires. Un compte de service prend `-r` (système) et un shell nologin.

### Gérer les groupes (groupadd, groupmod, gpasswd)

```bash
groupadd projet                    # crée un groupe
groupadd -g 1500 projet            # avec un GID précis
groupmod -n nouveau ancien         # renomme un groupe
gpasswd -a alice projet            # ajoute alice au groupe
gpasswd -d alice projet            # retire alice du groupe
groupdel projet                    # supprime le groupe
id alice                           # vérifie les groupes effectifs
```

État attendu : le  groupe est créé ou modifié, l'appartenance  ajustée. Après un
ajout de  groupe secondaire, l'utilisateur  doit rouvrir une session  (ou lancer
`newgrp projet` ) pour que le groupe soit actif.

### Surveiller les sessions (who, w)

```bash
who                                # utilisateurs connectés, terminal, heure
who -b                             # heure du dernier démarrage
w                                  # connectés + charge système + activité courante
w utilisateur                      # sessions d'un utilisateur précis
last                               # historique des connexions
```

État attendu : la liste des sessions s'affiche.  `w` est plus riche que `who`  :
il montre  la charge, le  temps d'inactivité et  la commande en cours  de chaque
session, utile pour repérer une session oubliée ou suspecte.

## Dépannage par symptôme

### « Permission denied » alors que les permissions semblent bonnes

Symptôme : l'accès échoue malgré des droits  rwx apparents sur le fichier. Cause
probable : un répertoire parent manque du  bit x (traversée), ou le propriétaire
est incorrect. Correction : vérifier la chaîne de répertoires et la propriété.

```bash
namei -l /chemin/complet/vers/fichier   # montre les droits à chaque niveau
stat -c '%A %U %G' fichier
chmod o+x /chemin/parent                # rétablir la traversée si besoin
```

### usermod a retiré l'utilisateur de ses groupes

Symptôme :  après  un  usermod  -G,  l'utilisateur  a  perdu  des  accès.  Cause
probable :   `-G`  sans  `-a`   remplace  la  liste  des   groupes  secondaires.
Correction : toujours utiliser `-aG` pour ajouter.

```bash
usermod -aG nouveaugroupe utilisateur   # AJOUTE sans retirer les autres
id utilisateur                           # vérifier le résultat
```

### Un nouveau groupe n'est pas pris en compte

Symptôme : un utilisateur  ajouté à un groupe n'a pas les  accès attendus. Cause
probable : les groupes sont fixés à l'ouverture de session ; la session courante
est   antérieure.    Correction :    rouvrir   une   session   ou   activer   le
groupe ponctuellement.

```bash
newgrp projet                      # active le groupe dans le shell courant
# ou se déconnecter/reconnecter pour une prise en compte complète
```

### Un chmod récursif a cassé des accès

Symptôme : après un  chmod -R, des programmes ou des  connexions échouent. Cause
probable :  x retiré sur  des répertoires,  ou permissions  trop larges  sur des
fichiers   sensibles.   Correction :    utiliser   X   majuscule  et   restaurer
les cas particuliers.

```bash
chmod -R u+rwX,go+rX dossier/      # X ne pose x que sur dossiers et exécutables
# ~/.ssh exige des droits stricts :
chmod 700 ~/.ssh && chmod 600 ~/.ssh/*
```

## Sécurité

> Surveiller les  binaires setuid/setgid. Un  binaire setuid root mal  écrit est
> une   voie    d'escalade   de    privilèges.     Inventorier   régulièrement :
> `find / -perm -4000 -type f 2>/dev/null`  (setuid) et  `-perm -2000` (setgid).
> Retirer le bit des binaires qui n'en ont pas besoin.

> Comptes de service  sans shell de login.  Un compte qui n'a pas  vocation à se
> connecter prend un shell  `nologin` ou `false` et l'option `-r`  . Cela réduit
> la surface d'attaque si le compte est compromis.

> Permissions minimales  sur les  fichiers sensibles. Clés  SSH privées  en 600,
> ~/.ssh  en 700,  fichiers de  configuration contenant  des secrets  en 600  et
> possédés par le bon compte. sshd refuse les clés aux permissions trop larges.

> Le sticky bit protège les répertoires  partagés. Sur un répertoire en écriture
> pour plusieurs utilisateurs  (type /tmp), le sticky bit  (1777) empêche chacun
> de supprimer ou renommer les fichiers des autres.

## Points clés à retenir

> Permissions  en  octal  (755)  ou  symbolique  (rwxr-xr-x),   pour  u/g/o,  en
> r=4/w=2/x=1. chmod accepte les deux.

> Sur un répertoire,  x = traverser, r = lister.  Un « Permission denied » vient
> souvent d'un parent sans x : namei -l le révèle.

> usermod  -aG,  jamais  -G  seul :  sans  -a,  l'utilisateur  perd  ses  autres
> groupes secondaires.

> Un   groupe   secondaire   ajouté   ne   prend   effet   qu'à   la   prochaine
> session (ou via newgrp).

> En récursif, chmod -R u+rwX,go+rX :  le X majuscule évite de rendre exécutable
> chaque fichier de données.

> chown change  la propriété,  chmod les droits :  un fichier mal  possédé reste
> inaccessible même bien permissionné.

> Sécurité : auditer les setuid/setgid (find -perm -4000), comptes de service en
> nologin, clés SSH en 600 / ~/.ssh en 700.
