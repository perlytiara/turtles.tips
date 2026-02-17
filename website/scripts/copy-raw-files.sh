#!/bin/bash
# Copy TurtlesPAC files to public/raw/ for static serving
# Run before next build so raw files are included in the export

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBSITE_DIR="$(dirname "$SCRIPT_DIR")"
TURTLESPAC_DIR="$(dirname "$WEBSITE_DIR")/TurtlesPAC"
RAW_DIR="$WEBSITE_DIR/public/raw"

echo "Copying TurtlesPAC files to public/raw/..."

rm -rf "$RAW_DIR"
mkdir -p "$RAW_DIR"

if [ -d "$TURTLESPAC_DIR/programs" ]; then
  cp -r "$TURTLESPAC_DIR/programs" "$RAW_DIR/programs"
  echo "  Copied programs/"
fi

if [ -d "$TURTLESPAC_DIR/community" ]; then
  cp -r "$TURTLESPAC_DIR/community" "$RAW_DIR/community"
  echo "  Copied community/"
fi

# Remove hidden files/dirs (.git, .gitmodules, etc.)
find "$RAW_DIR" -name ".*" -exec rm -rf {} + 2>/dev/null || true

FILE_COUNT=$(find "$RAW_DIR" -type f | wc -l)
echo "Done. $FILE_COUNT files copied to public/raw/"
