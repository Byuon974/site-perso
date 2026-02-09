---
title: "Cat"
description: "Commande fondamentale pour la lecture, la concaténation et la redirection de fichiers texte."
tags: ["linux", "cli", "unix"]
updated: 2025-01-31
---

## Finalité et Périmètre d'Application
*Commande fondamentale pour la lecture, la concaténation et la redirection de fichiers texte en environnement Unix/Linux.*
*Couvre les opérations de base, l'intégration dans les pipelines shell, et clarifie quand l'utiliser versus des alternatives modernes comme `bat`.*

---

## Principes Fondamentaux

### Modèle Mental : Outil de Base et de Composition
`cat` incarne la philosophie Unix de création d'outils simples et spécialisés qui se combinent. Il n'affiche pas, ne pagine pas, ne colore pas — il lit et écrit des octets. 
Sa puissance réside dans sa capacité à être le point de départ ou de liaison dans une chaîne de commandes.

### État et Flux de Données
* **Lecture seule** : `cat` ne modifie jamais les fichiers sources.
* **Flux d'entrée/sortie** : Il lit depuis des fichiers ou l'entrée standard (stdin) et écrit sur la sortie standard (stdout), permettant les redirections (`>`, `>>`, `|`).
* **Simplicité comme invariant** : Son comportement est strictement prédictible, ce qui en fait un outil fiable pour les scripts automatisés.

### Contraintes Clés
* Conçu pour le texte. L'affichage de fichiers binaires peut corrompre l'affichage du terminal.
* Affiche la totalité du contenu sans contrôle interactif (pas de défilement, retour en arrière).

> **Règle fondamentale :** Dans un script ou un pipeline automatisé, privilégiez toujours `cat` pour sa portabilité et son comportement prévisible. Pour une lecture interactive humaine, envisagez `bat` ou `less`.

---

## Opérations Standard

### 1. Affichage Basique et Formatage
```bash
# Afficher un fichier
cat /etc/os-release

# Numéroter toutes les lignes (utile pour le débogage)
cat -n script.py

# Numéroter uniquement les lignes non vides
cat -b journal.log

# Rendre les caractères non imprimables visibles (tabulations, fins de ligne)
cat -A fichier_etrange.txt
```

### 2. Concaténation et Création de Fichiers
```bash
# Fusionner deux fichiers en un nouveau
cat en-tête.txt contenu.txt > rapport_complet.txt

# Ajouter un fichier à la fin d'un autre
cat addendum.txt >> rapport_complet.txt

# Créer un fichier rapidement avec un "here-document"
cat > nouvelle_config.conf <<EOF
# Configuration générée le $(date)
paramètre=valeur
EOF
```

### 3. Intégration dans les Pipelines
```bash
# Alimenter un filtre comme grep
cat journal_serveur.log | grep -i "erreur"

# Transmettre du contenu à un outil de traitement (sed, awk, sort)
cat liste.txt | sort | uniq

# Lire depuis stdin puis concaténer avec un fichier
curl -s http://example.com/data.txt | cat - local_template.txt > sortie.txt
```
**Résultat attendu :** Flux de données propre et contrôlable, prêt pour un traitement ultérieur ou une redirection finale.

---

## Arbre de Diagnostic Rapide

| Symptôme | Cause Probable | Action Corrective |
| :--- | :--- | :--- |
| `No such file or directory` | Chemin de fichier incorrect ou permissions de lecture manquantes. | Vérifier le chemin avec `ls` et les permissions avec `ls -l`. |
| Terminal affiche des caractères bizarres/`corrompu` | Affichage d'un fichier binaire. | Arrêter avec `Ctrl+C`, restaurer le terminal avec la commande `reset`. |
| Commande `cat > fichier` ne se termine pas | Attente de saisie sur l'entrée standard. | Saisir le contenu, puis terminer avec **`Ctrl+D`** (signal EOF). |
| Fichier de sortie vide après `cat fichier > fichier` | La redirection `>` écrase le fichier avant que `cat` ne le lise. | Utiliser un fichier temporaire ou l'outil `sponge`. |
| Sortie trop longue et défile trop vite | Fichier volumineux sans contrôle de pagination. | Chaîner avec un paginateur : `cat long.log \| less`. |

---

## Problèmes Connus et Solutions

