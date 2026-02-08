---
title: "Chgrp"
description: "Commandes pour gérer les perms."
tags: ["tty", "devops", "cli"]
updated: 2025-10-20
---

## Finalité et Périmètre d'Application

_Commande système fondamentale pour modifier le groupe propriétaire de fichiers et répertoires sous Linux/Unix._
_Couvre : syntaxe de base, options de récursivité et de gestion des liens symboliques, intégration dans des scripts, et dépannage des erreurs de permissions._

---

## Principes Fondamentaux

### Modèle Mental : Contrôle d'Accès par Groupe

`chgrp` est l'outil spécialisé pour ajuster la composante "groupe" des permissions Unix. Il permet de gérer les droits d'accès collectifs, essentiels pour la collaboration et la sécurité dans un environnement multi-utilisateurs.

### État et Localisation des Métadonnées

- **Métadonnées de groupe** : Stockées dans l'inœud (_inode_) du fichier, visible via `ls -l`.
- **Base de données des groupes** : Les groupes systèmes sont définis dans `/etc/group`. Un groupe doit y exister pour être assigné.
- **Permissions d'exécution** : Pour modifier le groupe, vous devez être le propriétaire du fichier **ET** membre du groupe cible, ou agir en tant que `root`/`sudo`.

### Contraintes et Invariants

- `chgrp` ne modifie **que** le groupe, jamais le propriétaire utilisateur (contrairement à `chown`).
- L'opération est soumise aux mêmes vérifications de permissions que toute modification du système de fichiers.
- Les changements sont immédiats et ne nécessitent pas de redémarrage de service.

> **Règle d'or de sécurité :** Utilisez toujours le principe du moindre privilège. Avant d'assigner un groupe, demandez-vous si tous ses membres ont besoin de l'accès que les permissions actuelles (ou planifiées) accordent.

---

## Opérations Standard et Procédures Courantes

### 1. Modification Basique et Vérification

```bash
# Changer le groupe d'un seul fichier
sudo chgrp developers projet/script.py

# Vérification immédiate avec ls
ls -l projet/script.py
# -rw-r--r-- 1 alice developers 1234 Jan 15 10:00 script.py
```

**Résultat attendu :** La colonne du groupe affichée par `ls -l` montre le nouveau groupe (`developers`).

### 2. Application Récurrente sur une Arborescence

```bash
# Appliquer un groupe à un répertoire et tout son contenu
sudo chgrp -R www-data /var/www/mon_site/

# Combiner avec le mode verbeux pour un suivi
sudo chgrp -Rv backup /srv/archive/
```

**Résultat attendu :** Tous les fichiers et sous-répertoires héritent du groupe `www-data`. L'option `-v` liste chaque changement.

### 3. Gestion des Liens Symboliques

```bash
# Par défaut : modifie le groupe de la CIBLE du lien
sudo chgrp operators /opt/lien_vers_log -> (modifie la cible)

# Pour modifier le groupe du LIEN SYMBOLIQUE lui-même
sudo chgrp -h operators /opt/lien_vers_log
```

**Résultat attendu :** Utiliser `ls -l` montre le groupe du lien symbolique modifié, tandis que `ls -lL` (pour suivre le lien) montre le groupe de la cible.

### 4. Utilisation dans un Script avec Validation

```bash
#!/usr/bin/env bash
TARGET_DIR="/data/project_alpha"
TARGET_GROUP="analysts"

# Validation critique : le groupe existe-t-il ?
if ! getent group "$TARGET_GROUP" > /dev/null; then
    echo "ERREUR: Le groupe '$TARGET_GROUP' n'existe pas." >&2
    exit 1
fi

# Exécution sécurisée et verbose
if sudo chgrp -Rcv "$TARGET_GROUP" "$TARGET_DIR"; then
    echo "Succès : Groupe modifié pour $TARGET_DIR"
else
    echo "Échec : Vérifiez les permissions et les chemins." >&2
fi
```

---

## Arbre de Diagnostic Rapide

### `Operation not permitted`

**Causes**

- Pas de droits `sudo`
- Vous n’êtes pas propriétaire du fichier
- Groupe incorrect

**Actions**

- Utiliser `sudo`
- Vérifier avec `ls -l`
- Vérifier avec `groups`

---

### `invalid group: 'nom'`

**Cause**

- Groupe absent de `/etc/group`

**Action**

- `sudo groupadd nom`
- `getent group`

---

### `cannot dereference 'lien'`

**Cause**

- Lien symbolique protégé (`protected_symlinks`)

**Action**

- Utiliser `-h`
- Vérifier les droits de la cible

---

### Changements non persistants

**Cause**

- NFS / AFS ou régénération automatique

**Action**

- Vérifier les montages
- Inspecter le processus gestionnaire

---

## Problèmes Connus et Contournements

