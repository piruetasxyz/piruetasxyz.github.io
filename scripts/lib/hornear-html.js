/* Utilidades compartidas por los scripts scripts/generar-*.js para
   hornear contenido dentro de un archivo HTML ya existente, en vez de
   regenerar la página entera desde una plantilla genérica. Cada
   página del sitio tiene detalles propios alrededor del bloque que
   arma render.js (ej. una imagen lateral en algunas páginas de
   proyectos) que no vienen de datos/*.yaml y que no hay que tocar:
   por eso el reemplazo es quirúrgico, no una regeneración completa
   del archivo. */

/* Reemplaza el elemento cuya etiqueta de apertura es exactamente
   `aperturaTag` (ej. '<div class="contenido-texto">', o
   '<h1 class="cajita">') por `nuevoBloqueHtml`, contando profundidad
   de esa misma etiqueta para encontrar el cierre que le corresponde
   (soporta cualquier anidación adentro, como .galeria-filas/
   .galeria-fila). Lanza si no encuentra la apertura, si el nombre de
   etiqueta no se puede extraer, o si el HTML queda desbalanceado. */
function reemplazarBloque(html, aperturaTag, nuevoBloqueHtml) {
  const inicio = html.indexOf(aperturaTag);
  if (inicio === -1) {
    throw new Error(`No se encontró "${aperturaTag}" en el HTML`);
  }

  const nombreTag = (/^<([a-zA-Z0-9]+)/.exec(aperturaTag) || [])[1];
  if (!nombreTag) {
    throw new Error(`No se pudo extraer el nombre de etiqueta de "${aperturaTag}"`);
  }

  const tagRegex = new RegExp(`<${nombreTag}[\\s>]|<\\/${nombreTag}>`, 'g');
  tagRegex.lastIndex = inicio + aperturaTag.length;
  let profundidad = 1;
  let match;
  let finCierre = -1;
  while ((match = tagRegex.exec(html))) {
    if (match[0].startsWith('</')) {
      profundidad -= 1;
      if (profundidad === 0) {
        finCierre = match.index + match[0].length;
        break;
      }
    } else {
      profundidad += 1;
    }
  }
  if (finCierre === -1) {
    throw new Error(`"${aperturaTag}" no cierra correctamente (HTML desbalanceado)`);
  }

  return html.slice(0, inicio) + nuevoBloqueHtml + html.slice(finCierre);
}

/* Quita las etiquetas <script> del fetch/parse de YAML en runtime
   (js-yaml + render.js) de una página ya horneada, junto con su
   indentación y salto de línea, para no dejar una línea vacía. */
function quitarScriptsRuntime(html) {
  return html
    .replace(/[ \t]*<script src="\/lib\/js-yaml\.min\.js"><\/script>\r?\n?/, '')
    .replace(/[ \t]*<script src="\/js\/render\.js"><\/script>\r?\n?/, '');
}

/* Hornea el idioma por defecto ("en", igual que
   `localStorage.getItem('language') || 'en'` en js/script.js) como
   atributo `lang` de <html>. Sin esto, una vista sin JS (ej. al
   exportar a PDF) no tiene ningún `html[lang]` que matchee las reglas
   CSS `html[lang="es"] .es`/`html[lang="en"] .en`, así que ambos
   idiomas quedan visibles a la vez. Es no-op si el archivo ya trae un
   `lang` puesto a mano. */
function hornearIdiomaPorDefecto(html) {
  if (/<html[^>]*\blang=/.test(html)) return html;
  return html.replace('<html>', '<html lang="en">');
}

/* Reemplaza (o agrega, si no existe) un atributo de la etiqueta que
   tiene `id="idElemento"` — para elementos hoja como <img id="hero-img">
   que no tienen un bloque que reemplazar, solo atributos. `valorNuevo`
   va tal cual, sin escapar: el caller es responsable de eso. */
