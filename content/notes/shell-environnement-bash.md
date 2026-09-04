---
title: "Shell interactif et environnement Bash"
description: "Référence d'exploitation des shells interactifs Bash et Zsh sous Linux : édition de ligne et historique, résolution des noms de commandes, expansions, alias et fonctions, variables et PATH, élévation de privilèges. Couvre les opérations courantes dans les 2 shells, leurs divergen..."
tags: ["linux", "cli", "bash", "sudo", "shell", "runbook"]
updated: 2026-08-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux (Arch, Debian, RHEL), Bash 5.2/5.3, Zsh 5.9,"
---

_Référence d'exploitation des shells interactifs Bash et Zsh sous Linux : édition de ligne et historique, résolution des noms de commandes, expansions, alias et fonctions, variables et PATH, élévation de privilèges. Couvre les opérations courantes dans les 2 shells, leurs divergences de comportement, le dépannage par symptôme et la réparation d'une configuration cassée._

---


## Table d'équivalence bash / zsh

Les commandes qui changent de nom ou de syntaxe entre les 2 shells :

```
Intention                      Bash                    Zsh
──────────────────────────     ──────────────────      ──────────────────────
Tout ce qui porte un nom       type -a nom             whence -a nom
Le type seul                   type -t nom             whence -w nom
Le chemin retenu               command -v nom          whence -p nom
Options du shell               shopt / shopt -s        setopt / unsetopt
Vider le cache des chemins     hash -r                 rehash
Associer une touche            bind '"\C-r": widget'   bindkey '^R' widget
Lister les associations        bind -p                 bindkey -L
Fichier de réglages d'édition  ~/.inputrc              aucun : bindkey en .zshrc
Hook avant chaque invite       PROMPT_COMMAND          add-zsh-hook precmd f
Chaîne d'invite                PS1                     PROMPT
Dédupliquer le PATH            fonction maison         typeset -U path
Recharger proprement           exec bash               exec zsh
Démarrer sans configuration    bash --norc --noprofile zsh -f
Complétion                     paquet bash-completion  compinit (intégré)
```

3 divergences de comportement mordent plus souvent que les autres, vérifiées
sous Bash 5.2 et Zsh 5.9 :

```
Situation                        Bash                    Zsh
──────────────────────────       ──────────────────      ─────────────────────
v="a b c" ; set -- $v            3 arguments             1 argument
                                 (découpage IFS)         (pas de découpage)
print *.inexistant               le motif littéral       erreur « no matches
                                 est passé tel quel      found », commande non
                                                         exécutée
alias dans un script             non développé sauf      développé
                                 shopt -s expand_aliases
```

---

## Principes fondamentaux

> **L'ordre de résolution des noms est fixe, et il ne commence pas par le
> PATH.** Les 2 shells cherchent dans l'ordre : alias, mot réservé, fonction,
> commande interne, puis PATH. Une fonction du même nom qu'un script installé
> dans `~/.local/bin` gagne toujours : le script n'est jamais appelé, sans aucun
> message.

```
   mot tapé
      │
      ▼
   alias ?  ──oui──> substitution textuelle, puis on recommence l'analyse
      │ non
      ▼
   mot réservé (if, for, while) ?  ──oui──> syntaxe du shell
      │ non
      ▼
   fonction ?  ──oui──> exécutée dans le shell courant
      │ non
      ▼
   commande interne (cd, echo, type) ?  ──oui──> exécutée par bash
      │ non
      ▼
   parcours du PATH, premier répertoire qui contient un exécutable
```

> **Le fichier de démarrage lu dépend du type de shell.** Une variable définie
> dans `~/.bashrc` ou `~/.zshrc` manque en SSH non interactif et dans cron. Zsh
> a un fichier de plus, `~/.zshenv`, lu par TOUTES les invocations, y compris
> les scripts : c'est le seul endroit qui garantit la présence d'une variable
> partout.

```
   BASH
   Shell de login interactif        /etc/profile
   (console TTY, ssh utilisateur)      puis le PREMIER trouvé :
                                    ~/.bash_profile, ~/.bash_login,
                                    ~/.profile. ~/.bashrc seulement s'il
                                    est sourcé depuis l'un des trois

   Shell interactif non-login       ~/.bashrc
   (terminal graphique, tmux)

   Shell non interactif             rien, sauf si BASH_ENV pointe un fichier
   (script, cron, ssh hôte cmd)

   ZSH  (ordre observé sous 5.9, tous les fichiers lus s'enchaînent)
   Shell de login interactif        .zshenv  ->  .zprofile  ->  .zshrc
                                                                  ->  .zlogin
   Shell interactif non-login       .zshenv  ->  .zshrc
   Shell non interactif             .zshenv  seul
   zsh -f                           aucun fichier

   ZDOTDIR, s'il est défini, remplace ~ comme répertoire de ces fichiers.
   Il ne peut être posé que dans /etc/zshenv ou ~/.zshenv, lus avant tout.
```

