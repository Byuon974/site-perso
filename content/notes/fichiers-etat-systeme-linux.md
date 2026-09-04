---
title: "Fichiers d'état du système sous /etc"
description: "Référence d'exploitation des fichiers que les commandes d'administration écrivent : bases de comptes (passwd, shadow, group, gshadow), outils d'édition et de validation dédiés, résolution par NSS, et la règle générale qui associe à chaque fichier de `/etc` son éditeur sûr et son ..."
tags: ["linux", "cli", "passwd", "shadow", "nss", "runbook", "etc", "securite"]
updated: 2026-08-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux, shadow-utils, Arch, Artix, Debian"
---

_Référence d'exploitation des fichiers que les commandes d'administration écrivent : bases de comptes (passwd, shadow, group, gshadow), outils d'édition et de validation dédiés, résolution par NSS, et la règle générale qui associe à chaque fichier de `/etc` son éditeur sûr et son validateur. Se lit surtout en réparation, quand la commande n'est plus disponible et qu'il ne reste que le fichier._

---


## Principes fondamentaux

> **Les commandes écrivent des fichiers, et ce sont les fichiers qui font foi.**
> `useradd`, `usermod`, `passwd` ne sont que des éditeurs de 4 fichiers
> texte. En fonctionnement normal, employer les commandes. En réparation, depuis
> un chroot ou un mode maintenance, seule la connaissance du format permet
> d'agir.

```
   commande            fichier écrit                effet
   ──────────          ─────────────────────        ──────────────────────
   useradd             /etc/passwd, /etc/shadow     compte et mot de passe
                       /etc/group, /etc/gshadow     groupe primaire
                       copie de /etc/skel           dossier personnel
   passwd              /etc/shadow                  champ de hash et dates
   usermod -aG         /etc/group                   groupes secondaires
   chage               /etc/shadow                  péremption seulement
```

> **Le `x` de `/etc/passwd` n'est pas un mot de passe.** C'est un marqueur
> d'indirection vers `/etc/shadow`, créé pour que `/etc/passwd` reste lisible par
> tous sans exposer les empreintes. Un compte dont le second champ contiendrait
> autre chose que `x` court-circuiterait cette protection.

```
Format de /etc/passwd, sept champs séparés par des deux-points
   root : x : 0 : 0 : root : /root : /bin/bash
   nom    ↑   UID  GID  GECOS  home   shell
          indirection vers shadow

Format de /etc/shadow, neuf champs
   nom : hash : dernier_changement : min : max : avertissement : inactif :
   expiration : réservé
```

> **Le premier caractère du champ de hash dit l'état du compte.** `*` interdit la
> connexion par mot de passe sans verrouiller, `!` verrouille en conservant
> l'empreinte, `!!` signale un mot de passe jamais défini, et un préfixe
> `$y$` ou `$6$` désigne l'algorithme d'une empreinte réelle. Un champ vide
> signifie aucun mot de passe requis, ce qui est un incident.

> **Les fichiers à tiret final sont les copies de sécurité automatiques.**
### Le facteur de coût yescrypt ne fait rien

`/etc/login.defs` porte un réglage `YESCRYPT_COST_FACTOR`, dans la plage 1 à 11,
défaut 5. Le relever ne renforce aucun mot de passe d'usager.

La page de manuel de `login.defs` le pose sans détour : ce réglage ne concerne
que la génération des mots de passe de groupe. Les mots de passe d'usager sont
produits par PAM, qui ne lit pas cette valeur. L'annonce Arch du changement
d'algorithme le confirme et renvoie au seul levier réel.

```bash
# Sans effet sur les mots de passe d'usager
grep YESCRYPT_COST_FACTOR /etc/login.defs

# Le levier qui agit : option rounds de pam_unix
grep -n 'pam_unix.*rounds' /etc/pam.d/system-auth
```

Un facteur plus élevé se pose donc dans `/etc/pam.d/system-auth`, sur la ligne
`pam_unix`, par `rounds=N`. Vérifier ensuite qu'un mot de passe changé produit
bien une empreinte au coût voulu, la valeur étant lisible dans le préfixe
`$y$jN$` du champ de hachage.

> `/etc/passwd-`, `/etc/shadow-`, `/etc/group-` sont réécrits à chaque
> modification par les outils shadow. Vérifié : ils existent, avec les mêmes
> modes que les originaux. Ce sont eux que l'on restaure en premier.

> **Le fichier n'est pas toujours la seule source.** `getent` interroge la chaîne
> déclarée dans `/etc/nsswitch.conf`, qui peut inclure LDAP ou systemd-homed. Un
> compte visible par `getent passwd` et absent de `/etc/passwd` est normal sur
> une machine intégrée à un annuaire.

