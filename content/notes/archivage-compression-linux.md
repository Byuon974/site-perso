---
title: "Archivage et compression sous Linux"
description: "Référence d'exploitation des 5 outils d'archivage et de compression courants sous Linux : création, extraction, inspection, mise à jour, chiffrement, transfert, sauvegarde, dépannage par symptôme, sécurité, urgence et récupération. Couvre tar (archivage Unix et streaming), zip/un..."
tags: ["linux", "cli", "tar", "zip", "gzip", "7z", "runbook", "archivage"]
updated: 2026-06-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux (Arch/Artix, Debian, RHEL), GNU tar, InfoZip, 7zip"
---

_Référence d'exploitation des 5 outils d'archivage et de compression courants sous Linux : création, extraction, inspection, mise à jour, chiffrement, transfert, sauvegarde, dépannage par symptôme, sécurité, urgence et récupération. Couvre tar (archivage Unix et streaming), zip/unzip (interopérabilité), 7-Zip (compression et chiffrement), rar/unrar (format propriétaire) et gzip (compression de flux et de fichiers individuels). Cible un usage en ligne de commande sur systèmes Linux._

## Choisir le bon outil

Le choix de  l'outil se décide sur l'usage réel :  interopérabilité, métadonnées
Unix, ratio de compression, chiffrement, accès aléatoire.

```
Besoin                                  Outil recommandé    Pourquoi
──────────────                          ──────────────      ──────────────
Sauvegarde système Linux                tar (ou tar|7z)     Préserve
                                                            permissions, owner,
(permissions, liens, owner)                                 liens, xattrs,
                                                            sparse
Streaming réseau, pipeline SSH          tar                 Flux séquentiel, pas
                                                            d'index
Archive incrémentale (niveaux)          tar --listed-       Snapshot des
                                                            fichiers modifiés
                                        incremental
Échange multiplateforme simple          zip                 Lu partout, accès
                                                            sélectif
Mise à jour fréquente de membres        zip                 Index central, ajout
                                                            sans
                                                            tout réécrire
Meilleur ratio de compression           7z (LZMA2)          Compression solide
                                                            inter-fichiers
Chiffrement réel (AES-256 + noms)       7z -mhe=on          ZipCrypto est cassé,
                                                            RAR fermé
Accès aléatoire à un membre             zip ou 7z non solide Index, pas de scan
                                        complet
Réception d'une archive .rar            unrar               Extraction seule
                                                            sous Linux
Archivage long terme interopérable      tar.zst / tar.gz    Formats ouverts,
                                                            pérennes
                                        ou 7z
Compresser un seul fichier ou flux      gzip                Mono-flux, idéal
                                                            texte/logs/CSV
Compresser un répertoire en .tar.gz     tar + gzip          tar assemble, gzip
                                                            compresse
Append à un log compressé               gzip -c >>          Flux .gz
                                                            concaténables
Accélérer gzip sur gros volumes         pigz                Multithread, format
                                                            .gz identique
```

> En une phrase :  tar pour sauvegarder et streamer du Linux,  zip pour échanger
> et mettre  à jour,  7z  pour compresser fort  et chiffrer,  rar  uniquement en
> réception, gzip pour compresser un fichier ou un flux unique. Pour l'archivage
> pérenne,    préférer  les   formats   ouverts  (tar.zst,    tar.gz,   7z)   au
> format propriétaire RAR.

## Principes fondamentaux

Ces  règles  fondent un  usage  correct  et  évitent les  erreurs  destructrices
(écrasement, perte de métadonnées, corruption de flux).

> Archivage  et compression  sont 2  fonctions distinctes.  tar regroupe  les
> fichiers en  un flux  séquentiel sans les  compresser ; la  compression (gzip,
> bzip2,  xz,  zstd) est  un filtre  appliqué au  flux entier.  Une archive  tar
> compressée ne peut être ni parcourue ni modifiée sans décompression intégrale.
> Les formats  zip et  7z compressent  au contraire fichier  par fichier  ou par
> bloc, avec un index.

> L'index change tout pour l'accès. zip et 7z (non solide) maintiennent un index
> qui permet d'extraire un seul fichier ou  de lister le contenu sans tout lire.
> tar n'a pas  d'index : lister ou extraire  impose de lire depuis le  début. Ce
> modèle   séquentiel  rend   tar  idéal   pour  le   streaming  et   inefficace
> pour l'accès aléatoire.

> L'extraction  écrase sans  prévenir,  et  le  chemin compte.   tar écrase  les
> fichiers existants  silencieusement.  Un chemin  absolu stocké  dans l'archive
> peut  réécrire des  fichiers système  à l'extraction.  GNU tar  retire le  `/`
> initial  avec un  avertissement,  mais ce  comportement  n'est pas  universel.
> Toujours  inspecter   une  archive  avant   de  l'extraire  et   contrôler  le
> répertoire de base avec `-C` .

