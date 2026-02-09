#!/bin/bash
# =============================================================================
# SCRIPT DE DÉPLOIEMENT - Hugo sur hébergement classique (OVH, etc.)
# =============================================================================
#
# Ce script :
# 1. Pull les derniers changements depuis GitHub
# 2. Rebuild le site avec Hugo
# 3. (Optionnel) Copie les fichiers vers le dossier web
#
# INSTALLATION :
# 1. Place ce fichier à la racine de ton projet
# 2. chmod +x deploy.sh
# 3. Configure les variables ci-dessous
#
# UTILISATION :
# ./deploy.sh
#
# AUTOMATISATION (cron) :
# Ajoute cette ligne avec 'crontab -e' pour rebuild toutes les 5 minutes :
# */5 * * * * cd /chemin/vers/site-perso && ./deploy.sh >> /var/log/hugo-deploy.log 2>&1
#
# =============================================================================

# -----------------------------------------------------------------------------
# CONFIGURATION - À modifier selon ton setup
# -----------------------------------------------------------------------------

# Dossier où Hugo génère le site (par défaut: public)
BUILD_DIR="public"

# Dossier web de ton hébergement OVH (où les fichiers doivent aller)
# Exemples OVH :
#   - Hébergement mutualisé : /home/ton-login/www
#   - VPS : /var/www/html
# Laisse vide si le dossier public EST ton dossier web
WEB_DIR=""

# Branche Git à utiliser
GIT_BRANCH="main"

# -----------------------------------------------------------------------------
# SCRIPT - Ne pas modifier sauf si tu sais ce que tu fais
# -----------------------------------------------------------------------------

set -e  # Arrête le script en cas d'erreur

echo "=========================================="
echo "🚀 Déploiement Hugo - $(date)"
echo "=========================================="

# Vérifie qu'on est dans un repo Git
if [ ! -d ".git" ]; then
    echo "❌ Erreur : Ce n'est pas un repository Git"
    exit 1
fi

# Pull les derniers changements
echo ""
echo "📥 Récupération des changements depuis GitHub..."
git fetch origin
git reset --hard "origin/$GIT_BRANCH"

# Vérifie que Hugo est installé
if ! command -v hugo &> /dev/null; then
    echo "❌ Erreur : Hugo n'est pas installé"
    echo "   Installe-le avec : snap install hugo --channel=extended"
    exit 1
fi

# Build le site
echo ""
echo "🔨 Compilation du site avec Hugo..."
hugo --minify --gc

# Compte les fichiers générés
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
echo "✅ $FILE_COUNT fichiers générés dans /$BUILD_DIR"

# Copie vers le dossier web si configuré
if [ -n "$WEB_DIR" ] && [ -d "$WEB_DIR" ]; then
    echo ""
    echo "📂 Copie vers $WEB_DIR..."
    rsync -av --delete "$BUILD_DIR/" "$WEB_DIR/"
    echo "✅ Fichiers copiés"
fi

echo ""
echo "=========================================="
echo "✅ Déploiement terminé !"
echo "=========================================="