> **À chaque fichier d'état son éditeur et son validateur.** La règle vaut
> au-delà des comptes : éditer à la main un fichier qui a un outil dédié, c'est
> renoncer au verrouillage et à la vérification de syntaxe.

---

## Opérations standard

### Lire l'état d'un compte

```bash
getent passwd utilisateur              # via NSS, source réelle
id utilisateur                         # UID, GID, groupes effectifs
groups utilisateur
sudo passwd -S utilisateur             # état du mot de passe en une ligne
sudo chage -l utilisateur              # péremption détaillée
sudo getent shadow utilisateur         # ligne brute, root seulement
```

État attendu : `passwd -S` rend `P` pour un mot de passe utilisable, `L` pour un
compte verrouillé, `NP` pour aucun mot de passe. C'est la lecture la plus rapide
et elle évite d'ouvrir `/etc/shadow`.

### Éditer les fichiers de comptes en sûreté

```bash
sudo vipw                              # /etc/passwd, avec verrou
sudo vipw -s                           # /etc/shadow
sudo vigr                              # /etc/group
sudo vigr -s                           # /etc/gshadow
```

Ces outils posent un verrou, lancent l'éditeur défini par `VISUAL` ou `EDITOR`,
et proposent de vérifier à la sortie. Un éditeur lancé directement sur ces
fichiers perd les modifications concurrentes d'un `passwd` exécuté au même
moment.

### Vérifier la cohérence

```bash
sudo pwck -r                           # lecture seule : signale sans corriger
sudo grpck -r
sudo pwck                              # interactif, propose les corrections
```

État attendu : aucune sortie, ou une liste d'anomalies nommées, du type dossier
personnel absent, groupe primaire inexistant, doublon d'UID. À exécuter
systématiquement avant de refermer un chroot de réparation.

### Créer, modifier, verrouiller un compte

```bash
sudo useradd -m -s /bin/zsh -G wheel utilisateur   # -m crée le home depuis skel
sudo passwd utilisateur
sudo usermod -aG groupe utilisateur                # -a INDISPENSABLE
sudo usermod -s /usr/bin/nologin service           # interdire la connexion
sudo passwd -l utilisateur                         # verrouiller (! devant)
sudo passwd -u utilisateur                         # déverrouiller
sudo chage -E 2026-12-31 stagiaire                 # date de fin de compte
sudo userdel -r utilisateur                        # -r supprime le home
```

L'oubli du `-a` dans `usermod -aG` remplace tous les groupes secondaires au lieu
d'ajouter : perte d'accès silencieuse, et une des erreurs les plus fréquentes.
Vérifier après coup avec `id`, dans une nouvelle session.

### Comptes de service

```bash
sudo useradd --system --no-create-home --shell /usr/bin/nologin monservice
getent passwd monservice
grep -E '^(SYS_UID_MIN|SYS_UID_MAX|UID_MIN)' /etc/login.defs
```

Un compte de service n'a ni mot de passe, ni dossier personnel, ni shell de
connexion. Son UID est pris dans la plage système, ce qui le distingue des
comptes humains dans tout audit.

### Groupes

```bash
getent group wheel                     # membres réels
sudo groupadd -r groupesysteme
sudo gpasswd -a utilisateur groupe     # ajoute sans écraser
sudo gpasswd -d utilisateur groupe     # retire
newgrp groupe                          # session temporaire avec ce groupe
```

L'appartenance ne prend effet qu'à la prochaine ouverture de session : les
processus en cours gardent les groupes hérités à leur démarrage. `newgrp` ou
`sg` donnent un shell avec le nouveau groupe sans se déconnecter.

### La règle générale : éditeur et validateur par fichier

```
Fichier                     Éditer avec        Valider avec
──────────────────────      ──────────────     ──────────────────────
/etc/sudoers                visudo             visudo -c
/etc/passwd, /etc/shadow    vipw, vipw -s      pwck
/etc/group, /etc/gshadow    vigr, vigr -s      grpck
/etc/fstab                  éditeur            findmnt --verify
/etc/crypttab               éditeur            cryptsetup luksDump
unités systemd              systemctl edit     systemd-analyze verify
/etc/ssh/sshd_config        éditeur            sshd -t
/etc/nftables.conf          éditeur            nft -c -f
règles udev                 éditeur            udevadm test
/etc/mkinitcpio.conf        éditeur            mkinitcpio -P, sortie lue
/etc/hosts, /etc/hostname   éditeur            getent hosts nom
```

