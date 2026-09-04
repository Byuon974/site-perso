---
title: "Permissions, comptes et groupes"
description: "Référence d'exploitation de la gestion des droits et des identités sous Linux : permissions de fichiers (chmod), propriété (chown, chgrp), comptes utilisateurs (useradd), groupes (groupadd, groupmod, gpasswd), et surveillance des sessions (who, w). Couvre les opérations courantes..."
tags: ["linux", "cli", "chmod", "chown", "useradd", "runbook", "permissions", "securite"]
updated: 2026-08-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux (Arch/Artix, Debian, RHEL), shadow-utils"
---

_Référence d'exploitation de la gestion des droits et des identités sous Linux : permissions de fichiers (chmod), propriété (chown, chgrp), comptes utilisateurs (useradd), groupes (groupadd, groupmod, gpasswd), et surveillance des sessions (who, w). Couvre les opérations courantes, le dépannage par symptôme, la sécurité et les pièges classiques. Cible un usage en ligne de commande sur systèmes Linux._

## Principes fondamentaux

> 3  entités, 3  permissions,  lues en  octal ou  en symbolique.  Chaque
> fichier porte des droits pour le propriétaire (u), le groupe (g) et les autres
> (o),  chacun en lecture  (r=4),  écriture (w=2),  exécution (x=1).  Le triplet
> octal (par exemple 755) résume les 3 ; la forme symbolique (rwxr-xr-x) les
> détaille. chmod accepte les 2 notations.

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

> Propriété  et  permissions  sont 2  choses  distinctes.  chown  change  qui
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
# ajoute exécution au propriétaire (symbolique)
chmod u+x script.sh
chmod go-w fichier                 # retire écriture au groupe et aux autres
# récursif ; X = x seulement sur dossiers et exécutables
chmod -R u+rwX,go+rX dossier/
chmod 2775 dossier/                # setgid : héritage du groupe dans le dossier
# sticky bit : chacun ne supprime que ses fichiers
chmod 1777 /tmp
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
# copie propriétaire et groupe d'un autre fichier
chown --reference=modele fichier
chown :groupe fichier              # change seulement le groupe (syntaxe chown)
```

État attendu :  propriétaire et/ou groupe changent. Sur  un changement récursif,
vérifier d'abord  la cible (un chemin  erroné est destructeur). chgrp  ne touche
jamais au propriétaire, utile quand seule l'appartenance de groupe doit bouger.

### Gérer les comptes utilisateurs (useradd, usermod, userdel)

```bash
useradd -m -s /bin/bash alice           # crée le compte avec home et shell
# compte de service (système, sans login)
useradd -r -s /usr/sbin/nologin svc
passwd alice                             # définit le mot de passe
# AJOUTE au groupe docker (-a indispensable)
usermod -aG docker alice
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
# connectés + charge système + activité courante
w
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

## Protocole d'urgence

Situation : un `chmod` ou un `chown` récursif a été lancé sur une arborescence
système, ou un compte a perdu son accès. Le symptôme typique est immédiat :
`sudo` refuse de fonctionner, les services tombent, la session graphique ne
démarre plus.

**1. Ne pas fermer le terminal en cours.** S'il détient encore une élévation
valide, c'est la seule voie de réparation. Ne pas se déconnecter, ne pas
redémarrer.

**2. Vérifier ce qui reste possible**, avant que le ticket sudo n'expire :

```bash
sudo -v                          # renouvelle l'autorisation tant qu'elle marche
sudo -i                          # ouvre un shell root et le GARDE ouvert
```

Un shell root ouvert dans un second terminal vaut mieux que toute autre
précaution : le conserver pendant toute la réparation.

**3. Mesurer l'étendue.** Un récursif laisse une trace de date homogène, ce qui
permet de délimiter précisément ce qui a été touché.

```bash
find /chemin -newermt '-10 minutes' -printf '%M %u:%g %p\n' | head -30
find /chemin -newermt '-10 minutes' | wc -l
```

**4. Vérifier les 3 points qui bloquent tout.** Dans cet ordre, ce sont eux
qui décident si le système reste utilisable :

```bash
stat -c '%a %U:%G %n' /usr/bin/sudo   # attendu : 4755 root:root
stat -c '%a %U:%G %n' /etc/sudoers    # attendu : 440 root:root
stat -c '%a %U:%G %n' /etc/shadow     # attendu : 600 ou 640, jamais 644
```

Un `/etc/shadow` devenu lisible par tous est un incident de sécurité, pas
seulement une gêne : traiter les mots de passe comme exposés.

**5. Escalader si l'élévation est déjà perdue.** Sans sudo ni session root,
essayer dans l'ordre `pkexec`, puis `su -`, puis le démarrage sur une clé de
secours. Le runbook clé de secours prend le relais.

---

## Processus de récupération

### Prérequis

```bash
id                               # identité et groupes réels
sudo -l                          # les règles répondent-elles encore
pacman -Qkk 2>&1 | tail -3       # sur Arch : ampleur des écarts constatés
```