- **Problème : Attribution involontaire via des liens symboliques en mode récursif.**
  - **Contournement :** Utilisez `-P` (par défaut) ou `-H` au lieu de `-L` avec `-R`. Testez d'abord avec `-v` pour voir quels fichiers seraient touchés.
  - **Cause Racine :** L'option `-RL` fait suivre tous les liens symboliques, pouvant conduire à modifier des fichiers en dehors de l'arborescence prévue.

- **Problème : Héritage de groupe indésirable après `cp -p`.**
  - **Contournement :** La copie avec `-p` préserve le groupe. Soit utilisez `cp` sans `-p`, soit exécutez `chgrp` après la copie pour corriger le groupe.
  - **Cause Racine :** Le comportement de préservation (`-p`) de `cp` est conçu pour la fidélité, pas pour l'adaptation au contexte cible.

- **Problème : L'utilisateur est propriétaire mais ne peut pas assigner à un groupe.**
  - **Contournement :** L'utilisateur doit d'abord être ajouté au groupe cible avec `sudo usermod -aG groupe_cible $USER`. Une nouvelle session est nécessaire.
  - **Cause Racine :** Politique de sécurité standard : un utilisateur ne peut assigner un fichier qu'à un groupe dont il est membre.

---

## Protocole d'Urgence

1.  **Action Immédiate : Arrêter la Modification.**
    - Si vous avez lancé un `chgrp -R` sur un mauvais chemin, interrompez-le immédiatement avec **`Ctrl + C`**.

2.  **Préservation : Évaluer l'Étendue des Dégâts.**
    - Identifiez le point de départ de la commande erronée et le groupe assigné.
    - Utilisez `find` pour lister récursivement tous les fichiers appartenant désormais à ce groupe depuis ce point :
      ```bash
      find /chemin/errone -group mauvais_groupe -ls
      ```

3.  **Investigation : Identifier la Cause et le Périmètre Exact.**
    - Consultez l'historique des commandes (`history`) pour obtenir la commande `chgrp` exacte utilisée.
    - Vérifiez si des services critiques (web, base de données) utilisant des groupes spécifiques (`www-data`, `postgres`) ont été affectés et présentent des erreurs d'accès.

---

## Processus de Rétablissement

- [ ] **Prérequis :** Avoir une liste fiable des permissions d'origine ou un point de référence (backup, snapshot, autre serveur).
- [ ] **Étape 1 : Restauration Partielle des Services.**
  - Remettez les groupes critiques pour les services système (ex: `/var/www/`, `/var/lib/postgresql`).
  ```bash
  sudo chgrp -R www-data /var/www/
  sudo systemctl restart apache2
  ```
- [ ] **Étape 2 : Restauration Complète des Arborescences Utilisateurs.**
  - Utilisez un script basé sur la liste générée par `find` et votre référence pour restaurer groupe par groupe.
  ```bash
  # Exemple de correction ciblée
  sudo find /home/projets -group mauvais_groupe -exec chgrp bon_groupe {} \;
  ```
- [ ] **Validation :** Vérifiez l'intégrité.
  - Confirmez que les services redémarrés fonctionnent.
  - Faites un échantillonnage avec `ls -lR` sur des répertoires clés pour vérifier que les groupes sont corrects.

---

## Points Clés à Retenir

### Sous Pression

- **`Ctrl+C`** est votre premier réflexe pour arrêter un `chgrp -R` lancé par erreur.
- Pour diagnostiquer, **`find /path -group groupe_name`** est plus rapide que de parcourir manuellement l'arborescence.
- La commande **`getent group`** confirme instantanément l'existence d'un groupe avant de l'utiliser.

### Considérations Long Terme

- **Portabilité des scripts :** Préférez les **GID numériques** (`chgrp 1002 fichier`) dans les scripts pour les environnements où les noms de groupes pourraient différer (conteneurs, différents serveurs).
- **Audit et conformité :** Documentez les changements de groupe sur les répertoires systèmes critiques. Un changement de groupe peut être une action de persistance pour un attaquant.
- **Alternative à `chgrp` :** La commande **`chown :groupe fichier`** est fonctionnellement équivalente. Choisissez `chgrp` pour la clarté de l'intention dans les scripts et l'historique.

### Idées Fausses à Éviter

- **"`sudo` résout tous les problèmes de permission avec `chgrp`."** Vrai pour les droits, mais `sudo` ne contourne pas la nécessité que le groupe cible existe.
- **"Modifier le groupe d'un lien avec `-h` change les droits d'accès."** Faux. Les droits d'accès sont gouvernés par la **cible** du lien. Modifier le groupe du lien est une opération métadonnée rarement utile.
- **"`chgrp -R` est sans danger sur des répertoires connus."** Risqué. Des liens symboliques (`/tmp`, `/proc`) peuvent être présents et rediriger l'opération vers des chemins sensibles.
