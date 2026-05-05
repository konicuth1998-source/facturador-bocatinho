#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
npm install
npm run dist:linux
npm run dist:windows