Avant tout redémarrage suivant une modification de `/etc/fstab` ou de
`/etc/crypttab`, exécuter le validateur : ce sont les 2 fichiers qui
empêchent le système de démarrer.

### Fichiers .pacnew et .pacsave

Une mise à jour ne remplace jamais un fichier de configuration modifié : elle
dépose la version neuve à côté.

```bash
find /etc -name '*.pacnew' -o -name '*.pacsave' 2>/dev/null
diff /etc/fichier /etc/fichier.pacnew
# fusionner à la main, ou avec pacdiff (pacman-contrib)
sudo DIFFPROG=nvim pacdiff
```

Laisser s'accumuler les `.pacnew` revient à figer sa configuration à la version
d'installation, y compris pour les changements de sécurité.

---

## Traitement par lots

```bash
# Comptes humains, par UID, avec leur shell
getent passwd | awk -F: '$3 >= 1000 && $3 < 65534 {printf "%-16s %-6s %s\n",
  $1, $3, $7}'

# Comptes sans mot de passe utilisable, à auditer
sudo getent shadow | awk -F: '$2 == "" {print "SANS MOT DE PASSE: " $1}'

# Comptes verrouillés
sudo getent shadow | awk -F: '$2 ~ /^!/ {print $1}'

# Dossiers personnels déclarés mais absents
getent passwd | awk -F: '$3 >= 1000 {print $1, $6}' |
  while read -r u h; do
    [[ -d "$h" ]] || printf 'HOME ABSENT: %s (%s)\n' "$u" "$h"
  done

# Contrôle des modes de tous les fichiers d'état sensibles
for f in /etc/passwd /etc/shadow /etc/group /etc/gshadow /etc/sudoers; do
  printf '%-16s %s\n' "$f" "$(stat -c '%a %U:%G' "$f")"
done
```

---

## Dépannage par symptôme

### Un utilisateur ne peut plus se connecter

```bash
sudo passwd -S utilisateur             # L = verrouillé, NP = sans mot de passe
sudo chage -l utilisateur              # compte ou mot de passe périmé ?
getent passwd utilisateur | cut -d: -f7   # shell valide et dans /etc/shells ?
sudo grep utilisateur /var/log/auth.log | tail
```

4 causes couvrent presque tout : compte verrouillé, mot de passe périmé,
shell invalide ou absent de `/etc/shells`, dossier personnel manquant.

### `usermod -aG` semble sans effet

L'appartenance ne s'applique qu'aux sessions ouvertes après la modification.

```bash
getent group groupe | grep utilisateur     # le fichier est correct
id utilisateur                             # nouvelle session : correct aussi
id                                         # session en cours : inchangé
```

### « user X exists but has no home directory »

Le dossier a été supprimé sans le compte.

```bash
sudo mkdir -p /home/utilisateur
sudo cp -rT /etc/skel /home/utilisateur
sudo chown -R utilisateur:utilisateur /home/utilisateur
sudo chmod 700 /home/utilisateur
```

### Un compte apparaît dans `getent` mais pas dans `/etc/passwd`

Comportement normal : il vient d'une autre source NSS.

```bash
grep ^passwd /etc/nsswitch.conf
getent passwd utilisateur                  # confirme la résolution
```

### `/etc/shadow` est lisible par tous

Incident de sécurité, pas une gêne : les empreintes peuvent être cassées hors
ligne. Traiter les mots de passe comme exposés.

```bash
stat -c '%a %U:%G' /etc/shadow             # 640 root:shadow ou 600 root:root
sudo chmod 640 /etc/shadow                 # selon la distribution
sudo pwck -r
```

Vérifier également après toute restauration de sauvegarde : `tar` sans
`--same-owner` rend les fichiers au mauvais propriétaire.

### Après une modification manuelle, plus rien ne fonctionne

Restaurer la copie automatique, qui date d'avant la dernière modification par
les outils shadow.

```bash
sudo cp -a /etc/shadow- /etc/shadow
sudo pwck -r
```

---

## Problèmes connus et contournements

### Les modes ne sont pas les mêmes selon la distribution

Debian et Ubuntu emploient `640 root:shadow`, Arch et Artix `600 root:root`.
Copier une valeur d'une documentation à l'autre casse l'accès. Lire avec `stat`
plutôt que recopier.

### Un éditeur direct perd les modifications concurrentes

`vipw` et `vigr` existent pour cela : ils posent un verrou. Éditer `/etc/passwd`
avec un éditeur ordinaire pendant qu'un `passwd` s'exécute produit une perte
silencieuse.

