#!/usr/bin/env node
/* Hornea el contenido de las paginas de datos/datos.yaml que usan el
   molde "detalle" (titulo + secciones + galeria/ficha opcionales):
   inicio, tienda, y las paginas de proyectos bajo proyectos/<slug>/.
   Reemplaza el bloque .contenido-texto de cada archivo HTML existente
   con el HTML que hoy arma render.js en el navegador, saca los
   <script> de fetch/parse de YAML en runtime (js-yaml + render.js), y
   hornea lang="en" en <html> (por defecto no habia ningun atributo
   lang hasta que corria JS, asi que una vista sin JS mostraba ambos
   idiomas a la vez). No toca nada mas del archivo (ej. la imagen
   lateral que algunas paginas de proyectos traen junto a
   .contenido-texto).

   Tambien hornea proyectos/index.html (la grilla + el primer frame
   del hero rotativo): comparte este script/workflow con las 9
   paginas de arriba porque ambos leen datos/datos.yaml. La rotacion
   del hero en si (que antes hacia renderProyectos con un setInterval
   client-side sobre datos fetcheados) ahora la hace
   js/proyectos-hero.js leyendo los atributos data-hero ya horneados
   en la grilla — no cambia el HTML generado ademas de agregar ese
   script.
   Uso: node scripts/generar-proyectos.js
*/
const fs = require('fs');
const path = require('path');
const jsyaml = require('../lib/js-yaml.min.js');
const {
  renderizarDetalle,
  renderizarProyectosGrid,
  heroInicial,
  escaparHtml,
  renderizarMetaHead,
  extraerMetaDeDetalle,
} = require('./lib/plantillas-sitio.js');
const {
  reemplazarBloque,
  reemplazarAtributo,
  quitarScriptsRuntime,
  hornearIdiomaPorDefecto,
} = require('./lib/hornear-html.js');

const RAIZ = path.join(__dirname, '..');
const DATOS_YAML = path.join(RAIZ, 'datos', 'datos.yaml');
const INDICE_PROYECTOS_HTML = path.join(RAIZ, 'proyectos', 'index.html');

const PAGINAS = [
  { clave: 'inicio', archivo: 'index.html' },
  { clave: 'tienda', archivo: 'store/index.html' },
  { clave: 'parla', archivo: 'proyectos/parla/index.html' },
  { clave: 'investigacion-gerassic-organ', archivo: 'proyectos/investigacion-gerassic-organ/index.html' },
  { clave: 'maquinitas-tidal', archivo: 'proyectos/maquinitas-tidal/index.html' },
  { clave: 'gerassic-organ', archivo: 'proyectos/gerassic-organ/index.html' },
  { clave: 'osca', archivo: 'proyectos/osca/index.html' },
  { clave: 'redondela', archivo: 'proyectos/redondela/index.html' },
  { clave: 'talleres-momentos', archivo: 'proyectos/talleres-momentos/index.html' },
];

function hornearIndiceProyectos(proyectos) {
  let html = fs.readFileSync(INDICE_PROYECTOS_HTML, 'utf8');
  html = reemplazarBloque(html, '<div id="proyectos" class="proyectos-grid">', renderizarProyectosGrid(proyectos));

  const hero = heroInicial(proyectos);
  if (hero) {
    html = reemplazarAtributo(html, 'hero-img', 'src', escaparHtml(hero.src));
    html = reemplazarAtributo(html, 'hero-img', 'alt', escaparHtml(hero.alt));
    html = reemplazarAtributo(html, 'hero-link', 'href', escaparHtml(hero.href));
  }

  html = reemplazarBloque(
    html,
    '<title>',
    renderizarMetaHead({ titulo: 'projects', imagen: hero && hero.src, ruta: '/proyectos/' })
  );

  html = quitarScriptsRuntime(html);
  html = hornearIdiomaPorDefecto(html);
  if (!html.includes('/js/proyectos-hero.js')) {
    html = html.replace('</body>', '  <script src="/js/proyectos-hero.js"></script>\n</body>');
  }
  fs.writeFileSync(INDICE_PROYECTOS_HTML, html, 'utf8');
  console.log('  proyectos/index.html');
}

function main() {
  const datos = jsyaml.load(fs.readFileSync(DATOS_YAML, 'utf8'));

  hornearIndiceProyectos((datos.proyectos && datos.proyectos.proyectos) || []);

  let horneadas = 0;
  let omitidas = 0;

  PAGINAS.forEach(({ clave, archivo }) => {
    const data = datos[clave];
    if (!data) {
      console.warn(`Omitiendo "${clave}": no hay entrada en datos.yaml`);
      omitidas++;
      return;
    }

    const rutaArchivo = path.join(RAIZ, archivo);
    const rutaPagina = `/${archivo.replace(/index\.html$/, '')}`;
    let html = fs.readFileSync(rutaArchivo, 'utf8');
    html = reemplazarBloque(html, '<div class="contenido-texto">', renderizarDetalle(data));
    html = reemplazarBloque(html, '<title>', renderizarMetaHead({ ...extraerMetaDeDetalle(data), ruta: rutaPagina }));
    html = quitarScriptsRuntime(html);
    html = hornearIdiomaPorDefecto(html);
    fs.writeFileSync(rutaArchivo, html, 'utf8');
    console.log(`  ${archivo}`);
    horneadas++;
  });

  console.log(`\nListo: ${horneadas} horneadas, ${omitidas} omitidas.`);
}

main();
