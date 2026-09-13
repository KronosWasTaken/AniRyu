#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: $1 not found (try: mise install)" >&2; exit 1; }; }
need sops
grep -q 'AGE1_PUBLIC_KEY_PLACEHOLDER' .sops.yaml && {
  echo "ERROR: .sops.yaml still has the placeholder recipient." >&2
  echo "Run ./scripts/sops-setup.sh first, then paste the age1... key." >&2
  exit 1
}

if [ -f secrets/dev.env ]; then
  sops encrypt secrets/dev.env > secrets/dev.enc.env
  echo "wrote secrets/dev.enc.env"
else
  echo "skip: secrets/dev.env not present (copy from secrets/dev.example.env first)"
fi

if [ -f secrets/dev.env ]; then
  grep -v '^VITE_' secrets/dev.env > backend/.env.plain.tmp
  sops encrypt backend/.env.plain.tmp > backend/dev.enc.env
  rm backend/.env.plain.tmp
  echo "wrote backend/dev.enc.env"
fi
