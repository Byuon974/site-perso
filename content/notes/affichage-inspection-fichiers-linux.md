---
title: "Affichage et inspection de fichiers"
description: "Référence d'exploitation des outils d'affichage et d'inspection de fichiers sous Linux : lecture et concaténation de flux (cat, bat), formatage tabulaire (column), identification de type (file), métadonnées (stat), listing enrichi (eza). Couvre les opérations courantes, le choix ..."
tags: ["linux", "cli", "cat", "bat", "column", "file", "stat", "eza", "runbook", "fichiers"]
updated: 2026-06-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux, GNU coreutils 9.x, bat 0.24 et suivantes,"
---

_Référence d'exploitation des outils d'affichage et d'inspection de fichiers sous Linux : lecture et concaténation de flux (cat, bat), formatage tabulaire (column), identification de type (file), métadonnées (stat), listing enrichi (eza). Couvre les opérations courantes, le choix d'outil, le dépannage par symptôme et les pièges de piping. Cible un usage en ligne de commande sur systèmes Linux._

## Choisir le bon outil

```
Besoin                                   Outil               Pourquoi
──────────────                           ──────────────      ──────────────
Afficher un fichier dans un pipe         cat                 Sortie brute, sans
                                                             décoration
Lire un fichier de code, interactif      bat                 Coloration,
                                                             pagination, Git
Concaténer plusieurs fichiers            cat                 Fonction première
Aligner des colonnes (CSV, tableau)      column              Mise en forme
                                                             tabulaire
Identifier le type réel d'un fichier     file                Analyse du contenu,
                                                             pas du nom
Voir les métadonnées (inode, dates)      stat                Permissions,
                                                             taille, horodatages
Lister un répertoire, interactif         eza                 Couleur, Git,
                                                             icônes, arbre
Lister un répertoire, script portable    ls                  POSIX, présent
                                                             partout
```

> En une phrase : cat pour les pipes  et la concaténation, bat pour lire du code
> à  l'écran,  column  pour  aligner,   file  pour  identifier,  stat  pour  les
> métadonnées, eza pour un listing riche en interactif, ls pour les scripts.

## Principes fondamentaux

> L'extension ne dit pas le type, le contenu si. file analyse les octets de tête
> (nombres magiques)  pour déterminer le  type réel,  indépendamment du nom.  Un
> .txt  peut  être  un  binaire,  un  .jpg  un  script.  Avant  toute  opération
> risquée, file tranche.

> bat  est cat  enrichi,  mais  pas  un substitut  dans  les pipes.  bat  ajoute
> coloration syntaxique, numéros de ligne, pagination automatique et indicateurs
> Git. Ces décorations cassent les scripts  qui attendent du texte brut. Dans un
> pipe,  utiliser  `bat -p` (plain)  ou `bat --paging=never`  ,  ou garder  cat.
> Aliaser cat=bat sans précaution casse des scripts.

> eza enrichit ls sans  le remplacer partout. eza colore par  défaut, affiche le
> statut Git, les  icônes (avec une Nerd Font) et une  vue arbre intégrée. C'est
> un  fork  maintenu  d'exa,  devenu  dormant.  Comme  bat,  il  est  fait  pour
> l'interactif :   sur  un   serveur  distant   ou  dans  un   script  portable,
> ls reste la référence.

> Les  métadonnées sont  plus  riches que  la taille  et  la date.  stat  expose
> l'inode, le  nombre de liens,  le périphérique, les 3  horodatages (accès,
> modification, changement de statut) et les permissions en octal et symbolique.
> C'est l'outil de diagnostic quand un fichier se comporte autrement qu'attendu.

> Migration en  cours de  coreutils vers Rust.  Ubuntu teste  uutils (réécriture
> Rust de coreutils) à partir de 25.10, avec un déploiement visé pour 26.04 LTS.
> Les commandes restent  compatibles, mais quelques  différences de comportement
> aux   marges    peuvent   apparaître :     vérifier    l'implémentation   avec
> `cat --version` en cas de doute.

## Opérations standard

### Afficher et concaténer (cat, bat)

