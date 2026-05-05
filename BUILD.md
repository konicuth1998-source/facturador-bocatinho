# Facturador Bocatinho - Instaladores

Esta carpeta contiene la version profesional instalable con Electron.

## Entregables generados

Los archivos listos para copiar a otros PCs quedan en `dist/`:

- `Facturador Bocatinho-1.1.0-linux-amd64.deb`: instalador para Ubuntu, Debian, Zorin y derivados.
- `Facturador Bocatinho-1.1.0-linux-x86_64.AppImage`: version portable para Linux.
- `Facturador Bocatinho Setup-1.1.0-win-x64.exe`: instalador para Windows con acceso de escritorio.
- `Facturador Bocatinho Portable-1.1.0-win-x64.exe`: version portable para Windows.

## Desarrollo

```bash
npm install
npm start
```

Si el entorno tiene `ELECTRON_RUN_AS_NODE=1`, probar con:

```bash
env -u ELECTRON_RUN_AS_NODE npm start
```

## Generar instaladores

```bash
./crear-instaladores.sh
```

Tambien se pueden generar por separado:

```bash
npm run dist:linux
npm run dist:windows
```

## Datos del usuario

La app guarda los datos en el PC donde se instala.

- Linux: `~/.config/facturador-bocatinho/data/facturador-data.json`
- Windows: `%APPDATA%\\Facturador Bocatinho\\data\\facturador-data.json`

Dentro de la app se puede exportar e importar un respaldo JSON con clientes, productos, facturas e historial.