### `userdel` ne nettoie pas tout

Les fichiers appartenant à l'utilisateur hors de son dossier personnel
subsistent, avec un UID désormais orphelin, qui sera réattribué au compte
suivant créé dans la même plage.

```bash
sudo find / -xdev -nouser -o -nogroup 2>/dev/null | head
```

### Le hash n'est pas lisible, et c'est voulu

Aucun outil ne retrouve un mot de passe depuis `/etc/shadow` : le champ contient
une empreinte, pas un chiffrement réversible. La seule réponse à un mot de passe
perdu est de le réinitialiser.

---

## Protocole d'urgence

Situation : les fichiers de comptes sont corrompus, ou l'accès administrateur
est perdu.

**1. Ne pas fermer la session en cours.** Si un shell root est ouvert quelque
part, il est la voie de réparation la plus courte.

**2. Photographier avant de corriger.**

```bash
sudo cp -a /etc/passwd /etc/shadow /etc/group /etc/gshadow /root/incident/
sudo pwck -r > /root/incident/pwck.txt 2>&1
```

**3. Restaurer depuis les copies automatiques**, qui reflètent l'état d'avant la
dernière opération des outils shadow.

```bash
sudo cp -a /etc/passwd- /etc/passwd
sudo cp -a /etc/shadow- /etc/shadow
sudo pwck -r
```

**4. Sans accès root**, passer par le mode maintenance ou une clé de secours,
monter la racine, corriger le fichier dans le chroot, puis `pwck` avant de
refermer. Voir le runbook noyau pour l'accès en mode maintenance.

**5. Ne jamais éditer ces fichiers depuis une session dont on n'est pas certain
qu'elle survivra**, sans avoir d'abord vérifié qu'une seconde voie d'accès
existe.

---

## Processus de récupération

### Prérequis

```bash
ls -l /etc/passwd- /etc/shadow- /etc/group-      # copies disponibles
sudo pwck -r ; sudo grpck -r                     # étendue des anomalies
mount | grep ' / '                               # racine en écriture
```

### Étapes

**1. Restaurer les 4 fichiers ensemble.** Restaurer `passwd` sans `shadow`
crée des incohérences pires que le problème initial.

```bash
for f in passwd shadow group gshadow; do
  [[ -f "/etc/$f-" ]] && sudo cp -a "/etc/$f-" "/etc/$f"
done
```

**2. Rétablir les modes attendus.**

```bash
sudo chmod 644 /etc/passwd /etc/group
sudo chmod 640 /etc/shadow /etc/gshadow     # 600 sur Arch et Artix
sudo chown root:root /etc/passwd /etc/group
sudo chown root:shadow /etc/shadow /etc/gshadow
```

**3. Valider avant tout redémarrage.**

```bash
sudo pwck -r
sudo grpck -r
getent passwd root    # la ligne root est intacte
```

**4. Reconstituer les comptes créés après la copie**, avec les commandes plutôt
qu'à la main, puis redéfinir leurs mots de passe.

### Validation d'état

```bash
sudo pwck -r && sudo grpck -r && echo "cohérence OK"
id root ; id "$USER"
sudo -l                              # l'élévation fonctionne toujours
su - utilisateur -c 'echo connexion OK'
```

---

## Pipelines utiles

```bash
# Comptes pouvant ouvrir une session, shell réel affiché
awk -F: '$7 !~ /(nologin|false|sync)$/ {print $1, $3, $7}' /etc/passwd

# État du mot de passe de chaque compte, lu au premier caractère du hash
sudo awk -F: '{s=substr($2,1,1);
  print $1, (s=="!" ? "verrouillé" : s=="*" ? "sans mot de passe" : "actif")}' \
  /etc/shadow

# Algorithme de hachage employé, comparé au réglage déclaré
sudo awk -F: '$2 ~ /^\$/ {split($2,a,"$"); print a[2]}' /etc/shadow |
  sort | uniq -c
grep '^ENCRYPT_METHOD' /etc/login.defs

# UID en double, symptôme d'une base éditée à la main
awk -F: '{print $3}' /etc/passwd | sort -n | uniq -d

# Écarts entre le fichier et sa copie de sécurité
diff /etc/passwd /etc/passwd- ; diff /etc/group /etc/group-

# Fichiers de configuration modifiés depuis l'installation du paquet
sudo find /etc -name '*.pacnew' -o -name '*.pacsave' -printf '%T+\t%p\n' | sort
```

Les commandes qui écrivent dans ces fichiers, et la réparation d'une
arborescence dont les droits ont été détruits, relèvent du runbook
permissions-comptes.

