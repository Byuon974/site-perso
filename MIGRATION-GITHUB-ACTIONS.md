# Migration : `docs/` vers GitHub Actions + GitHub Pages

## Pourquoi migrer

Actuellement, le site est build localement (`hugo --minify`) et le dossier `docs/` est commite dans le repo. Chaque commit inclut les fichiers generes, ce qui :
- Pollue l'historique git (diff illisibles sur les fichiers HTML generes)
- Melange code source et artefacts de build
- Oblige a rebuild manuellement avant chaque push

Avec GitHub Actions, le build est automatique a chaque push sur `main`. Le repo ne contient que le code source.

---

## Etapes

### 1. Creer le workflow GitHub Actions

Creer le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy Hugo site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: # permet un declenchement manuel

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify --gc

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Modifier `config.yaml`

Supprimer la ligne `publishDir: "docs"` pour revenir au defaut (`public/`).
Le workflow ci-dessus utilise `./public` comme source.

```yaml
# AVANT
publishDir: "docs"

# APRES
# (supprimer la ligne, Hugo utilisera "public/" par defaut)
```

### 3. Configurer GitHub Pages dans les settings du repo

1. Aller dans **Settings** > **Pages**
2. Dans **Source**, selectionner **GitHub Actions** (au lieu de "Deploy from a branch")
3. Sauvegarder

### 4. Supprimer `docs/` du repo

```bash
# Supprimer le dossier docs/ du suivi git
git rm -r docs/

# Ajouter docs/ et public/ au .gitignore
echo "public/" >> .gitignore
echo "docs/" >> .gitignore

# Commit
git add .gitignore
git commit -m "ci: migration vers GitHub Actions, suppression docs/"
git push origin main
```

### 5. Supprimer `deploy.sh` (optionnel)

Le script `deploy.sh` n'est plus necessaire si le deploiement est entierement gere par GitHub Actions. Tu peux le garder comme backup pour un deploiement VPS/OVH, ou le supprimer.

---

## Verification

Apres le push sur `main` :
1. Aller dans l'onglet **Actions** du repo
2. Le workflow "Deploy Hugo site to GitHub Pages" doit s'executer
3. Une fois termine, le site est accessible a `https://byuon974.github.io/site-perso/`

---

## Rollback

Si ca ne marche pas, tu peux revenir en arriere :
1. Remettre `publishDir: "docs"` dans `config.yaml`
2. Rebuild : `hugo --minify --gc`
3. Re-commiter `docs/`
4. Dans Settings > Pages, remettre "Deploy from a branch" sur `main` / `docs`