> **Le shell suit un ordre d'expansion fixe.** Pour chaque commande : accolades,
> tilde, paramètres et variables, substitution de commande, expansion
> arithmétique, découpage en mots selon IFS, expansion des chemins, suppression
> des guillemets. Cet ordre explique la plupart des surprises de quotation : le
> découpage IFS a lieu après la substitution, donc `$(cmd)` non protégé par des
> guillemets se fait découper sous Bash.

> **Zsh ne découpe pas les expansions non protégées.** `$var` contenant des
> espaces reste un seul mot, sauf `setopt SH_WORD_SPLIT`. Un script écrit sous
> zsh sans guillemets casse une fois porté sous bash, et une boucle
> `for x in $liste` ne fait qu'un tour sous zsh là où bash en fait un par mot :
> mettre des guillemets partout, ou expanser un tableau avec `${(f)var}` ou
> `${=var}` selon le séparateur voulu.

> **Les alias sont une substitution textuelle, les fonctions une logique.** Un
> alias remplace un mot par du texte avant interprétation, sans accepter
> d'arguments au milieu. Sous Bash, les alias ne sont pas développés dans les
> shells non interactifs : un alias appelé depuis un script est introuvable.
> Sous Zsh ils le sont, ce qui rend un script portable dépendant d'un alias
> présent d'un côté et absent de l'autre : écrire des fonctions.

> **Une variable doit être exportée pour être héritée.** Seule une variable
> exportée est transmise aux processus enfants, et un processus déjà lancé
> n'hérite jamais d'une modification postérieure à son démarrage : le relancer.

> **Sourcer ajoute, cela n'enlève rien.** `source ~/.bashrc` empile les entrées
> de `PROMPT_COMMAND`, redéfinit les fonctions et laisse en place tout ce qui a
> été supprimé du fichier. Sous Zsh, re-sourcer `~/.zshrc` réenveloppe les
> widgets de zsh-autosuggestions et réenregistre les hooks de coloration
> syntaxique. `exec bash` ou `exec zsh` remplace l'image du processus et donne
> l'état exact d'un terminal neuf.

> **sudo applique le moindre privilège à condition d'être restreint.** Sa
> puissance vient de la règle par commande précise avec chemin absolu, non du
> blanc-seing. Toute édition passe par `visudo`, qui valide la syntaxe avant
> d'enregistrer.

> **Garder une session de secours ouverte avant toute modification sensible.**
> Avant d'éditer sudoers, le PATH système ou les fichiers de démarrage,
> conserver un second terminal déjà authentifié : une erreur de syntaxe peut
> rendre l'élévation de privilèges impossible, et cette session est alors la
> seule voie de réparation.

---

## Opérations standard

### Retrouver ce qui sera réellement exécuté

```bash
# bash
type -a git                      # TOUTES les définitions, dans l'ordre
type -t git                      # une réponse : alias, function, builtin
command -v git                   # le chemin retenu, sans les alias
compgen -A function              # toutes les fonctions définies

# zsh
whence -a git                    # TOUTES les définitions, dans l'ordre
whence -w git                    # « git: alias », « git: function », ...
whence -p git                    # le chemin du PATH, en ignorant tout le reste
print -l -- ${(ok)functions}     # toutes les fonctions définies
```

État attendu : `type -a` liste chaque définition du plus prioritaire au moins
prioritaire. 3 lignes signifient 3 candidats, dont un seul s'exécute.

Contournements ponctuels, à connaître exactement pour ne pas viser à côté :

```
Écriture        Contourne             Exécute alors
──────────      ──────────────────    ─────────────────────────
\commande       l'alias seulement     la fonction, si elle existe
command cmd     alias ET fonction     la commande interne ou le PATH
env cmd         alias, fonction et    le fichier du PATH
                commande interne
enable -n cmd   la commande interne   le fichier du PATH (persistant)
unset -f cmd    supprime la fonction  le PATH, pour toute la session
```

Vérifié sous Bash 5.2 et Zsh 5.9 avec un alias, une fonction et un script
homonymes : l'appel nu exécute l'alias, `\demo` exécute la fonction, `command
demo` exécute le script du PATH. Sous Zsh, `unfunction` remplace `unset -f`, et
`disable` remplace `enable -n` pour neutraliser une commande interne.

### Historique et rappel de commandes

Rappel, identique dans les 2 shells :

```bash
history 20                       # 20 dernières commandes (zsh : history -20)
!!                               # relance la dernière commande
!$                               # dernier argument de la commande précédente
!abc                             # dernière commande commençant par abc
Ctrl-r                           # recherche incrémentale arrière
Alt-.                            # insère le dernier argument (répétable)
```

Configuration, où tout diffère :

```bash
# bash
HISTSIZE=200000                  # lignes gardées en mémoire
HISTFILESIZE=200000              # lignes gardées dans le fichier
HISTCONTROL=ignoreboth           # ignore doublons et lignes préfixées d'espace
HISTTIMEFORMAT="%F %T "          # horodate l'historique
shopt -s histappend              # ajoute au lieu d'écraser à la fermeture
shopt -s histverify              # !! et !$ s'affichent avant exécution
```