```bash
cat fichier                        # affiche le contenu brut
cat f1 f2 f3 > fusion.txt          # concatène plusieurs fichiers
cat -n fichier                     # numérote toutes les lignes
# rend visibles tabulations, fins de ligne, CR
cat -A fichier
cat > nouveau.txt                  # saisie au clavier jusqu'à Ctrl-d

bat fichier.py                     # coloration syntaxique + pagination
bat -p fichier                     # mode brut (plain), sûr pour les pipes
bat --paging=never fichier         # sans pagination
# rend visibles les caractères non imprimables
bat -A fichier
# piping : bat détecte la non-tty et passe en brut
bat fichier.py | grep def
```

État attendu : le  contenu s'affiche. `cat -A` (ou `bat -A` )  est précieux pour
diagnostiquer des fins de ligne Windows  ( `^M$` ) ou des tabulations parasites.
Dans un script, préférer cat ou `bat -p` .

### Aligner en colonnes (column)

```bash
column -t fichier.txt              # aligne en colonnes sur les espaces
column -t -s ',' fichier.csv       # séparateur virgule (CSV)
column -t -s ':' /etc/passwd       # séparateur deux-points
mount | column -t                  # rend lisible une sortie tabulaire
```

État attendu : les  colonnes sont alignées et lisibles. `-s`  fixe le séparateur
d'entrée,  `-t`  active le  mode tableau.  Utile  en  bout de  pipe pour  rendre
présentable une sortie brute.

### Identifier le type réel (file)

```bash
file fichier                       # type déterminé par le contenu
file -i fichier                    # type MIME (text/plain, image/png...)
file -b fichier                    # sans le nom du fichier (brut)
file *                             # type de tous les fichiers du répertoire
# regarde à l'intérieur d'un fichier compressé
file -z archive.gz
```

État attendu : file annonce le type  réel. Réflexe avant d'ouvrir, d'extraire ou
de  traiter  un  fichier   d'origine  incertaine,   et  pour  diagnostiquer  une
extension trompeuse.

### Lire les métadonnées (stat)

```bash
stat fichier                       # toutes les métadonnées
stat -c '%s' fichier               # taille en octets seulement
stat -c '%A %U %G' fichier         # permissions, propriétaire, groupe
stat -c '%y' fichier               # date de modification lisible
stat -f fichier                    # infos du système de fichiers (espace, type)
```

État attendu : stat affiche inode,  taille, permissions (octal et symbolique) et
les 3 horodatages. Le format `-c`  extrait un champ précis, utile en script.
À  distinguer :   mtime   (contenu  modifié),   ctime   (métadonnées  changées),
atime (dernier accès).

### Lister un répertoire (eza)

```bash
eza                                # listing coloré
eza -l --git                       # détaillé avec statut Git par fichier
eza -la                            # tout, y compris les fichiers cachés
eza --tree --level=2               # vue arbre sur 2 niveaux
eza -l --sort=size --reverse       # trié par taille décroissante
eza -l --icons                     # avec icônes (nécessite une Nerd Font)
```

État attendu : le listing s'affiche, coloré et enrichi. La colonne Git ( `--git`
) montre d'un coup d'œil les fichiers modifiés  ou non suivis. Pour un script ou
un serveur distant, revenir à `ls` .

## Dépannage par symptôme

### bat affiche des numéros de ligne et casse un script en aval

Symptôme : un script qui consomme la sortie échoue depuis qu'on a aliasé cat sur
bat. Cause probable :  bat ajoute décorations et pagination  en mode interactif.
Correction : forcer le mode brut, ou garder cat dans les scripts.

```bash
bat -p fichier                     # plain, pas de décoration
# alias sûr pour le piping (perd la gouttière Git)
alias cat='bat --paging=never -p'
\cat fichier                       # contourne l'alias ponctuellement
```

### « batcat: command not found » sur Debian/Ubuntu

Symptôme : la commande  bat est introuvable après installation  du paquet. Cause
probable :  Debian et Ubuntu  nomment le binaire  batcat (conflit avec  un autre
paquet). Correction : utiliser batcat, ou créer un alias.

```bash
batcat fichier
alias bat='batcat'                 # dans ~/.bashrc
```

### column désaligne une sortie avec des champs vides

Symptôme : les  colonnes se décalent quand  un champ est vide.  Cause probable :
column fusionne les séparateurs consécutifs par défaut. Correction : préciser le
séparateur et ne pas fusionner.