- **Problème : Écrasement accidentel du fichier source.**
  - **Solution :** Ne jamais faire `cat fichier > fichier`. Utiliser `sponge` (du paquet `moreutils`) : `cat fichier \| sponge fichier`.
  - **Cause Racine :** Le shell ouvre le fichier de destination en écriture (en le vidant) avant d'exécuter la commande `cat`.

- **Problème : "Useless Use of Cat" (UUoC) — Utilisation redondante.**
  - **Solution :** Passer le fichier directement en argument à la commande suivante.
    ```bash
    # Redondant : cat fichier.txt | grep "motif"
    # Optimal : grep "motif" fichier.txt
    ```
  - **Cause Racine :** Inefficacité inutile (création d'un processus supplémentaire).

- **Problème : `cat` est basique pour une lecture interactive.**
  - **Solution :** Pour une lecture confortable, utiliser `bat` (coloration syntaxique, numéros de ligne, Git intégré) ou `less` (pagination).
  - **Cause Racine :** `cat` est conçu pour la composition, pas pour l'interaction.

---

## Protocole d'Urgence

1. **Action Immédiate :** Si l'affichage du terminal est corrompu par un fichier binaire, tapez immédiatement **`reset`** et appuyez sur Entrée. Cela restaure les paramètres normaux du terminal.
2. **Préservation :** Si une mauvaise redirection a écrasé un fichier important, arrêtez toute écriture sur le disque concerné. Ne tentez pas de réécrire le fichier.
3. **Investigation :** Vérifiez l'historique des commandes (`history`) pour identifier la commande `cat` fautive et son contexte. 
   Utilisez `ls -l` pour vérifier la taille et la date de modification du fichier endommagé.

---

## Processus de Rétablissement

- [ ] **Prérequis :** Identifier le fichier source perdu et la dernière bonne sauvegarde ou version disponible (ex: via Git, snapshot, backup).
- [ ] **Étape 1 :** Restaurer le fichier depuis la source la plus récente (p. ex., `cp backup/fichier.cfg .`).
- [ ] **Étape 2 :** Remplacer la commande `cat` problématique par une commande sûre (utilisant `sponge` ou évitant la redirection sur le même fichier).
- [ ] **Validation :** Vérifier l'intégrité du fichier restauré (par exemple, avec `cat -n fichier` pour voir son contenu) et s'assurer que le script ou le processus fonctionne à nouveau.

---

## Points Clés à Retenir

### Sous Pression
* **`Ctrl+D`** envoie `EOF` (End-Of-File) et termine une saisie standard.
* **`reset`** est la bouée de sauvetage pour un terminal corrompu.
* Dans un pipeline, **`cat`** est souvent superflu : passez le fichier directement en argument à `grep`, `sed`, etc.

### Considérations Long Terme
* **Pour les scripts et l'automatisation,** la simplicité et la portabilité de `cat` sont inégalées. Ne le remplacez pas par `bat` dans ce contexte.
* **Pour la lecture humaine interactive,** adoptez des outils modernes comme `bat`, 
  qui offre une expérience nettement supérieure sans sacrifier la compatibilité des pipelines (il se comporte comme `cat` quand sa sortie est redirigée).

### Idées Fausses à Éviter
* **"`cat` est inutile."** Faux. C'est la brique de base idéale pour les flux de données dans les scripts.
* **"`cat fichier` est la bonne façon de lire un fichier."** C'est la façon *basique*. Pour lire, préférez `less` (navigation) ou `bat` (enrichissement visuel).
* **"Il faut toujours utiliser `cat` avant un pipe."** C'est l'erreur classique UUoC. Évaluez si la commande suivante peut lire le fichier directement.

### Tableau de Décision : `cat` vs. `bat`

| Critère de Choix | Outil Recommandé | Raison |
| :--- | :--- | :--- |
| **Écrire un script shell portable** | `cat` | Présent partout, comportement universel. |
| **Lire rapidement un fichier de configuration** | `bat` | Coloration syntaxique, en-têtes, plus lisible. |
| **Concaténer des fichiers dans un pipeline** | `cat` ou `bat` | Les deux fonctionnent ; `bat` agit comme `cat` en mode non-interactif. |
| **Suivre les ajouts à un fichier log (`tail -f`)** | `cat` ou `bat --paging=never` | Simplicité et fiabilité. |
| **Explorer un code source inconnu** | `bat` | Numéros de ligne, intégration Git, navigation facilitée. |

