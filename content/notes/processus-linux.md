---
title: "Processus : observer, cibler, arrêter, contraindre"
description: "Référence d'exploitation des processus sous Linux : lire l'état du système (ps, top, uptime, /proc), retrouver le bon PID avant d'agir, arrêter avec la bonne commande de la famille kill, régler priorité et limites, diagnostiquer une charge, une fuite de mémoire ou un processus qu..."
tags: ["linux", "cli", "ps", "top", "kill", "runbook", "processus"]
updated: 2026-08-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux, procps-ng, util-linux"
---

_Référence d'exploitation des processus sous Linux : lire l'état du système (ps, top, uptime, /proc), retrouver le bon PID avant d'agir, arrêter avec la bonne commande de la famille kill, régler priorité et limites, diagnostiquer une charge, une fuite de mémoire ou un processus qui refuse de mourir. La sémantique des signaux et des codes de sortie est dans le runbook signaux ; les services et leur init dans le runbook artix-init._

---


## Choisir le bon outil

```
Intention                             Outil              Pourquoi
──────────────────────────────        ──────────────     ────────────────────
Instantané scriptable                 ps                 sortie stable,
                                                         colonnes choisies
Vue temps réel, tri interactif        top                présent partout
Vue confortable, arborescence         htop, btop         si installés
Arbre des filiations                  pstree -p          voit qui a lancé quoi
Retrouver un PID                      pgrep              sans grep parasite
Agir sur plusieurs processus          pkill, killall     sélection par motif
Qui tient ce fichier, ce port         lsof, fuser        la question inverse
Ce que fait un processus bloqué       strace, /proc      dernier recours
Charge dans la durée                  uptime, vmstat     tendance, pas
                                                         instantané
```

En une phrase : `ps` pour scripter, `top` pour regarder, `pgrep` pour cibler,
`pkill` pour agir, `lsof` pour la question inverse.

---

## Principes fondamentaux

> **Un processus est un arbre, pas une liste.** Chaque processus a un parent, et
> tuer un parent ne tue pas nécessairement ses enfants : ils sont adoptés par
> l'init. C'est pourquoi arrêter un service par son PID principal laisse parfois
> des travailleurs orphelins qui continuent d'écrire.

```
   init (PID 1)
     └─ shell de session
          └─ tmux
               └─ shell
                    └─ commande          ← Ctrl-C vise le GROUPE au premier
                         └─ enfant          plan, pas ce seul processus
```

> **L'état d'un processus dit ce qui est possible.** La colonne `STAT` de `ps`
> est le premier diagnostic, avant toute action.

```
Lettre   État                        Conséquence pratique
──────   ─────────────────────       ──────────────────────────────────
R        en cours ou prêt            consomme du processeur
S        en attente interruptible    normal, la plupart des processus
D        attente NON interruptible   aucun signal ne passe, KILL compris
Z        zombie                      déjà mort, attend son parent
T        arrêté (Ctrl-Z)             reprend avec SIGCONT ou fg
<  N     priorité relevée, abaissée  voir nice
s  +     chef de session, premier plan
```

> **La charge moyenne n'est pas un pourcentage.** C'est un nombre de tâches
> prêtes ou en attente disque, à comparer au nombre de cœurs. Une charge de 4
> sur 8 cœurs est confortable, la même sur 2 cœurs est saturée. Une charge
> élevée avec un processeur inoccupé désigne le disque ou le réseau.

> **La mémoire « libre » n'est pas la mémoire disponible.** Le noyau emploie la
> mémoire inutilisée comme cache et la rend à la demande. La colonne à lire est
> `available`, jamais `free`. Un système sain a peu de mémoire libre.

> **Tuer est un dernier recours, cibler est le vrai travail.** L'erreur coûteuse
> n'est pas de choisir le mauvais signal, c'est de viser le mauvais processus.
> D'où la règle : sélectionner, vérifier la sélection, puis seulement agir.

---

## Opérations standard

### Observer l'état du système

```bash
uptime                           # charge 1, 5, 15 minutes
nproc                            # cœurs, pour interpréter la charge
free -h                          # mémoire : lire « available »
vmstat 1 5                       # tendance : cinq mesures d'une seconde
ps aux --sort=-%cpu | head       # instantané des gros consommateurs
ps aux --sort=-%mem | head
top                              # temps réel ; P trie par CPU, M par mémoire
top -o %MEM -b -n1 | head -15    # même chose, non interactif, scriptable
```

État attendu : une charge inférieure au nombre de cœurs, et une valeur
`available` confortable. Dans `top`, une part élevée de `wa` signale une attente
disque, pas un manque de processeur.

### Choisir ce que `ps` affiche