> Les métadonnées  Unix ne sont pas  toutes préservées par défaut.  tar conserve
> permissions, propriétaire,  groupe et mtime,  mais pas les ACL,  les attributs
> étendus  (xattrs)  ni   les  contextes  SELinux  sans   options  explicites  (
> `--acls --xattrs --selinux` ). zip ne  préserve pas setuid/setgid/sticky. Pour
> une vraie sauvegarde  système, tar avec  ces options, ou le  pipe `tar | 7z` ,
> est la seule voie correcte.

> La compression solide améliore le ratio mais fragilise. En mode solide (défaut
> du format  7z, option  des RAR),  les fichiers sont  compressés comme  un flux
> unique : meilleur ratio,  mais un octet corrompu peut perdre tout  le bloc, la
> mise  à  jour devient  impossible,  et  extraire  un  seul fichier  impose  de
> décompresser tout ce qui précède. Pour les archives à mettre à jour ou dont la
> résilience prime, désactiver le solide ( `-ms=off` ).

> Tester avant de supprimer l'original. Une archive se vérifie après création et
> avant  toute suppression  des sources :  `tar -tf`  ,  `unzip -t` ,  `7z t`  ,
> `unrar t` . Une archive chiffrée se teste  aussi (avec le mot de passe). Cette
> vérification est la dernière barrière avant une perte de données silencieuse.

> gzip compresse un flux unique et supprime  l'original par défaut. gzip ne crée
> pas d'archive multi-fichiers : il transforme un  fichier en un `.gz` et efface
> la  source,   sans  fichier  temporaire  intermédiaire.  Pour  un  répertoire,
> l'assembler d'abord avec tar  ( `tar czf archive.tar.gz dossier/` ). Conserver
> l'original impose `-k` ou la redirection  `-c >` . Pour les fichiers critiques
> non sauvegardés, `--synchronous` force le flush disque et évite de perdre à la
> fois l'original et le `.gz` en cas de crash.

> Les flux gzip  sont concaténables, et  `gzip -l` ment au-delà de 4  Go. Coller
> 2  `.gz` (  `cat a.gz b.gz > ab.gz` )  produit  un gzip  valide que  gunzip
> décompresse  en  séquence,   ce  qui  permet  l'append  atomique  aux  logs  (
> `gzip -c nouveau >> archive.gz` ).  En revanche, `gzip -l`  affiche une taille
> fausse pour un original  de plus de 4 Go (champ ISIZE modulo  2^32) et pour un
> fichier multi-membres  (dernier membre  seulement) : la  taille réelle  se lit
> avec `zcat fichier.gz | wc -c` .

## Opérations standard

Les  opérations sont  présentées par  tâche, avec  la commande  de chaque  outil
concerné. Choisir l'outil selon le tableau ci-dessus.

### Créer une archive

```bash
# tar : archivage Unix, compression par filtre (-C contrôle le chemin de base)
tar -czf archive.tar.gz -C /home/user data/      # gzip
# xz (meilleur ratio, plus lent)
tar -cJf archive.tar.xz -C /home/user data/
# zstd (rapide, multithread)
tar --zstd -cf archive.tar.zst -C /home/user data/

# zip : récursif, niveau de compression, exclusion de patterns
zip -r archive.zip /chemin/source -x "*/node_modules/*" "*.log"
# stockage seul (déjà compressés)
zip -r -0 media.zip /dossier/videos

# 7z : meilleur ratio (LZMA2), niveau -mx, solide -ms
7z a -t7z -mx=5 archive.7z /source/               # usage courant
7z a -t7z -mx=9 -ms=on archive.7z /source/        # archivage long terme

# rar : création (outil propriétaire requis)
rar a archive.rar /source/

# gzip : compresser un fichier unique (pas un répertoire)
gzip -k fichier.log                               # garde l'original (-k)
gzip -c fichier.log > fichier.log.gz              # vers stdout, original intact
# ratio max (gain marginal vs -6)
gzip -9 fichier.log
```

État  attendu :  le fichier  d'archive  est créé.  Vérifier  sa structure  avant
distribution avec `tar -tf` , `unzip -l` ,  `7z l` ou `unrar l` . Le niveau `-0`
(zip) ou `-mx=0`  (7z) évite de recompresser des fichiers  déjà compressés (MP4,
JPEG, archives), gain nul pour un coût CPU réel.

### Inspecter sans extraire

```bash
tar -tvf archive.tar.gz                  # liste détaillée
unzip -l archive.zip                     # noms et tailles
# détails complets (méthode, CRC, permissions)
zipinfo archive.zip
7z l -slt archive.7z                     # liste avec détails techniques
unrar l archive.rar                      # liste (sans extraction, sûr)
zipgrep "motif" logs.zip "*.log"         # grep dans les membres sans extraire
gzip -tv fichier.log.gz                  # tester le CRC32 d'un .gz
# taille/ratio (FAUX si original > 4 Go)
gzip -lv fichier.log.gz
zgrep "ERROR" fichier.log.gz             # grep dans un .gz sans décompresser
```