function reemplazarAtributo(html, idElemento, atributo, valorNuevo) {
  const marcaId = `id="${idElemento}"`;
  const posId = html.indexOf(marcaId);
  if (posId === -1) {
    throw new Error(`No se encontró id="${idElemento}" en el HTML`);
  }
  const inicioTag = html.lastIndexOf('<', posId);
  const finTag = html.indexOf('>', posId);
  if (inicioTag === -1 || finTag === -1) {
    throw new Error(`Etiqueta de id="${idElemento}" mal formada`);
  }
  const tag = html.slice(inicioTag, finTag + 1);
  const attrRegex = new RegExp(`${atributo}="[^"]*"`);
  const tagNuevo = attrRegex.test(tag)
    ? tag.replace(attrRegex, `${atributo}="${valorNuevo}"`)
    : tag.replace(/\/?>$/, (cierre) => ` ${atributo}="${valorNuevo}"${cierre}`);
  return html.slice(0, inicioTag) + tagNuevo + html.slice(finTag + 1);
}

const META_INICIO = '<!-- meta-og:inicio -->';
const META_FIN = '<!-- meta-og:fin -->';

/* Matchea un <title> seguido de cero o mas <meta> "sueltas" (sin
   marcadores) de una corrida vieja de reemplazarMetaHead, para poder
   barrerlas junto con el <title> la primera vez que un archivo pasa
   a tener marcadores. Sin este barrido, la primera corrida con
   marcadores (ver mas abajo) dejaba esas <meta> viejas pegadas justo
   despues del bloque nuevo en vez de reemplazarlas. */
const META_SUELTA = /<meta\s+(?:name="description"|property="og:[a-z_:]+"|name="twitter:card")[^>]*\/>/;
const META_SUELTAS_SEGUIDAS = new RegExp(`(?:\\s*${META_SUELTA.source})*`);
const TITULO_Y_META_SUELTAS = new RegExp(`<title>[\\s\\S]*?</title>${META_SUELTAS_SEGUIDAS.source}`);

/* Inserta (o reemplaza, si ya existe) el bloque de <title> + meta
   description/Open Graph/Twitter que arma renderizarMetaHead(),
   delimitado por comentarios para que hornear sea idempotente: si el
   archivo ya trae el bloque de una corrida anterior, lo reemplaza
   entero en vez de agregarle uno nuevo al lado (lo que duplicaría
   los meta tags cada vez que corre el script, como pasó la primera
   vez que esto se hizo con reemplazarBloque(html, '<title>', ...),
   que solo pisa el <title> y deja los <meta> de la corrida anterior
   sueltos). Ademas de reemplazar entre marcadores (o el <title>
   original si todavia no hay marcadores), barre cualquier <meta>
   suelta de una corrida vieja pegada justo despues del punto de
   reemplazo, para poder limpiar en una sola corrida un archivo que
   ya quedo con copias duplicadas por este mismo bug. */
function reemplazarMetaHead(html, nuevoBloqueHtml) {
  const bloqueMarcado = `${META_INICIO}\n    ${nuevoBloqueHtml}\n    ${META_FIN}`;
  const inicio = html.indexOf(META_INICIO);
  if (inicio !== -1) {
    let fin = html.indexOf(META_FIN);
    if (fin === -1) {
      throw new Error(`"${META_INICIO}" sin "${META_FIN}" correspondiente`);
    }
    fin += META_FIN.length;
    const sueltasRegex = new RegExp(`^${META_SUELTAS_SEGUIDAS.source}`);
    const sueltas = sueltasRegex.exec(html.slice(fin));
    if (sueltas) fin += sueltas[0].length;
    return html.slice(0, inicio) + bloqueMarcado + html.slice(fin);
  }
  if (!TITULO_Y_META_SUELTAS.test(html)) {
    throw new Error('No se encontró "<title>" en el HTML');
  }
  return html.replace(TITULO_Y_META_SUELTAS, bloqueMarcado);
}

module.exports = {
  reemplazarBloque,
  reemplazarAtributo,
  quitarScriptsRuntime,
  hornearIdiomaPorDefecto,
  reemplazarMetaHead,
};