```bash
ps -eo pid,ppid,user,stat,pcpu,pmem,etime,comm --sort=-pcpu | head
ps -eo pid,ppid,rss,args --sort=-rss | head        # mémoire résidente réelle
ps -p 1234 -o pid,ppid,stat,wchan,lstart,args      # tout sur un processus
ps -eLf | head                                     # threads compris
pstree -ps 1234                                    # ascendance et descendance
```

`ps aux` est une habitude, `ps -eo` est un outil : il rend exactement les
colonnes voulues, dans un ordre stable, ce qui le rend utilisable en pipeline.

### Retrouver le bon PID avant d'agir

```bash
pgrep -a nginx                   # PID et ligne de commande complète
pgrep -u "$USER" -a python       # restreint à un utilisateur
pgrep -f 'monservice --worker'   # motif sur la LIGNE COMPLÈTE
pgrep -n firefox                 # le plus récent
pgrep -c chrome                  # combien
pidof nginx                      # équivalent simple, nom exact
```

État attendu : la liste des PID visés, avec leur ligne de commande, avant toute
action destructrice. `pgrep -f` puis `pkill -f` avec le même motif : la
vérification et l'action emploient la même sélection, c'est la seule discipline
qui évite de tuer le mauvais processus.

L'ancienne forme `ps aux | grep motif` a 2 défauts : elle liste son propre
`grep`, et son motif attrape des lignes sans rapport. `pgrep` n'a ni l'un ni
l'autre.

### Arrêter : la famille kill

```bash
kill 1234                        # SIGTERM au PID 1234, forme par défaut
kill -TERM 1234                  # identique, explicite
kill -KILL 1234                  # dernier recours, aucun nettoyage
kill -0 1234                     # ne tue rien : le PID existe-t-il encore
kill -TERM -1234                 # tout le GROUPE (noter le tiret)
kill %1                          # une tâche du shell courant

pkill nginx                      # par nom, tous les correspondants
pkill -u autreuser -f 'motif'    # par utilisateur ET par ligne complète
pkill -TERM -f 'motif' ; sleep 5 ; pkill -KILL -f 'motif'

killall nginx                    # par nom EXACT d'exécutable
killall -i nginx                 # avec confirmation pour chacun
```

Séquence recommandée, avec fenêtre de politesse :

```bash
pgrep -f 'motif' -a              # 1. vérifier la sélection
pkill -TERM -f 'motif'           # 2. demander l'arrêt
sleep 5
pgrep -f 'motif' -a              # 3. contrôler
pkill -KILL -f 'motif'           # 4. forcer seulement si nécessaire
```

Différence à connaître : `killall` compare le nom de l'exécutable, `pkill`
compare un motif, et `pkill -f` compare la ligne de commande entière. Un
`pkill python` tue tous les scripts Python de la machine ; `pkill -f
'python /opt/monapp/serveur.py'` vise le bon.

La sémantique de chaque signal, les codes 137 et 143, `trap` et le nettoyage
sont dans le runbook signaux et codes de sortie.

### Contraindre : priorité, mémoire, temps

```bash
nice -n 19 commande              # lancer à priorité basse (19 = la plus basse)
renice -n 10 -p 1234             # changer après coup
ionice -c3 -p 1234               # priorité disque « au ralenti »
timeout 30s commande             # tuer après 30 secondes
timeout -s KILL 30s commande     # avec KILL plutôt que TERM
systemd-run --scope -p MemoryMax=1G commande     # plafond mémoire, si systemd
ulimit -v 2000000                # limite d'espace virtuel, shell courant
```

État attendu : la commande s'exécute plus lentement mais laisse la machine
réactive. `nice` n'améliore jamais les performances de la commande, il protège
le reste du système : c'est un outil de courtoisie, pas d'accélération.

Seul root peut abaisser une valeur de politesse, donc relever une priorité :
`renice -n -5` échoue pour un utilisateur ordinaire, ce qui est voulu.

### Répondre à la question inverse

```bash
lsof -p 1234                     # tout ce qu'un processus a ouvert
lsof /var/log/monfichier         # qui tient ce fichier
lsof +D /mnt/disque              # qui tient quoi sous ce répertoire
lsof -i :8080                    # qui écoute ce port
fuser -v /mnt/disque             # même question, sortie compacte
fuser -k /mnt/disque             # ET tuer ces processus, à manier avec soin
ss -tulpn                        # ports en écoute, avec les processus
```

État attendu : la liste des processus concernés. C'est la commande qui débloque
un démontage impossible, un port déjà pris, ou un espace disque qui ne revient
pas après suppression.

### Lire un processus par /proc

