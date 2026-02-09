# Migration vers nexus-tvs.xyz

Guide pour passer de `byuon974.github.io/site-perso/` au domaine personnalise `nexus-tvs.xyz`.

---

## 1. Acheter et configurer le DNS

Chez le registrar (OVH, Cloudflare, Namecheap, etc.), ajouter ces enregistrements DNS :

```
# Apex domain (nexus-tvs.xyz)
Type  Nom   Valeur
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153

# Sous-domaine www (optionnel)
CNAME www   byuon974.github.io.
```

> Les 4 adresses IP sont celles de GitHub Pages.
> Propagation DNS : quelques minutes a 48h selon le registrar.

### Verifier la propagation

```bash
dig nexus-tvs.xyz +short
# Doit retourner les 4 IP ci-dessus
```

---

## 2. Configurer GitHub Pages

### Via l'interface GitHub

1. Aller dans **Settings > Pages** du repo `thomasvinh-san-byte/test`
2. Sous **Custom domain**, entrer `nexus-tvs.xyz`
3. Cocher **Enforce HTTPS** (disponible apres propagation DNS)

### Via le fichier CNAME

Creer un fichier `static/CNAME` (Hugo le copiera dans `docs/`) :

```
nexus-tvs.xyz
```

> Ce fichier est **obligatoire** pour que GitHub Pages associe le domaine au repo.

---

## 3. Modifier la configuration Hugo

### config.yaml

```yaml
# AVANT
baseURL: "https://byuon974.github.io/site-perso/"

# APRES
baseURL: "https://nexus-tvs.xyz/"
```

C'est le **seul changement de configuration necessaire**. Toutes les fonctions Hugo (`relURL`, `absURL`, `Permalink`) s'adaptent automatiquement au nouveau `baseURL`.

---

## 4. Impact sur les URLs

Le site passe d'un sous-repertoire (`/site-perso/`) a la racine (`/`).

| Avant                                         | Apres                              |
|-----------------------------------------------|-------------------------------------|
| `byuon974.github.io/site-perso/`              | `nexus-tvs.xyz/`                   |
| `byuon974.github.io/site-perso/projets/`      | `nexus-tvs.xyz/projets/`           |
| `byuon974.github.io/site-perso/blog/`         | `nexus-tvs.xyz/blog/`              |
| `byuon974.github.io/site-perso/notes/`        | `nexus-tvs.xyz/notes/`             |
| `byuon974.github.io/site-perso/about/`        | `nexus-tvs.xyz/about/`             |
| `byuon974.github.io/site-perso/css/style.css` | `nexus-tvs.xyz/css/style.css`      |

> Aucun changement dans les templates. Les fonctions `relURL` et `{{ "" | relURL }}` generent automatiquement `/` au lieu de `/site-perso/`.

---

## 5. Rebuild et deploiement

```bash
# 1. Creer le fichier CNAME
echo "nexus-tvs.xyz" > static/CNAME

# 2. Mettre a jour baseURL dans config.yaml

# 3. Rebuild
hugo --minify --gc

# 4. Verifier que CNAME est bien dans docs/
cat docs/CNAME

# 5. Commit et push
git add config.yaml static/CNAME docs/
git commit -m "feat: migration vers nexus-tvs.xyz"
git push
```

---

## 6. Checklist post-migration

- [ ] DNS propage (dig retourne les IP GitHub)
- [ ] `https://nexus-tvs.xyz/` repond correctement
- [ ] HTTPS actif (cadenas dans le navigateur)
- [ ] Toutes les pages internes fonctionnent (navigation, sidebar, header)
- [ ] Les assets (CSS, JS, images, favicon) se chargent correctement
- [ ] Le lien canonical dans `<head>` pointe vers `nexus-tvs.xyz`
- [ ] Le flux RSS (`/index.xml`) est accessible
- [ ] Google Search Console : ajouter la nouvelle propriete `nexus-tvs.xyz`

---

## 7. Redirection ancien domaine (optionnel)

GitHub Pages redirige automatiquement `byuon974.github.io/site-perso/` vers `nexus-tvs.xyz/` une fois le domaine personnalise configure. Aucune action supplementaire n'est necessaire.

---

## Resume des fichiers a modifier

| Fichier          | Modification                                         |
|------------------|------------------------------------------------------|
| `config.yaml`    | `baseURL: "https://nexus-tvs.xyz/"`                 |
| `static/CNAME`   | Creer avec le contenu `nexus-tvs.xyz`                |
| `docs/`          | Rebuild complet avec `hugo --minify --gc`             |