État attendu :  le contenu s'affiche sans  rien écrire sur le  disque. Inspecter
est  le réflexe  de  sécurité avant  toute  extraction  d'une archive  d'origine
incertaine.  Pour un `.gz`  de plus de  4 Go décompressé,  ignorer la  taille de
`gzip -l` et utiliser `zcat fichier.gz | wc -c` .

### Extraire une archive

```bash
# tar : autodétection de la compression sur GNU tar récent
tar -xf archive.tar.gz -C /destination/
# sauvegarde système
tar -xpf archive.tar.gz --acls --xattrs --selinux -C /destination/

# zip : contrôle de l'écrasement
unzip archive.zip -d /destination/       # demande avant d'écraser
unzip -o archive.zip -d /destination/    # écrase sans demander
unzip -n archive.zip -d /destination/    # n'écrase jamais

# 7z : x préserve l'arborescence, e extrait à plat
7z x archive.7z -o/destination/

# rar : extraction avec arborescence
unrar x archive.rar /destination/

# gzip : décompresser un .gz (supprime le .gz par défaut)
gunzip fichier.log.gz                    # restaure fichier.log, efface le .gz
gunzip -k fichier.log.gz                 # garde le .gz
# vers une destination, .gz intact
zcat fichier.log.gz > /destination/fichier.log
```

État attendu :  les fichiers  apparaissent dans le  répertoire cible.  Sans `-C`
(tar) ou `-d` (zip), l'extraction a lieu dans le répertoire courant, ce qui peut
écraser des fichiers. Toujours fixer la destination explicitement.

### Mettre à jour une archive existante

```bash
# tar : possible UNIQUEMENT sur archive non compressée
tar -rf archive.tar nouveau_fichier.txt          # ajouter
tar --delete -f archive.tar chemin/fichier.txt   # supprimer (GNU tar)

# zip : ajout et mise à jour natifs (index central)
zip archive.zip nouveau_fichier.txt              # ajouter ou remplacer
zip -d archive.zip "obsolete/*.log"              # supprimer

# 7z : update (impossible sur archive solide)
7z u archive.7z /source/
7z d archive.7z "obsolete/*.log"
```

État  attendu :  l'archive  est  modifiée  sans  recréation  complète.  Sur  tar
compressé (  `.tar.gz` , `.tar.xz` ,  `.tar.zst` ) et  sur 7z solide, la  mise à
jour échoue : décompresser, modifier, recompresser, ou recréer l'archive.

### Transférer une arborescence par pipeline SSH (tar)

```bash
# Copier un répertoire vers un serveur distant sans fichier intermédiaire
tar -czf - /chemin/source/ |
  ssh user@serveur "tar -xzf - -C /chemin/destination/"
# Sans compression sur réseau local rapide (le CPU est le goulot)
tar -cf - /chemin/source/ | ssh user@serveur "tar -xf - -C /chemin/destination/"
# Avec barre de progression
tar -cf - /src/ |
  pv -s "$(du -sb /src/ | awk '{print $1}')" |
  gzip | ssh user@serveur "cat > /sauvegarde/src.tar.gz"
```

État  attendu :  l'arborescence  est  recréée  à distance  en  préservant  liens
symboliques, permissions  et fichiers spéciaux,  ce que  `scp` ne fait  pas. Sur
réseau   gigabit,     omettre   la    compression   peut   doubler    le   débit
quand le CPU limite.

### Sauvegarde système et incrémentale (tar)

```bash
# Sauvegarde complète avec métadonnées, via pipe vers 7z pour le ratio
tar cf - /data/ | 7z a -si -mx=5 /backups/data_$(date +%Y%m%d).tar.7z
# Restaurer
7z x -so /backups/data_20260618.tar.7z | tar xf - -C /restore/

# Incrémentale par snapshot
# niveau 0
tar --listed-incremental=/backup/data.snar -czf /backup/full.tar.gz /source/
# niveau 1
tar --listed-incremental=/backup/data.snar -czf /backup/incr1.tar.gz /source/
```

État attendu : la sauvegarde complète crée le fichier snapshot ( `.snar` ) ; les
incrémentales  ne capturent  que  les fichiers  modifiés depuis.  Restaurer  une
chaîne incrémentale  impose d'extraire  les archives  dans l'ordre,  de  la plus
ancienne  à   la  plus  récente.   Si  le  `.snar`   est  perdu,   la  prochaine
sauvegarde sera complète.

### Chiffrer une archive

```bash
# 7z : AES-256, chiffrement des noms de fichiers avec -mhe=on (RECOMMANDÉ)
7z a -p -mhe=on archive_securisee.7z /donnees/
7z t archive_securisee.7z -p                     # tester (obligatoire)

# zip : ZipCrypto FAIBLE, à éviter pour des données sensibles
# saisie interactive du mot de passe
zip -r -e archive.zip /donnees

# Alternative robuste : chiffrer une archive avec GPG après création
tar -czf - /donnees/ | gpg -c > archive.tar.gz.gpg
```

