---
title: "Disques, partitions et systèmes de fichiers"
description: "Runbook d'exploitation des opérations disques sous Linux : dd, mkfs, parted, ncdu. Opérations parmi les plus destructrices du système : le runbook insiste sur la vérification de la cible avant toute action."
tags: ["linux", "cli", "dd", "mkfs", "parted", "runbook", "disques", "systemes-fichiers"]
updated: 2026-06-18
validated: 2026-06-18
owner: "opérateur du système"
target: "Linux, util-linux, parted/GNU, e2fsprogs, dosfstools"
---

_Référence d'exploitation des opérations sur les disques sous Linux : écriture sectorielle et imagerie (dd), partitionnement GPT/MBR (parted), création de systèmes de fichiers (mkfs), analyse de l'espace (ncdu, du, df). Ces opérations sont parmi les plus destructrices du système : ce runbook insiste sur la vérification de la cible avant action. Cible un usage en ligne de commande sur systèmes Linux._

## Choisir le bon outil

| Besoin | Outil | Pourquoi |
|---|---|---|
| Copier un disque ou une image secteur | `dd`, `ddrescue` | Copie brute, bit à bit |
| Récupérer un disque défaillant | `ddrescue` | Tolère les erreurs de lecture |
| Partitionner (GPT moderne) | `parted` | Scriptable, GPT et MBR |
| Partitionner (interactif simple) | `cfdisk`, `fdisk` | Interface guidée |
| Créer un système de fichiers ext4 | `mkfs.ext4` | FS Linux par défaut |
| Créer un FS d'échange (clé USB) | `mkfs.vfat`, `mkfs.exfat` | Compatibilité multiplateforme |
| Voir ce qui remplit un disque | `ncdu` | Navigation interactive par taille |
| Espace libre par montage | `df -h` | Vue d'ensemble rapide |

> En une  phrase : lsblk  pour identifier, parted  pour partitionner,  mkfs pour
> formater, dd/ddrescue pour imager ou copier secteur à secteur, ncdu et df pour
> analyser   l'occupation.   Toutes   ces   actions,    sauf  l'analyse,    sont
> destructrices : vérifier la cible deux fois.

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

> L'espace  disque a  deux ennemis  distincts :  les octets  et  les inodes.  Un
> « disque plein » peut  venir de fichiers volumineux (df montre  les octets) ou
> d'une  multitude  de  petits  fichiers   épuisant  les  inodes  (  `df -i`  ).
> Diagnostiquer les deux ; ncdu trouve  les gros consommateurs d'octets, mais un
> manque d'inodes exige `df -i` et la chasse aux répertoires surpeuplés.

## Opérations standard

### Identifier les disques (préalable obligatoire)

```bash
lsblk -f                              # arbre disques/partitions, FS, montage, UUID
lsblk -o NAME,SIZE,MODEL,SERIAL       # identifier par taille, modèle, numéro de série
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
df -i                                 # espace en INODES (autre cause de « disque plein »)
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
# Tenter une récupération de données (voir aussi runbook archivage pour les images)
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

## Points clés à retenir

> dd,  mkfs et  parted sont destructeurs  et sans  confirmation :  identifier la
> cible avec lsblk -f, par taille et modèle, avant chaque action.

> Démonter (umount) avant de formater  ou partitionner ; lsof/fuser pour trouver
> ce qui occupe un périphérique « busy ».

> GPT pour  tout nouveau disque (au-delà  de 2 To,  plus de 4  partitions) ; MBR
> seulement par contrainte de compatibilité.

> dd :  bs=4M pour la  vitesse, status=progress pour  le suivi,  conv=fsync pour
> garantir l'écriture. ddrescue sur un support défaillant.

> « Disque plein »  a  deux causes :  octets (df  -h, ncdu)  ou inodes  (df -i).
> Diagnostiquer les deux.

> Récupération : ne  plus écrire sur  le disque touché, l'imager  avec ddrescue,
> travailler sur la copie.
