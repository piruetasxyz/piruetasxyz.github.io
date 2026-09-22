#!/usr/bin/env node
/* Hornea personas/index.html a partir de datos/datos.yaml (clave
   `personas`). Reemplaza el h1.cajita y el bloque #grupos con el
   HTML que hoy arma render.js en el navegador, saca los <script> de
   fetch/parse de YAML en runtime, y hornea lang="en" en <html>.
   El importmap de three.js y el <script type="module"
   src="/js/visor-3d.js"> quedan intactos: el visor 3D sigue siendo
   client-side, ahora montado sobre la <img> de respaldo que trae
   cada tarjeta con modelo3d (ver renderizarPersonaCard).
   Uso: node scripts/generar-personas.js
*/
const fs = require('fs');
const path = require('path');
const jsyaml = require('../lib/js-yaml.min.js');
const { renderizarTituloH1, renderizarGrupos, renderizarMetaHead } = require('./lib/plantillas-sitio.js');
const { reemplazarBloque, reemplazarMetaHead, quitarScriptsRuntime, hornearIdiomaPorDefecto } = require('./lib/hornear-html.js');

const RAIZ = path.join(__dirname, '..');
const DATOS_YAML = path.join(RAIZ, 'datos', 'datos.yaml');
const ARCHIVO = path.join(RAIZ, 'personas', 'index.html');

function main() {
  const datos = jsyaml.load(fs.readFileSync(DATOS_YAML, 'utf8'));
  const personas = datos.personas;
  if (!personas) {
    console.warn('No se encontró la clave "personas" en datos.yaml');
    return;
  }

  let html = fs.readFileSync(ARCHIVO, 'utf8');
  html = reemplazarBloque(html, '<h1 class="cajita">', renderizarTituloH1(personas.es, personas.en));
  html = reemplazarBloque(html, '<div id="grupos">', renderizarGrupos(personas.grupos));
  html = reemplazarMetaHead(html, renderizarMetaHead({ titulo: personas.en || personas.es, ruta: '/personas/' }));
  html = quitarScriptsRuntime(html);
  html = hornearIdiomaPorDefecto(html);
  fs.writeFileSync(ARCHIVO, html, 'utf8');

  console.log('  personas/index.html');
}

main();
