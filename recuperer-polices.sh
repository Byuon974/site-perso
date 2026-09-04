#!/usr/bin/env bash
# Télécharge les woff2 des polices du site depuis Google Fonts et génère le
# bloc @font-face correspondant, pour supprimer la dépendance à un tiers.
#
# Usage : ./recuperer-polices.sh [dossier_de_sortie]
#   dossier_de_sortie : défaut static/fonts
#
# Codes de sortie : 0 succès, 1 erreur d'exécution, 2 dépendance absente.

set -euo pipefail
IFS=$'\n\t'

DEST="${1:-static/fonts}"
CSS_OUT="polices.css"

# Google sert du woff2 seulement à un navigateur récent : sans cet en-tête, la
# réponse contient du ttf ou du eot.
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

# Les familles telles que déclarées dans layouts/partials/head.html.
# subset=latin,latin-ext : latin couvre é è à ç ù, latin-ext ajoute œ, que le
# français emploie dans cœur, œuvre, sœur.
URL='https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap&subset=latin,latin-ext'

command -v curl >/dev/null || { echo "curl absent" >&2; exit 2; }

mkdir -p "$DEST"

echo "Récupération de la feuille de style…" >&2
css=$(curl -fsSL -A "$UA" "$URL")

# Une déclaration @font-face par sous-ensemble : on garde latin et latin-ext,
# on jette cyrillique, grec et vietnamien.
echo "$css" | grep -oE 'https://fonts\.gstatic\.com/[^)]+\.woff2' | sort -u | while read -r u; do
  nom=$(basename "$u")
  echo "  $nom" >&2
  curl -fsSL -o "$DEST/$nom" "$u"
done

echo >&2
echo "Fichiers dans $DEST :" >&2
ls -1sh "$DEST" >&2

# Réécriture des chemins distants vers les chemins locaux.
echo "$css" \
  | sed -E "s#https://fonts\.gstatic\.com/[^)]+/([^/)]+\.woff2)#/fonts/\1#g" \
  > "$CSS_OUT"

echo >&2
echo "Bloc @font-face écrit dans $CSS_OUT" >&2
echo "Reste à faire :" >&2
echo "  1. coller le contenu de $CSS_OUT en tête de static/css/style.css" >&2
echo "  2. retirer les 3 balises Google Fonts de layouts/partials/head.html" >&2
echo "  3. ajouter les préchargements listés ci-dessous" >&2
echo >&2

# Préchargement des seules coupes réellement employées au premier rendu.
for f in "$DEST"/*.woff2; do
  printf '<link rel="preload" href="/fonts/%s" as="font" type="font/woff2" crossorigin>\n' "$(basename "$f")"
done
