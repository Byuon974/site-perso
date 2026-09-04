---
title: "Copie, déplacement et synchronisation"
description: "Référence d'exploitation des outils de copie et de transfert d'arborescences sous Linux : duplication (cp), déplacement et renommage (mv), synchronisation incrémentale (rsync), transfert d'arborescence en flux (tar). Couvre les opérations courantes, le choix d'outil, le dépannage..."
tags: ["linux", "cli", "cp", "mv", "rsync", "tar", "runbook", "fichiers"]
updated: 2026-08-25
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux, GNU coreutils, rsync 3.x"
---

_Référence d'exploitation des outils de copie et de transfert d'arborescences sous Linux : duplication (cp), déplacement et renommage (mv), synchronisation incrémentale (rsync), transfert d'arborescence en flux (tar). Couvre les opérations courantes, le choix d'outil, le dépannage par symptôme et les pièges de préservation des métadonnées. Pour l'archivage et la compression détaillés, voir le runbook archivage. Cible un usage en ligne de commande sur systèmes Linux._

## Choisir le bon outil

```
Besoin                                    Outil               Pourquoi
──────────────                            ──────────────      ──────────────
Copier un fichier ou un dossier local     cp -a               Préserve les
                                                              métadonnées
Déplacer ou renommer                      mv                  Atomique sur le
                                                              même FS
Synchroniser deux arborescences           rsync               Delta, reprise,
                                                              miroir
Copier vers/depuis un hôte distant        rsync ou scp        rsync delta, scp
                                                              simple
Transférer une arbo en préservant tout    tar (pipe)          Liens,
                                                              permissions,
                                                              sparse
Copie miroir périodique (sauvegarde)      rsync               Incrémental,
                                                              --delete
Première copie d'une grosse arbo          tar (pipe)          Flux unique, pas
sur lien fiable                                               de coût/fichier
Copier des médias déjà compressés         rsync sans -z       Recompression
(FLAC, MP3, JPEG)                                             sans gain
Conserver une bibliothèque de médias      aucun conteneur     L'archive
                                                              concentre le
                                                              risque
Copier depuis exFAT, FAT32 ou NTFS        rsync -rt           -a grave des
                                          cp -r               droits fabriqués
Copier vers exFAT, FAT32 ou NTFS          rsync -rt           -a échoue en
                                                              code 23
```

> En une phrase :  cp -a pour copier en local, mv  pour déplacer/renommer, rsync
> pour  synchroniser  et  sauvegarder (local  ou  distant),  tar  en  pipe  pour
> transférer  une   arborescence  en  préservant  tout.   Détail   archivage  et
> compression dans le runbook dédié.

## Principes fondamentaux

> cp sans  option perd  des métadonnées.  Une  copie simple  ne préserve  ni les
> horodatages,  ni le  propriétaire, ni  les liens.  `cp -a`  (archive) conserve
> permissions,  dates, liens  symboliques et structure.  Pour une  copie fidèle,
> `-a` est le réflexe.

> Depuis un système de fichiers sans propriétaires, `-a` recopie une fiction.
> exFAT, FAT32 et NTFS ne stockent ni uid, ni gid, ni permissions Unix : ce que
> `stat` affiche vient des options `uid=`, `gid=` et `fmask=` du montage. `cp
> -a` et `rsync -a` propagent ces valeurs fabriquées vers une destination qui,
> elle, les grave dans ses inodes : tous les fichiers arrivent avec le même
> propriétaire et les mêmes droits uniformes. Dans ce sens, `-rt` suffit.

> `-t` est obligatoire dans toutes les copies rsync, y compris allégées. La
> comparaison rapide de rsync repose sur la taille et la date de modification :
> sans `-t`, la destination reçoit la date du transfert, la comparaison échoue à
> la passe suivante et l'arborescence entière repasse le lien. `-a` contient
> `-t` ; `-r` seul ne le contient pas, et c'est le piège de la forme allégée.

Composition de `-a`, pour décider quoi retirer selon la source :

