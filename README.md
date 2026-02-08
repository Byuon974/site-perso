# nexus-tvs.dev

Site personnel Hugo — Thomas, développeur backend à La Réunion.

---

## 🚀 Comment ça marche

Le site est **100% dynamique**. Tu déposes des fichiers `.md` dans les dossiers et ils apparaissent automatiquement. Pas besoin de toucher au code HTML.

```
content/
├── blog/      ← Dépose tes articles ici
├── notes/     ← Dépose tes notes ici
└── projets/   ← Dépose tes projets ici
```

C'est tout. Hugo lit les fichiers et génère les pages.

---

## 📝 Créer un article de blog

### 1. Créer le fichier

```bash
# Créer un nouveau fichier dans content/blog/
touch content/blog/mon-article.md
```

### 2. Copier ce template

```markdown
---
title: "Titre de l'article"
date: 2025-01-31
description: "Résumé de l'article (pour SEO et aperçus)"
tags: ["tag1", "tag2"]
draft: false
---

Écris ton contenu ici en Markdown.

## Un titre

Du texte, du **gras**, de l'*italique*.

### Un sous-titre

- Liste à puces
- Autre item

```python
# Du code
print("Hello")
```

> Une citation

![Une image](/images/uploads/mon-image.png)
```

### 3. C'est publié

Lance `hugo server -D` et ton article apparaît dans la liste.

---

## 📓 Créer une note technique

### 1. Créer le fichier

```bash
touch content/notes/ma-note.md
```

### 2. Copier ce template

```markdown
---
title: "Titre de la note"
description: "Description courte"
tags: ["tag1", "tag2"]
updated: 2025-01-31
---

## Section 1

Contenu...

## Section 2

| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Valeur    | Valeur    |

```bash
# Commande
echo "hello"
```
```

---

## 🎨 Créer un projet

### 1. Créer le fichier

```bash
touch content/projets/mon-projet.md
```

### 2. Copier ce template

```markdown
---
title: "Nom du projet"
description: "Description courte"
date: 2025-01-15
tags: ["Python", "API"]
github: "https://github.com/user/repo"
demo: "https://demo.exemple.com"
image: "/images/uploads/screenshot.png"
draft: false
---

## Le projet

Description détaillée...

## Stack technique

- Python
- BeautifulSoup
- PostgreSQL

## Ce que j'ai appris

Retour d'expérience...
```

---

## 📋 Champs YAML disponibles

### Blog

| Champ | Requis | Description |
|-------|--------|-------------|
| `title` | ✅ | Titre de l'article |
| `date` | ✅ | Date (YYYY-MM-DD) |
| `description` | ✅ | Résumé (160 car. max) |
| `tags` | ❌ | Liste de tags |
| `draft` | ❌ | `true` = brouillon |

### Notes

| Champ | Requis | Description |
|-------|--------|-------------|
| `title` | ✅ | Titre de la note |
| `description` | ✅ | Description courte |
| `tags` | ❌ | Liste de tags |
| `updated` | ❌ | Date de mise à jour |

### Projets

| Champ | Requis | Description |
|-------|--------|-------------|
| `title` | ✅ | Nom du projet |
| `description` | ✅ | Description courte |
| `date` | ✅ | Date du projet |
| `tags` | ❌ | Technologies |
| `github` | ❌ | Lien GitHub |
| `demo` | ❌ | Lien démo |
| `image` | ❌ | Image de couverture |
| `draft` | ❌ | Brouillon |

---

## 🖼️ Ajouter des images

1. Place l'image dans `static/images/uploads/`
2. Référence-la : `![Alt](/images/uploads/nom.png)`

---

## 🧪 Tester en local

```bash
# Lancer le serveur de dev (avec brouillons)
hugo server -D

# Ouvrir http://localhost:1313
```

Les changements sont visibles instantanément (hot reload).

---

## 🚀 Déployer

```bash
# Build production
hugo --minify

# Le site est dans public/
```

---

## 📁 Structure

```
nexus-tvs.dev/
├── config.yaml           # Configuration
├── content/
│   ├── blog/*.md         # ← Articles (dynamique)
│   ├── notes/*.md        # ← Notes (dynamique)
│   ├── projets/*.md      # ← Projets (dynamique)
│   └── about/_index.md   # Page À propos
├── static/
│   └── images/uploads/   # ← Images
└── layouts/              # Templates (ne pas toucher)
```

---

## ✨ Fonctionnalités automatiques

- ⏱️ **Temps de lecture** calculé automatiquement
- 🍞 **Fil d'Ariane** sur chaque page
- 🔗 **Articles liés** par tags communs
- 🎠 **Carrousel** pour les projets
- 📡 **RSS** stylisé (`/index.xml`)
- 🌙 **Dark mode** avec toggle

---

## 🔧 Modifier les pages fixes

| Page | Fichier |
|------|---------|
| Accueil | `layouts/index.html` |
| À propos | `content/about/_index.md` |
| Header | `layouts/partials/header.html` |
| Config | `config.yaml` |

---

## ❓ FAQ

**Le contenu n'apparaît pas ?**
→ Vérifie que `draft: false` dans le frontmatter

**Comment voir les brouillons ?**
→ `hugo server -D` (le `-D` affiche les drafts)

**Comment ajouter un tag ?**
→ Ajoute-le dans `tags: ["nouveau-tag"]`, il apparaît automatiquement
