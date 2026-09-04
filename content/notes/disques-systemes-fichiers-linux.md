---
title: "Disques, partitions et systèmes de fichiers"
description: "Référence d'exploitation des opérations sur les disques sous Linux : écriture sectorielle et imagerie (dd), partitionnement GPT/MBR (parted), création de systèmes de fichiers (mkfs), analyse de l'espace (ncdu, du, df). Ces opérations sont parmi les plus destructrices du système :..."
tags: ["linux", "cli", "dd", "parted", "mkfs", "ncdu", "runbook", "disques"]
updated: 2026-08-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux, util-linux, parted/GNU, e2fsprogs, dosfstools"
---

_Référence d'exploitation des opérations sur les disques sous Linux : écriture sectorielle et imagerie (dd), partitionnement GPT/MBR (parted), création de systèmes de fichiers (mkfs), analyse de l'espace (ncdu, du, df). Ces opérations sont parmi les plus destructrices du système : ce runbook insiste sur la vérification de la cible avant action. Cible un usage en ligne de commande sur systèmes Linux._

## Choisir le bon outil

```
Besoin                                    Outil               Pourquoi
──────────────                            ──────────────      ──────────────
Copier un disque ou une image secteur     dd (ou ddrescue)    Copie brute, bit à
                                                              bit
Récupérer un disque défaillant            ddrescue            Tolère les erreurs
                                                              de lecture
Partitionner (GPT moderne)                parted              Scriptable, GPT et
                                                              MBR
Partitionner (interactif simple)          cfdisk / fdisk      Interface guidée
Créer un système de fichiers ext4         mkfs.ext4           FS Linux par
                                                              défaut
Créer un FS d'échange (clé USB)           mkfs.vfat / exfat   Compatibilité
                                                              multiplateforme
Voir ce qui remplit un disque             ncdu                Navigation
                                                              interactive par
                                                              taille
Espace libre par montage                  df -h               Vue d'ensemble
                                                              rapide
```

> En une  phrase : lsblk  pour identifier, parted  pour partitionner,  mkfs pour
> formater, dd/ddrescue pour imager ou copier secteur à secteur, ncdu et df pour
> analyser   l'occupation.   Toutes   ces   actions,    sauf  l'analyse,    sont
> destructrices : vérifier la cible 2 fois.

## Principes fondamentaux

> Ces commandes ne demandent pas confirmation et  ne pardonnent pas. dd écrit là
> où on lui dit,  sans filet ; un mkfs efface le  système de fichiers existant ;
> parted réécrit  la table  de partitions.  Aucune corbeille,  aucun « êtes-vous
> sûr ».   Une  lettre  de  disque   erronée  (sdb  au  lieu   de  sdc)  détruit
> le mauvais support.

> Toujours  identifier la  cible  avant  d'écrire.  lsblk  montre la  hiérarchie
> disques/partitions  avec tailles,  modèles et  points de  montage.  Le réflexe
> avant tout  dd, parted  ou mkfs est  de relire la  sortie de `lsblk -f`  et de
> confirmer que  le périphérique  visé est  bien le  bon, par  sa taille  et son
> modèle, pas seulement par sa lettre.

> Démonter avant de formater ou de partitionner. Modifier un système de fichiers
> monté corrompt les données et peut figer  le système. Démonter ( `umount` ) la
> cible  avant mkfs  ou  parted,  et vérifier  qu'aucun  processus ne  l'utilise
> ( `lsof` , `fuser` ).

> GPT a  remplacé MBR  pour les disques  modernes. MBR  est limité à  2 To  et 4
> partitions primaires ;  GPT lève ces  limites et stocke une  table redondante.
> Pour tout nouveau  disque, choisir GPT, sauf contrainte  de compatibilité avec
> un système très ancien.

> dd se  diagnostique et s'accélère  avec les bonnes  options. `status=progress`
> affiche  l'avancement,   `bs=4M`  accélère  la  copie,  `conv=fsync`  garantit
> l'écriture sur le support avant de rendre la main. Pour un disque qui présente
> des erreurs de  lecture, ddrescue est  préférable à dd car  il continue malgré
> les secteurs défectueux.

> L'espace  disque a  2 ennemis  distincts :  les octets  et  les inodes.  Un
> « disque plein » peut  venir de fichiers volumineux (df montre  les octets) ou
> d'une  multitude  de  petits  fichiers   épuisant  les  inodes  (  `df -i`  ).
> Diagnostiquer les 2 ; ncdu trouve  les gros consommateurs d'octets, mais un
> manque d'inodes exige `df -i` et la chasse aux répertoires surpeuplés.