```zsh
# zsh
HISTFILE=~/.zsh_history          # SANS lui, rien n'est écrit sur disque
HISTSIZE=200000                  # lignes gardées en mémoire
SAVEHIST=200000                  # lignes écrites : vaut 0 par défaut
setopt EXTENDED_HISTORY          # horodate les entrées
setopt HIST_IGNORE_DUPS          # équivalent de ignoredups
setopt HIST_IGNORE_SPACE         # équivalent de ignorespace
setopt HIST_VERIFY               # équivalent de histverify
setopt SHARE_HISTORY             # partage entre sessions ouvertes
```

**`SAVEHIST` vaut 0 par défaut.** Un `HISTFILE` défini sans `SAVEHIST` produit
un historique qui disparaît à la fermeture du terminal, sans message. Vérifié
sous Zsh 5.9. `SHARE_HISTORY` contient déjà l'effet de `INC_APPEND_HISTORY` :
les activer ensemble est contradictoire.

État attendu : les commandes passées sont rappelables sans les retaper, et une
commande préfixée d'un espace n'entre pas dans l'historique, ce qui sert pour
une ligne contenant un secret. `histverify` transforme `!!` en insertion à
relire au lieu d'une exécution immédiate.

Recherche insensible à la casse, readline 8.3 et Bash 5.3 uniquement :

```bash
bind 'set search-ignore-case on'   # 5.3+ ; « unknown variable name » sous 8.2
```

### Édition de ligne readline (mode emacs par défaut)

```bash
Ctrl-a / Ctrl-e                  # début / fin de ligne
Alt-b / Alt-f                    # mot précédent / suivant
Ctrl-w / Alt-d                   # supprime le mot avant / après le curseur
Ctrl-u / Ctrl-k                  # coupe avant / après le curseur
Ctrl-y                           # colle le dernier texte coupé
Ctrl-x Ctrl-e                    # édite la commande courante dans $EDITOR
```

État attendu : le curseur se déplace et le texte s'édite sans les touches
fléchées. Si `Alt-b` et `Alt-f` insèrent des caractères accentués au lieu de
déplacer le curseur, le terminal envoie Meta en 8 bits : ajouter
`set meta-flag on` et `set input-meta on` dans `~/.inputrc`, ou utiliser `Échap`
puis la lettre.

Les raccourcis ci-dessus sont ceux du keymap emacs, actif par défaut dans les
2 shells. Zsh n'utilise pas readline : il embarque son propre éditeur, ZLE,
qui ignore totalement `~/.inputrc`. Les associations passent par `bindkey`, dans
`~/.zshrc`.

```zsh
bindkey -L                       # toutes les associations du keymap courant
bindkey -l                       # les keymaps : emacs, viins, vicmd, ...
bindkey -v                       # bascule en mode vi (équivaut à set -o vi)
bindkey -M viins '^R' history-incremental-search-backward
zle -la                          # tous les widgets disponibles
```

État attendu : `bindkey -L` affiche une ligne par touche associée. Sous bash,
l'équivalent est `bind -p`, et les réglages persistants vont dans `~/.inputrc`.

### Alias et fonctions

```bash
# Alias : raccourci textuel, interactif seulement
alias ll='ls -lh --color=auto'
unalias ll

# Espace final : autorise l'expansion de l'alias qui SUIT sudo
alias sudo='sudo '               # sans lui, `sudo ll` : command not found

# Fonction : arguments, variables locales, validation
backup() {
  local src="${1:?usage: backup FICHIER}"
  cp -a -- "$src" "${src}.$(date +%Y%m%d-%H%M%S).bak"
}
```

État attendu : alias et fonctions sont disponibles dans la session interactive,
et persistants s'ils sont définis dans `~/.bashrc` ou un fichier sourcé par lui.

Avant de nommer une fonction, vérifier qu'aucun exécutable du PATH ne porte ce
nom : la fonction le masquerait définitivement.

```bash
type -a extract                  # « is /home/user/.local/bin/extract » : pris
whence -a extract                # zsh
```

Zsh ajoute 2 formes d'alias sans équivalent sous bash :

```zsh
alias -g G='| grep -i'           # global : substitué N'IMPORTE OÙ dans la ligne
alias -s pdf=zathura             # suffixe : `fichier.pdf` ouvre zathura
```

État attendu : `ls G motif` devient `ls | grep -i motif`. Les alias globaux se
substituent aussi à l'intérieur d'une chaîne de commandes : un nom court comme
`G` ou `L` peut se déclencher là où il n'était pas attendu, réserver les
majuscules à cet usage.

### Recharger la configuration sans empiler l'état

```bash
exec bash                        # remplace le processus : état neuf
exec zsh                         # idem sous zsh
```

État attendu : même terminal, même répertoire courant, aucune trace de la
session précédente. Les tâches en arrière-plan survivent au remplacement mais
sortent de la table des jobs : vérifier avec `jobs` avant.

