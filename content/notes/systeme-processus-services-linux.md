---
title: "Système, processus et services"
description: "Runbook d'exploitation de la gestion du système Linux : systemd (services), top (temps réel), lscpu/lsblk/lspci (inventaire), udev (périphériques), pacman (paquets). Opérations courantes, dépannage et pièges."
tags: ["linux", "cli", "systemd", "top", "udev", "pacman", "runbook", "processus"]
updated: 2026-06-18
validated: 2026-06-18
owner: "opérateur du système"
target: "Linux systemd (Arch/Artix, Debian, RHEL), pacman 7.x"
---

_Référence d'exploitation de la gestion du système sous Linux : services et unités (systemd), diagnostic temps réel des processus et ressources (top), inventaire matériel et système (uname, lscpu, free, lsblk, lspci), périphériques et règles de nommage (udev), gestion de paquets (pacman). Couvre les opérations courantes, le dépannage par symptôme et les pièges classiques. Cible un usage en ligne de commande sur systèmes Linux (orientation Arch/systemd)._

## Choisir le bon outil

| Besoin | Outil | Pourquoi |
|---|---|---|
| Démarrer, arrêter, activer un service | `systemctl` | Gestion des unités systemd |
| Lire les journaux d'un service | `journalctl` | Logs structurés et filtrables |
| Voir la charge et les processus | `top`, `htop`, `btop` | Diagnostic temps réel |
| Inventorier CPU, RAM, disques, PCI | `lscpu`, `free`, `lsblk`, `lspci` | Connaître le matériel |
| Nommer ou réagir à un périphérique | `udev` | Règles événementielles |
| Installer, mettre à jour des paquets | `pacman` | Gestionnaire natif d'Arch |
| Planifier une tâche récurrente | timer systemd | Alternative moderne à cron |

> En une  phrase : systemctl  pour les services  et journalctl pour  leurs logs,
> top/htop/btop   pour  la   charge,   la   suite  lscpu/free/lsblk/lspci   pour
> l'inventaire, udev pour les périphériques, pacman pour les paquets, les timers
> systemd pour la planification.

## Principes fondamentaux

> systemd gère  des unités,  pas seulement  des services.  Une unité  décrit une
> ressource gérée :  service  (.service), montage  (.mount),  minuteur (.timer),
> socket  (.socket),   cible  (.target).   systemctl  est  l'interface  unique ;
> journalctl   lit  les   journaux  associés.   Comprendre   ce  modèle   unifie
> la gestion du système.

> Ne  jamais éditer  les unités  fournies par  les paquets.  Un fichier  d'unité
> installé par un paquet est écrasé à la mise à jour. Pour le modifier, créer un
> drop-in  avec `systemctl edit unité`  (qui recharge  automatiquement), ce  qui
> pose  un   fragment  dans  /etc/systemd/system/unité.d/   appliqué  par-dessus
> l'original. Voir l'état réel avec `systemctl cat unité` .

> Sur Arch, les mises à jour partielles  cassent le système. Arch est en rolling
> release :   les  paquets  sont  reconstruits  ensemble  contre  les  nouvelles
> bibliothèques. Faire `pacman -Sy paquet` (synchroniser  la base puis installer
> un seul  paquet) crée  une incohérence de  versions. La  seule forme  sûre est
> `pacman -Syu`  (mise   à  jour  complète).   Lire  les  annonces   Arch  avant
> une grosse mise à jour.

> top lit  la charge à l'instant,  et la charge  moyenne sur trois  fenêtres. La
> « load average » (1, 5, 15 minutes) à comparer au nombre de cœurs : une charge
> de 4  sur 4 cœurs  est saturée, sur  8 cœurs elle  est moyenne.  top distingue
> aussi  le temps  CPU utilisateur,  système,  en attente  d'entrée-sortie (wa),
> révélateur d'un goulot disque.