État attendu :  l'archive  est chiffrée.  Ne jamais  passer le  mot de  passe en
argument  ( `-P motdepasse`  ,  `-p'mdp'` ) :  il  est visible  dans `ps aux`  ,
`/proc/*/cmdline` et  l'historique shell.  Toujours la saisie  interactive. Pour
des données sensibles, préférer 7z AES-256  (avec `-mhe=on` qui masque aussi les
noms) ou GPG ; le ZipCrypto natif est cryptographiquement cassé.

### Archives fractionnées et multi-volumes

```bash
zip -r -s 30m archive.zip dossier/               # zip : volumes de 30 Mo
7z a -v500m -mx=5 backup.7z /dataset/            # 7z : volumes de 500 Mo
7z x backup.7z.001                               # extraction (pointer le .001)
```

État  attendu :  l'archive  est  découpée  en  volumes  numérotés.  L'extraction
requiert que  tous les volumes  soient présents dans  le même répertoire,  et se
lance depuis le premier ( `.001` ou `.part1` ).

### Opérations spécifiques à gzip (flux, logs, rsync)

```bash
# Append atomique à un log compressé (les flux .gz sont concaténables)
gzip -c nouveau.log >> archive.log.gz

# Compression compatible rsync : ne retransmet que les blocs modifiés
# coût ~1% de taille, gros gain en bande passante
gzip --rsyncable fichier.log

# Compression sûre contre les crashs (fsync avant suppression de l'original)
gzip --synchronous fichier_critique.log

# Opérer directement sur des .gz sans fichier temporaire
zgrep "ERROR" app.log.gz                 # grep
zless app.log.gz                         # pagination
zdiff v1.log.gz v2.log.gz                # diff entre deux archives

# Accélérer sur gros volumes : pigz, remplacement drop-in multithread
pigz -p 4 gros_fichier.log               # 4 threads, format .gz standard
pigz -p 4 --rsyncable gros_fichier.log
```

État  attendu :  ces  opérations  produisent  ou  lisent  des  `.gz`  standards.
`--rsyncable`  réinitialise périodiquement  l'état  DEFLATE  pour qu'une  petite
modification ne change  pas tout le fichier,  ce qui est  indispensable pour les
archives synchronisées par rsync. `--synchronous` protège les fichiers critiques
non sauvegardés : sans lui, un crash entre  la fin de la compression et le flush
disque peut perdre  à la fois l'original (déjà supprimé) et  un `.gz` incomplet.
`pigz` produit un format identique à gzip, décompressable par gunzip.

## Dépannage par symptôme

### « This does not look like a tar archive » ou « not in gzip format »

Symptôme :  tar  refuse d'ouvrir  l'archive,  ou  l'option  de décompression  ne
correspond  pas. Cause  probable :  le format  réel diffère  de l'extension,  ou
l'archive  n'est pas  du  tar.  Correction :  identifier  le format  réel,  puis
utiliser l'option correspondante.

```bash
file archive.tar.gz       # "gzip compressed data", "XZ", "Zstandard"...
# GNU tar récent détecte seul ; forcer -z/-j/-J en script portable
tar -xf archive.tar.gz
```

### « Removing leading '/' from member names »

Symptôme : avertissement à  la création d'une archive avec  des chemins absolus.
Cause  probable :  GNU tar  retire  le `/`  initial  par sécurité,  pour  éviter
d'écraser  des   fichiers  système  à   l'extraction.   Correction :   c'est  un
avertissement, pas une erreur. Pour contrôler le chemin de base, utiliser `-C` .

```bash
tar -czf backup.tar.gz -C /home/user data        # au lieu de /home/user/data
```

### L'archive zip est corrompue, unzip refuse de l'extraire

Symptôme :  « End-of-central-directory  signature not  found »  ou « zipfile  is
corrupt ».  Cause probable :  l'index central  en fin  de fichier  est endommagé
(troncation,  transfert  incomplet).   Correction :  tester,  puis  reconstruire
l'index depuis les en-têtes locaux.

```bash
unzip -t archive.zip 2>&1 | tee diagnostic.log
zip -F archive.zip --out reparee.zip       # reconstruction légère
# reconstruction agressive (scan octet par octet)
zip -FF archive.zip --out reparee.zip
unzip reparee.zip -d /destination/recuperation/
```

`-FF` peut  produire des membres fantômes  mais récupère souvent ce  que `-F` ne
peut pas. Si le support physique est suspect, imager d'abord avec `ddrescue` .

### Noms de fichiers corrompus après extraction (caractères illisibles)

Symptôme : les  noms contiennent des  caractères graphiques DOS ou  des symboles
illisibles.  Cause  probable :  archive  créée sous  Windows  ou  macOS avec  un
encodage  autre  qu'UTF-8 ;  unzip  interprète  en CP437.   Correction :  forcer
l'encodage à l'extraction, ou passer par 7z, ou renommer après coup.