```
Drapeau   Préserve                    Utile depuis exFAT/NTFS
────────  ──────────────────────      ──────────────────────────
-r        récursion                   oui
-t        dates de modification       oui, indispensable
-l        liens symboliques           non, la source n'en a pas
-p        permissions                 non, fabriquées au montage
-g        groupe                      non, fabriqué au montage
-o        propriétaire (root seul)    non, fabriqué au montage
-D        fichiers spéciaux           non, la source n'en a pas
```

> mv est atomique sur le même système de  fichiers, une copie sinon. Sur le même
> FS, mv ne  déplace que l'entrée de répertoire : instantané et  sûr. Entre 2
> FS, mv copie puis supprime, ce qui  n'est pas atomique et peut laisser un état
> partiel en cas d'interruption.

> cp rend la main avant que le support soit écrit. Les données transitent par le
> cache de pages : la fin de `cp` signale l'acceptation par le noyau, pas la
> persistance sur le média. `sync` ou `umount` déclenche l'écriture réelle, à la
> vitesse du support. Une copie de 20 Go instantanée suivie d'un `sync` de
> plusieurs minutes est le comportement normal, et retirer une clé entre les 2
> perd des données que `cp` a pourtant déclarées copiées. Le principe vaut aussi
> pour `mv` inter-FS : la suppression de l'original suit une copie dont rien ne
> garantit encore la persistance.

> rsync  ne transfère  que  les différences.  Après  une première  copie,  rsync
> compare  source  et  destination  et   ne  transmet  que  les  blocs  modifiés
> (algorithme delta).  C'est ce qui  le rend efficace pour  les synchronisations
> répétées et reprenable après coupure.

> Le slash final de la source change  tout en rsync. `rsync src/ dest/` copie le
> contenu de  src dans dest ; `rsync src dest/`  copie le dossier src  dans dest
> (créant  dest/src).  Cette  nuance est  la  première  cause d'arborescence  en
> double ou mal placée.

> tar   en  pipe   préserve   ce  que   cp   et  scp   perdent.   Le   transfert
> `tar -cf - | tar -xf -` conserve liens  symboliques, permissions, propriétaire
> et fichiers spéciaux, là où scp suit  les liens et ignore les fichiers device.
> Voir le runbook archivage pour le détail.

> Vérifier l'espace  et la cible  avant un gros  transfert. Un  transfert avorté
> faute  d'espace  laisse  une   copie  partielle.   Contrôler  `df -h`  sur  la
> destination, et pour  rsync, employer `--dry-run` afin de prévoir  ce qui sera
> transféré ou supprimé.

> Recompresser un média déjà compressé ne rapporte rien. MP3, AAC, Opus, FLAC et
> JPEG sortent compressés de leur encodeur : les repasser dans gzip, zstd ou
> `rsync -z` produit un gain sous 2 % pour un coût CPU mesurable. La liste par
> défaut de `--skip-compress` protège mp3, mp4, ogg, avi et jpg : elle ne couvre
> pas flac, à déclarer à la main quand `-z` est imposé par ailleurs.

> Une archive compressée concentre le risque de corruption. Un octet corrompu
> dans un fichier audio nu abîme quelques millisecondes de son : le fichier
> reste jouable, les autres sont intacts. Le même octet dans un flux compressé
> en solide (tar.gz, tar.zst, 7z par défaut) désynchronise le décodeur et rend
> illisible tout ce qui suit. Conservation : arborescence nue. Le conteneur sert
> au transport, pas au stockage.

Portée d'un octet corrompu selon le conteneur :

```
Conteneur                 Portée du dégât         Réparation possible
──────────────────        ──────────────────      ──────────────────────
Fichier nu                1 fichier, quelques     PAR2, ou restauration
                          millisecondes d'audio   depuis une copie
tar non compressé         1 fichier               Structure en blocs de
                                                  512 o, reste analysable
tar.gz / tar.zst / .xz    tout ce qui suit        aucune
zip (deflate/fichier)     1 fichier               index de fin
                                                  reconstructible
7z solide (défaut)        tout le bloc solide     aucune, sauf -ms=off
```

