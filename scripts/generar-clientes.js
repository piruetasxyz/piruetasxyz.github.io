#!/usr/bin/env node
/* Hornea el contenido de la seccion clientes a partir de
   datos/clientes.yaml (el indice y las 4 fichas de detalle viven ahi,
   consolidadas en un solo archivo):
   - clientes/index.html: la lista de `clientes` (titulo + filas)
   - clientes/<slug>/index.html por cada cliente con entrada de
     detalle propia (`clientesYaml[slug]`), con el mismo molde
     "titulo + secciones + galeria/ficha opcionales" que usan las
     paginas de proyectos
   Igual que scripts/generar-proyectos.js: si el archivo ya existe,
   reemplaza solo el bloque que le corresponde (no regenera el
   documento entero, para no tocar nada page-especifico); si el
   cliente es nuevo y no tiene archivo todavia, lo crea desde una
   plantilla minima ya horneada.
   Uso: node scripts/generar-clientes.js
*/
const fs = require('fs');
const path = require('path');
const jsyaml = require('../lib/js-yaml.min.js');
const {
  renderizarDetalle,
  renderizarTituloH1,
  renderizarClientesLista,
  renderizarMetaHead,
  extraerMetaDeDetalle,
} = require('./lib/plantillas-sitio.js');
const {
  reemplazarBloque,
  reemplazarMetaHead,
  quitarScriptsRuntime,
  hornearIdiomaPorDefecto,
} = require('./lib/hornear-html.js');

const RAIZ = path.join(__dirname, '..');
const CLIENTES_YAML = path.join(RAIZ, 'datos', 'clientes.yaml');
const INDEX_HTML = path.join(RAIZ, 'clientes', 'index.html');

function plantillaNueva(slug, data) {
  let html = `<!DOCTYPE html>
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
</body>
</html>
`;
  html = reemplazarBloque(html, '<div class="contenido-texto">', renderizarDetalle(data));
  html = reemplazarMetaHead(html, renderizarMetaHead({ ...extraerMetaDeDetalle(data), ruta: `/clientes/${slug}/` }));
  return hornearIdiomaPorDefecto(html);
}

function slugDesdeEnlace(enlace) {
  const m = /^\/clientes\/([^/]+)\/index\.html$/.exec(enlace || '');
  return m ? m[1] : null;
}

function hornearIndice(clientesYaml) {
  let html = fs.readFileSync(INDEX_HTML, 'utf8');
  html = reemplazarBloque(html, '<h1 class="cajita">', renderizarTituloH1(clientesYaml.es, clientesYaml.en));
  html = reemplazarBloque(html, '<div id="clientes" class="clientes-list">', renderizarClientesLista(clientesYaml.clientes));
  html = reemplazarMetaHead(html, renderizarMetaHead({ titulo: clientesYaml.en || clientesYaml.es, ruta: '/clientes/' }));
  html = quitarScriptsRuntime(html);
  html = hornearIdiomaPorDefecto(html);
  fs.writeFileSync(INDEX_HTML, html, 'utf8');
  console.log('  clientes/index.html');
}

function main() {
  const clientesYaml = jsyaml.load(fs.readFileSync(CLIENTES_YAML, 'utf8'));
  const clientes = (clientesYaml && clientesYaml.clientes) || [];

  if (clientes.length === 0) {
    console.warn('No se encontraron clientes en clientes.yaml');
    return;
  }

  hornearIndice(clientesYaml);

  let creados = 0;
  let actualizados = 0;
  let omitidos = 0;

  clientes.forEach((c) => {
    const slug = slugDesdeEnlace(c.enlace);
    if (!slug) {
      console.warn(`Omitiendo "${c.nombre}": enlace inválido o ausente (${c.enlace})`);
      omitidos++;
      return;
    }

    const data = clientesYaml[slug];
    if (!data) {
      console.warn(`Omitiendo "${c.nombre}": no hay entrada "${slug}:" en clientes.yaml`);
      omitidos++;
      return;
    }

    const dir = path.join(RAIZ, 'clientes', slug);
    const archivo = path.join(dir, 'index.html');
    const existia = fs.existsSync(archivo);

    if (existia) {
      let html = fs.readFileSync(archivo, 'utf8');
      html = reemplazarBloque(html, '<div class="contenido-texto">', renderizarDetalle(data));
      html = reemplazarMetaHead(html, renderizarMetaHead({ ...extraerMetaDeDetalle(data), ruta: `/clientes/${slug}/` }));
      html = quitarScriptsRuntime(html);
      html = hornearIdiomaPorDefecto(html);
      fs.writeFileSync(archivo, html, 'utf8');
      actualizados++;
    } else {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(archivo, plantillaNueva(slug, data), 'utf8');
      creados++;
    }
    console.log(`  clientes/${slug}/index.html`);
  });

  console.log(`\nListo: ${creados} creados, ${actualizados} actualizados, ${omitidos} omitidos.`);
}

main();