```bash
unzip -O CP1252 archive_windows.zip -d /destination/      # patch Debian/Ubuntu
unzip -O Shift_JIS archive_japonaise.zip -d /destination/
# 7z gère mieux les encodages
7z x archive.zip -o/destination/
# renommage après extraction
convmv --notest -f cp1252 -t utf-8 -r /destination/
```

### Extraction très lente, CPU saturé à 100 %

Symptôme :  la  décompression  sature  un  cœur,   le  débit  s'effondre.  Cause
probable : la décompression xz et  bzip2 est monothread par défaut. Correction :
utiliser les variantes multithread, ou préférer zstd pour les futures archives.

```bash
pixz -d < archive.tar.xz | tar -xf -          # xz multithread
unpigz -c archive.tar.gz | tar -xf -          # gzip multithread
tar --zstd -cf archive.tar.zst /source/       # zstd : multithread natif
```

### « Can not open file as archive » (7z) ou « CRC failed » (rar)

Symptôme :  7z ou  unrar  refuse l'archive,  ou signale  une  erreur CRC.  Cause
probable : format  non reconnu, archive corrompue,  ou téléchargement incomplet.
Correction :   vérifier  le  format,  tester  l'intégrité,   et  réparer  si  un
enregistrement de récupération existe.

```bash
file archive.7z                # confirmer le format réel
7z t archive.7z                # test 7z (codes : 0 ok, 1 warning, 2 fatal)
unrar t archive.rar            # test rar
# rar avec enregistrement de récupération (-rr à la création) :
unrar r archive.rar            # tenter la réparation
```

### unzip écrase des fichiers existants sans prévenir

Symptôme :  des fichiers  présents sont  remplacés lors  de l'extraction.  Cause
probable :  option `-o`  active,  ou réponse  « All »  à l'invite.  Correction :
utiliser `-n` pour ne jamais écraser, ou extraire dans un répertoire vide dédié.

```bash
unzip -n archive.zip -d /destination/         # préserve l'existant
mkdir -p /tmp/extraction-propre && unzip archive.zip -d /tmp/extraction-propre
```

### « gzip: fichier.gz: not in gzip format »

Symptôme : gzip refuse  un fichier portant l'extension `.gz`  . Cause probable :
le fichier n'est pas du gzip (corrompu, ou renommé sans être compressé, ou autre
format). Correction : vérifier le format réel et le magic number.

```bash
file fichier.gz                  # identifier le format réel
# gzip commence par 1f 8b ; bzip2 par 42 5a ; xz par fd 37 7a 58 5a
xxd fichier.gz | head -1
```

Si le  magic number n'est  pas `1f 8b` ,  le fichier n'est  pas du gzip.  gunzip
décompresse aussi les formats `.Z` (compress), `.zip` (membre unique) et LZH, ce
qui peut surprendre un script qui se fie à l'extension.

### « gzip -l » affiche une taille absurde ou un ratio faux

Symptôme :  la  taille  décompressée annoncée  est  plus  petite que  la  taille
compressée, ou le ratio est aberrant. Cause probable : l'original fait plus de 4
Go ; le champ ISIZE du format gzip  stocke la taille modulo 2^32. Un original de
5  Go apparaît  comme  environ 1  Go.  Correction :  lire  la  taille réelle  en
décompressant le flux.

```bash
zcat fichier.gz | wc -c          # seule méthode fiable au-delà de 4 Go
```

C'est  une limite  du format  gzip, non  un  bug. Sur  un fichier  multi-membres
(concaténation de `.gz` ), `gzip -l` n'affiche que le dernier membre.

### La compression produit un fichier plus gros que l'original

Symptôme :  le `.gz`  est plus  volumineux que  la source.  Cause probable :  le
fichier est déjà  compressé (JPEG, PNG,  MP4, ZIP) ou à  haute entropie (binaire
chiffré) ;  gzip n'a alors  rien à  gagner et  ajoute son en-tête.  Correction :
vérifier le type avant de compresser, et ne pas recompresser ce qui l'est déjà.

```bash
file fichier_suspect             # si déjà compressé, ne pas gziper
```

L'expansion worst-case reste minime (environ 0,015  % sur un gros fichier), mais
le coût CPU est réel pour un gain nul.

### « Argument list too long » avec `gzip *.log`

Symptôme : le shell  refuse la commande quand trop de  fichiers correspondent au
glob.  Cause  probable :  la  liste  d'arguments  dépasse  la limite  du  shell.
Correction : passer par `find` ou compresser récursivement.

```bash
find . -name "*.log" -exec gzip {} +     # regroupe les arguments en lots
# compresse récursivement le répertoire courant
gzip -r .
```

## Sécurité des archives

Une archive peut transporter du code malveillant ou écraser des fichiers hors de
la destination prévue. Ces risques valent pour tous les formats.

> Sur Linux,  le risque le  plus actuel vient  des liens symboliques  piégés. La
> faille CVE-2025-55188 (7-Zip antérieur à 25.01) permet à une archive forgée de
> créer un lien  symbolique malveillant que 7-Zip suit à  l'extraction, menant à
> l'écriture de  fichiers arbitraires. Elle  touche Linux pour les  formats zip,
> tar,  7z et rar.  Correction :  passer 7-Zip en  version 25.01  ou supérieure,
> et vérifier `7z i` .

