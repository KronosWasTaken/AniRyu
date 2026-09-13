#!/usr/bin/env bash
set -euo pipefail

OS="$(uname -s)"
if [ "$OS" = "Linux" ]; then
  KEY_FILE="${SOPS_AGE_KEY_FILE:-${XDG_CONFIG_HOME:-$HOME/.config}/sops/age/keys.txt}"
elif [ "$OS" = "Darwin" ]; then
  KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/Library/Application Support/sops/age/keys.txt}"
else
  KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
  echo "(note: native Windows sops looks in %AppData%\\sops\\age\\keys.txt;"
  echo " Git Bash here uses $KEY_FILE instead — set SOPS_AGE_KEY_FILE to unify)"
fi

if [ -f "$KEY_FILE" ]; then
  echo "Age key already exists: $KEY_FILE"
else
  echo "Generating age key: $KEY_FILE"
  mkdir -p "$(dirname "$KEY_FILE")"
  if command -v age-keygen >/dev/null 2>&1; then
    age-keygen -o "$KEY_FILE"
  elif command -v mise >/dev/null 2>&1; then
    mise x age -- age-keygen -o "$KEY_FILE"
  else
    echo "ERROR: age-keygen not found. Install age (mise install) and re-run." >&2
    exit 1
  fi
  chmod 600 "$KEY_FILE"
fi

PUBKEY="$(grep -o 'age1[0-9a-z]*' "$KEY_FILE" | head -n1)"
echo
echo "Public recipient (paste into .sops.yaml, replacing AGE1_PUBLIC_KEY_PLACEHOLDER):"
echo "  $PUBKEY"
echo
echo "Next:"
echo "  cp secrets/dev.example.env secrets/dev.env"
echo "  ./scripts/sops-encrypt.sh"