```bash
ls -l /proc/1234/exe             # le binaire réel, même supprimé
ls -l /proc/1234/cwd             # son répertoire de travail
tr '\0' '\n' < /proc/1234/cmdline    # sa ligne de commande exacte
tr '\0' '\n' < /proc/1234/environ    # son environnement, tel qu'hérité
cat /proc/1234/status | head -20     # état, mémoire, threads, UID
ls -l /proc/1234/fd | head           # ses descripteurs ouverts
cat /proc/1234/wchan; echo           # dans quel appel noyau il attend
```

C'est la source de vérité : quand un outil et `/proc` divergent, `/proc` a
raison. L'environnement hérité y est particulièrement utile pour comprendre un
service qui se comporte autrement qu'en interactif.

### Tâches du shell

```bash
commande &                       # arrière-plan
jobs -l                          # tâches du shell courant, avec PID
fg %1                            # ramener au premier plan
bg %1                            # reprendre en arrière-plan
Ctrl-Z                           # suspendre la tâche du premier plan
wait %1                          # attendre la fin, et lire son code
```

Les tâches appartiennent au shell : un autre terminal ne les voit pas dans
`jobs`, seulement dans `ps`. Pour qu'un travail survive à la fermeture, voir
`nohup`, `disown` et `setsid` dans le runbook signaux.

---

## Traitement par lots

```bash
# Arrêter proprement une famille de processus, puis forcer les récalcitrants
pkill -TERM -f 'monservice --worker'
sleep 5
pgrep -f 'monservice --worker' | while read -r p; do
  printf 'récalcitrant: %s\n' "$p"; kill -KILL "$p"
done

# Consommation mémoire cumulée par nom de programme
ps -eo rss,comm --no-headers |
  awk '{m[$2]+=$1} END {for (k in m) printf "%8d Ko  %s\n", m[k], k}' |
  sort -rn | head

# Surveiller un processus jusqu'à sa fin, sans boucle d'attente active
while kill -0 "$pid" 2>/dev/null; do sleep 2; done
printf 'terminé\n'

# Relancer chaque processus d'un utilisateur avec une priorité plus basse
for p in $(pgrep -u "$USER" ffmpeg); do renice -n 15 -p "$p"; done
```

---

## Dépannage par symptôme

### Le système est lent, la charge est élevée

Distinguer processeur, disque et mémoire avant d'agir :

```bash
uptime ; nproc                   # charge rapportée aux cœurs
top -b -n1 | head -5             # ligne %Cpu : us, sy, wa, id
free -h                          # available, et si l'échange est actif
vmstat 1 5                       # colonnes si et so : échange en cours
```

```
Constat                          Conclusion
─────────────────────────        ────────────────────────────────────
%us élevé                        calcul : trouver le processus, nice
%wa élevé                        attente disque : iotop, ionice
%sy élevé                        appels système : strace, pilote
si/so non nuls                   échange actif : mémoire insuffisante
charge élevée, tout inoccupé     processus en état D, disque ou réseau
```

### Un processus refuse de mourir

```bash
ps -o pid,stat,wchan,comm -p "$pid"
```

État `D` : attente non interruptible, aucun signal ne passe, KILL compris.
Traiter la cause, disque en panne ou montage réseau perdu, pas le processus.
État `Z` : ce n'est plus un processus, il attend que son parent lise son code de
sortie ; agir sur le parent.

### La mémoire disparaît

```bash
ps -eo pid,rss,comm --sort=-rss | head
grep -E 'MemAvailable|SwapFree' /proc/meminfo
sudo dmesg -T | grep -i 'out of memory' | tail
```

Un processus tué avec le code 137 sans intervention humaine désigne presque
toujours le tueur de mémoire du noyau. Le journal du noyau nomme la victime et
le déclencheur.

### « Too many open files »

```bash
ulimit -Sn ; ulimit -Hn                        # limites du shell courant
ls /proc/"$pid"/fd | wc -l                     # ce que le processus a ouvert
cat /proc/"$pid"/limits | grep 'open files'    # ses limites réelles
```

La limite s'hérite du processus qui a lancé le service : la changer dans le shell
ne change rien à un service déjà démarré. Corriger dans l'unité ou dans le script
de démarrage, puis relancer.

### Un démontage est refusé, « target is busy »

```bash
lsof +D /mnt/disque | head
fuser -vm /mnt/disque
```

Un simple shell dont le répertoire courant est sous le point de montage suffit à
bloquer. `fuser -k` tue les responsables, à n'employer qu'après avoir lu la
liste.

### Un port est déjà pris

```bash
ss -tulpn | grep :8080
lsof -i :8080
```

### `ps aux | grep` renvoie une ligne de trop