## Opérations standard

### Identifier les disques (préalable obligatoire)

```bash
# arbre disques/partitions, FS, montage, UUID
lsblk -f
# identifier par taille, modèle, numéro de série
lsblk -o NAME,SIZE,MODEL,SERIAL
sudo parted /dev/sdX print            # table de partitions d'un disque
sudo blkid                            # UUID et type de chaque partition
df -h                                 # espace par système de fichiers monté
```

État attendu :  la  cartographie des disques  s'affiche.  Cette étape  n'est pas
optionnelle :  elle conditionne la  sûreté de  toutes les  opérations suivantes.
Confirmer le disque par sa taille et son modèle, jamais par sa seule lettre.

### Partitionner (parted)

```bash
sudo umount /dev/sdX1                 # démonter d'abord
sudo parted /dev/sdX                  # session interactive
# Dans parted :
#   mklabel gpt                       # table GPT (neuf disque, EFFACE tout)
#   mkpart primary ext4 1MiB 100%     # partition couvrant tout le disque
#   print                             # vérifier
#   quit
# Ou en une commande non interactive :
sudo parted -s /dev/sdX mklabel gpt mkpart primary ext4 1MiB 100%
```

État  attendu :  la  table  de  partitions est  créée.  `mklabel`  efface  toute
partition existante. Aligner la première partition  sur 1 MiB (défaut de parted)
pour les performances. Vérifier avec `print` avant de quitter.

### Créer un système de fichiers (mkfs)

```bash
sudo mkfs.ext4 /dev/sdX1              # ext4 (FS Linux par défaut)
sudo mkfs.ext4 -L DONNEES /dev/sdX1   # avec étiquette
sudo mkfs.vfat -F32 /dev/sdX1         # FAT32 (compatibilité maximale)
sudo mkfs.exfat /dev/sdX1            # exFAT (gros fichiers, multiplateforme)
sudo mkfs.btrfs /dev/sdX1            # Btrfs (snapshots, CoW)
# Vérifier après création
sudo blkid /dev/sdX1
```

État attendu :  le  système de fichiers  est créé,  prêt à  monter.  mkfs efface
irrémédiablement le  contenu existant. Choisir  le FS selon l'usage :  ext4 pour
Linux, exFAT ou FAT32 pour l'échange multiplateforme, Btrfs pour les snapshots.

### Imager et copier secteur à secteur (dd, ddrescue)

```bash
# Écrire une image ISO sur une clé USB (VÉRIFIER /dev/sdX avec lsblk d'abord)
sudo dd if=image.iso of=/dev/sdX bs=4M status=progress conv=fsync
# Sauvegarder une partition entière en image
sudo dd if=/dev/sdX1 of=sauvegarde.img bs=4M status=progress
# Cloner un disque vers un autre
sudo dd if=/dev/sdX of=/dev/sdY bs=4M status=progress conv=fsync
# Récupérer un disque défaillant (tolère les erreurs)
sudo ddrescue /dev/sdX image.img journal.logfile
```

État   attendu :   l'image  ou   le   clone  est   écrit,   octet  pour   octet.
`status=progress` est  indispensable pour suivre  une opération longue.  Pour un
disque qui présente des secteurs illisibles,  utiliser ddrescue avec son fichier
journal, qui permet de reprendre et de réessayer les zones difficiles.

### Analyser l'occupation (ncdu, du, df)

```bash
df -h                                 # espace par système de fichiers (octets)
# espace en INODES (autre cause de « disque plein »)
df -i
ncdu /                                # navigation interactive par taille
du -sh /chemin/*                      # taille de chaque sous-élément
du -sh /chemin/* | sort -rh | head    # les plus gros, classés
```

État attendu : les  consommateurs d'espace sont identifiés. ncdu  est l'outil le
plus efficace pour explorer interactivement. Si df montre de la place libre mais
que l'écriture échoue,  vérifier `df -i`  : les inodes peuvent  être épuisés par
une multitude de petits fichiers.

## Dépannage par symptôme

### dd a écrit sur le mauvais disque

Symptôme : un  disque de données  a été écrasé  par une image.  Cause probable :
lettre de  périphérique erronée (sdb vs  sdc), non vérifiée  avant. Correction :
arrêter immédiatement, ne plus écrire, tenter une récupération.

```bash
# NE PLUS RIEN ÉCRIRE sur le disque. Démonter si monté.
sudo umount /dev/sdX* 2>/dev/null
# Récupération de données : voir aussi le runbook archivage
sudo ddrescue /dev/sdX rescue.img rescue.log   # imager d'abord
# puis testdisk/photorec sur l'image, jamais sur le disque d'origine
```