La détection et la réparation de la corruption silencieuse (sommes de contrôle
du système de fichiers, parité PAR2, manifestes) relèvent du runbook archivage.
Repères pour choisir avant d'y aller :

```
Mécanisme                    Détecte    Répare     Prérequis
──────────────────           ────────   ────────   ──────────────────
ZFS / Btrfs + scrub          oui        oui        redondance (miroir,
                                                   RAID-Z, copies=2)
Parité PAR2 (-r10)           oui        oui        10 % d'espace en plus
Manifeste sha256sum          oui        non        une copie de secours
flac -t                      oui        non        fichiers FLAC
```

## Opérations standard

### Copier (cp)

```bash
cp fichier copie                   # copie simple (perd des métadonnées)
cp -a source/ dest/                # archive : préserve tout (réflexe)
cp -r dossier/ dest/               # récursif
cp -i fichier dest/                # demande avant d'écraser
# copie seulement si la source est plus récente
cp -u source dest
# copie légère (CoW) sur Btrfs/XFS si possible
cp --reflink=auto gros dest
cp -v source dest                  # verbeux
```

État attendu :  la copie existe à  destination. `cp -a` est la  copie fidèle par
défaut. Sur un  système de fichiers CoW (Btrfs, XFS),  `--reflink=auto` crée une
copie instantanée partageant les blocs jusqu'à modification.

### Déplacer et renommer (mv)

```bash
mv ancien nouveau                  # renomme (même répertoire)
mv fichier /autre/dossier/         # déplace
mv -i source dest                  # demande avant d'écraser
mv -n source dest                  # n'écrase jamais
mv -v *.txt /archives/             # verbeux, plusieurs fichiers
```

État attendu : le fichier  est à sa nouvelle place ou sous  son nouveau nom. Sur
le même FS,  l'opération est atomique.  Entre 2 FS (par exemple  vers une clé
USB), mv  copie puis supprime :  une interruption peut laisser  les 2 copies,
vérifier avant de considérer l'original comme parti.

### Synchroniser (rsync)

```bash
rsync -av source/ dest/                    # archive + verbeux (local)
# vers un hôte distant, avec suivi
rsync -av --progress source/ user@hôte:/dest/
# miroir EXACT (supprime à destination)
rsync -av --delete source/ miroir/
rsync -av --dry-run --delete source/ dest/ # SIMULE : montre sans rien faire
rsync -avz source/ user@hôte:/dest/        # -z compresse pendant le transfert
rsync -av --exclude='*.tmp' --exclude='.git/' source/ dest/   # exclusions
# reprise de gros fichiers
rsync -av --partial --append-verify gros user@hôte:/dest/
# depuis ou vers un support sans propriétaires, barre unique pour le transfert
rsync -rtv --info=progress2 /mnt/usb/OST /mnt/stockage
```

État attendu :  la destination  reflète la source,  seuls les  changements étant
transférés. Toujours  lancer `--delete` en  `--dry-run` d'abord : combiné  à une
mauvaise barre oblique, il peut effacer la mauvaise arborescence. `-z` est utile
sur réseau lent, inutile en local rapide.

Le suivi se choisit selon la granularité de l'arborescence :

```
Forme                Affichage                     Apporte --partial
──────────────────   ───────────────────────────   ─────────────────
-P                   une barre par fichier         oui
--info=progress2     une barre pour l'ensemble     non
```

`-P` sert sur un gros fichier unique, où la reprise compte et où la barre reste
lisible. Sur plusieurs milliers de petits fichiers, elle défile sans rien
apprendre : `--info=progress2` donne alors le pourcentage et le débit global.

### Transférer une arborescence en flux (tar)

```bash
# Local : copier en préservant tout (liens, permissions, sparse)
tar -cf - -C /source . | tar -xf - -C /destination

# Distant : via SSH, sans fichier intermédiaire
tar -czf - /source/ | ssh user@hôte "tar -xzf - -C /destination/"
```

