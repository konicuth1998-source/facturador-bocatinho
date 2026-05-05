#!/usr/bin/env bash
set -euo pipefail

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  echo "Node.js y npm ya estan instalados."
else
  echo "Instala Node.js LTS y npm con tu gestor de paquetes."
  echo "En Ubuntu/Debian: sudo apt install nodejs npm"
  exit 1
fi

npm install
echo "Dependencias listas. Usa: npm start"
