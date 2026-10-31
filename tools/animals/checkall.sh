#!/bin/sh
# Summarises the print check of every built animal page (defaults + presets): ok / warn / ERROR per variant.
cd "$(dirname "$0")/../.." || exit 1
for f in "$@"; do
  echo "## $f"
  node .claude/skills/makermakers-generator/check-mesh.mjs programs/$f.html --all 2>&1 | grep -E "^==|PRINT CHECK|RESULT: not|NOT" | sed 's/Overhang steeper than about 50° //; s/It will sag.*//; s/They will print.*//; s/It will print.*//' | cut -c1-150 
done