État attendu : l'arborescence est recréée à l'identique, métadonnées préservées.
C'est la  méthode quand cp  ou scp perdent des  liens ou des  fichiers spéciaux.
Pour   les   options   d'archivage   et  de   compression,    se   reporter   au
runbook archivage.

### Transférer une bibliothèque de médias déjà compressés

```bash
# Première copie, lien fiable : flux unique, débit maximal, aucun fichier
# d'archive intermédiaire écrit sur disque
tar -cf - -C /source/musique . | ssh hôte "tar -xf - -C /destination/musique"

# Copies suivantes : incrémental et reprenable
rsync -aP --whole-file /source/musique/ hôte:/destination/musique/

# Lien de confiance : chiffrement allégé, compression SSH désactivée
rsync -aP --whole-file \
      -e "ssh -T -c aes128-gcm@openssh.com -o Compression=no" \
      /source/musique/ hôte:/destination/musique/

# Si -z est imposé par une politique : exclure flac de la compression
rsync -azP --skip-compress=flac/gz/jpg/mp3/mp4/ogg/zip \
      /source/musique/ hôte:/destination/musique/

# Vérifier l'intégrité du signal audio après transfert (FLAC uniquement)
find /destination/musique -name '*.flac' -exec flac -t {} +
```

État attendu : l'arborescence  est recréée à l'identique  côté destination, et
`flac -t`  sort  sans  erreur  sur  chaque  fichier.  `--whole-file`  désactive
l'algorithme  delta,  inutile  sur  des fichiers  qui  ne  changent  jamais par
fragments : le  gain est  net sur  réseau local.  L'empreinte MD5  du signal
décodé est stockée dans l'en-tête FLAC, ce qui rend le contrôle autonome, sans
manifeste externe.

Choix de l'outil selon la passe :

```
   Passe 1 (bibliothèque vide)   ──>  tar en pipe      débit brut maximal
                                          │
                                          v
   Passes 2..n (ajouts, tags)    ──>  rsync --whole-file
                                          │
                                          └──> seuls les nouveaux albums
                                               traversent le lien
```

## Dépannage par symptôme

### rsync a créé un sous-dossier en trop (dest/src/...)

Symptôme :  les fichiers se  retrouvent dans dest/src/  au lieu de  dest/. Cause
probable : absence de  barre oblique finale sur la source.  Correction : ajouter
le slash final pour copier le contenu.

```bash
rsync -av source/ dest/        # contenu de source DANS dest
# et non : rsync -av source dest/   (qui crée dest/source/)
```

### rsync --delete a effacé des fichiers à conserver

Symptôme : des fichiers  de la destination ont disparu après  un rsync --delete.
Cause probable : --delete supprime tout ce qui n'est pas dans la source ; source
mal ciblée. Correction : toujours simuler avant.

```bash
rsync -av --dry-run --delete source/ dest/   # vérifier la liste avant
```

### La copie perd les permissions ou les dates

Symptôme : après cp,  les fichiers ont une date ou des  droits différents. Cause
probable :   cp   simple  ne   préserve   pas  les   métadonnées.   Correction :
utiliser -a (archive).

```bash
cp -a source/ dest/
stat source/fichier dest/fichier   # comparer pour confirmer
```

### mv entre 2 disques laisse l'original

Symptôme : après un  mv vers un autre point de montage,  l'original est toujours
là. Cause probable :  mv inter-FS copie puis supprime ;  une erreur a interrompu
la  suppression.   Correction :  vérifier  l'intégrité  de  la  copie  avant  de
supprimer manuellement.

```bash
diff -r source dest && rm -rf source   # supprimer seulement si identique
```

### rsync sort en code 23 avec « failed to set permissions »

Symptôme : le transfert vers un point de montage exFAT, FAT32 ou NTFS se termine
en code 23, chaque fichier signalant `Operation not permitted` sur les
permissions ou le groupe. Cause probable : `-a` demande la préservation de
droits qu'un système de fichiers sans propriétaires ne sait pas stocker.
Correction : retirer les composantes inapplicables.