> udev  réagit  aux  événements  de  périphériques  par  des  règles.  Quand  un
> périphérique  apparaît,   udev   applique  des  règles   (nommage  persistant,
> permissions,  déclenchement d'actions).  Les  règles personnalisées  vont dans
> /etc/udev/rules.d/. Toujours  les valider avec `udevadm verify`  et les tester
> avec `udevadm test` avant de compter dessus.

> L'inventaire matériel  se lit  avec une  suite d'outils  spécialisés.  Pas une
> commande unique : uname pour le noyau,  lscpu pour le processeur, free pour la
> mémoire, lsblk pour le stockage, lspci pour les bus, dmidecode pour le BIOS et
> la  carte mère.  Les connaître  évite d'installer  des outils  tiers pour  des
> informations déjà disponibles.

## Opérations standard

### Gérer les services (systemctl)

```bash
systemctl status nginx                # état, PID, logs récents
systemctl start nginx                 # démarrer maintenant
systemctl stop nginx                  # arrêter maintenant
systemctl restart nginx               # redémarrer
systemctl reload nginx                # recharger la config sans coupure (si supporté)
systemctl enable --now nginx          # activer au boot ET démarrer
systemctl disable nginx               # désactiver au boot
systemctl --failed                    # unités en échec
systemctl edit nginx                  # créer un drop-in (NE PAS éditer le fichier d'origine)
systemctl cat nginx                   # voir l'unité effective + drop-ins
systemctl daemon-reload               # après modification manuelle d'une unité
```

État  attendu :  le  service passe  dans  l'état voulu.   `enable --now` est  le
raccourci usuel  (activer et  démarrer). Après  toute modification  d'unité hors
`systemctl edit` , lancer `daemon-reload` .

### Lire les journaux (journalctl)

```bash
journalctl -u nginx                   # logs d'un service
journalctl -u nginx -f                # suivi en direct
journalctl -u nginx --since "1 hour ago"   # fenêtre temporelle
journalctl -p err -b                  # erreurs depuis le dernier démarrage
journalctl -b                         # logs du démarrage courant
journalctl --disk-usage               # taille occupée par les journaux
journalctl --vacuum-time=2weeks       # purger les logs de plus de 2 semaines
```

État attendu :  les journaux  filtrés s'affichent. `-u`  cible un service,  `-f`
suit en direct, `-p err` ne montre que  les erreurs, `-b` se limite au démarrage
courant. Précieux pour diagnostiquer un service en échec.

### Diagnostiquer la charge et les processus (top, htop, btop)

```bash
top                                   # vue temps réel (P=CPU, M=mémoire, k=kill)
top -o %MEM                           # trié par mémoire
htop                                  # version interactive (si installée)
btop                                  # version moderne et graphique (si installée)
uptime                                # charge moyenne 1/5/15 min en une ligne
ps aux --sort=-%cpu | head            # top consommateurs CPU (instantané)
kill -TERM PID                        # arrêt propre d'un processus
kill -KILL PID                        # arrêt forcé (dernier recours)
```

État attendu : les processus et la  charge s'affichent. Comparer la load average
au nombre de  cœurs ( `nproc` ). Un  fort « wa » (I/O wait) dans  top signale un
goulot disque,  pas CPU. Privilégier  TERM avant KILL pour  laisser le processus
se fermer proprement.

### Inventorier le matériel et le système

```bash
uname -a                              # noyau, architecture, hôte
hostnamectl                           # hôte, OS, noyau, virtualisation
lscpu                                 # processeur (cœurs, threads, cache)
free -h                               # mémoire et swap
lsblk -f                              # stockage (disques, partitions, FS)
lspci                                 # cartes et bus PCI
lsusb                                 # périphériques USB
sudo dmidecode -t memory              # détail des barrettes mémoire (BIOS)
```

État attendu :  l'information matérielle demandée s'affiche.  Cette suite couvre
l'essentiel sans outil  tiers. `hostnamectl` indique aussi si  le système tourne
en machine virtuelle.

### Gérer les périphériques (udev)

```bash
udevadm info /dev/sdb                  # tous les attributs d'un périphérique
udevadm info -a /dev/sdb               # attributs hiérarchiques (pour écrire une règle)
udevadm monitor                        # observer les événements en direct (branchement)
# Règle personnalisée dans /etc/udev/rules.d/99-local.rules, puis :
sudo udevadm control --reload-rules    # recharger les règles
sudo udevadm trigger                   # réappliquer aux périphériques présents
udevadm verify /etc/udev/rules.d/99-local.rules   # valider la syntaxe
udevadm test /sys/block/sdb            # simuler l'application des règles
```

État  attendu :   les  attributs  ou  événements  s'affichent,   les  règles  se
rechargent.  Toujours valider une  règle ( `verify`  ) et  la tester (  `test` )
avant  de  s'y   fier.  `udevadm info -a`  fournit   les  attributs  utilisables
comme critères de règle.

### Gérer les paquets (pacman, orientation Arch)

```bash
sudo pacman -Syu                      # mise à jour COMPLÈTE (seule forme sûre)
sudo pacman -S paquet                 # installer
sudo pacman -R paquet                 # supprimer
sudo pacman -Rns paquet               # supprimer avec dépendances orphelines et config
pacman -Ss motif                      # chercher dans les dépôts
pacman -Qs motif                      # chercher parmi les paquets installés
pacman -Qi paquet                     # informations détaillées
pacman -Qo /chemin/fichier            # quel paquet possède ce fichier
checkupdates                          # voir les mises à jour SANS toucher la base (pacman-contrib)
sudo pacman -Sc                       # nettoyer le cache des anciens paquets
```

État  attendu :  les paquets  sont  installés,  supprimés  ou listés.  La  règle
absolue : `pacman -Syu` complet, jamais  `pacman -Sy paquet` qui crée une mise à
jour   partielle  dangereuse.    Utiliser   `checkupdates`  pour   prévisualiser
sans risque.

## Dépannage par symptôme

### Un service refuse de démarrer

Symptôme : `systemctl start` échoue, le  service reste inactif. Cause probable :
erreur de configuration, dépendance manquante,  ou conflit de port. Correction :
lire l'état et les journaux.

```bash
systemctl status service              # message d'erreur et PID
journalctl -u service -n 50 --no-pager  # 50 dernières lignes de log
systemctl cat service                 # vérifier l'unité effective
```

### Une modification d'unité n'est pas prise en compte

Symptôme :  un  changement  dans un  fichier  d'unité reste  sans  effet.  Cause
probable : systemd n'a pas rechargé  sa configuration. Correction : recharger le
démon (sauf si édité via systemctl edit).

```bash
sudo systemctl daemon-reload
sudo systemctl restart service
```

### Le système est lent, charge élevée

Symptôme : lenteurs  générales, load average élevé.  Cause probable : saturation
CPU,  mémoire  épuisée  (swap),  ou  attente  disque  (I/O  wait).  Correction :
distinguer la cause avec top.

```bash
top                                   # observer %CPU, %MEM, et surtout wa (I/O wait)
free -h                               # mémoire et swap saturés ?
# wa élevé = goulot disque ; %MEM proche de 100 + swap = manque de RAM
```

### pacman : « failed to commit transaction (conflicting files) »

Symptôme : une mise à jour échoue  sur des fichiers en conflit. Cause probable :
un  fichier appartenant  à  un paquet  existe  déjà hors  gestion.  Correction :
identifier et résoudre le conflit, jamais forcer aveuglément.

```bash
pacman -Qo /chemin/du/fichier/en/conflit   # à qui appartient le fichier
# Si le fichier est orphelin et sûr à remplacer :
sudo pacman -S --overwrite '/chemin/precis' paquet   # ciblé, pas global
```

### pacman : « invalid or corrupted package » après pacman -Sy

Symptôme :  impossible  d'installer après  un  -Sy,  erreurs de  version.  Cause
probable :  mise à  jour partielle  (base synchronisée  mais système  non mis  à
jour). Correction : compléter la mise à jour.

```bash
sudo pacman -Syu                      # terminer la mise à jour complète
```

## Points clés à retenir

> systemctl  gère les  unités (services,  montages,  timers...), journalctl  lit
> leurs  logs.  enable  --now  active et  démarre ;  daemon-reload  après  toute
> modification manuelle d'unité.

> Ne jamais  éditer une  unité fournie par  un paquet :  systemctl edit  crée un
> drop-in qui survit aux mises à jour ; systemctl cat montre l'unité effective.

> Sur Arch,  pacman -Syu complet  uniquement, jamais  pacman -Sy paquet  (mise à
> jour partielle = système cassé). checkupdates pour prévisualiser sans risque.

> top :  comparer la load  average au nombre  de cœurs ;  un fort I/O  wait (wa)
> pointe le disque, pas le CPU. TERM avant KILL.

> Inventaire matériel : uname, lscpu, free,  lsblk, lspci, dmidecode. Pas besoin
> d'outil tiers pour l'essentiel.

> udev : règles dans /etc/udev/rules.d/,  validées par udevadm verify et testées
> par udevadm test, rechargées par udevadm control --reload-rules.
