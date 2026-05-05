# Facturador Bocatinho

App de escritorio para generar facturas locales de Bocatinho Snacks.

## Descargas

Cuando el proyecto este publicado en GitHub, los instaladores se descargan desde la seccion **Releases** del repositorio.

- Windows instalable: `Facturador Bocatinho Setup-*-win-x64.exe`
- Windows portable: `Facturador Bocatinho Portable-*-win-x64.exe`
- Linux Ubuntu/Debian/Zorin: `Facturador Bocatinho-*-linux-amd64.deb`
- Linux portable: `Facturador Bocatinho-*-linux-x86_64.AppImage`

## Desarrollo local

```bash
npm install
npm start
```

Si Electron queda forzado como Node por el entorno:

```bash
env -u ELECTRON_RUN_AS_NODE npm start
```

## Crear instaladores localmente

```bash
./crear-instaladores.sh
```

Los instaladores quedan en `dist/`.

## Publicar una nueva version

1. Actualiza la version en `package.json`, por ejemplo `1.0.1`.
2. Haz commit de los cambios.
3. Crea y sube un tag:

```bash
git tag v1.0.1
git push origin main --tags
```

GitHub Actions compilara los instaladores y los adjuntara al release.

## Datos guardados

La app guarda datos en el PC donde se instala.

- Linux: `~/.config/Facturador Bocatinho/data/facturador-data.json`
- Windows: `%APPDATA%\\Facturador Bocatinho\\data\\facturador-data.json`

La app tambien permite exportar e importar respaldo JSON.