```bash
findmnt -no FSTYPE /mnt/usb                       # confirmer le type
rsync -rtv --info=progress2 source/ /mnt/usb/     # sans -p, -o, -g, -l, -D
rsync -av --no-perms --no-owner --no-group --no-links source/ /mnt/usb/
```

État attendu : code de sortie 0, et `stat` à destination affiche les droits
uniformes fabriqués par les options de montage du support.

### rsync retransfère tout à chaque passe alors que rien n'a changé

Symptôme : la seconde exécution transfère le même volume que la première.
Cause probable : `-t` absent, donc dates de modification non préservées et
comparaison rapide impossible. Correction : ajouter `-t`, présent d'office dans
`-a`.

```bash
# Vérification en 4 commandes, à rejouer avant de dater la validation
mkdir -p /tmp/src /tmp/dst && head -c 20M /dev/urandom > /tmp/src/f.bin
rsync -r  --stats /tmp/src/ /tmp/dst/ | grep 'files transferred'
rsync -r  --stats /tmp/src/ /tmp/dst/ | grep 'files transferred'   # attendu : 1
rsync -rt --stats /tmp/src/ /tmp/dst/ | grep 'files transferred'   # attendu : 0
```

État attendu : la troisième ligne renvoie 1, la quatrième 0. Une troisième ligne
à 0 signifierait que la version installée compare autrement : réviser ce
paragraphe dans ce cas.

### cp se termine en quelques secondes, umount met plusieurs minutes

Symptôme : une copie de plusieurs gigaoctets rend la main presque
immédiatement, puis `sync` ou `umount` paraît bloqué. Cause probable :
l'écriture réelle a lieu pendant le `sync`, à la vitesse du support.
Correction : suivre la vidange du cache plutôt qu'interrompre.

```bash
watch -n1 grep -E 'Dirty|Writeback' /proc/meminfo
sync -f /mnt/usb                                  # vider ce seul FS
sudo umount /mnt/usb
```

État attendu : `Dirty` décroît jusqu'à quelques centaines de kilo-octets, puis
`umount` rend la main sans délai. Sur disque externe, enchaîner par `udisksctl
power-off -b /dev/sdX` (voir le runbook périphériques et matériel).

### « rsync: command not found » sur l'hôte distant

Symptôme :  rsync échoue en  signalant la commande  absente côté distant.  Cause
probable :  rsync  n'est pas  installé  sur  la machine  distante.  Correction :
installer rsync des 2 côtés (il doit exister sur les 2 hôtes).

### Le débit plafonne loin de la capacité du lien sur des milliers de fichiers

Symptôme : `--progress`  affiche un  débit bas  alors que  le lien  est rapide,
et  l'arborescence  contient  beaucoup  de  petits  fichiers.  Cause probable :
le coût  par fichier (négociation,  création, écriture des  métadonnées) domine
le temps de transfert. Corrections, par ordre d'effet :

```bash
# 1. Compter avant de conclure : le symptôme suppose beaucoup de fichiers
find /source/musique -type f | wc -l

# 2. Paralléliser sur des sous-arborescences distinctes
ls -d /source/musique/*/ | xargs -P 3 -I{} rsync -a {} hôte:/destination/

# 3. Première copie seulement : basculer sur le pipe tar
tar -cf - -C /source/musique . | ssh hôte "tar -xf - -C /destination/musique"
```

Sur clé USB ou disque externe en FAT32 ou exFAT, le coût des métadonnées est
structurel : vérifier le système de fichiers avant d'incriminer le transfert.

```bash
findmnt -no FSTYPE /point/de/montage
```

## Problèmes connus et contournements

### rsync et les liens durs

Par défaut, rsync ne  préserve pas les liens durs (2 noms  pour le même inode
deviennent 2 fichiers).  Ajouter `-H` ( `--hard-links` )  pour les conserver,
au prix d'un surcoût de calcul.

### Transfert tar via SSH pollué par le .bashrc distant

Si le  ~/.bashrc distant écrit sur  stdout, il corrompt  le flux tar.  Forcer un
shell  non   interactif :   `ssh hôte "bash --norc --noprofile -c 'tar ...'"`  .
Détail dans le runbook archivage.