`vipw` et `vigr` ouvrent l'éditeur désigné par `EDITOR` et posent un verrou.
Pour la survie dans vim et nvim, et notamment la sortie sans écrire, voir
runbook edition-vim-nvim.

Ce document traite `/etc`. Les fichiers de configuration personnels, sous
`~/.config` et à la racine du répertoire personnel, relèvent du runbook
dotfiles.

La comparaison avec les fichiers à tiret final est le premier réflexe après une
modification douteuse de la base de comptes. Ces copies sont écrites
automatiquement à chaque écriture par les outils de gestion, donc leur contenu
correspond à l'état d'avant la dernière opération réussie.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
shadow-utils                 https://github.com/shadow-maint/shadow/releases
Annonces de la distribution  https://archlinux.org/news/
```

---

## Sécurité

> **Un fichier de comptes lisible par tous est une base de hachages publiée.**
> `/etc/shadow` en mode 644 équivaut à la fuite de tous les hachages du système,
> donc à leur cassage hors ligne, sans qu'aucune commande n'échoue ni ne
> signale quoi que ce soit. Le contrôle porte sur le mode, pas sur le contenu.

```bash
stat -c '%a %U:%G %n' /etc/passwd /etc/shadow /etc/group /etc/gshadow
# shadow et gshadow : 640 ou 600 selon la distribution, jamais 644
```

> **La restauration d'une sauvegarde est le moment où le mode se perd.** Un
> `tar` sans `--same-owner` ni `-p` rend les fichiers au mauvais propriétaire et
> avec un masque appliqué. Contrôler après restauration, systématiquement, avant
> de considérer le système remis en état.

> **Éditer sans verrou perd les écritures concurrentes.** `vipw`, `vipw -s` et
> `vigr` posent un verrou et proposent une vérification en sortie. Un éditeur
> lancé directement sur `/etc/shadow` pendant qu'un `passwd` s'exécute écrase
> silencieusement l'autre écriture.

> **Un compte dont le champ de hachage commence par `!` est verrouillé, pas
> désactivé.** L'authentification par mot de passe est refusée, l'accès par clé
> SSH continue de fonctionner. Fermer un compte demande les 2 gestes :
> verrouiller et retirer les clés.

```bash
passwd -S utilisateur                 # état du mot de passe
ls -l /home/utilisateur/.ssh/authorized_keys 2>/dev/null
```

> **Les copies à tiret final contiennent l'état précédent.** `/etc/passwd-`,
> `/etc/shadow-` et `/etc/group-` sont écrites à chaque modification. Elles ont
> la même sensibilité que les originaux et se contrôlent avec eux : une copie
> de sécurité en 644 annule la protection du fichier qu'elle double.

```bash
stat -c '%a %n' /etc/shadow- /etc/gshadow- 2>/dev/null
```

> **Un `.pacnew` sur un fichier de sécurité se traite, il ne s'ignore pas.**
> Une mise à jour qui apporte un durcissement le dépose à côté sans l'appliquer.
> Le fichier en place reste celui d'avant, avec ses réglages d'avant.

```bash
find /etc -name '*.pacnew' -newer /var/log/pacman.log -ls 2>/dev/null
```

---

## Points clés à retenir

`stat -c %a /etc/shadow` doit rendre 640 ou 600. En 644, les hachages sont
publiés, et rien dans le système ne le signale.

Verrouiller un compte ne ferme pas l'accès par clé SSH : les 2 gestes se
font ensemble.


Les commandes écrivent 4 fichiers : en réparation, il ne reste que les
fichiers, et le format devient la seule compétence utile.

Le premier caractère du champ de hash dit tout : `*` pas de connexion par mot de
passe, `!` verrouillé, `!!` jamais défini, `$y$` ou `$6$` empreinte réelle.

Les copies à tiret final, `/etc/shadow-` et ses voisines, sont le premier
recours d'une récupération, et elles se restaurent ensemble.

`vipw`, `vigr`, `visudo` posent un verrou et valident : un éditeur ordinaire ne
fait ni l'un ni l'autre.

`pwck -r` et `grpck -r` avant de refermer un chroot de réparation, toujours.

Un `/etc/shadow` en 644 est un incident de sécurité, à traiter comme une fuite
d'empreintes.

`getent` interroge NSS, pas seulement le fichier : un compte absent de
`/etc/passwd` peut être parfaitement valide.

`usermod -aG` sans le `-a` remplace tous les groupes secondaires, et
l'appartenance ne s'applique qu'à la session suivante.
