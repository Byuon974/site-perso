---
title: "Shell interactif et environnement Bash"
description: "Runbook d'exploitation du shell Bash et de son environnement : readline, expansions, alias, variables et PATH, sudo/su/visudo. Opérations courantes, dépannage, sécurité et pièges de configuration."
tags: ["linux", "cli", "bash", "sudo", "shell", "runbook", "environnement"]
updated: 2026-06-18
validated: 2026-06-18
owner: "opérateur du système"
target: "Linux (Arch/Artix, Debian, RHEL), Bash 5.x, sudo 1.9.x"
---

_Référence d'exploitation du shell interactif Bash et de son environnement sous Linux : historique et édition de ligne (readline), expansions et substitutions, alias et fonctions, variables d'environnement et PATH, élévation de privilèges (sudo, su, visudo). Couvre les opérations courantes, le dépannage par symptôme, la sécurité et les pièges de configuration. Cible un usage en ligne de commande sur systèmes Linux (Bash 5.x)._

## Principes fondamentaux

> Le shell suit  un ordre d'expansion fixe. Pour chaque  commande, Bash applique
> dans l'ordre : expansion des accolades, du tilde, des paramètres et variables,
> substitution de commande, expansion arithmétique, découpage en mots selon IFS,
> expansion des chemins (globbing),  puis suppression des guillemets. Comprendre
> cet ordre explique la plupart des surprises de quotation et d'expansion.

> Le  fichier de  démarrage  lu dépend  du  type de  shell.  Un  shell de  login
> interactif  lit /etc/profile  puis  le premier  trouvé parmi  ~/.bash_profile,
> ~/.bash_login,  ~/.profile. Un  shell interactif  non-login lit ~/.bashrc.  Un
> shell non  interactif (script)  ne lit ni  l'un ni  l'autre, sauf  si BASH_ENV
> pointe vers  un fichier.  C'est pourquoi une  variable définie  dans ~/.bashrc
> peut manquer en SSH non interactif ou dans cron.

> Les alias sont une substitution textuelle, les fonctions une logique. Un alias
> remplace un mot  par du texte avant interprétation,  sans accepter d'arguments
> positionnels  au milieu.  Une fonction  accepte des  arguments,  des variables
> locales et de  la logique. Les alias  ne sont pas développés  dans les scripts
> non   interactifs   par  défaut,    ce   qui   en   fait  un   mauvais   choix
> pour l'automatisation.

> Une variable doit  être exportée pour être héritée. Une  variable simple reste
> locale au shell  courant ; seule une variable exportée  (export) est transmise
> aux  processus  enfants.   Un  processus  déjà  lancé  n'hérite  jamais  d'une
> modification faite après son démarrage : il faut le relancer.

> sudo  applique  le  moindre  privilège  et  trace,  à  condition  d'être  bien
> configuré. sudo exécute une commande sous  une autre identité selon les règles
> de /etc/sudoers, en journalisant l'appel. Sa puissance vient de la restriction
> par commande précise,  non du blanc-seing. Toute édition de  sudoers passe par
> visudo,   qui   valide  la  syntaxe   avant  d'enregistrer,   sous   peine  de
> verrouiller l'accès root.

> Garder une session de secours ouverte avant toute modification sensible. Avant
> d'éditer sudoers, le  PATH système ou les fichiers de  démarrage, conserver un
> second terminal déjà authentifié. Une erreur  de syntaxe ou un PATH cassé peut
> rendre le système  inutilisable jusqu'à correction, et la  session ouverte est
> alors la seule voie de réparation.

## Opérations standard

### Historique et rappel de commandes

```bash
history 20                       # 20 dernières commandes
!!                               # relance la dernière commande
!$                               # dernier argument de la commande précédente
!abc                             # dernière commande commençant par abc
Ctrl-r                           # recherche incrémentale arrière dans l'historique
Alt-.                            # insère le dernier argument (répéter pour remonter)
# Historique persistant et partagé entre sessions
export HISTSIZE=10000 HISTFILESIZE=20000
export HISTCONTROL=ignoreboth    # ignore doublons et lignes débutant par espace
shopt -s histappend              # ajoute au lieu d'écraser à la fermeture
```

