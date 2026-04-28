#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

docker compose stop postgres backend frontend admin

cat <<'EOF'

Production services stopped:
  postgres
  backend
  frontend
  admin
EOF