### rsync n'agrège pas les fichiers en un flux unique

Comportement  structurel.  Aucune  option  ne  change  cela.  rsync  ouvre  1
seule  connexion  et  y  fait  circuler  les  fichiers  successivement,  chacun
avec ses  métadonnées.  Cette granularité  par fichier  est ce  qui autorise  la
reprise  après  coupure,  le  saut  des  fichiers  déjà  présents  et  le
transfert  delta :  un  tar  est  opaque,  donc  incomparable  côté  récepteur.

Contournement quand seul le débit brut compte : le pipe tar. Il perd la reprise
et l'incrémental, ce qui le réserve à la première copie.

## Traitement par lots

```bash
shopt -s nullglob

# Copier chaque fichier vers une destination datée
for f in *.csv; do cp -a "$f" "/sauvegarde/$(date +%F)/${f}"; done

# Synchroniser plusieurs sources vers la même destination, une par une
for d in projet-*/; do
  rsync -a --delete "$d" "/sauvegarde/${d%/}/" || printf 'ÉCHEC: %s\n' "$d" >&2
done

# Vérifier après coup que chaque source a bien sa destination
for f in *.csv; do
  [[ -f "/sauvegarde/$(date +%F)/$f" ]] || printf 'MANQUE: %s\n' "$f"
done
```

Une boucle de copie ne remplace pas `rsync -a` sur une arborescence : elle sert
quand la destination change d'un fichier à l'autre.

---

## Pipelines utiles

```bash
# Simulation détaillée avant tout transfert destructif
rsync -aAXHn --delete --itemize-changes source/ destination/

# Différences de contenu seules, en ignorant horodatages et permissions
rsync -rin --checksum --no-perms --no-times source/ destination/

# Fichiers présents à la source et absents de la destination
rsync -rn --ignore-existing --out-format='%n' source/ destination/

# Transfert avec limite de débit et reprise
rsync -aAXH --partial --bwlimit=5m --info=progress2 source/ destination/

# Copie locale avec déduplication du système de fichiers si disponible
cp -a --reflink=auto grande-arborescence/ copie/

# Vérifier une copie sans la relire deux fois par un outil tiers
diff -qr source/ destination/ | head -20
```

Pour un dossier tenu à jour en continu dans les 2 sens plutôt qu'une copie
ponctuelle, voir runbook synchronisation-continue.

Synchroniser vers un partage monté n'est pas synchroniser vers un hôte distant :
les droits, la casse et les liens s'y comportent autrement. Voir runbook
partage-fichiers.

`--itemize-changes` explique chaque ligne par un code de 11 caractères, alors
que `--verbose` ne dit que le nom. Sur un `--delete`, la différence entre lire
`*deleting` et lire un nom seul est celle entre comprendre et espérer.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
rsync, publications et NEWS  https://www.samba.org/rsync/
rsync, avis de sécurité      https://download.samba.org/pub/rsync/NEWS
```

---

## Sécurité

> **Une copie privilégiée suit les liens qu'on lui donne à suivre.** Un
> utilisateur qui contrôle un seul composant du chemin source ou destination y
> place un lien symbolique, et `rsync` lancé en root lit ou écrit où le lien
> pointe. Le scénario ne demande ni réseau ni compte privilégié : il demande un
> répertoire partagé et une tâche planifiée qui passe dessus.

> **rsync 3.5.0 corrige 33 failles de cette famille.** Publiée le 13 août 2026
> à l'issue d'un audit du traitement des chemins et du protocole du démon, elle
> est qualifiée d'extraordinaire par ses auteurs. Une quinzaine des correctifs
> visent des courses entre la vérification et l'usage d'un chemin. Des
> rétroportages existent sur les branches 3.4.1 et 3.2.7 pour les
> distributions qui ne suivent pas la 3.5.

```bash
rsync --version | head -1
# 3.5.0, ou un rétroportage 3.4.1 / 3.2.7 portant les correctifs
```

Les 4 entrées qui changent une pratique :

```
Effet                                   Conséquence pratique
─────────────────────────────────       ─────────────────────────────────
Un --temp-dir ou un --link-dest         ne pas donner de chemin absolu à
absolu désactivait le confinement       ces options depuis une tâche
du renommage côté récepteur             privilégiée
Un lien dans un fichier de filtres      un fichier de filtres se traite
faisait lire un fichier arbitraire      comme du code : propriétaire root,
                                        non inscriptible par autrui
