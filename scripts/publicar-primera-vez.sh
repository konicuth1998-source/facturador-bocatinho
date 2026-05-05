#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="facturador-bocatinho"
OWNER="konicuth1998-source"
REMOTE="git@github.com:${OWNER}/${REPO_NAME}.git"
TAG="${1:-v1.0.0}"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! gh auth status >/dev/null 2>&1; then
  echo "Primero autentica GitHub CLI:"
  echo "  gh auth login"
  exit 1
fi

if ! gh repo view "${OWNER}/${REPO_NAME}" >/dev/null 2>&1; then
  gh repo create "${OWNER}/${REPO_NAME}" --private --source=. --remote=origin --push
else
  git remote set-url origin "${REMOTE}"
  git push -u origin main
fi

if git rev-parse "${TAG}" >/dev/null 2>&1; then
  git push origin "${TAG}"
else
  git tag "${TAG}"
  git push origin "${TAG}"
fi

echo "Repositorio publicado: https://github.com/${OWNER}/${REPO_NAME}"
echo "El release se construira en GitHub Actions para Linux y Windows."