Le `grep` se voit lui-même. Employer `pgrep -a`, ou l'astuce classique
`grep '[n]ginx'`, dont le motif ne correspond pas à sa propre ligne.

### Un processus consomme le processeur sans rien faire d'utile

```bash
sudo strace -c -p "$pid"         # profil des appels système, Ctrl-C pour finir
cat /proc/"$pid"/wchan; echo     # où il attend dans le noyau
sudo perf top -p "$pid"          # si perf est installé
```

---

## Problèmes connus et contournements

### Tuer un parent n'arrête pas ses enfants

Comportement structurel : les enfants sont réadoptés par l'init et continuent.
Viser le groupe de processus, `kill -TERM -PID`, ou employer le gestionnaire de
services qui connaît l'arborescence complète.

### `killall` n'a pas le même sens partout

Sur Linux, il tue les processus dont le nom correspond. Sur certains Unix
historiques, il tue tous les processus de l'utilisateur. Dans un script destiné
à durer, préférer `pkill` avec un motif explicite.

### `nice` n'accélère rien

Il abaisse la priorité d'une tâche pour préserver les autres. Sur une machine
inoccupée, il ne change rien du tout. Seul root peut relever une priorité,
opération irréversible pour un utilisateur ordinaire.

### La colonne mémoire de `ps` compte 2 fois

`RSS` inclut les pages partagées entre processus : additionner les `RSS` d'une
famille de processus surestime la consommation réelle. Pour une mesure honnête,
lire `PSS` dans `/proc/PID/smaps_rollup`.

### Les limites ne s'appliquent qu'aux processus lancés ensuite

`ulimit` modifie le shell courant et ce qu'il lancera. Un service déjà démarré
garde les limites héritées à son démarrage, visibles dans `/proc/PID/limits`.

---

## Pipelines utiles

```bash
# Les dix processus les plus gourmands en mémoire, en unités lisibles
ps -eo rss,pid,comm --no-headers --sort=-rss | head -10 |
  numfmt --from-unit=1024 --to=iec --field=1

# Consommation cumulée par utilisateur
ps -eo user,rss --no-headers |
  awk '{m[$1]+=$2} END {for (u in m) printf "%10d Ko  %s\n", m[u], u}' |
  sort -rn

# Processus démarrés depuis moins de dix minutes
ps -eo etimes,pid,args --no-headers --sort=etimes |
  awk '$1 < 600 {print}' | head

# Tous les processus en état D ou Z, ceux qui demandent une décision
ps -eo pid,stat,wchan,comm --no-headers | awk '$2 ~ /^[DZ]/'

# Nombre de descripteurs ouverts par processus, du plus gourmand au moins
for d in /proc/[0-9]*/fd; do
  printf '%s %s\n' "$(ls "$d" 2>/dev/null | wc -l)" "${d%/fd}"
done | sort -rn | head
```

---

## Voir aussi

Ce qu'un processus rend en s'arrêtant, et la traduction d'un code supérieur à
128 en nom de signal, sont traités dans le runbook signaux-codes-sortie.

---

## Sources amont

```
Source                                          Nature      Relevé le
─────────────────────────────────────────────   ─────────   ──────────
gitlab.com/procps-ng/procps, notes de version   primaire    2026-09-03
man 1 ps, man 1 top, man 1 pgrep                primaire    2026-09-03
man 5 proc, documentation du noyau              primaire    2026-09-03
man 1 lsof, man 1 fuser                         primaire    2026-09-03
```

Ce qui bouge : les colonnes disponibles dans `ps -o`, les champs de `/proc`
ajoutés par le noyau, et la bascule complète vers les cgroups v2 qui change les
outils de mesure applicables.

---

## Points clés à retenir

Cibler avant d'agir : `pgrep -a` avec le motif exact, puis `pkill` avec le même
motif. L'erreur coûteuse est de viser le mauvais processus, pas de choisir le
mauvais signal.

`pkill python` tue tous les scripts Python de la machine ; `pkill -f` sur la
ligne complète vise le bon.

TERM, fenêtre de 5 secondes, contrôle, puis KILL seulement si nécessaire.

La colonne `STAT` décide : `D` ne se tue pas, `Z` se traite par le parent, `T`
se reprend avec `fg` ou SIGCONT.

Comparer la charge au nombre de cœurs, et lire `available` plutôt que `free`.

`lsof` et `fuser` répondent à la question inverse : qui tient ce fichier, ce
point de montage, ce port.

`/proc/PID/` est la source de vérité, environnement hérité compris, quand un
outil et le noyau divergent.

`nice` protège le reste du système, il n'accélère jamais la tâche visée.