> La CVE-2025-8088  de WinRAR (path  traversal, exploitée par  RomCom) n'affecte
> que  Windows. Les  versions Unix  de RAR  et unrar,  le  code portable  et RAR
> Android ne  sont pas  concernés. Sous  Linux, maintenir unrar  à jour  par les
> dépôts suffit ; cette faille ne doit pas servir d'argument pour craindre unrar
> sur un poste Linux à jour.

> Une  archive d'origine  incertaine  se traite  comme hostile.  Inspecter  sans
> extraire ( `unrar l` , `7z l` ,  `unzip -l` ), repérer les exécutables masqués
> ( `.exe`  ,  `.scr` ,  `.js` ,  `.vbs` )  et les chemins  suspects,  scanner à
> l'antivirus, et n'extraire que dans un répertoire dédié, idéalement en machine
> virtuelle isolée pour une pièce jointe non sollicitée.

> Le  chiffrement  réel passe  par  AES-256,  non  par les  protections  natives
> faibles.  ZipCrypto  est cassé,  et  la  protection  RAR ne  vaut  que par  la
> robustesse  du mot  de passe.  Pour des  données sensibles,  utiliser  7z avec
> `-mhe=on` (chiffre  contenu et  noms) ou  GPG, avec  un mot  de passe  long et
> unique saisi interactivement.

## Problèmes connus et contournements

### Une archive tar compressée ne se modifie pas en place

Les  opérations `-r`  ,  `-u`  ,  `--delete` ,  `-A`  échouent  sur `.tar.gz`  ,
`.tar.xz` ,  `.tar.zst`   : la  compression est  un filtre  sur le  flux entier.
Contournement :  décompresser, modifier,  recompresser,  ou conserver  le format
`.tar` non compressé pour les archives à modifier souvent.

### Les ACL et attributs étendus sont perdus silencieusement (tar)

Par  défaut tar  ne préserve  ni  ACL, ni  xattrs,  ni  contextes SELinux,  sans
avertissement. La perte  se découvre à l'extraction. Toujours  créer et extraire
avec `--acls --xattrs --selinux` pour  une sauvegarde système,  et vérifier avec
`getfacl -R` avant/après.

### Le transfert tar via SSH produit une archive corrompue

Si le  `~/.bashrc` distant  écrit sur  stdout (bannière,  fortune),  ces données
polluent le flux tar. Diagnostic et contournement :

```bash
# doit afficher CLEAN_CHECK seul
ssh user@serveur "echo CLEAN_CHECK" | head -1
ssh user@serveur "bash --norc --noprofile -c 'tar -czf - /src/'" | tar -xzf -
```

Correction définitive :  déplacer les commandes d'affichage  de `~/.bashrc` vers
`~/.bash_profile` (exécuté seulement en session interactive).

### p7zip est obsolète, utiliser 7zz

p7zip est  abandonné depuis  2016. Le  port officiel `7zz`  (paquet `7zip`  ) le
remplace depuis  2021 : il préserve les  permissions Unix dans les  archives 7z,
suit plus  de formats  récents et  reçoit les correctifs  de sécurité.  Vérifier
l'implémentation avec `7z i` .

### gzip peut perdre l'original et le .gz en cas de crash

Par défaut, gzip supprime l'original après écriture du `.gz` , sans `fsync` . Si
le système crashe avant  le flush du cache disque, le  `.gz` peut être incomplet
alors que l'original est déjà supprimé. Contournement pour un fichier critique :
`gzip --synchronous fichier.log` , ou la voie non destructive
`gzip -k fichier.log && rm fichier.log` après vérification.

### gzip -9 peut produire un fichier plus gros que gzip -6

Le  niveau  maximal n'est  pas  garanti  optimal :  sur  certains  fichiers,  la
recherche exhaustive de `-9` fait des choix localement optimaux mais globalement
moins bons que `-6` . Pour  l'archivage critique, comparer les 2 ( `gzip -6k`
puis `gzip -9k` ,  puis `ls -l` ) plutôt que d'assumer  que `-9` gagne toujours.
Le  gain  typique de  `-9`  sur  `-6`  reste de  2  à  3  points pour  un  temps
2 fois plus long.

### La variable d'environnement GZIP n'honore que quelques options

Les  versions  modernes  de  gzip   n'appliquent  via  la  variable  `GZIP`  que
`--rsyncable` , `--synchronous` et le  niveau de compression. Les autres options
y sont ignorées en silence. Pour  un comportement par défaut fiable, utiliser un
alias   (    `alias gzip='gzip --rsyncable'`   )   plutôt   que    la   variable
d'environnement.

## Protocole d'urgence

Pour le cas  d'une extraction qui a  écrasé des fichiers au mauvais  endroit, ou
d'une archive suspecte. Lire la première ligne de chaque étape suffit à agir.