### « Device or resource busy » au démontage ou au formatage

Symptôme :  umount ou  mkfs refuse  d'agir,  le périphérique  est occupé.  Cause
probable : un  processus utilise le  point de montage,  ou il est  encore monté.
Correction : identifier et arrêter ce qui occupe.

```bash
lsof +D /point/de/montage             # processus utilisant le montage
fuser -vm /dev/sdX1                   # processus accédant au périphérique
sudo umount /dev/sdX1                 # une fois libéré
```

### « No space left on device » alors que df montre de la place

Symptôme :  l'écriture  échoue bien  que  df affiche  de l'espace  libre.  Cause
probable : les  inodes sont épuisés (beaucoup de  petits fichiers). Correction :
vérifier les inodes et faire le ménage.

```bash
df -i                                 # taux d'utilisation des inodes
# Trouver les répertoires aux nombreux fichiers
find /chemin -xdev -type f | cut -d/ -f1-4 | sort | uniq -c | sort -rn | head
```

### parted refuse d'écrire ou avertit sur l'alignement

Symptôme :  parted  signale un  mauvais alignement  ou un  chevauchement.  Cause
probable :  partition  non  alignée  sur une  frontière  optimale.  Correction :
laisser parted aligner (unités MiB) et démarrer à 1MiB.

```bash
sudo parted -a optimal /dev/sdX mkpart primary ext4 1MiB 100%
```

## Sécurité et précautions

> La  règle d'or :  identifier  la  cible avant  d'écrire.  Relire `lsblk -f`  ,
> confirmer le  disque par sa taille  et son modèle.  La majorité des  pertes de
> données dd/mkfs viennent  d'une lettre de périphérique confondue.  Une seconde
> de vérification contre une perte irréversible.

> Démonter avant  de modifier.  mkfs et  parted sur un  FS monté  corrompent les
> données.  Toujours `umount`  et  vérifier avec  lsof/fuser qu'aucun  processus
> n'accède au support.

> Préférer ddrescue  à dd  sur un support  douteux. Sur  un disque  qui faiblit,
> ddrescue  avec  son  journal  récupère   le  maximum  et  réessaie  les  zones
> difficiles, là où dd s'arrête ou écrit des données incomplètes.

> Imager avant de réparer.  Face à une perte de données,  la première action est
> d'imager  le disque  (ddrescue) et  de  travailler sur  la copie,  jamais  sur
> l'original, pour ne pas réduire les chances de récupération.

## Protocole d'urgence

Situation : une écriture s'est faite sur le mauvais support, une partition a été
supprimée, un système de fichiers a été créé par-dessus des données.

**1. Arrêter toute écriture, immédiatement.** C'est la seule action dont
dépendent toutes les suivantes. Chaque écriture réduit ce qui est récupérable.

```bash
sync                                     # vider les tampons en attente
sudo umount /dev/sdXN                    # démonter la cible
sudo mount -o remount,ro /point_montage  # si le démontage est refusé
```

Si un `dd` est encore en cours, l'interrompre. Ne pas le relancer « pour
corriger », ne pas reformater, ne pas repartitionner.

**2. Préserver l'état.** Noter ce qui a été tapé, exactement, avant de
l'oublier. La commande fautive dit où l'écriture a eu lieu et sur quelle
longueur.

```bash
history | tail -20 > /tmp/incident-$(date +%s).txt
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT >> /tmp/incident-$(date +%s).txt
```

**3. Observer sans monter.** Lire la table de partitions et signer le contenu
sans écrire dessus.

```bash
sudo fdisk -l /dev/sdX          # table lue, rien d'écrit
sudo blkid /dev/sdX*            # systèmes de fichiers reconnus
sudo file -s /dev/sdXN          # signature de début de partition
```

**4. Isoler le support.** Débrancher si c'est un disque externe. S'il s'agit
d'un disque système et que la machine tourne encore, ne pas redémarrer : le
démarrage écrit. Passer par une clé de secours pour la suite.

**5. Décider avant d'agir.** 2 chemins seulement, et ils s'excluent :

```
Données irremplaçables       imager d'abord, travailler sur la copie,
                             envisager un service spécialisé si l'image
                             elle-même est illisible
Données sauvegardées         ne rien tenter de récupérer, restaurer
ailleurs                     depuis la sauvegarde, c'est plus rapide
                             et plus sûr
```

---

## Processus de récupération

### Prérequis

Vérifier avant de commencer. S'il manque un élément, s'arrêter et le signaler.

