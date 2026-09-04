---
title: "Médias et affichage graphique sous Linux"
description: "Référence d'exploitation des outils multimédias et d'affichage sous Linux/X11 : transcodage et filtrage audio-vidéo (ffmpeg), visionneuse d'images légère (feh), miroir et contrôle d'appareils Android (scrcpy), configuration dynamique des écrans (xrandr). Couvre les opérations cou..."
tags: ["linux", "cli", "ffmpeg", "scrcpy", "xrandr", "x11", "runbook", "medias"]
updated: 2026-06-18
validated: 2026-08-18
owner: "opérateur du système"
target: "Linux X11, ffmpeg 6.x/7.x, scrcpy 2.x/3.x, xrandr"
---

_Référence d'exploitation des outils multimédias et d'affichage sous Linux/X11 : transcodage et filtrage audio-vidéo (ffmpeg), visionneuse d'images légère (feh), miroir et contrôle d'appareils Android (scrcpy), configuration dynamique des écrans (xrandr). Couvre les opérations courantes, le choix d'outil, le dépannage par symptôme et les pièges classiques. Cible un usage en ligne de commande sur systèmes Linux avec X11._

## Choisir le bon outil

```
Besoin                                    Outil               Pourquoi
──────────────                            ──────────────      ──────────────
Convertir ou compresser une vidéo         ffmpeg              Transcodage
                                                              universel
Extraire l'audio d'une vidéo              ffmpeg              Démuxage et
                                                              réencodage
Couper, concaténer, redimensionner        ffmpeg              Filtres et flux
Afficher une image, un diaporama          feh                 Visionneuse X11
                                                              légère
Définir un fond d'écran (X11)             feh                 --bg-scale et
                                                              dérivés
Miroir et contrôle d'un Android           scrcpy              Affichage et
                                                              contrôle
                                                              USB/réseau
Enregistrer l'écran d'un Android          scrcpy              --record
Configurer résolution et écrans           xrandr              Sorties,
                                                              résolution,
                                                              disposition
```

> En une  phrase : ffmpeg pour  tout transcodage audio-vidéo, feh  pour afficher
> des  images et  poser un  fond d'écran,  scrcpy  pour miroiter  et piloter  un
> Android, xrandr pour gérer les écrans sous X11.

## Principes fondamentaux

> ffmpeg sépare  conteneur, flux  et codec.  Un fichier  vidéo est  un conteneur
> (mp4, mkv) qui transporte des flux  (vidéo, audio, sous-titres), chacun encodé
> avec un  codec (H.264,  AAC).  ffmpeg peut  copier les  flux sans  réencoder (
> `-c copy`  , rapide,  sans  perte) ou  les réencoder  (lent,  avec réglage  de
> qualité). Distinguer les 2 est la clé de l'efficacité.

> Copier vaut  mieux que  réencoder quand c'est  possible. Changer  de conteneur
> sans  toucher aux  flux (  `-c copy`  ) est  quasi instantané  et sans  perte.
> Réencoder ne  se justifie  que pour  changer de  codec,  réduire la  taille ou
> appliquer   un   filtre.    Réencoder    par   réflexe   gaspille   du   temps
> et dégrade la qualité.

> feh  est minimaliste  et orienté  X11. Léger  et scriptable,  feh  affiche des
> images,  monte des  diaporamas et  pose des fonds  d'écran.  Il dépend  de X11
> (variable  DISPLAY)  et   ne  fonctionne  pas  tel  quel   sous  Wayland  sans
> couche de compatibilité.

> scrcpy s'appuie sur  adb et n'enregistre rien sur l'appareil.  Le miroir passe
> par le pont de débogage Android (adb),  en USB ou en réseau. scrcpy n'installe
> aucune application persistante sur le téléphone  et ne stocke rien dessus : le
> flux   est   traité   côté   ordinateur.     Le   débogage   USB   doit   être
> autorisé sur l'appareil.

> xrandr configure l'affichage X11 à chaud, mais sans persistance. xrandr active
> des sorties,  change la résolution  et dispose les écrans  immédiatement, mais
> ses réglages  sont perdus à  la déconnexion. Pour  les rendre permanents,  les
> placer dans la configuration de session  (script de démarrage, ~/.xprofile, ou
> configuration du gestionnaire de fenêtres).

> La qualité d'un encodage se règle, elle ne se devine pas. Pour H.264/H.265, le
> CRF (Constant Rate  Factor) contrôle la qualité : plus  bas, meilleure qualité
> et fichier  plus gros  (18 à 23  est une  plage usuelle).  Le preset  règle le
> compromis vitesse/compression.  Annoncer une « bonne qualité »  sans fixer CRF
> et preset n'a pas de sens.

## Opérations standard

### Transcoder et manipuler des médias (ffmpeg)

