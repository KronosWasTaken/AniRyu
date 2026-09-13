#!/usr/bin/env bash
set -u
ok=0; warn=0; fail=0
say_ok()   { ok=$((ok+1)); echo "  [ok]   $1"; }
say_warn() { warn=$((warn+1)); echo "  [warn] $1"; }
say_fail() { fail=$((fail+1)); echo "  [FAIL] $1"; }
have() { command -v "$1" >/dev/null 2>&1; }

echo "== runtimes =="
have node && say_ok "node $(node --version)" || say_fail "node missing"
have pnpm && say_ok "pnpm $(pnpm --version)" || say_fail "pnpm missing"
have go   && say_ok "$(go version)" || say_fail "go missing"

echo "== mise =="
if have mise; then say_ok "mise $(mise --version 2>/dev/null || echo present)"; mise ls --current 2>/dev/null || true
else say_warn "mise missing (winget install jdx.mise | curl https://mise.run | sh)"; fi

echo "== devenv =="
if have devenv; then say_ok "devenv $(devenv version 2>/dev/null || echo present)"
else say_warn "devenv missing — Nix lane unavailable; mise lane still works"; fi
if have nix; then say_ok "nix present"; else say_warn "nix missing (needed only for devenv lane)"; fi

echo "== direnv =="
if have direnv; then
  say_ok "direnv $(direnv --version)"
  direnv status 2>/dev/null | head -n5 || true
else say_warn "direnv missing (Lane A only; mise lane does not need it)"; fi

echo "== sops / age =="
have sops && say_ok "sops $(sops --version 2>/dev/null | head -n1)" || say_warn "sops missing (mise install)"
have age-keygen || have age && say_ok "age present" || say_warn "age missing (mise install)"
grep -q 'AGE1_PUBLIC_KEY_PLACEHOLDER' .sops.yaml 2>/dev/null \
  && say_warn ".sops.yaml still has placeholder recipient (run ./scripts/sops-setup.sh)" \
  || say_ok ".sops.yaml has a real age recipient"
ls secrets/*.enc.env backend/*.enc.env 2>/dev/null && say_ok "encrypted secrets present" \
  || say_warn "no *.enc.env yet (only needed once you store real secrets)"
[ -f .env.local ] && say_warn ".env.local exists (plaintext, must stay gitignored)" || true
[ -f backend/.env ] && say_warn "backend/.env exists (plaintext, must stay gitignored)" || true

echo "== portless =="
if have portless; then
  say_ok "portless $(portless --version 2>/dev/null || echo present)"
  portless doctor 2>&1 | head -n20 || true
else say_warn "portless missing (mise install, or npm i -g portless)"; fi
[ -f portless.json ] && say_ok "portless.json present" || say_fail "portless.json missing"

echo
echo "summary: $ok ok, $warn warnings, $fail failures"
[ "$fail" -eq 0 ]