1. **Arrêter.** Interrompre  l'extraction immédiatement  ( `Ctrl+C`  ).  Ne rien
   corriger manuellement à chaud.
2. **Noter.**   Consigner  la   commande  exacte   exécutée  et   le  répertoire
   courant ( `pwd` ).
3. **Identifier.**   Lister  ce   que  l'archive   contient  sans   réextraire :
   `tar -tf archive.tar.gz | head -50` ou `7z l` , `unzip -l` .
4. **Isoler.** Si  des fichiers système  ( `/etc`  , `/bin` ,  `/lib` )  ont été
   touchés, ne pas redémarrer ; arrêter  les services impactés. Si l'archive est
   suspecte  (pièce  jointe  non  sollicitée),   la  déplacer  hors  ligne  sans
   l'extraire et déconnecter la machine du réseau.
5. **Préserver.**  Ne rien  supprimer,  conserver  l'archive originale  intacte.
   Passer à la récupération.

Ne jamais  inverser : un redémarrage  ou une suppression manuelle  avant d'avoir
évalué les dégâts transforme un incident réversible en perte définitive.

## Processus de récupération

**Prérequis.**    Vérifier   avant    de    commencer ;     si   l'un    manque,
arrêter et le signaler.

```
Prérequis                          Vérification
──────────────                     ──────────────
Commande et répertoire connus      historique shell, note de l'étape urgence
Archive originale intacte          file archive.xxx, test d'intégrité
Source de référence disponible     sauvegarde récente, snapshot, paquets distrib
```

### Cas 1 : extraction accidentelle au mauvais endroit

```bash
# Lister ce qui a été écrit, repérer les fichiers écrasés
tar -tf archive.tar.gz > /tmp/extraits.txt
while IFS= read -r f; do
  [ -e "$f" ] && echo "ÉCRASÉ: $f"
done < /tmp/extraits.txt
# Restaurer les fichiers système depuis les paquets
dpkg -S /chemin/fichier && apt-get install --reinstall paquet      # Debian
rpm -qf /chemin/fichier && dnf reinstall paquet                    # RHEL/Fedora
```

### Cas 2 : après extraction d'une archive malveillante

```
1. Éradication : déconnecter du réseau, identifier et supprimer les fichiers
   extraits, analyser le système à l'antivirus.
2. Restauration : restaurer les données légitimes endommagées depuis une
   sauvegarde propre antérieure à l'incident, jamais depuis l'archive
   compromise.
3. Validation : vérifier l'intégrité des fichiers restaurés, changer les mots
   de passe potentiellement exposés, réanalyser pour confirmer l'éradication.
```

### Cas 3 : archive .gz corrompue, original supprimé

Travailler sur une copie, jamais sur la seule archive restante.

```bash
# 0. Préserver avant toute tentative
cp --preserve=all archive.gz /mnt/rescue/archive.gz.backup
gzip -tv /mnt/rescue/archive.gz.backup 2>&1        # diagnostic exact

# 1. Extraire les données valides jusqu'au point de corruption
zcat /mnt/rescue/archive.gz.backup > /mnt/rescue/partiel 2>/dev/null
wc -c /mnt/rescue/partiel                          # quantifier le récupéré

# 2. Récupération avancée si le flux est cassé en plusieurs points
sudo apt install gzrt                              # gzip recovery toolkit
gzrecover /mnt/rescue/archive.gz.backup            # saute les blocs corrompus

# 3. Dernier recours : récupérer l'original supprimé par gzip
mount -o remount,ro /dev/sdXY                      # figer le filesystem d'abord
sudo extundelete /dev/sdXY --restore-file chemin/vers/fichier.log
```

État attendu : `zcat`  récupère les données jusqu'au premier  bloc corrompu (les
dernières lignes peuvent  être tronquées) ; `gzrecover`  récupère davantage avec
des lacunes sur un fichier texte. La récupération de l'original supprimé suppose
que  le  filesystem  n'a  pas  été  réécrit  depuis :  le  remonter  en  lecture
seule immédiatement.

**Validation finale.** Fichiers restaurés intègres,  aucun reliquat de l'archive
incriminée, services fonctionnels, sauvegarde récente disponible.

## Traitement par lots

```bash
shopt -s nullglob                     # bash ; sous zsh : *.tar.gz(N)

# Archiver chaque répertoire séparément, une archive par dossier
for d in */; do tar czf "${d%/}.tar.gz" "$d"; done

# Vérifier l'intégrité de tout un lot d'archives, échecs signalés
for f in *.tar.gz; do
  tar tzf "$f" >/dev/null 2>&1 || printf 'CORROMPUE: %s\n' "$f" >&2
done

# Recompresser un lot vers un format plus efficace
for f in *.tar.gz; do
  gunzip -c "$f" | zstd -19 -o "${f%.tar.gz}.tar.zst"
done
```

`${d%/}` retire la barre oblique finale de `*/`, `${f%.tar.gz}` coupe le double
suffixe : `${f%.*}` ne suffirait pas ici.