```bash
# Changer de conteneur SANS réencoder (rapide, sans perte)
ffmpeg -i entree.mkv -c copy sortie.mp4
# Réencoder en H.264 avec qualité réglée (CRF) et preset
ffmpeg -i entree.mp4 -c:v libx264 -crf 20 -preset medium -c:a aac sortie.mp4
# Extraire l'audio en MP3
ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3
# Couper sans réencoder (de 00:01:00, durée 30 s)
ffmpeg -ss 00:01:00 -i entree.mp4 -t 30 -c copy extrait.mp4
# Redimensionner (largeur 1280, hauteur proportionnelle)
ffmpeg -i entree.mp4 -vf "scale=1280:-2" sortie.mp4
# Concaténer des fichiers de même codec (liste dans un fichier)
ffmpeg -f concat -safe 0 -i liste.txt -c copy fusion.mp4
# Extraire une image à un instant donné
ffmpeg -ss 00:00:05 -i video.mp4 -frames:v 1 capture.png
```

État attendu :  le média de  sortie est produit.  `-c copy` évite  le réencodage
quand seul le conteneur ou un découpage  change. Pour réduire la taille, ajuster
`-crf`  (plus  haut   =  plus  petit,   qualité  moindre)   et  `-preset`  (plus
lent = mieux compressé).

### Afficher des images et poser un fond (feh)

```bash
feh image.jpg                         # affiche une image
feh *.jpg                             # navigation dans un dossier (flèches)
feh -F *.jpg                          # plein écran
feh -Z -. *.jpg                       # zoom auto, ajusté à la fenêtre
feh --slideshow-delay 5 *.jpg         # diaporama, 5 s par image
feh --bg-scale image.jpg              # fond d'écran (étiré, X11)
feh --bg-fill image.jpg               # fond d'écran (rempli sans déformer)
feh -t -y 150 répertoire/             # planche de vignettes
```

État attendu : l'image  ou le diaporama s'affiche, ou le  fond d'écran est posé.
Les  options `--bg-*`  génèrent un  script  ~/.fehbg rejouable  au démarrage  de
session pour restaurer le fond.

### Miroir et contrôle d'un Android (scrcpy)

```bash
adb devices                           # vérifier que l'appareil est autorisé
scrcpy                                # miroir + contrôle (USB)
scrcpy --max-size 1024                # limiter la résolution (fluidité)
scrcpy --record capture.mp4           # enregistrer la session
scrcpy --no-audio                     # sans audio (scrcpy 2.x+ gère l'audio)
# éteindre l'écran du téléphone, garder le contrôle
scrcpy --turn-screen-off
# Connexion sans fil
adb tcpip 5555 && adb connect IP:5555 && scrcpy
```

État attendu :  l'écran du  téléphone apparaît,  contrôlable à  la souris  et au
clavier. Prérequis : débogage USB autorisé sur l'appareil. `--max-size` améliore
la  fluidité  sur   liaison  lente.   Pour  le  sans-fil,   activer  d'abord  le
mode TCP via adb en USB.

### Configurer les écrans (xrandr)

```bash
xrandr                                # liste sorties, résolutions, état
xrandr --output HDMI-1 --auto         # active une sortie à sa résolution native
# résolution et fréquence précises
xrandr --output HDMI-1 --mode 1920x1080 --rate 60
xrandr --output HDMI-1 --right-of eDP-1   # placer un écran à droite du portable
xrandr --output eDP-1 --primary       # définir l'écran principal
xrandr --output HDMI-1 --off          # désactiver une sortie
xrandr --output eDP-1 --scale 1.2x1.2 # mise à l'échelle (dépannage HiDPI)
```

État attendu : la disposition et  la résolution changent immédiatement. Les noms
de sorties (eDP-1, HDMI-1) viennent de `xrandr` sans argument. Ces réglages sont
temporaires :  les inscrire  dans ~/.xprofile  ou la  config du  gestionnaire de
fenêtres pour les rendre permanents.

## Dépannage par symptôme

### ffmpeg : le découpage avec -c copy décale ou fige le début

Symptôme : un extrait  coupé sans réencodage commence par un  gel ou un décalage
audio.  Cause  probable : la  coupe  tombe entre  2 images-clés  (keyframes).
Correction : réencoder pour une coupe précise, ou couper sur une image-clé.

```bash
# Coupe précise (réencode, donc exacte à la frame)
ffmpeg -ss 00:01:00 -i entree.mp4 -t 30 \
  -c:v libx264 -crf 20 -c:a aac extrait.mp4
```

### ffmpeg : la concaténation échoue ou désynchronise

Symptôme :  la  fusion  par  concat  produit  des  artefacts  ou  échoue.  Cause
probable :   les  fichiers  n'ont  pas  les  mêmes  codec/résolution/paramètres.
Correction :    harmoniser    par   réencodage   avant   de    concaténer,    ou
utiliser le filtre concat.

```bash
ffmpeg -i a.mp4 -i b.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" sortie.mp4
```

### feh : « Can't open X display »

