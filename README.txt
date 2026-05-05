FACTURADOR LOCAL - BOCATINHO SNACKS

Como usarlo:
1. Abre "Facturador Bocatinho" desde el menu de aplicaciones.
2. Llena cliente, productos y datos de factura.
3. Presiona Guardar para conservar la factura en el historial.
4. Presiona Imprimir / PDF para generar el PDF.

App profesional instalada en este PC:
- Ejecutable: /usr/bin/facturador-bocatinho
- Carpeta de app: /opt/Facturador Bocatinho
- Acceso de menu: /usr/share/applications/facturador-bocatinho.desktop
- Acceso de escritorio: ~/Desktop/Facturador Bocatinho.desktop
- Datos: ~/.config/Facturador Bocatinho/data/facturador-data.json

Instaladores listos en dist:
- Facturador Bocatinho-1.0.0-linux-amd64.deb
- Facturador Bocatinho-1.0.0-linux-x86_64.AppImage
- Facturador Bocatinho Setup-1.0.0-win-x64.exe
- Facturador Bocatinho Portable-1.0.0-win-x64.exe

Respaldo:
- Exportar datos crea un archivo JSON con clientes, productos, facturas e historial.
- Guarda ese archivo en una USB, Google Drive o correo.
- En otro PC, abre este mismo facturador y usa Importar datos.

Para llevarlo a otro PC:
1. Copia el instalador correcto desde dist.
2. Instala la app en el otro PC.
3. Abre "Facturador Bocatinho".
4. Importa el ultimo respaldo JSON.

Migrar datos del modo anterior:
1. Abre index.html directo como antes.
2. Usa Exportar datos.
3. Abre la app instalada.
4. Usa Importar datos.

Archivos importantes:
- index.html: pantalla principal.
- app.js: datos y logica.
- styles.css: diseno.
- assets/logo.jpeg: logo.
- electron/main.js: app instalable y guardado en el PC.
- package.json: configuracion de instaladores.
- BUILD.md: instrucciones de empaquetado.

Recomendacion:
Haz un respaldo al final de cada dia de trabajo.
