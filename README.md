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

Hugo pour la génération statique, HTML, CSS et JavaScript sans bibliothèque ni
étape de construction, publication par GitHub Actions.

- **Aucune dépendance à un tiers.** Polices et bibliothèques sont servies
  depuis la même origine : le site ne contacte aucun domaine extérieur.
- **Un système de design dans un fichier unique.** `static/css/systeme.css`
  définit les échelles de typographie, d'espace, de forme et de mouvement.
  Une valeur littérale dans une feuille signale un oubli.
- **Le contenu commande la forme.** Les archives s'alignent sur une grille de
  caractères, en unités `ch`, ce qui garde les colonnes stables quelle que soit
  la taille de police choisie par le visiteur.

## Développement

```bash
hugo server -D          # serveur local avec brouillons
hugo --minify           # construction de production
```

## Licence

Le code du site est réutilisable.