`source` reste utile pour un fichier d'aliases seul, qui ne définit ni hook ni
`PROMPT_COMMAND`, ni widget ZLE.

### Variables d'environnement et PATH

```bash
printenv                         # toutes les variables exportées
export -p                        # variables exportées avec leur valeur
echo "$PATH"

VAR=valeur                       # locale au shell courant
export VAR=valeur                # exportée aux enfants
VAR=valeur commande              # uniquement pour cette commande
```

Ajout au PATH sans doublon, rechargeable sans gonfler la variable :

```bash
path_prepend() {
  local d
  for d in "$@"; do
    case ":$PATH:" in
      *":$d:"*) ;;
      *) PATH="$d:$PATH" ;;
    esac
  done
  export PATH
}
path_prepend "$HOME/.local/bin"
```

Sous zsh, le shell le fait nativement : `path` est un tableau lié à `PATH`, et
`typeset -U` y interdit les doublons.

```zsh
typeset -U path
path=("$HOME/.local/bin" /usr/local/bin $path)
```

État attendu : le répertoire apparaît une seule fois en tête de `$PATH`, même
après plusieurs rechargements. Toujours réinclure `$PATH` dans une affectation
directe, sous peine de perdre l'accès aux commandes système. Pour une unité
systemd, utiliser `Environment=` ; pour cron, définir les variables en tête de
crontab, l'environnement de cron étant quasi vide.

### Substitution de commande et de processus

```bash
fichiers=$(find . -name '*.log')        # capture la SORTIE
echo "Disque : $(df -h / | awk 'NR==2 {print $5}')"

diff <(sort a.txt) <(sort b.txt)        # une commande vue comme un FICHIER
tee >(gzip > sortie.gz) < entree.txt > /dev/null

x=${ ls | wc -l; }                      # 5.3+ : sans fork, shell courant
${| read -r ligne < fichier; }          # 5.3+ : résultat dans REPLY
```

État attendu : `$(...)` capture du texte, `<(...)` fournit un chemin de fichier
virtuel, `${ ...; }` fait la même chose que `$(...)` sans créer de sous-shell.
Sous Bash 5.2, cette dernière forme échoue avec « bad substitution » : vérifier
`bash --version` avant de l'employer dans un fichier partagé.

Zsh ajoute `=(commande)`, qui matérialise la sortie dans un vrai fichier
temporaire plutôt qu'un tube nommé : indispensable pour un programme qui fait
des accès non séquentiels ou qui refuse un FIFO.

```zsh
diff =(sort a.txt) =(sort b.txt)
```

Pour préserver les variables modifiées dans une boucle de lecture, alimenter par
substitution de processus : `while read l; do ...; done < <(commande)` garde les
variables, alors que `commande | while read` les perd dans un sous-shell sous
bash. Zsh exécute le dernier étage d'un tube dans le shell courant : le même
code y conserve la variable, ce qui rend le bogue invisible jusqu'au portage.
Mesuré sur une boucle de 3 lignes : `count=3` sous zsh, `count=0` sous bash,
et `count=3` sous bash avec `shopt -s lastpipe`, inopérant en interactif car il
exige que le contrôle de tâches soit désactivé.

### Élévation de privilèges (sudo, su, visudo)

```bash
sudo commande                    # exécute en root, journalisé
sudo -u utilisateur commande     # exécute sous une autre identité
sudo -l                          # liste ses propres autorisations
sudo -k                          # oublie le ticket, force la ressaisie
sudoedit /etc/fichier            # ouvre en tant qu'utilisateur, écrit en root

sudo visudo                             # syntaxe validée avant écriture
sudo visudo -f /etc/sudoers.d/deploy    # fichier modulaire dédié

# Règle restreinte : commande précise, chemin absolu
# deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
```

État attendu : la commande s'exécute avec les privilèges voulus et l'appel est
journalisé. `visudo` refuse d'enregistrer un fichier dont la syntaxe est
invalide, ce qui évite de verrouiller l'accès root.

---

## Dépannage par symptôme

### Les modifications de ~/.bashrc ne prennent pas effet

Symptôme : une variable, un alias ou une fonction ajouté à `~/.bashrc` reste
indisponible. Cause probable : le shell courant a déjà lu le fichier, ou il
s'agit d'un shell de login qui ne lit pas `~/.bashrc`.

```bash
# bash
shopt login_shell                # « on » : le fichier lu est ~/.bash_profile
exec bash                        # relit toute la configuration proprement
echo '[[ -r ~/.bashrc ]] && . ~/.bashrc' >> ~/.bash_profile
```

```zsh
# zsh : .zshrc est lu par tout shell interactif, login compris. Un réglage
# absent vient plutôt d'un ZDOTDIR qui déplace les fichiers.
print -r -- "${ZDOTDIR:-$HOME}"  # répertoire réellement lu
exec zsh
```

### Un script de ~/.local/bin n'est pas celui qui s'exécute