### Étapes

**1. Rétablir les droits critiques à la main**, avant tout le reste, parce que
la suite en dépend :

```bash
sudo chown root:root /usr/bin/sudo && sudo chmod 4755 /usr/bin/sudo
sudo chown root:root /etc/sudoers && sudo chmod 440 /etc/sudoers
sudo chmod 600 /etc/shadow /etc/gshadow    # 640 root:shadow sur Debian
sudo chmod 644 /etc/passwd /etc/group
```

**2. Restaurer les droits d'un ensemble de paquets.** C'est la seule méthode
fiable pour une arborescence système : le gestionnaire de paquets connaît les
modes attendus, pas l'opérateur.

```bash
# Arch et Artix : réinstaller les paquets dont les fichiers ont changé
sudo pacman -Qkk 2>&1 | awk -F: '/Permissions/ {print $1}' | sort -u
sudo pacman -S --overwrite '*' paquet1 paquet2

# Debian et Ubuntu
sudo dpkg --verify | awk '{print $NF}' | head
sudo apt install --reinstall paquet
```

**3. Réparer un dossier personnel.** Les droits y sont uniformes, la
reconstruction est directe :

```bash
sudo chown -R utilisateur:utilisateur /home/utilisateur
chmod 700 /home/utilisateur
chmod 700 /home/utilisateur/.ssh
chmod 600 /home/utilisateur/.ssh/id_* /home/utilisateur/.ssh/authorized_keys
chmod 644 /home/utilisateur/.ssh/*.pub
```

Les droits de `~/.ssh` sont vérifiés par le démon SSH : trop larges, il refuse
l'authentification par clé sans message explicite côté client.

**4. Rétablir un compte perdu de ses groupes.** Le groupe d'élévation n'a pas le
même nom partout, `wheel` sur Arch et RHEL, `sudo` sur Debian.

```bash
getent group wheel sudo
sudo gpasswd -a utilisateur wheel      # ajoute sans écraser les autres groupes
```

L'appartenance ne prend effet qu'à la prochaine ouverture de session : vérifier
avec `id` dans un nouveau terminal, pas dans celui en cours.

### Validation d'état

```bash
sudo -l                                  # les règles s'affichent
stat -c '%a %U:%G' /usr/bin/sudo /etc/sudoers /etc/shadow
id utilisateur                           # groupes attendus
ssh -o BatchMode=yes utilisateur@localhost true   # si SSH est en service
systemctl --failed                       # ou rc-status, selon l'init
```

État attendu : les règles sudo répondent, les 3 fichiers critiques ont
retrouvé leurs modes, aucun service en échec.

---

## Pipelines utiles

```bash
# Fichiers accessibles en écriture au groupe ou aux autres
find . -type f -perm /go+w -printf '%M %U:%G %p\n'

# SUID et SGID présents sur le système, à comparer à un relevé de référence
find / -xdev -type f -perm /6000 -printf '%M %p\n' 2>/dev/null | sort

# Modes numériques d'une arborescence, pour diff avant et après
find . -printf '%m %y %p\n' | sort -k3 > /tmp/modes-avant.txt

# Fichiers sans propriétaire connu, après suppression d'un compte
find / -xdev \( -nouser -o -nogroup \) -printf '%U:%G %p\n' 2>/dev/null

# Comptes autorisés à ouvrir une session, lus dans la base
getent passwd | awk -F: '$7 !~ /(nologin|false)$/ {print $1, $3, $7}'

# Groupes secondaires d'un utilisateur, dans les deux bases
getent group | awk -F: -v u=alice '$4 ~ u {print $1}'
```

Ces commandes écrivent dans `/etc/passwd`, `/etc/shadow` et `/etc/group`, dont
le format et la réparation sont traités dans le runbook fichiers-etat-systeme.

Le `/` de `-perm /go+w` signifie « au moins un de ces bits », là où `-perm -go+w`
exige les 2 et `-perm go+w` exige une correspondance exacte. La confusion
entre les 3 donne des relevés silencieusement vides.

---

## Sources amont

```
Source                                          Nature      Relevé le
─────────────────────────────────────────────   ─────────   ──────────
github.com/shadow-maint/shadow, notes de        primaire    2026-09-03
version
man 1 chmod, man 1 chown, coreutils             primaire    2026-09-03
man 5 sudoers, man 8 visudo                     primaire    2026-09-03
man 7 acl, man 1 setfacl                        primaire    2026-09-03
```

Ce qui bouge : les valeurs par défaut de `/etc/login.defs` selon la
distribution, et le comportement de `sudo` sur les variables d'environnement.
La série sudo-rs diverge de sudo sur certaines options : voir le runbook
socle-gnu-outils-rust.

---

## Points clés à retenir

> Permissions  en  octal  (755)  ou  symbolique  (rwxr-xr-x),   pour  u/g/o,  en
> r=4/w=2/x=1. chmod accepte les 2.

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
