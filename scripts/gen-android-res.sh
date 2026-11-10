#!/bin/bash
# Generates the Android launcher icons and splash PNGs from the Omi logo.
# The PNGs are not committed (the repo flow here is text-only), so CI runs
# this before the Gradle build. Requires ImageMagick `convert` and the
# base64-encoded logo in scripts/omi-logo.b64.txt.
set -e
cd "$(dirname "$0")/.."
LOGO="${TMPDIR:-/tmp}/omi-logo.png"
base64 -d < scripts/omi-logo.b64.txt > "$LOGO"
RES="${RES_DIR:-android/app/src/main/res}"

for spec in "mdpi 48" "hdpi 72" "xhdpi 96" "xxhdpi 144" "xxxhdpi 192"; do
  set -- $spec
  mkdir -p "$RES/mipmap-$1"
  convert "$LOGO" -resize ${2}x${2} "$RES/mipmap-$1/ic_launcher.png"
  convert "$LOGO" -resize ${2}x${2} "$RES/mipmap-$1/ic_launcher_round.png"
done

# Adaptive-icon foreground: the emblem at 74% centred on transparency, over
# the black background colour from values/ic_launcher_background.xml.
for spec in "mdpi 108" "hdpi 162" "xhdpi 216" "xxhdpi 324" "xxxhdpi 432"; do
  set -- $spec
  inner=$(( $2 * 74 / 100 ))
  convert -background none "$LOGO" -resize ${inner}x${inner} -gravity center -extent ${2}x${2} "$RES/mipmap-$1/ic_launcher_foreground.png"
done

# Splashes: logo centred on black (the logo art's own background).
splash() {
  local short=$(( $2 < $3 ? $2 : $3 ))
  local inner=$(( short * 38 / 100 ))
  mkdir -p "$RES/$1"
  convert -size ${2}x${3} xc:#000000 "$LOGO" -resize ${inner}x${inner} -gravity center -composite "$RES/$1/splash.png"
}
splash drawable 480 320
splash drawable-land-mdpi 480 320
splash drawable-land-hdpi 720 480
splash drawable-land-xhdpi 960 640
splash drawable-land-xxhdpi 1440 960
splash drawable-land-xxxhdpi 1920 1280
splash drawable-port-mdpi 320 480
splash drawable-port-hdpi 480 720
splash drawable-port-xhdpi 640 960
splash drawable-port-xxhdpi 960 1440
splash drawable-port-xxxhdpi 1280 1920
echo "Android resources generated."