Symptôme : la commande répond autre chose que le script installé, ou ignore ses
options, sans message d'erreur. Cause probable : un alias ou une fonction du
même nom, défini dans `~/.bashrc` ou un fichier d'aliases, masque le PATH.

Première action de discrimination :

```bash
type -a nom_de_la_commande
```

```
Sortie de type -a / whence -a  Correction bash          Correction zsh
─────────────────────────────  ──────────────────       ────────────────────
alias                          unalias nom              unalias nom
fonction                       unset -f nom             unfunction nom
commande interne               enable -n nom            disable nom
chemin, mais le mauvais        homonyme dans le PATH : lire l'ordre complet
```

Dans les 2 cas, retirer aussi la ligne du fichier de configuration : sans
cela, le masquage revient au prochain terminal.

Si la commande est correcte mais introuvable : vérifier que le répertoire est
bien dans `$PATH`, et que le shell n'a pas mémorisé un ancien chemin.

```bash
hash -r                          # bash : vide le cache des chemins
rehash                           # zsh : idem
```

Sous zsh, `zstyle ':completion:*' rehash true` dans `~/.zshrc` rend ce
rafraîchissement automatique, ce qui évite le « command not found » qui suit
l'installation d'un paquet dans un terminal déjà ouvert.

### Le prompt ralentit et PROMPT_COMMAND s'allonge

Symptôme : après plusieurs `source ~/.bashrc`, l'invite met du temps à
s'afficher. Cause probable : une ligne du type
`PROMPT_COMMAND="history -a; $PROMPT_COMMAND"` se concatène à elle-même à chaque
rechargement.

```bash
declare -p PROMPT_COMMAND        # montre la répétition : history -a; ...
exec bash                        # repart d'un état propre
```

Sous zsh, le pendant est un `precmd()` défini directement, qui écrase celui d'un
plugin ou se fait écraser par lui.

```zsh
autoload -Uz add-zsh-hook
add-zsh-hook precmd ma_fonction  # idempotent : n'ajoute pas deux fois
print -l -- $precmd_functions    # état réel des hooks
```

Correction durable dans le fichier de configuration bash : nommer la fonction et
tester son appartenance avant d'ajouter.

```bash
_hist_sync() { history -a; }
[[ " ${PROMPT_COMMAND[*]-} " == *" _hist_sync "* ]] ||
  PROMPT_COMMAND=(_hist_sync ${PROMPT_COMMAND[@]+"${PROMPT_COMMAND[@]}"})
```

### Sous zsh, ~/.inputrc n'a aucun effet

Symptôme : les réglages d'édition de ligne fonctionnent sous bash et sont
ignorés sous zsh, y compris `set completion-ignore-case on`. Cause probable :
zsh n'utilise pas readline, mais son propre éditeur ZLE, qui ne lit jamais ce
fichier. Comportement structurel, pas un défaut de configuration.

```zsh
bindkey -M emacs '^R' history-incremental-search-backward   # associer
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'      # casse ignorée
```

### « no matches found » et la commande ne s'exécute pas du tout

Symptôme : sous zsh, `commande *.log` échoue avec « no matches found » quand
aucun fichier ne correspond, alors que bash passe le motif littéral au
programme. Cause probable : l'option `NOMATCH`, active par défaut, considère un
motif sans correspondance comme une erreur.

```zsh
setopt NULL_GLOB                 # motif sans correspondance : supprimé
setopt NO_NOMATCH                # motif sans correspondance : passé littéral
print -r -- *.log(N)             # ponctuel : le qualificateur (N) sur ce motif
noglob commande '*.log'          # si le programme doit voir le motif
```

Le dernier cas se rencontre avec `scp serveur:'*.log' .` et avec les commandes
qui font leur propre globbing.

### La variable est définie dans le terminal mais absente dans cron ou SSH

Symptôme : un script marche en interactif, échoue en cron ou en SSH non
interactif. Cause probable : ces contextes ne lisent ni `~/.bashrc` ni
`~/.profile`, leur environnement est minimal.

```bash
# En tête de crontab :
PATH=/usr/local/bin:/usr/bin:/bin
MAILTO=admin@exemple.fr
# Ou sourcer explicitement l'environnement dans le script :
. /etc/profile.d/monenv.sh
```

### Un alias ne fonctionne pas dans un script

Symptôme : un alias défini dans `~/.bashrc` est introuvable une fois le script
bash lancé, alors que le même script fonctionne sous zsh. Cause probable : bash
ne développe pas les alias dans les shells non interactifs, zsh le fait.

```bash
shopt -s expand_aliases          # en tête du script, AVANT de sourcer les alias
# Mieux : remplacer l'alias par une fonction, développée partout
```

Vérifié : le même script affiche « ALIAS » sous zsh et « command not found »
sous bash.

### Variables perdues après une boucle « while read » dans un pipe

Symptôme : un compteur modifié dans `cmd | while read` vaut zéro après la
boucle. Cause probable : le pipe exécute la boucle dans un sous-shell, dont les
variables ne remontent pas.