Symptôme :  feh refuse de  démarrer en  l'absence d'affichage.  Cause probable :
variable DISPLAY non  définie (session non graphique, SSH  sans X). Correction :
s'assurer d'un contexte X11.

```bash
echo $DISPLAY                         # doit être défini (ex. :0)
# En SSH, activer le transfert X : ssh -X user@hôte
```

### scrcpy : « ERROR: Could not find any ADB device »

Symptôme : scrcpy ne détecte pas le téléphone. Cause probable : débogage USB non
autorisé, câble de  charge seule, ou adb non démarré.  Correction : autoriser le
débogage et vérifier adb.

```bash
adb devices                           # doit lister l'appareil comme « device »
adb kill-server && adb start-server   # réinitialiser le pont
# Sur le téléphone : autoriser le débogage USB quand la fenêtre s'affiche
```

### xrandr : un écran branché n'apparaît pas

Symptôme : un écran  connecté n'est pas listé ou reste  éteint. Cause probable :
sortie  non activée,  ou  mode non  détecté.  Correction :  forcer la  détection
et activer la sortie.

```bash
# vérifier si la sortie est listée comme « connected »
xrandr
xrandr --output HDMI-1 --auto         # activer à la résolution native
# Si le mode manque, l'ajouter avec cvt puis xrandr --newmode/--addmode
```

## Traitement par lots

```bash
shopt -s nullglob

# Transcoder tout un dossier, une sortie par entrée
for f in *.mkv; do
  ffmpeg -i "$f" -c:v libx264 -crf 23 -c:a aac "${f%.mkv}.mp4" ||
    printf 'ÉCHEC: %s\n' "$f" >&2
done

# Extraire la piste audio de chaque vidéo
for f in *.mp4; do ffmpeg -i "$f" -vn -c:a copy "${f%.mp4}.m4a"; done

# Inventaire des durées et des dimensions, en colonnes
for f in *.mp4; do
  printf '%s\t%s\n' "$f" "$(ffprobe -v error -show_entries \
    format=duration -of csv=p=0 "$f")"
done | column -t
```

Le transcodage est coûteux : sur un gros lot, préférer `xargs -P "$(nproc)"` au
tour par tour, en surveillant la charge.

---

## Pipelines utiles

```bash
# Durée et taille de chaque média d'un dossier, classées
for f in *.mkv *.mp4; do
  [ -e "$f" ] || continue
  printf '%s\t%s\t%s\n' \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")" \
    "$(stat -c %s "$f")" "$f"
done | sort -rn

# Codecs présents, pour repérer ce qui ne se lit pas en accélération
for f in *.mkv; do
  printf '%s\t%s\n' \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name \
       -of csv=p=0 "$f")" "$f"
done | sort | uniq -c

# Durée cumulée d'un dossier, en secondes puis en heures
ffprobe -v error -show_entries format=duration -of csv=p=0 *.mp4 |
  awk '{s+=$1} END{printf "%.0f s soit %.2f h\n", s, s/3600}'

# Dimensions et profondeur de toutes les images
identify -format '%w %h %[bit-depth] %f\n' *.png | sort -k1 -rn

# Images plus larges qu'une borne, à réduire
identify -format '%w %f\n' *.jpg | awk '$1>1920 {print $2}'
```

Le traitement d'un dossier entier, images comprises, suit la boucle sûre du
runbook conversion-lots.

`ffprobe` avec `-of csv=p=0` rend les valeurs sans étiquette, dans l'ordre des
`-show_entries`. Vérifié : une demande combinée de `format` et de `stream` rend
2 lignes distinctes, la ligne de flux d'abord. Grouper les 2 sur une ligne
demande 2 appels, ce que fait la première forme.

---

## Sources amont

À ouvrir quand une commande de vérification révèle un écart avec ce qui est
relevé plus haut.

```
FFmpeg, publications  https://ffmpeg.org/download.html
ImageMagick           https://github.com/ImageMagick/ImageMagick/releases
```

---

## Points clés à retenir

> ffmpeg : distinguer conteneur,  flux et codec. -c copy  change le conteneur ou
> découpe sans réencoder (rapide, sans perte) ; réencoder seulement pour changer
> de codec, réduire ou filtrer.

> Qualité H.264/H.265 : régler  -crf (18-23 usuel, plus bas =  mieux) et -preset
> (vitesse/compression). « Bonne qualité » sans CRF n'a pas de sens.

> Une  coupe -c  copy  tombe  sur les  images-clés :  pour  une  coupe exacte  à
> la frame, réencoder.

> feh affiche  et pose des  fonds d'écran sous  X11 (variable DISPLAY) ;  --bg-*
> génère ~/.fehbg rejouable.

> scrcpy  miroite  et  pilote un  Android  via  adb,  sans  rien  installer  sur
> l'appareil ; débogage USB requis, --max-size pour la fluidité.

> xrandr configure les  écrans X11 à chaud mais sans  persistance : inscrire les
> réglages dans ~/.xprofile ou la config du gestionnaire de fenêtres.
