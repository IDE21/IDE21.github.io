#!/bin/sh
# Renders design/og-card.html to public/og-card.jpg (1200x630) with headless Chrome.
cd "$(dirname "$0")/.."
CHROME="${CHROME:-$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/Google\ Chrome\ for\ Testing.app/Contents/MacOS/Google\ Chrome\ for\ Testing | tail -1)}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=6000 --screenshot="$PWD/design/og-card.png" "file://$PWD/design/og-card.html"
python3 -c "from PIL import Image; Image.open(\"design/og-card.png\").convert(\"RGB\").save(\"public/og-card.jpg\", quality=88, optimize=True, progressive=True)" && rm design/og-card.png
