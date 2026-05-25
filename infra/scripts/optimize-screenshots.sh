#!/usr/bin/env bash
# Convert every public/screenshots/**/*.png to .webp:
#   - downscale to max-width 1600 if wider,
#   - encode WebP at quality 82 (visually lossless for UI captures),
#   - delete the source .png so the deployment stops shipping both.
#
# Run from the repo root. Safe to re-run: existing .webp files are overwritten.
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
DIR="$ROOT/public/screenshots"

if [[ ! -d "$DIR" ]]; then
  echo "fatal: $DIR not found" >&2
  exit 1
fi

if ! command -v cwebp >/dev/null; then
  echo "fatal: cwebp not in PATH (install via 'brew install webp')" >&2
  exit 1
fi
if ! command -v magick >/dev/null; then
  echo "fatal: ImageMagick (magick) not in PATH" >&2
  exit 1
fi

MAX_WIDTH=1600
QUALITY=82

before_total=0
after_total=0
count=0

while IFS= read -r -d '' png; do
  webp="${png%.png}.webp"
  before=$(stat -f%z "$png")

  width=$(magick identify -format "%w" "$png")
  if [[ "$width" -gt "$MAX_WIDTH" ]]; then
    tmp="$(mktemp -t resized-XXXXXX).png"
    magick "$png" -resize "${MAX_WIDTH}x>" "$tmp"
    cwebp -quiet -q "$QUALITY" "$tmp" -o "$webp"
    rm -f "$tmp"
  else
    cwebp -quiet -q "$QUALITY" "$png" -o "$webp"
  fi

  after=$(stat -f%z "$webp")
  before_total=$((before_total + before))
  after_total=$((after_total + after))
  count=$((count + 1))

  rm -f "$png"
  printf "  %s  %6d KB -> %5d KB\n" "${png#"$ROOT"/}" "$((before/1024))" "$((after/1024))"
done < <(find "$DIR" -type f -name '*.png' -print0)

if [[ "$count" -eq 0 ]]; then
  echo "No PNGs to convert."
  exit 0
fi

printf "\n%d images optimized.\n" "$count"
printf "Total: %d KB -> %d KB (-%d%%)\n" \
  "$((before_total/1024))" \
  "$((after_total/1024))" \
  "$(( (before_total - after_total) * 100 / before_total ))"
