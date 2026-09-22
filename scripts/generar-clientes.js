#!/usr/bin/env node
/* Genera clientes/<slug>/index.html a partir de datos/datos.yaml
   - Lee clientes.clientes en datos/datos.yaml
   - Por cada cliente, obtiene el slug desde su campo `enlace`
     (ej: '/clientes/sokio/index.html' -> 'sokio')
   - Escribe (o sobreescribe) clientes/<slug>/index.html con la
     plantilla estándar, seteando data-page="<slug>"
   - No requiere dependencias externas: usa la copia local de
     js-yaml en lib/js-yaml.min.js
   Uso: node scripts/generar-clientes.js
*/
const fs = require('fs');
const path = require('path');
const jsyaml = require('../lib/js-yaml.min.js');

const RAIZ = path.join(__dirname, '..');
const DATOS_YAML = path.join(RAIZ, 'datos', 'datos.yaml');

function plantilla(slug) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/png" href="/assets/favicon.ico" />
    <title>piruetas</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="/css/style.css" />
</head>
<body data-page="${slug}">
    <div class="flex-container">
        <div id="divLeftMenu" class="left"></div>

        <div class="right">
            <div class="contenedor-producto">
                <div class="contenido-texto">
                    <h1 class="cajita">
                        <span class="es"></span>
                        <span class="en"></span>
                    </h1>
                </div>
            </div>
        </div>
    </div>

    <script src="/js/nav.js"></script>
    <script src="/js/script.js"></script>
    <script src="/lib/js-yaml.min.js"></script>
    <script src="/js/render.js"></script>
</body>
</html>
`;
}

function slugDesdeEnlace(enlace) {
  const m = /^\/clientes\/([^/]+)\/index\.html$/.exec(enlace || '');
  return m ? m[1] : null;
}

function main() {
  const texto = fs.readFileSync(DATOS_YAML, 'utf8');
  const datos = jsyaml.load(texto);
  const clientes = (datos.clientes && datos.clientes.clientes) || [];

  if (clientes.length === 0) {
    console.warn('No se encontraron clientes en datos.yaml');
    return;
  }

  let creados = 0;
  let actualizados = 0;
  let omitidos = 0;

  clientes.forEach((c) => {
    const slug = slugDesdeEnlace(c.enlace);
    if (!slug) {
      console.warn(
        `Omitiendo "${c.nombre}": enlace inválido o ausente (${c.enlace})`,
      );
      omitidos++;
      return;
    }
    if (!datos[slug]) {
      console.warn(
        `Aviso: no hay entrada "${slug}:" en datos.yaml para "${c.nombre}"`,
      );
    }

    const dir = path.join(RAIZ, 'clientes', slug);
    const archivo = path.join(dir, 'index.html');
    const existia = fs.existsSync(archivo);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(archivo, plantilla(slug), 'utf8');

    if (existia) {
      actualizados++;
    } else {
      creados++;
    }
    console.log(`  clientes/${slug}/index.html`);
  });

  console.log(
    `\nListo: ${creados} creados, ${actualizados} actualizados, ${omitidos} omitidos.`,
  );
}

main();