État attendu : les commandes passées sont rappelables sans les retaper. `Ctrl-r`
est le réflexe le plus rentable.  `HISTCONTROL=ignoreboth` permet de masquer une
commande de  l'historique en la préfixant  d'un espace (utile pour  une commande
contenant un secret).

### Édition de ligne readline (mode emacs par défaut)

```bash
Ctrl-a / Ctrl-e                  # début / fin de ligne
Alt-b / Alt-f                    # mot précédent / suivant
Ctrl-w / Alt-d                   # supprime le mot avant / après le curseur
Ctrl-u / Ctrl-k                  # coupe avant / après le curseur
Ctrl-y                           # colle le dernier texte coupé
Ctrl-x Ctrl-e                    # édite la commande courante dans $EDITOR
```

État  attendu : le  curseur  se déplace  et le  texte s'édite  sans les  touches
fléchées.  Si `Alt-b`  / `Alt-f` insèrent  des caractères  accentués au  lieu de
déplacer  le   curseur,   le   terminal  envoie  Meta   en  8   bits :   ajouter
`set meta-flag on`   et  `set input-meta on`   dans  ~/.inputrc,   ou   utiliser
`Échap` puis la lettre.

### Alias et fonctions

```bash
# Alias : raccourci textuel
alias ll='ls -lh --color=auto'
alias grep='grep --color=auto'
\ls                              # contourne l'alias (antislash) pour la commande native
command ls                       # autre contournement
unalias ll                       # supprime un alias

# Fonction : logique et arguments
extract() {
  case "$1" in
    *.tar.gz)  tar -xzf "$1" ;;
    *.zip)     unzip "$1" ;;
    *)         echo "format inconnu : $1" >&2; return 1 ;;
  esac
}
# Fonction avec variable locale et validation
backup() {
  local src="${1:?usage: backup FICHIER}"
  cp -a "$src" "${src}.$(date +%Y%m%d-%H%M%S).bak"
}
```

État attendu : alias et fonctions  sont disponibles dans la session interactive.
Les définir dans ~/.bashrc (ou un  fichier sourcé par lui) les rend persistants.
Pour l'automatisation, préférer  les fonctions aux alias, car les  alias ne sont
pas développés dans les scripts.

### Variables d'environnement et PATH

```bash
# Inspecter
printenv                         # toutes les variables exportées
echo "$PATH"
export -p                        # variables exportées avec leur valeur

# Définir : temporaire, pour une commande, persistante
VAR=valeur                       # locale au shell courant
export VAR=valeur                # exportée aux enfants
VAR=valeur commande              # uniquement pour cette commande
echo 'export VAR=valeur' >> ~/.bashrc   # persistante (shell interactif)

# Modifier le PATH sans le casser (toujours réutiliser $PATH)
export PATH="$HOME/.local/bin:$PATH"     # priorité au privé
export PATH="$PATH:/opt/outil/bin"       # ajout en fin
```

État  attendu :  la variable  est  visible là  où  elle est  attendue.  Toujours
réinclure `$PATH`  lors d'une  modification,  sous peine  de perdre  l'accès aux
commandes  système.  Pour  un  service  systemd,  utiliser  `Environment=`  dans
l'unité ; pour cron, définir les variables  en tête de crontab, car cron démarre
avec un environnement quasi vide.

### Substitution de commande et de processus

```bash
# Substitution de commande : insère la SORTIE d'une commande
fichiers=$(find . -name '*.log')
echo "Disque utilisé : $(df -h / | awk 'NR==2 {print $5}')"

# Substitution de processus : présente une commande comme un FICHIER
diff <(sort a.txt) <(sort b.txt)         # comparer sans fichiers temporaires
comm -12 <(sort a.txt) <(sort b.txt)
tee >(gzip > sortie.gz) < entree.txt > /dev/null   # vers un flux parallèle
```

État attendu : `$(...)` capture du texte,  `<(...)` fournit un chemin de fichier
virtuel.  Pour préserver  les variables  modifiées dans  une boucle  de lecture,
utiliser la substitution de processus plutôt qu'un pipe :
`while read l; do ...; done < <(commande)`  garde   les  variables,   alors  que
`commande | while read` les perd (le pipe crée un sous-shell).

### Élévation de privilèges (sudo, su, visudo)