Un lien sur un composant parent         la racine d'un module de démon se
faisait sortir de la racine du module   vérifie, elle ne se suppose pas
Sur un démon en proxy protocol, un      ne pas activer proxy protocol sans
client direct forgeait son en-tête      filtrage réseau devant le démon
PROXY et usurpait son adresse
```

> **Le filtrage par hôte échoue désormais fermé.** Une entrée de refus qui ne
> se résout pas bloque au lieu de laisser passer. Un `hosts deny` qui
> fonctionnait par accident sur une résolution défaillante cessera de laisser
> entrer : c'est le comportement voulu, pas une régression.

3 gestes qui valent indépendamment de la version :

```bash
# 1. La source d'une copie privilégiée ne doit pas être inscriptible par autrui
find /chemin/source -maxdepth 3 \( -perm -002 -o -type l \) -ls | head

# 2. Préférer un chemin relatif au module pour les répertoires de travail
rsync -a --temp-dir=.rsync-tmp source/ dest/

# 3. Copier vers un répertoire dont on possède chaque composant du chemin
namei -l /chemin/destination
```

Voir le runbook liens-symboliques pour le mécanisme, et le runbook sauvegarde
pour le cas de la tâche planifiée en root.

---

## Points clés à retenir

Une copie privilégiée suit les liens qu'on lui donne : aucun composant du chemin
source ou destination ne doit être inscriptible par autrui.

`rsync --version` avant de reprogrammer une tâche en root : 3.5.0 corrige 33
failles, dont une quinzaine de cette forme.


> cp  -a pour  une copie  fidèle  (cp simple  perd dates,  droits,  liens).  Sur
> Btrfs/XFS, --reflink=auto pour une copie instantanée.

> Source ou destination exFAT, FAT32, NTFS : `-rt` et non `-a`. Les droits y
> sont fabriqués par le montage, et `-a` les grave à destination ou échoue en
> code 23.

> `-t` dans toutes les copies rsync, sans exception : sans lui, la relance
> retransfère l'arborescence entière au lieu de la comparer.

> `cp` rend la main sur le cache de pages : `sync -f` puis `umount` avant de
> retirer un support amovible, sous peine de perdre une copie déclarée faite.

> Le slash final en  rsync décide tout : source/ copie le  contenu, source copie
> le dossier. Première cause d'arborescence mal placée.

> rsync --delete fait  un miroir exact : toujours --dry-run  d'abord, sous peine
> d'effacer la mauvaise arborescence.

> mv est  atomique sur le  même FS, copie+suppression  entre 2 FS :  vérifier
> avant de considérer l'original comme déplacé.

> tar  en  pipe  préserve   liens,  permissions  et   fichiers  spéciaux  là  où
> cp et scp les perdent.

> rsync  ne transfère  que  les différences  (delta)  et  reprend après  coupure
> (--partial) : l'outil des sauvegardes et synchronisations répétées.

> Média  déjà  compressé :  ne  pas  ajouter  `-z`.  La  liste  par  défaut  de
> `--skip-compress` ignore flac, à déclarer à la main si `-z` est imposé.

> Première copie  d'une grosse arborescence :  pipe tar. Copies  suivantes  :
> `rsync --whole-file`. Mélanger les 2 dans le mauvais ordre coûte du débit.

> Conservation d'une bibliothèque : arborescence nue. Un octet corrompu dans un
> tar.gz ou un 7z solide emporte tout ce qui suit.

> Après transfert d'une bibliothèque FLAC : `flac -t` sur l'arborescence cible.
> L'empreinte du signal est dans l'en-tête, aucun manifeste externe requis.
