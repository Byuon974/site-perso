# La Commande `cp` : Stratégies de Duplication et Préservation d'État

## 1. Objectif et Champ d'Application
*Commande fondamentale de duplication de fichiers et répertoires dans les systèmes Unix/Linux*
*Création de snapshots, préparation de données pour export, isolation des transformations*
*Différences sémantiques clés avec `mv`, `rsync` et outils de synchronisation*

## 2. Principes Fondamentaux
**Modèle mental :** `cp` crée des états duplicables, `mv` publie/bascule, `rsync` synchronise des écarts
**État préservé :** Contenu + métadonnées (permissions, timestamps) selon les options
**Invariant critique :** Source jamais modifiée (sauf avec options spécifiques)

> `cp` est une primitive de préservation d'état, pas une simple copie d'octets. 
> Son utilisation professionnelle exige une compréhension de ce qui est préservé (métadonnées) et de ce qui ne l'est pas (verrous, état d'ouverture).

## 3. Opérations Standard

### 3.1 Duplication Basique avec Préservation Complète
```bash
# Clone exact avec toutes les métadonnées
cp -a source destination  # -a = -dR --preserve=all

# Alternative explicite
cp --preserve=mode,ownership,timestamps --recursive source destination
```

**Résultat attendu :** Réplique bit-à-bit avec métadonnées identiques

### 3.2 Patterns de Staging pour Transformations
```bash
# Création d'un environnement isolé
mkdir -p STAGING
cp -a ./dataset/. STAGING/  # Note: le point après le slash copie le contenu

# Transformation dans STAGING
# ... opérations de nettoyage, reformatage

# Validation puis publication
validate STAGING && mv STAGING ./dataset_clean
```

### 3.3 Export Canonique vers Environnements Contraints
```bash
# Normalisation des noms pour Android/Windows
normalize_name() {
  echo "$1" | sed 's/[<>:"\\|?*]//g; s/^ \+//; s/ \+$//; s/  \+/ /g'
}

src="fichier: avec:problèmes.txt"
dst="SAFE/$(normalize_name "$src")"
cp -n --preserve=mode,timestamps -- "$src" "$dst"
```

### 3.4 Snapshots Opérationnels avec Contexte
```bash
# Capture d'état pour debugging avec préservation du chemin
mkdir -p snapshot_$(date +%Y%m%d_%H%M%S)
cp -a --parents /var/log/syslog /etc/passwd snapshot_*/
```

### 3.5 Publication Atomique (évite les états partiels)
```bash
# Pattern pour publication sans interruption visible
temp_dst="${destination}.tmp.$$"
cp -a -- "$source" "$temp_dst"
mv -- "$temp_dst" "$destination"
```

## 4. Dépannage
| Symptôme | Cause probable | Action |
|----------|----------------|---------|
| `cp: omitting directory` | Oubli de l'option récursive | Ajouter `-r` ou `-a` |
| Permissions modifiées | Préservation non activée | Utiliser `-p` ou `--preserve=mode` |
| Timestamps unifiés à maintenant | `--preserve=timestamps` manquant | Inclure dans les options |
| Copie interrompue fichier partiel | Processus tué ou espace disque plein | Supprimer fichier partiel, vérifier espace, relancer |
| `Argument list too long` | Trop de fichiers en argument | Utiliser `find` avec `-exec` ou `xargs` |

## 5. Problèmes Connus
- **Problème :** `cp -r` sans `-p` réinitialise tous les timestamps
  - **Solution :** Toujours utiliser `-a` ou `-p` pour les copies opérationnelles
  - **Cause :** Comportement par défaut de `cp` sans options de préservation

- **Problème :** Confusion entre `source/` et `source/.` pour les répertoires
  - **Solution :** `cp -a source/. destination/` pour copier le contenu
  - `cp -a source destination/` crée `destination/source/`

- **Problème :** Copie croisée de systèmes de fichiers lente
  - **Solution :** Utiliser `rsync` pour les gros volumes avec reprise possible
  - **Alternative :** `tar cf - source | (cd dest && tar xf -)`

## 6. Protocole d'Urgence (Données Corrompues)
1. **Immédiat :** Arrêter toute écriture sur la source et la destination
2. **Préserver :** Capturer `ls -laR`, `stat` des fichiers affectés, logs système
3. **Investigation :** Comparer checksums (`sha256sum`) pour identifier l'étendue
4. **Restauration :** Si backup disponible, restaurer avec vérification d'intégrité

## 7. Processus de Récupération
- [ ] **Prérequis :** Vérifier l'espace disque et les permissions en écriture
- [ ] **Étape 1 :** Nettoyer les fichiers partiellement copiés
```bash
find destination -type f -size 0 -delete  # Fichiers vides
```
- [ ] **Étape 2 :** Relancer avec journalisation et vérification
```bash
cp -av source destination 2>copy_errors.log
```
- [ ] **Validation :** Vérifier le compte et la taille des fichiers
```bash
src_count=$(find source -type f | wc -l)
dst_count=$(find destination -type f | wc -l)
[ "$src_count" -eq "$dst_count" ] && echo "OK" || echo "Problème"
```

## 8. Points Clés à Retenir
- **Sous pression :** `cp -a` préserve tout, `cp -n` n'écrase jamais, `cp -i` demande confirmation
- **Long terme :** Journaliser les copies importantes avec checksums pour audit futur
- **Éviter :** Copier directement dans un répertoire géré par Syncthing/rsync - utiliser un staging intermédiaire
- **Idempotence :** Pour les scripts, combiner `-n` (no-clobber) avec normalisation des noms

> La puissance de `cp` réside dans sa simplicité conceptuelle, mais sa maîtrise exige une compréhension fine des métadonnées et des garanties d'intégrité. 
> Dans les pipelines de données, il est l'outil de choix pour créer des états isolés et reproductibles.
