# nexus-tvs.xyz

Portfolio et base de notes techniques de Thomas Vinh-San, développeur à
La Réunion.

**→ [nexus-tvs.xyz](https://nexus-tvs.xyz)**

---

## Ce que contient le site

- **Projets** : une plateforme SaaS de régulation de transport médico-social,
  et 2 outils en ligne de commande.
- **Notes** : des fiches Linux écrites comme des pages de manuel, pour un usage
  quotidien.
- **Blog** : des textes plus longs sur la conception logicielle.

## Ce qui fait tourner le site

Hugo, HTML, CSS et JS sans bibliothèque. Publication par GitHub Actions.

- Aucun domaine tiers : polices et bibliothèques servies depuis le site.
- Système de design dans `static/css/systeme.css`.
- Archives alignées sur une grille de caractères, en `ch`.

## Développement

```bash
hugo server -D          # serveur local avec brouillons
hugo --minify           # construction de production
./mk-repo.sh -n         # prépare le dépôt, essai à blanc
```

## Licence

Le code du site est réutilisable.