```bash
lsblk                            # identifier le support source, sans le monter
df -h /destination               # espace libre >= taille du support source
command -v ddrescue              # sinon : installer depuis un AUTRE support
```

L'espace de destination doit être au moins égal à la taille totale du disque
source, pas à celle des données : l'image est sectorielle.

### Étapes

Chaque étape se vérifie avant la suivante.

**1. Imager le support, jamais travailler sur l'original.**

```bash
sudo ddrescue -d -r3 /dev/sdX /destination/image.img /destination/image.map
```

État attendu : `ddrescue` affiche le taux de secteurs récupérés et écrit un
fichier de journal. Ce journal permet de reprendre une passe interrompue :
ne pas le supprimer.

**2. Travailler sur une copie de l'image, pas sur l'image elle-même.**

```bash
cp --reflink=auto /destination/image.img /destination/travail.img
```

**3. Retrouver les partitions perdues, sur la copie.**

```bash
sudo losetup -fP --show /destination/travail.img    # expose /dev/loopN
sudo testdisk /destination/travail.img              # analyse et reconstruction
```

Pour extraire des fichiers sans reconstruire la table, `photorec` travaille par
signatures : il retrouve le contenu mais perd les noms et l'arborescence.

**4. Vérifier un système de fichiers retrouvé avant de le monter en écriture.**

```bash
sudo fsck -n /dev/loopNp1        # -n : diagnostic seul, aucune réparation
sudo mount -o ro /dev/loopNp1 /mnt/verif
```

**5. Recopier ce qui a été retrouvé vers un support sain**, puis seulement
alors réutiliser le support d'origine.

### Validation d'état

```bash
diff -r /mnt/verif/dossier /destination/restaure/dossier | head
find /destination/restaure -type f | wc -l       # volumétrie attendue
sudo losetup -d /dev/loopN                       # détacher proprement
```

État attendu : le nombre de fichiers correspond à ce qui était attendu, un
échantillon s'ouvre correctement, et le périphérique de boucle est détaché.

---

## Pipelines utiles

```bash
# Occupation par système de fichiers, sans les pseudo-systèmes
df -hT -x tmpfs -x devtmpfs -x squashfs | sort -k6 -h

# Répertoires les plus lourds sans franchir de point de montage
du -xh --max-depth=2 / 2>/dev/null | sort -rh | head -20

# Inodes consommés, cause fréquente d'un disque « plein » qui ne l'est pas
df -i | awk 'NR==1 || $5+0 > 80'

# Fichiers supprimés mais toujours ouverts, qui retiennent l'espace
lsof -nP 2>/dev/null |
  awk '/deleted/ {s[$1"/"$2]+=$7} END{for(p in s) print s[p], p}' |
  sort -rn | head

# Correspondance périphérique, UUID et point de montage
lsblk -o NAME,SIZE,FSTYPE,UUID,MOUNTPOINT

# Vérifier qu'une entrée de fstab correspond à un périphérique présent
awk '$1 ~ /^UUID=/ {print substr($1,6)}' /etc/fstab |
  while read -r u; do blkid -U "$u" >/dev/null || echo "UUID ABSENT: $u"; done
```

L'occupation de `/tmp` en tmpfs, bornée indépendamment du disque, relève du
runbook temporaires-vidages.

Le cas des fichiers supprimés encore ouverts explique la plupart des écarts
entre `du` et `df` : `du` parcourt les entrées de répertoire, un fichier
supprimé n'en a plus, et son espace reste pourtant réservé jusqu'à la fermeture
du dernier descripteur.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
util-linux           https://github.com/util-linux/util-linux/releases
e2fsprogs            https://e2fsprogs.sourceforge.net/
Documentation btrfs  https://btrfs.readthedocs.io/
```

---

## Points clés à retenir

> dd,  mkfs et  parted sont destructeurs  et sans  confirmation :  identifier la
> cible avec lsblk -f, par taille et modèle, avant chaque action.

> Démonter (umount) avant de formater  ou partitionner ; lsof/fuser pour trouver
> ce qui occupe un périphérique « busy ».

> GPT pour  tout nouveau disque (au-delà  de 2 To,  plus de 4  partitions) ; MBR
> seulement par contrainte de compatibilité.

> dd :  bs=4M pour la  vitesse, status=progress pour  le suivi,  conv=fsync pour
> garantir l'écriture. ddrescue sur un support défaillant.

> « Disque plein »  a  2 causes :  octets (df  -h, ncdu)  ou inodes  (df -i).
> Diagnostiquer les 2.

> Récupération : ne  plus écrire sur  le disque touché, l'imager  avec ddrescue,
> travailler sur la copie.
