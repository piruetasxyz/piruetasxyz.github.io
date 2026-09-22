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

module.exports = {
  reemplazarBloque,
  reemplazarAtributo,
  quitarScriptsRuntime,
  hornearIdiomaPorDefecto,
};
