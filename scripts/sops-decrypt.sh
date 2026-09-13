#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: $1 not found (try: mise install)" >&2; exit 1; }; }
need sops

if [ -f secrets/dev.enc.env ]; then
  sops decrypt secrets/dev.enc.env > .env.local
  echo "wrote .env.local (frontend)"
else
  echo "skip: secrets/dev.enc.env not present (nothing encrypted yet — see secrets/dev.example.env)"
fi

if [ -f backend/dev.enc.env ]; then
  sops decrypt backend/dev.enc.env > backend/.env
  echo "wrote backend/.env"
elif [ -f secrets/dev.enc.env ]; then
  grep -v '^VITE_' .env.local > backend/.env
  echo "wrote backend/.env (derived from secrets/dev.enc.env)"
fi