```bash
count=0
while read -r l; do count=$((count+1)); done < <(grep -c . fichiers)
echo "$count"                    # correct : boucle dans le shell courant
```

### Terminal corrompu après l'affichage d'un fichier binaire

Symptôme : caractères illisibles, invite cassée, écho absent. Cause probable :
des octets de contrôle ont été envoyés au terminal.

```bash
reset                            # réinitialisation complète
printf '\033c'                   # en aveugle si l'écho est cassé
stty sane                        # rétablit les réglages de terminal seuls
```

### sudo demande un mot de passe malgré une règle NOPASSWD

Symptôme : `sudo cmd` redemande le mot de passe alors qu'une règle NOPASSWD
existe. Cause probable : la règle ne correspond pas exactement, chemin relatif
contre chemin absolu, ou arguments différents.

```bash
command -v ip                    # /usr/bin/ip
sudo -l                          # règle réellement appliquée
# La règle doit viser /usr/bin/ip, pas « ip »
```

---

## Sécurité

> **3 failles d'élévation de privilèges depuis 2025, dont une en 2026.** La
> CVE-2025-32463 (CVSS 9.3) permet à un utilisateur local quelconque d'obtenir
> root via l'option chroot, même sans aucune règle sudoers, en faisant charger
> un `/etc/nsswitch.conf` piégé. La CVE-2025-32462 permet d'exécuter des
> commandes prévues pour un autre hôte. Les 2 sont corrigées en 1.9.17p1. La
> CVE-2026-35535 (CVSS 7.4, publiée le 3 avril 2026) vient d'un abandon de
> privilèges non vérifié avant l'appel du mailer : un échec de `setuid`,
> `setgid` ou `setgroups` n'était pas fatal.

> **Le numéro de version ne suffit pas pour la CVE de 2026.** La branche stable
> amont est restée en 1.9.17p2 (juillet 2025), le correctif étant le commit
> `3e474c2` repris en patch par les distributions à partir de mars 2026.
> `sudo -V` affiche donc 1.9.17p2 sur un système corrigé comme sur un système
> vulnérable : lire le journal du paquet.

```bash
sudo -V | head -1                        # version amont
pacman -Qc sudo | head -20               # Arch : changelog du paquet
apt changelog sudo | head -20            # Debian et Ubuntu
rpm -q --changelog sudo | head -20       # RHEL et Fedora
```

État attendu : le journal mentionne la CVE-2026-35535 ou le correctif du mailer.
Contournement tant que le paquet n'est pas à jour, en désactivant le mailer :

```bash
sudo visudo -f /etc/sudoers.d/99-mailer  # Defaults mailerpath=""
```

> **Durcir la configuration sudo.** Ajouter `Defaults !use_chroot` et supprimer
> toute directive `CHROOT=` ou `runchroot=`, ce qui neutralise la voie de la
> CVE chroot. Conserver `Defaults use_pty` et `Defaults env_reset`, et éviter
> les règles host-spécifiques au profit de règles par groupe ou par commande.

> **Limiter NOPASSWD au strict nécessaire.** Le réserver aux comptes de service,
> restreint à des commandes précises avec chemin absolu, jamais `NOPASSWD: ALL`
> pour un compte humain. Auditer :
> `grep -r NOPASSWD /etc/sudoers /etc/sudoers.d/`

> **Se méfier des commandes sudo qui ouvrent un shell.** Autoriser via sudo un
> éditeur, un pager (`less`, `vi`) ou un interpréteur (`python`) revient souvent
> à donner un shell root, ces outils permettant d'exécuter des commandes.
> Préférer `sudoedit` pour l'édition, et le tag `NOEXEC` quand il est
> disponible.

> **Le périmètre de sudo ne couvre pas le noyau.** Une élévation locale peut
> venir du noyau lui-même, comme la CVE-2026-31431 (avril 2026, CVSS 7.8) :
> maintenir sudo à jour ne dispense pas des mises à jour de noyau.

---

## Problèmes connus et contournements

### HISTCONTROL=erasedups est incompatible avec l'écriture incrémentale

`erasedups` ne purge que la liste en mémoire. Avec `history -a` exécuté à chaque
invite, les lignes partent au fichier avant toute purge : le fichier garde les
doublons, la session non, et les 2 vues divergent. Comportement structurel.
Employer `ignoreboth` seul, ou renoncer à l'écriture incrémentale.

### Substitution de commande dans une boucle : performance catastrophique

Appeler `$(commande)` à chaque itération relance un sous-processus à chaque
tour, ce qui s'effondre sur des milliers d'itérations. Sortir l'appel de la
boucle, traiter le flux en une passe avec `awk`, ou employer `${ commande; }`
en Bash 5.3, qui exécute sans fork.

### Sous zsh, un script sans guillemets se comporte différemment sous bash

