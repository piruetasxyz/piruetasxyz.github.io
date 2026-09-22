/* Plantillas compartidas para hornear el HTML que hoy arma js/render.js
   en el navegador. Cada función porta 1:1 la lógica de una de las
   funciones de render.js a texto (string-templating), para que los
   scripts scripts/generar-*.js las usen en tiempo de build.

   Por ahora solo existe renderizarDetalle, que porta
   renderProjectDetail (js/render.js), el molde que usan 13 de las 15
   páginas del sitio (título + secciones + galería opcional + ficha
   técnica opcional). El resto de las funciones (personas, proyectos,
   clientes) se agregan en etapas siguientes del plan de reemplazo de
   render.js.
*/

function escaparHtml(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function spanEsEn(es, en, clasesExtra) {
  const clases = clasesExtra ? ' ' + clasesExtra : '';
  return (
    `<span class="es${clases}">${escaparHtml(es)}</span>` +
    `<span class="en${clases}">${escaparHtml(en)}</span>`
  );
}

function renderizarGaleria(galeria) {
  if (!Array.isArray(galeria) || !galeria.length) return '';
  const filas = galeria
    .map((item) => {
      const src = escaparHtml(item.image || '');
      const altEsRaw = (item.alt && item.alt.es) || '';
      const altEnRaw = (item.alt && item.alt.en) || '';
      const altEs = escaparHtml(altEsRaw);
      const altEn = escaparHtml(altEnRaw);
      // el sitio arranca en ingles por defecto (ver applyLang en
      // js/script.js), asi que el alt horneado usa ese idioma; el
      // toggle de idioma lo actualiza en el navegador via
      // refreshGaleriaAlt, igual que hoy
      const altInicial = escaparHtml(altEnRaw || altEsRaw);
      return (
        `<div class="galeria-fila"><a class="galeria-item" href="${src}" target="_blank" rel="noopener">` +
        `<img src="${src}" loading="lazy" data-alt-es="${altEs}" data-alt-en="${altEn}" alt="${altInicial}"></a></div>`
      );
    })
    .join('');
  return `<div class="galeria-filas">${filas}</div>`;
}

function renderizarFichaTecnica(data) {
  const tieneFicha =
    data.materiales || data.software || (data.equipo && data.equipo.length);
  if (!tieneFicha) return '';

  let filas = '';

  function filaTexto(labelEs, labelEn, valor) {
    if (!valor) return;
    filas +=
      `<dt>${spanEsEn(labelEs, labelEn)}</dt>` +
      `<dd>${spanEsEn(valor.es || '', valor.en || '')}</dd>`;
  }

  filaTexto('materiales', 'materials', data.materiales);
  filaTexto('software', 'software', data.software);

  if (Array.isArray(data.equipo) && data.equipo.length) {
    const items = data.equipo
      .map((miembro) => {
        const nombre = `<span class="equipo-nombre">${escaparHtml(miembro.nombre || '')}</span>`;
        const tieneRol =
          miembro.rol && (miembro.rol.es || miembro.rol.en);
        const rol = tieneRol
          ? spanEsEn(miembro.rol.es || '', miembro.rol.en || '', 'equipo-rol')
          : '';
        return `<li>${nombre}${rol}</li>`;
      })
      .join('');
    filas +=
      `<dt>${spanEsEn('equipo', 'team')}</dt>` +
      `<dd><ul class="equipo-list">${items}</ul></dd>`;
  }

  return `<dl class="ficha-tecnica">${filas}</dl>`;
}

function renderizarSecciones(sections) {
  if (!Array.isArray(sections)) return '';
  return sections
    .map((sec) => {
      let html = '';
      if (sec.titulo && (sec.titulo.es || sec.titulo.en)) {
        html += `<h2 class="cajita">${spanEsEn(sec.titulo.es || '', sec.titulo.en || '')}</h2>`;
      }
      let p = '';
      if (sec.content) {
        // sec.content puede traer HTML (ej. <br><br>): igual que
        // render.js, que usa innerHTML acá y no textContent
        const es = sec.content.es || '';
        const en = sec.content.en || '';
        p = `<p><span class="es">${es}</span><span class="en">${en}</span></p>`;
      } else {
        p = '<p></p>';
      }
      return html + p;
    })
    .join('');
}

/* Porta renderProjectDetail (js/render.js). `data` es la entrada de
   YAML de la página (ya sea con un `titulo: {es,en}` propio, como en
   clientes.yaml, o con `es`/`en` sueltos en el nivel superior, como
   en datos.yaml). Devuelve el fragmento completo que reemplaza a
   `.contenido-texto`, con el mismo h1.cajita que trae el shell de la
   página. */
function renderizarDetalle(data) {
  const tituloData = data.titulo || data;
  const h1 = `<h1 class="cajita">${spanEsEn((tituloData && tituloData.es) || '', (tituloData && tituloData.en) || '')}</h1>`;
  const galeria = renderizarGaleria(data.galeria);
  const ficha = renderizarFichaTecnica(data);
  const secciones = renderizarSecciones(data.sections);
  return `<div class="contenido-texto">${h1}${galeria}${ficha}${secciones}</div>`;
}

/* Porta createPersonaCard (js/render.js). A diferencia del original,
   que mostraba la foto O el visor 3D (nunca ambos), acá siempre
   hornea la <img> estática cuando hay `foto`, y además el
   `.visor-3d[data-modelo3d]` cuando hay `modelo3d` — se superponen
   por CSS (ver .persona-foto en css/style.css): la imagen se ve
   hasta que el visor 3D termina de cargar el modelo encima. Así una
   vista sin JS (o mientras el modelo carga) siempre tiene algo que
   mostrar en vez de un cajón vacío. */
function renderizarPersonaCard(p) {
  const tieneDescripcion = p.descripcion && (p.descripcion.es || p.descripcion.en);
  const claseCard = 'persona-card' + (tieneDescripcion ? '' : ' persona-card-compacta');

  const nombreEsObjeto = p.nombre && typeof p.nombre === 'object';
  const nombreAlt = nombreEsObjeto ? (p.nombre.es || p.nombre.en || '') : (p.nombre || '');

  let foto = '';
  if (p.foto) {
    foto += `<img src="${escaparHtml(p.foto)}" alt="${escaparHtml(nombreAlt)}">`;
  }
  if (p.modelo3d) {
    foto += `<div class="visor-3d" data-modelo3d="${escaparHtml(p.modelo3d)}"></div>`;
  }
  const fotoHtml = foto ? `<div class="persona-foto">${foto}</div>` : '';

  let nombreHtml = nombreEsObjeto
    ? spanEsEn(p.nombre.es || '', p.nombre.en || '')
    : escaparHtml(p.nombre || '');
  if (p.pronombres) {
    const contenidoPronombres =
      typeof p.pronombres === 'object'
        ? ' ' + spanEsEn(p.pronombres.es || '', p.pronombres.en || '')
        : ' ' + escaparHtml(p.pronombres);
    nombreHtml += `<span class="pronombres">${contenidoPronombres}</span>`;
  }
  const h2 = `<h2 class="nombre-destacado">${nombreHtml}</h2>`;

  let rol = '';
  if (p.rol) {
    rol =
      typeof p.rol === 'object'
        ? `<p class="rol es">${escaparHtml(p.rol.es || '')}</p><p class="rol en">${escaparHtml(p.rol.en || '')}</p>`
        : `<p class="rol">${escaparHtml(p.rol)}</p>`;
  }

  let descripcion = '';
  if (p.descripcion && p.descripcion.es) descripcion += `<p class="es">${escaparHtml(p.descripcion.es)}</p>`;
  if (p.descripcion && p.descripcion.en) descripcion += `<p class="en">${escaparHtml(p.descripcion.en)}</p>`;

  let enlaces = '';
  if (Array.isArray(p.enlaces) && p.enlaces.length) {
    const items = p.enlaces
      .map((l) => {
        const etiqueta =
          l.etiqueta && typeof l.etiqueta === 'object'
            ? spanEsEn(l.etiqueta.es || '', l.etiqueta.en || '')
            : escaparHtml(l.etiqueta || l.url || 'link');
        return `<a href="${escaparHtml(l.url || '#')}" target="_blank" class="boton-piruetas">${etiqueta}</a>`;
      })
      .join('');
    enlaces = `<div class="persona-links">${items}</div>`;
  }

  const info = `<div class="persona-info">${h2}${rol}${descripcion}${enlaces}</div>`;
  return `<div class="${claseCard}">${fotoHtml}${info}</div>`;
}

/* Porta renderPersonas (js/render.js). Devuelve el fragmento que
   reemplaza a `<div id="grupos">`. */
function renderizarGrupos(grupos) {
  const contenido = (grupos || [])
    .map((grupo) => {
      const h2 = `<h2 class="cajita">${spanEsEn((grupo.encabezado && grupo.encabezado.es) || '', (grupo.encabezado && grupo.encabezado.en) || '')}</h2>`;
      const tarjetas = (grupo.miembros || []).map(renderizarPersonaCard).join('');
      return h2 + `<div class="personas-list">${tarjetas}</div>`;
    })
    .join('');
  return `<div id="grupos">${contenido}</div>`;
}

const HERO_DESEADOS = ['parla', 'redondela'];

/* Misma lista que hoy calcula renderProyectos para el hero rotativo:
   los proyectos cuyo titulo (es o en) esta en HERO_DESEADOS, o todos
   si ninguno matchea. */
function calcularRotacionHero(proyectos) {
  const candidatos = (proyectos || []).filter((p) => {
    const t = ((p.titulo && (p.titulo.es || p.titulo.en)) || '').toString().toLowerCase();
    return HERO_DESEADOS.includes(t);
  });
  return candidatos.length ? candidatos : (proyectos || []);
}

/* Porta renderProyectos (js/render.js), la grilla de /proyectos/.
   Cada tarjeta que participa en la rotacion del hero (ver
   calcularRotacionHero) recibe un atributo `data-hero="<indice>"`
   para que js/proyectos-hero.js pueda leer su imagen/enlace ya
   horneados sin volver a pedir datos. Devuelve el fragmento que
   reemplaza a `<div id="proyectos" class="proyectos-grid">`. */
function renderizarProyectosGrid(proyectos) {
  const rotList = calcularRotacionHero(proyectos);

  const tarjetas = (proyectos || [])
    .map((p) => {
      const metaTexto = typeof p.meta === 'object' ? (p.meta.es || p.meta.en || '') : (p.meta || '');
      let header = `<div class="proyecto-header"><div class="proyecto-meta-left">${escaparHtml(metaTexto)}</div>`;
      if (p.etiqueta) {
        const etiquetaTexto = typeof p.etiqueta === 'object' ? (p.etiqueta.es || p.etiqueta.en || '') : p.etiqueta;
        header += `<div class="proyecto-tag">${escaparHtml(etiquetaTexto)}</div>`;
      }
      header += '</div>';

      const tagLink = p.enlace ? 'a' : 'div';
      const hrefAttr = p.enlace ? ` href="${escaparHtml(p.enlace)}"` : '';
      const altTexto =
        p.alt && typeof p.alt === 'object'
          ? p.alt.es || p.alt.en || ''
          : p.alt || (p.titulo && (p.titulo.es || p.titulo.en)) || 'piruetas';
      const imagenSrc = escaparHtml(p.image || '/media/piruetas-v0.jpg');
      const link =
        `<${tagLink}${hrefAttr} class="proyecto-link"><div class="proyecto-imgwrap">` +
        `<img src="${imagenSrc}" alt="${escaparHtml(altTexto)}"></div></${tagLink}>`;

      const h3 =
        p.titulo && typeof p.titulo === 'object'
          ? `<h3 class="proyecto-title">${spanEsEn(p.titulo.es || '', p.titulo.en || '')}</h3>`
          : `<h3 class="proyecto-title">${escaparHtml(p.titulo || '')}</h3>`;

      const subTexto = typeof p.subtitulo === 'object' ? (p.subtitulo.es || p.subtitulo.en || '') : (p.subtitulo || '');
      const sub = `<p class="proyecto-sub">${escaparHtml(subTexto)}</p>`;

      const indiceHero = rotList.indexOf(p);
      const heroAttr = indiceHero !== -1 ? ` data-hero="${indiceHero}"` : '';

      return `<article class="proyecto-item"${heroAttr}>${header}${link}${h3}${sub}</article>`;
    })
    .join('');

  return `<div id="proyectos" class="proyectos-grid">${tarjetas}</div>`;
}

/* El primer frame del hero (equivalente a `show(0)` en el
   renderProyectos original), para hornearlo directo en #hero-img /
   #hero-link. Devuelve null si no hay proyectos. */
function heroInicial(proyectos) {
  const rotList = calcularRotacionHero(proyectos);
  const p = rotList[0];
  if (!p) return null;
  const alt = (p.alt && (p.alt.es || p.alt.en)) || (p.titulo && (p.titulo.es || p.titulo.en)) || 'piruetas';
  return {
    src: p.image || '/media/piruetas-v0.jpg',
    alt,
    href: p.enlace || '#',
  };
}

/* Porta el h1.cajita que renderClientes y renderProjectDetail arman
   igual (dos spans es/en). Sirve para paginas donde el titulo vive
   separado del contenido, como clientes/index.html. */
function renderizarTituloH1(es, en) {
  return `<h1 class="cajita">${spanEsEn(es || '', en || '')}</h1>`;
}

/* Porta renderClientes (js/render.js): la lista de clientes del
   indice /clientes/. Devuelve el fragmento que reemplaza a
   `<div id="clientes" class="clientes-list">`. */
function renderizarClientesLista(clientes) {
  const filas = (clientes || [])
    .map((c) => {
      const tag = c.enlace ? 'a' : 'div';
      const href = c.enlace ? ` href="${escaparHtml(c.enlace)}"` : '';
      const nombre = escaparHtml(c.nombre || '');
      const anho = c.anho ? escaparHtml(String(c.anho)) : '';
      return (
        `<div class="cliente-item"><${tag} class="cliente-nombre"${href}>${nombre}</${tag}>` +
        `<div class="cliente-ano">${anho}</div></div>`
      );
    })
    .join('');
  return `<div id="clientes" class="clientes-list">${filas}</div>`;
}

module.exports = {
  escaparHtml,
  renderizarDetalle,
  renderizarTituloH1,
  renderizarClientesLista,
  renderizarPersonaCard,
  renderizarGrupos,
  renderizarProyectosGrid,
  heroInicial,
};