```bash
# -n (selon version) ne fusionne pas les séparateurs
column -t -s ',' -n fichier.csv
# Alternative robuste pour du CSV complexe : awk ou un outil dédié
```

### file annonce « data » sur un fichier attendu comme texte

Symptôme : file renvoie  « data » au lieu d'un type précis.  Cause probable : le
fichier  contient  des  octets  non  textuels,  ou  est  corrompu.  Correction :
inspecter les premiers octets.

```bash
xxd fichier | head             # voir les octets de tête
file -i fichier                # type MIME pour confirmer
```

## Traitement par lots

La même forme de boucle que partout, appliquée à l'inspection : produire un
fichier de sortie par fichier d'entrée, ou un rapport unique.

```bash
shopt -s nullglob                     # bash ; sous zsh : *.log(N)

# Un aperçu de chaque fichier, dans un rapport unique
for f in *.log; do
  printf '\n===== %s =====\n' "$f"
  head -20 "$f"
done > apercu.txt

# Identifier le type réel de tout un lot, sans se fier aux extensions
for f in *; do printf '%-40s %s\n' "$f" "$(file -b "$f")"; done

# Repérer les fichiers qui ne sont pas du texte avant de les ouvrir
for f in *; do file -b "$f" | grep -q text || printf 'BINAIRE: %s\n' "$f"; done
```

Les guillemets autour de `"$f"` et la garde sur le motif vide valent ici comme
ailleurs : voir le runbook conversion par lots pour la forme complète.

---

## Pipelines utiles

```bash
# Les 20 fichiers les plus gros, taille lisible
find . -type f -printf '%s\t%p\n' | sort -rn | head -20 |
  numfmt --to=iec --field=1

# Volume cumulé par extension, séparateur tabulation obligatoire
find . -type f -name '*.*' -printf '%s\t%f\n' |
  awk -F'\t' '{n=split($2,p,"."); s[p[n]]+=$1}
              END{for(e in s) printf "%12d  %s\n", s[e], e}' | sort -rn

# Fichiers dont le contenu ne correspond pas à l'extension
find . -name '*.txt' -type f -exec file --mime-type {} + | grep -v 'text/plain'

# Repérer les fins de ligne CRLF sur une arborescence
find . -type f -exec file {} + | grep CRLF

# Les 10 premiers octets d'un binaire, en hexadécimal et en caractères
od -A d -t x1z -N 16 fichier.bin

# Longueur de la ligne la plus longue de chaque fichier
find . -name '*.md' -exec awk 'length>m{m=length} END{print m, FILENAME}' {} \;

# Fichiers vides et fichiers à un seul octet
find . -type f -size -2c -printf '%s %p\n' | sort -n
```

Le séparateur de la deuxième forme n'est pas cosmétique. Avec un espace, `awk`
découpe le nom `fichier avec espace.txt` sur son premier blanc et crée un seau
`fichier` inexistant, en sous-comptant `txt`. Mesuré sur le banc d'essai :
`6000 bin, 11 md, 6 txt, 4 fichier` avec l'espace, contre `6000 bin, 11 md,
10 txt` avec la tabulation, total conforme aux 6021 octets réels.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
GNU coreutils  https://www.gnu.org/software/coreutils/
bat            https://github.com/sharkdp/bat/releases
eza            https://github.com/eza-community/eza/releases
```

---

## Points clés à retenir

> L'extension ment,  file tranche :  analyser le  contenu avant  toute opération
> risquée sur un fichier d'origine incertaine.

> bat et eza sont  faits pour l'interactif. Dans un pipe  ou un script, utiliser
> cat / bat -p et ls : leurs décorations cassent les sorties brutes.

> cat -A (ou  bat -A) révèle les  caractères invisibles : fins  de ligne Windows
> (^M$), tabulations, espaces de fin.

> stat distingue 3 horodatages : mtime (contenu), ctime (métadonnées), atime
> (accès). Clé pour diagnostiquer un comportement inattendu.

> Sur  Debian/Ubuntu,   le  binaire  bat  s'appelle  batcat.  eza  est  le  fork
> maintenu d'exa (dormant).

> column -t aligne  une sortie tabulaire en  bout de pipe ; préciser  -s pour le
> séparateur d'entrée.