```bash
sudo commande                    # exécute en root, journalisé
sudo -u utilisateur commande     # exécute sous une autre identité
sudo -l                          # liste ses propres autorisations
sudo -k                          # oublie le ticket d'authentification (force la ressaisie)
sudoedit /etc/fichier            # édite en sûreté (ouvre en tant qu'utilisateur, écrit en root)

# Éditer sudoers EN SÛRETÉ (validation de syntaxe avant écriture)
sudo visudo                              # /etc/sudoers
sudo visudo -f /etc/sudoers.d/deploy     # fichier modulaire dédié

# Règle restreinte (recommandé) : commande précise, chemin absolu
# deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

État attendu : la  commande s'exécute avec les privilèges voulus  et l'appel est
journalisé.  Toujours  passer par  `visudo`  (ou  `visudo -f` ),  jamais  éditer
sudoers à la main : la validation  de syntaxe évite de verrouiller l'accès root.
Restreindre les règles à des commandes précises avec chemin absolu, et garder un
terminal root ouvert pendant l'édition.

## Dépannage par symptôme

### Les modifications de ~/.bashrc ne prennent pas effet

Symptôme :  une variable,  un  alias ou  une fonction  ajouté à  ~/.bashrc reste
indisponible.  Cause probable :  le shell  courant a  déjà lu  ~/.bashrc,  ou il
s'agit d'un shell de  login qui ne lit pas ~/.bashrc.  Correction : recharger le
fichier, ou vérifier la chaîne de démarrage.

```bash
source ~/.bashrc                 # recharge dans la session courante
# Si shell de login (SSH) : s'assurer que ~/.bash_profile source ~/.bashrc
echo '[ -f ~/.bashrc ] && . ~/.bashrc' >> ~/.bash_profile
```

### La variable est définie dans le terminal mais absente dans cron ou SSH

Symptôme :  un  script marche  en  interactif,  échoue  en cron  ou  en SSH  non
interactif.  Cause  probable :  cron et  le  SSH non  interactif  ne lisent  pas
~/.bashrc ni ~/.profile ;  leur environnement est minimal.  Correction : définir
les variables nécessaires dans le contexte d'exécution.

```bash
# Dans la crontab, en tête :
PATH=/usr/local/bin:/usr/bin:/bin
MAILTO=admin@exemple.fr
# Ou sourcer explicitement l'environnement dans le script
. /etc/profile.d/monenv.sh
```

### Un alias ne fonctionne pas dans un script

Symptôme :  un alias défini  dans ~/.bashrc est  introuvable une fois  le script
lancé. Cause  probable : les  alias ne sont pas  développés dans les  shells non
interactifs.  Correction :  utiliser  une  fonction,  ou  activer  explicitement
l'expansion.

```bash
shopt -s expand_aliases          # à placer en tête du script, avant de sourcer les alias
# Mieux : remplacer l'alias par une fonction, développée partout
```

### Variables perdues après une boucle « while read » dans un pipe

Symptôme :  un compteur ou  une variable  modifiée dans  `cmd | while read` vaut
zéro  après la  boucle.  Cause probable :  le  pipe  exécute la  boucle dans  un
sous-shell,  dont les  variables  ne remontent  pas.  Correction : alimenter  la
boucle par substitution de processus.

```bash
count=0
while read -r l; do count=$((count+1)); done < <(grep -c . fichiers)
echo "$count"                    # correct : la boucle s'exécute dans le shell courant
```

### Terminal corrompu après l'affichage d'un fichier binaire

Symptôme : le  terminal affiche des caractères illisibles,  l'invite est cassée.
Cause probable :  des octets de contrôle  ont été envoyés au  terminal (cat d'un
binaire). Correction : réinitialiser le terminal.

```bash
reset                            # réinitialisation complète
# ou, en aveugle si l'écho est cassé :
printf '\033c'
```

### sudo demande un mot de passe malgré une règle NOPASSWD

Symptôme :  `sudo cmd` redemande  le mot  de passe  alors qu'une  règle NOPASSWD
existe. Cause probable :  la règle ne correspond pas  exactement (chemin relatif
vs  absolu,  arguments). Correction :  la  règle  doit cibler  le chemin  absolu
réel de la commande.

```bash
which ip                         # /usr/bin/ip
sudo -l                          # vérifier la règle réellement appliquée
# La règle doit viser /usr/bin/ip, pas « ip »
```

## Sécurité

> Mettre sudo à  jour : deux failles critiques de 2025.  La CVE-2025-32463 (CVSS
> 9.3)  permet à  un utilisateur  local quelconque  d'obtenir root  via l'option
> chroot (-R),  même sans aucune  règle sudoers définie,  en faisant  charger un
> /etc/nsswitch.conf piégé.  La CVE-2025-32462  permet d'exécuter  des commandes
> sur des machines  non prévues quand une règle  vise un host autre  que le host
> courant ou  ALL. Les  deux sont  corrigées dans  sudo 1.9.17p1.  Vérifier avec
> `sudo -V` et appliquer la mise à jour de la distribution.

> Durcir  la configuration  sudo.  Ajouter  `Defaults !use_chroot` et  supprimer
> toute  directive CHROOT=/runchroot=  (neutralise la  CVE  chroot). Éviter  les
> règles  host-spécifiques au  profit  de règles  par  groupe  ou par  commande.
> Conserver   `Defaults use_pty`  (journalise   dans   un  pseudo-terminal)   et
> `Defaults env_reset` (réinitialise l'environnement).

> Limiter NOPASSWD  au strict  nécessaire. Le passwordless  sudo est  un vecteur
> d'escalade privilégié. Le réserver aux comptes  de service et le restreindre à
> des  commandes précises  avec chemin  absolu, jamais  `NOPASSWD: ALL` pour  un
> compte humain interactif. Auditer régulièrement :
> `grep -r NOPASSWD /etc/sudoers /etc/sudoers.d/` .

> Se méfier  des commandes  sudo qui  ouvrent un  shell.  Autoriser via  sudo un
> éditeur,  un pager (less,  vi) ou un  interpréteur (python) revient  souvent à
> donner un  shell root,  car  ces outils  permettent d'exécuter  des commandes.
> Préférer sudoedit pour l'édition, et le tag NOEXEC quand il est disponible.

## Problèmes connus et contournements

### LD_LIBRARY_PATH défini globalement casse des commandes système

Définir LD_LIBRARY_PATH dans l'environnement global force des binaires système à
charger des  bibliothèques inattendues, provoquant  des erreurs de  symboles. Ne
jamais l'exporter globalement : le définir uniquement  pour la commande qui en a
besoin ( `LD_LIBRARY_PATH=/opt/lib commande` ).

### secure_path neutralise le PATH de l'utilisateur sous sudo

Par défaut,  sudo réinitialise le PATH selon  `Defaults secure_path` de sudoers.
Une commande accessible dans le PATH de l'utilisateur peut être introuvable sous
sudo. Utiliser le chemin absolu, ou ajuster secure_path via visudo.

### Substitution de commande dans une boucle : performance catastrophique

Appeler  `$(commande)`  à  chaque  itération  d'une  grande  boucle  relance  un
sous-processus à chaque tour, ce qui  s'effondre en performance sur des milliers
d'itérations.   Sortir  l'appel  de  la  boucle,  ou  traiter  le  flux  en  une
passe avec awk ou sed.

## Points clés à retenir

> L'ordre des expansions est fixe :  accolades, tilde, paramètres, substitution,
> arithmétique, découpage IFS, globbing, suppression des guillemets. Il explique
> les surprises de quotation.

> Le fichier de  démarrage dépend du type de shell :  login lit ~/.bash_profile,
> interactif non-login lit ~/.bashrc, non interactif  ne lit ni l'un ni l'autre.
> D'où les variables manquantes en cron et SSH.

> Toujours réinclure  $PATH lors  d'une modification, et  garder un  terminal de
> secours avant d'éditer sudoers, le PATH système ou les fichiers de démarrage.

> Alias pour l'interactif,  fonctions pour l'automatisation : les  alias ne sont
> pas développés dans les scripts.

> Ctrl-r  (recherche d'historique)  et Alt-.  (dernier argument)  sont les  deux
> raccourcis readline les plus rentables.

> Pour  préserver  les  variables   d'une  boucle  de  lecture,   alimenter  par
> `< <(commande)` et non par `commande |` , qui crée un sous-shell.

> sudo :   mettre  à  jour  en  1.9.17p1  (CVE-2025-32462  et  32463),   ajouter
> `Defaults !use_chroot`  ,   restreindre   NOPASSWD  aux   commandes  précises,
> toujours éditer via visudo.
