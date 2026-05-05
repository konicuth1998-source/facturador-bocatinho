#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
DESKTOP_FILE="$DESKTOP_DIR/facturador-bocatinho.desktop"
RUNNER="$BIN_DIR/facturador-bocatinho"

mkdir -p "$BIN_DIR" "$DESKTOP_DIR"

cat > "$RUNNER" <<EOF_RUNNER
#!/usr/bin/env bash
exec python3 "$APP_DIR/server.py"
EOF_RUNNER
chmod +x "$RUNNER"

cat > "$DESKTOP_FILE" <<EOF_DESKTOP
[Desktop Entry]
Type=Application
Name=Facturador Bocatinho
Comment=Facturador local con datos guardados en este PC
Exec=$RUNNER
Icon=$APP_DIR/assets/logo.jpeg
Terminal=false
Categories=Office;Finance;
StartupNotify=true
EOF_DESKTOP

chmod +x "$DESKTOP_FILE"
update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true

echo "Instalado: Facturador Bocatinho"
echo "Ejecutable: $RUNNER"
echo "Datos: ${XDG_DATA_HOME:-$HOME/.local/share}/facturador-bocatinho/data.json"