---

## Pipelines utiles

```bash
# Contenu d'une archive classé par taille, sans extraction
tar tzvf archive.tgz | awk '{print $3, $6}' | sort -rn | head -20

# Refuser une archive contenant un chemin absolu ou remontant
tar tzf archive.tgz | grep -E '^/|(^|/)\.\./' && echo 'ARCHIVE SUSPECTE'

# Taux de compression réel, comparé à la somme des membres
tar tzvf archive.tgz | awk '{s+=$3} END{print "contenu:", s}'
stat -c '%s compressé' archive.tgz

# Membres d'un zip triés par taux de compression
unzip -v archive.zip | awk 'NR>3 && NF>7 {print $5, $8}' | sort -n | head

# Archiver en excluant ce qui se reconstruit
tar --exclude-vcs --exclude='*.o' --exclude='node_modules' \
    -caf sortie.tar.zst dossier/

# Comparer une archive à l'arborescence d'origine sans extraire
tar dzf archive.tgz -C /chemin/origine
```

Le contrôle des chemins avant extraction est la seule parade générique à la
traversée de répertoire. `tar` refuse par défaut les chemins absolus et les
remontées, mais les options `-P` et `--absolute-names` lèvent cette protection,
et certains outils tiers ne l'ont jamais eue. Le test coûte une commande.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
GNU tar               https://savannah.gnu.org/projects/tar/
libarchive et bsdtar  https://github.com/libarchive/libarchive/releases
zstd                  https://github.com/facebook/zstd/releases
```

---

## Points clés à retenir

> Archivage  et   compression  sont   distincts :   tar  regroupe,    le  filtre
> (gzip/xz/zstd)    compresse.     Une   archive    tar    compressée   ne    se
> modifie pas en place.

> Avant d'extraire,  inspecter : `tar -tf` ,  `unzip -l` , `7z l` ,  `unrar l` .
> C'est le réflexe de sécurité, surtout pour une archive d'origine incertaine.

> tar écrase sans prévenir et le chemin compte : contrôler le répertoire de base
> avec `-C` , fixer la destination avec `-C` ou `-d` à l'extraction.

> Sauvegarde système Linux :  tar avec `--acls --xattrs --selinux` ,  ou le pipe
> `tar | 7z` . tar seul perd ACL et xattrs silencieusement.

> Tester  avant de  supprimer l'original :  `tar -tf` ,  `unzip -t`  , `7z t`  ,
> `unrar t` , y compris pour les archives chiffrées.

> Compression solide  (défaut 7z,  option RAR) : meilleur  ratio, mais  un octet
> perdu détruit  le bloc  et la  mise à  jour devient  impossible.  `-ms=off` si
> résilience ou mise à jour prioritaires.

> Choix d'outil : tar pour sauvegarder et  streamer, zip pour échanger et mettre
> à jour, 7z pour compresser fort et chiffrer, rar en réception seule. Pérenne :
> formats ouverts (tar.zst, tar.gz, 7z).

> Chiffrement : 7z AES-256 avec `-mhe=on` ,  ou GPG. ZipCrypto est cassé. Jamais
> le mot de passe en argument de ligne de commande (visible dans `ps` ).

> Sur  Linux,   le  risque  archive   le  plus  actuel  est   le  symlink  piégé
> (CVE-2025-55188,  7-Zip avant  25.01) :  mettre 7-Zip  à jour.  La CVE  WinRAR
> CVE-2025-8088 n'affecte que Windows.

> Gros  volumes lents :  décompression xz  et bzip2  monothread.  Utiliser pixz,
> pigz, ou préférer zstd (multithread natif).

> p7zip est obsolète depuis 2016 : utiliser  7zz (paquet 7zip), qui préserve les
> permissions Unix et reçoit les correctifs.

> RAR n'est  pas ouvert et reste  un vecteur d'attaque privilégié :  le réserver
> aux cas où ses fonctions spécifiques  sont nécessaires, et l'intégrer dans une
> stratégie 3-2-1 (3 copies, 2 supports, 1 hors site).

> gzip compresse un flux unique, pas  un répertoire : pour un dossier, assembler
> avec tar d'abord  ( `tar czf` ).  Il supprime l'original par défaut ;  `-k` ou
> `-c >`   le  conservent,    `--synchronous`   protège   un  fichier   critique
> contre un crash.

> `gzip -l` est  faux au-delà  de 4 Go  (taille modulo 2^32)  et sur  un fichier
> multi-membres (dernier  seulement) : utiliser `zcat fichier.gz | wc -c`  . Les
> niveaux   1  à   9  ne   changent  pas   la  mémoire,   et   `-9`  n'est   pas
> toujours meilleur que `-6` .

> `--rsyncable` est  indispensable pour les  `.gz` synchronisés par  rsync (coût
> environ 1 %).  `pigz` est un remplacement multithread au  format identique. Ne
> pas compresser ce qui l'est déjà (vérifier avec `file` ).