`for f in $liste` fait un seul tour sous zsh et un tour par mot sous bash, le
découpage IFS des expansions non protégées étant désactivé par défaut sous zsh.
Comportement structurel, réglé par `setopt SH_WORD_SPLIT` mais au prix de la
cohérence avec le reste de la configuration zsh. Contournement : mettre des
guillemets systématiquement, et expanser explicitement quand un découpage est
voulu, `${=var}` par les espaces ou `${(f)var}` par les sauts de ligne.

### Zsh perd moins de variables dans les tubes, ce qui masque un bogue portable

Le dernier étage d'un tube s'exécute dans le shell courant sous zsh : une
variable modifiée dans `cmd | while read` y survit à la boucle. Le même code
sous bash rend zéro. Un script mis au point sous zsh échoue une fois porté :
écrire `< <(commande)`, qui fonctionne dans les 2 shells.

### secure_path neutralise le PATH de l'utilisateur sous sudo

Par défaut, sudo réinitialise le PATH selon `Defaults secure_path`. Une commande
accessible dans le PATH de l'utilisateur devient introuvable sous sudo :
utiliser le chemin absolu, ou ajuster `secure_path` via `visudo`.

### LD_LIBRARY_PATH défini globalement casse des commandes système

Défini dans l'environnement global, il force des binaires système à charger des
bibliothèques inattendues, avec des erreurs de symboles à la clé. Ne jamais
l'exporter globalement : le poser pour la seule commande concernée,
`LD_LIBRARY_PATH=/opt/lib commande`.

---

## Protocole d'urgence

Situation : une modification de sudoers, du PATH ou d'un fichier de démarrage a
rendu le système inutilisable ou l'élévation impossible.

**1. Stopper.** Ne pas fermer le terminal en cours. Ne lancer aucune autre
modification.

**2. Préserver.** Ouvrir un second terminal et vérifier qu'il fonctionne avant
toute correction. Si une session root est déjà ouverte quelque part, la garder.

**3. Observer.** Identifier le périmètre exact.

```bash
sudo -l                          # « syntax error » : sudoers est cassé
echo "$PATH"                     # vide ou sans /usr/bin : PATH cassé
```

**4. Isoler.** Si l'élévation est perdue, ne pas se déconnecter : la session
authentifiée en cours est la dernière voie d'accès.

**5. Escalader.** Sans accès root et sans session de secours, passer au
démarrage sur support externe.

### Cas : le shell ne démarre plus après édition de sa configuration

Le fichier fautif est lu avant l'invite : le terminal se ferme ou boucle sur une
erreur. Démarrer sans aucun fichier de configuration, corriger, puis relancer.

```bash
bash --norc --noprofile          # bash sans configuration
zsh -f                           # zsh sans configuration (aucun rc lu)
zsh -n ~/.zshrc                  # valide la syntaxe sans exécuter
bash -n ~/.bashrc                # idem
```

Depuis un autre shell, si le shell de connexion lui-même est cassé :
`chsh -s /bin/bash` rétablit un shell fonctionnel sans toucher aux fichiers.

### Cas : PATH cassé, plus aucune commande ne répond

Les commandes internes du shell restent disponibles. Reconstruire le PATH avec
la commande interne `export`, sans dépendre d'un binaire externe :

```bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
hash -r                          # bash
rehash                           # zsh
```

### Cas : sudoers invalide, sudo refuse de fonctionner

`visudo` empêche ce cas à l'écriture. Il survient après une édition directe.
Ordre de tentative, du moins destructeur au plus lourd :

```bash
pkexec visudo                    # polkit, indépendant de sudoers
su -                             # si un mot de passe root existe
```

À défaut, redémarrer en mode secours ou sur un support live, monter la racine et
corriger le fichier :

```bash
mount /dev/sdaX /mnt
nano /mnt/etc/sudoers            # ou supprimer le fichier fautif de sudoers.d/
chmod 0440 /mnt/etc/sudoers
```

---

## Processus de récupération

### Prérequis

```bash
ls -l ~/.bashrc*.bak*            # sauvegarde du fichier de démarrage
ls -l /etc/sudoers.d/            # fichiers modulaires en place
id                               # identité et groupes courants
```

Si aucune sauvegarde n'existe et que sudoers est cassé, la récupération passe
par le support de secours : ne pas tenter les étapes suivantes.

### Étapes de restauration

**1. Restaurer le fichier de démarrage.**

```bash
cp -a ~/.bashrc.20260818-101500.bak ~/.bashrc
bash -n ~/.bashrc                # aucune sortie : syntaxe valide
zsh -n ~/.zshrc                  # équivalent zsh
```

**2. Vérifier la syntaxe de sudoers avant de le remettre en service.**

```bash
visudo -c -f /etc/sudoers        # « parsed OK »
visudo -c -f /etc/sudoers.d/deploy
```

**3. Rétablir les permissions attendues.**

```bash
chmod 0440 /etc/sudoers /etc/sudoers.d/*
chown root:root /etc/sudoers /etc/sudoers.d/*
```

### Validation d'état

```bash
exec bash                        # recharge complète, sans état résiduel
                                 # (exec zsh sous zsh)
sudo -l                          # les règles s'affichent : sudoers est lu
type -a sudo                     # aucun alias ni fonction parasite
whence -a sudo                   # équivalent zsh
echo "$PATH"                     # les répertoires système sont présents
```

État attendu : les 4 commandes répondent sans erreur, `sudo -l` liste les
autorisations, `$PATH` contient `/usr/bin`.

---

## Traitement par lots

```bash
shopt -s nullglob

# Vérifier la syntaxe de tous les fichiers de configuration du shell
for f in ~/.bashrc ~/.bash_profile ~/.config/bash/*.bash; do
  bash -n "$f" || printf 'SYNTAXE: %s\n' "$f" >&2
done

# Le même contrôle côté zsh
for f in ~/.zshrc ~/.zprofile ~/.config/zsh/*.zsh; do
  zsh -n "$f" || printf 'SYNTAXE: %s\n' "$f" >&2
done

# Sauvegarder chaque fichier de configuration avant une modification
for f in ~/.bashrc ~/.zshrc ~/.config/zsh/aliases.zsh; do
  cp -a "$f" "$f.$(date +%Y%m%d-%H%M%S).bak"
done
```

Un contrôle de syntaxe avant `exec zsh` évite le shell qui refuse de démarrer :
c'est la précaution la moins chère du corpus.

---

## Pipelines utiles

```bash
# Variables exportées, distinguées des variables de shell
env | cut -d= -f1 | sort > /tmp/exportees
set -o posix; set | grep -oE '^[A-Za-z_][A-Za-z0-9_]*' | sort > /tmp/toutes
comm -13 /tmp/exportees /tmp/toutes | head -20

# PATH en une entrée par ligne, doublons repérés
printf '%s\n' "${PATH//:/$'\n'}" | sort | uniq -d

# Répertoires du PATH qui n'existent pas
printf '%s\n' "${PATH//:/$'\n'}" |
  while read -r d; do [ -d "$d" ] || echo "ABSENT: $d"; done

# Quelle définition d'un nom est employée, dans l'ordre de résolution
type -a commande

# Fichiers de démarrage réellement lus, tracés
bash -lixc true 2>&1 | grep -E '^\+\+ (source|\.) ' | head

# Comparer l'environnement interactif et non interactif
diff <(bash -lic env | sort) <(bash -c env | sort) | head -20
```

Les signes employés dans ces formes, `${PATH//:/}`, `2>&1`, `comm -13`, sont
déchiffrés un à un dans le runbook syntaxe-symboles.

La dernière forme explique les incidents où un script fonctionne au clavier et
échoue en tâche planifiée. Le shell non interactif ne lit ni `~/.bashrc` ni le
profil, donc tout ce qui y est défini disparaît sans message d'erreur.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
Bash, notes de version  https://git.savannah.gnu.org/cgit/bash.git/tree/NEWS
Zsh                     https://zsh.sourceforge.io/News/
sudo, avis de sécurité  https://www.sudo.ws/security/advisories/
```

---

## Points clés à retenir

Avant de nommer une fonction ou un alias : `type -a nom` sous bash, `whence -a
nom` sous zsh, sinon un script du PATH est masqué sans message.

`\commande` ne contourne que l'alias, `command commande` contourne aussi la
fonction : viser le bon niveau selon ce qui masque. Retirer : `unset -f` sous
bash, `unfunction` sous zsh.

Après modification d'un fichier de démarrage : `exec bash` ou `exec zsh` plutôt
que `source`, qui empile les hooks et laisse en place ce qui a été supprimé du
fichier.

Variable absente en cron ou en SSH non interactif : ces contextes ne lisent ni
`~/.bashrc` ni `~/.profile`, définir l'environnement dans le contexte lui-même.

Toute affectation de `$PATH` doit réinclure `$PATH`, sinon les commandes système
disparaissent de la session.

Pour préserver les variables d'une boucle de lecture : alimenter par
`< <(commande)`, jamais par `commande |`, qui crée un sous-shell.

Avant d'éditer sudoers, le PATH système ou un fichier de démarrage : garder un
second terminal déjà authentifié.

Éditer sudoers uniquement par `visudo`, et vérifier un fichier existant par
`visudo -c -f`.

sudo : `sudo -V` ne prouve pas que la CVE-2026-35535 est corrigée, la branche
stable étant restée en 1.9.17p2. Lire le changelog du paquet.

Sous zsh : `HISTFILE` sans `SAVEHIST` ne sauvegarde rien, `SAVEHIST` valant 0
par défaut.

Sous zsh, `~/.inputrc` est ignoré : les associations de touches passent par
`bindkey` dans `~/.zshrc`.

Script écrit sous zsh et destiné à tourner sous bash : mettre des guillemets
autour de chaque expansion, et alimenter les boucles par `< <(commande)`, les
2 shells ne découpant ni ne sous-shellant de la même façon.

`Ctrl-r` et `Alt-.` restent les 2 raccourcis les plus rentables, dans les
2 shells.
