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

const DOMINIO = 'https://piruetas.xyz';
const IMAGEN_DEFECTO = 'https://cdn.jsdelivr.net/gh/piruetasxyz/piruetas-web-media@main/2022-piruetas-logo/jpg/piruetas-v0.jpg';
const DESCRIPCION_DEFECTO = 'piruetas es un estudio chileno de arte electrónico y computacional fundado en 2022.';

function textoPlano(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncar(texto, maxLargo) {
  if (texto.length <= maxLargo) return texto;
  return texto.slice(0, maxLargo - 1).trimEnd() + '…';
}

function absolutizarUrl(ruta) {
  return /^https?:\/\//.test(ruta) ? ruta : `${DOMINIO}${ruta}`;
}

/* Traduce una imagen de piruetas-web-media (.../<proyecto>/jpg|png|svg/
   <nombre>.<ext>) a su preview de redes sociales
   (.../<proyecto>/redes/<nombre>.jpg), que genera el script
   scripts/generar-redes-sociales.sh de ese repositorio. Devuelve null
   si la url no es de piruetas-web-media. */
const PATRON_MEDIA = /^(https:\/\/cdn\.jsdelivr\.net\/gh\/piruetasxyz\/piruetas-web-media@main\/[^/]+)\/(?:jpg|png|svg)\/([^/]+)\.(?:jpe?g|png|svg)$/i;

function imagenRedesSociales(url) {
  const m = PATRON_MEDIA.exec(url);
  return m ? `${m[1]}/redes/${m[2]}.jpg` : null;
}

/* Extrae titulo/descripcion/imagen de un `data` con la misma forma
   que usa renderizarDetalle (titulo/es-en sueltos + sections +
   galeria opcional), para armar los meta tags de la pagina. */
function extraerMetaDeDetalle(data) {
  const tituloData = data.titulo || data;
  const titulo = (tituloData && (tituloData.en || tituloData.es)) || '';

  const seccionConContenido = Array.isArray(data.sections)
    ? data.sections.find((s) => s.content && (s.content.en || s.content.es))
    : null;
  const descripcion = seccionConContenido
    ? truncar(textoPlano(seccionConContenido.content.en || seccionConContenido.content.es), 160)
    : '';

  // prioridad: imagen_social explicita > imagenes/hero > galeria.
  // Si la imagen vive en piruetas-web-media se usa su version redes/
  // (1200x628, generada por un GitHub Action alla). Si no, los SVG se
  // descartan porque WhatsApp/Facebook/X/LinkedIn no los muestran.
  const candidatas = [data.imagen_social, ...imagenesDePagina(data).map((i) => i.image)]
    .filter(Boolean)
    .map((c) => imagenRedesSociales(c) || c);
  const imagen = candidatas.find((c) => !/\.svg$/i.test(c)) || '';

  return { titulo, descripcion, imagen };
}

/* Arma el <title> + meta description/Open Graph/Twitter Card para el
   <head> de una pagina. Sin esto, apps como WhatsApp/Telegram/iMessage
   no tienen de donde sacar el icono, titulo o imagen al pegar un link
   del sitio: muestran el link pelado. `ruta` es el path absoluto de
   la pagina (ej. '/clientes/parla/'). */
function renderizarMetaHead({ titulo, descripcion, imagen, ruta }) {
  const tituloFinal = titulo ? `piruetas - ${titulo}` : 'piruetas';
  const descripcionFinal = descripcion || DESCRIPCION_DEFECTO;
  const imagenFinal = absolutizarUrl(imagen || IMAGEN_DEFECTO);
  // el logo es cuadrado: con summary_large_image X lo recorta, asi que
  // sin foto propia se usa la tarjeta chica
  const tarjetaTwitter = imagen ? 'summary_large_image' : 'summary';
  const urlFinal = absolutizarUrl(ruta);

  const t = escaparHtml(tituloFinal);
  const d = escaparHtml(descripcionFinal);
  const i = escaparHtml(imagenFinal);
  const u = escaparHtml(urlFinal);

  return `<title>${t}</title>
    <meta name="description" content="${d}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="piruetas" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${i}" />
    <meta property="og:url" content="${u}" />
    <meta name="twitter:card" content="${tarjetaTwitter}" />`;
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
      // un video (ej. render 3D de una placa) va en loop y sin sonido,
      // como si fuera una imagen animada; no se enlaza a su archivo.
      // Su texto alternativo va en aria-label (refreshGaleriaAlt lo
      // cambia con el idioma igual que el alt de las imagenes)
      if (item.video) {
        const videoSrc = escaparHtml(item.video);
        return (
          `<div class="galeria-fila"><div class="galeria-item">` +
          `<video src="${videoSrc}" autoplay loop muted playsinline preload="metadata" ` +
          `data-alt-es="${altEs}" data-alt-en="${altEn}" aria-label="${altInicial}"></video></div></div>`
        );
      }
      return (
        `<div class="galeria-fila"><a class="galeria-item" href="${src}" target="_blank" rel="noopener">` +
        `<img src="${src}" loading="lazy" data-alt-es="${altEs}" data-alt-en="${altEn}" alt="${altInicial}"></a></div>`
      );
    })
    .join('');
  return `<div class="galeria-filas">${filas}</div>`;
}

/* Todas las imágenes (y videos, con `video:` en vez de `image:`) de
   una página de detalle, en orden: `imagenes` (ej. placa + esquemático
   de un popusinte), o si no el `hero` suelto, y después la `galeria`. Se muestran después del texto,
   cada una en su propia fila de ancho completo (nunca al lado del
   texto). Vacía si no hay ninguna. */
function imagenesDePagina(data) {
  const principales = Array.isArray(data.imagenes)
    ? data.imagenes
    : data.hero
      ? [data.hero]
      : [];
  const galeria = Array.isArray(data.galeria) ? data.galeria : [];
  return [...principales, ...galeria].filter((i) => i && (i.image || i.video));
}

const MESES = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
};

/* Lee una fecha del YAML: 'AAAA' (o el número AAAA) o 'AAAA-MM'.
   Devuelve { anho, mes } con mes 1-12 o null, o null si no se
   entiende. */
function leerFecha(valor) {
  if (valor == null || valor === '') return null;
  const m = /^(\d{4})(?:-(\d{1,2}))?$/.exec(String(valor).trim());
  if (!m) return null;
  const mes = m[2] ? Number(m[2]) : null;
  return { anho: m[1], mes: mes >= 1 && mes <= 12 ? mes : null };
}

/* Arma el periodo de `inicio`/`fin` en un idioma:
   - '2023-11'            -> 'nov 2023'
   - '2023-11'..'2023-12' -> 'nov – dic 2023'
   - '2023-11'..'2024-02' -> 'nov 2023 – feb 2024'
   - '2023'..'2024'       -> '2023 – 2024'
   - fin: 'presente'      -> 'nov 2025 – presente' / 'present' */
function textoPeriodo(inicio, fin, idioma) {
  const ini = leerFecha(inicio);
  if (!ini) return '';
  const mes = (f) => (f.mes ? `${MESES[idioma][f.mes - 1]} ` : '');
  const completa = (f) => `${mes(f)}${f.anho}`;

  if (String(fin || '').trim() === 'presente') {
    return `${completa(ini)} – ${idioma === 'es' ? 'presente' : 'present'}`;
  }
  const f = leerFecha(fin);
  if (!f || (f.anho === ini.anho && f.mes === ini.mes)) return completa(ini);
  if (f.anho === ini.anho && ini.mes && f.mes) {
    return `${MESES[idioma][ini.mes - 1]} – ${completa(f)}`;
  }
  return `${completa(ini)} – ${completa(f)}`;
}

/* Periodo bilingüe (dos spans es/en) de un objeto con `inicio` y
   `fin` opcional; cae a `anho` para entradas antiguas. '' si no hay
   fecha. */
function renderizarPeriodo(item, clase) {
  const inicio = item.inicio != null ? item.inicio : item.anho;
  const es = textoPeriodo(inicio, item.fin, 'es');
  if (!es) return '';
  return spanEsEn(es, textoPeriodo(inicio, item.fin, 'en'), clase);
}

function renderizarFichaTecnica(data) {
  const periodo = renderizarPeriodo(data);
  const tieneFicha = periodo || data.materiales || data.software;
  if (!tieneFicha) return '';

  let filas = '';

  if (periodo) {
    filas += `<dt>${spanEsEn('fechas', 'dates')}</dt><dd>${periodo}</dd>`;
  }

  function filaTexto(labelEs, labelEn, valor) {
    if (!valor) return;
    filas +=
      `<dt>${spanEsEn(labelEs, labelEn)}</dt>` +
      `<dd>${spanEsEn(valor.es || '', valor.en || '')}</dd>`;
  }

  filaTexto('materiales', 'materials', data.materiales);
  filaTexto('software', 'software', data.software);

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

/* Un texto del YAML que puede venir suelto ('GAM') o traducido
   ({ es, en }); siempre devuelve los dos spans es/en. */
function textoEsEn(valor) {
  if (valor && typeof valor === 'object') {
    return spanEsEn(valor.es || valor.en || '', valor.en || valor.es || '');
  }
  return escaparHtml(valor || '');
}

/* Clave AAAAMM para ordenar del más nuevo al más antiguo. */
function claveFecha(valor) {
  const f = leerFecha(valor);
  return f ? Number(f.anho) * 100 + (f.mes || 0) : 0;
}

function enlazar(contenido, enlace) {
  return enlace ? `<a href="${escaparHtml(enlace)}">${contenido}</a>` : contenido;
}

function renderizarListaRegistro(tituloEs, tituloEn, filas) {
  if (!filas.length) return '';
  return (
    `<h2 class="cajita">${spanEsEn(tituloEs, tituloEn)}</h2>` +
    `<ul class="lista-registro">${filas.join('')}</ul>`
  );
}

/* `presentaciones`: dónde se mostró el trabajo (muestras, funciones,
   conciertos), cada una con nombre, lugar, ciudad, inicio/fin y
   enlace opcionales. Más nueva primero. */
function renderizarPresentaciones(presentaciones) {
  if (!Array.isArray(presentaciones)) return '';
  const filas = [...presentaciones]
    .sort((a, b) => claveFecha(b.inicio) - claveFecha(a.inicio))
    .map((p) => {
      const donde = [p.lugar, p.ciudad].filter(Boolean).map(textoEsEn).join(', ');
      const nombre = p.nombre ? enlazar(textoEsEn(p.nombre), p.enlace) : '';
      const texto = [nombre, donde].filter(Boolean).join(', ');
      const periodo = renderizarPeriodo(p);
      return `<li>${texto}${periodo ? ` <span class="registro-fecha">${periodo}</span>` : ''}</li>`;
    });
  return renderizarListaRegistro('presentaciones', 'shows', filas);
}

/* `prensa`: artículos sobre el trabajo. El título va tal cual se
   publicó (sin traducir); `archivo` es una copia opcional en
   web.archive.org por si el enlace original muere. Más nuevo primero. */
function renderizarPrensa(prensa) {
  if (!Array.isArray(prensa)) return '';
  const filas = [...prensa]
    .sort((a, b) => claveFecha(b.fecha) - claveFecha(a.fecha))
    .map((p) => {
      const titulo = p.titulo ? enlazar(`<cite>${escaparHtml(p.titulo)}</cite>`, p.enlace) : '';
      const texto = [textoEsEn(p.medio), titulo].filter(Boolean).join(', ');
      const periodo = renderizarPeriodo({ inicio: p.fecha });
      const archivo = p.archivo
        ? ` (<a href="${escaparHtml(p.archivo)}">${spanEsEn('archivo', 'archive')}</a>)`
        : '';
      return `<li>${texto}${archivo}${periodo ? ` <span class="registro-fecha">${periodo}</span>` : ''}</li>`;
    });
  return renderizarListaRegistro('prensa', 'press', filas);
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
  const ficha = renderizarFichaTecnica(data);
  const secciones = renderizarSecciones(data.sections);
  const registro = renderizarPresentaciones(data.presentaciones) + renderizarPrensa(data.prensa);
  // primero el texto y después las imágenes, como en montoyamoraga.github.io
  const imagenes = renderizarGaleria(imagenesDePagina(data));
  return `<div class="contenido-texto">${h1}${ficha}${secciones}${registro}${imagenes}</div>`;
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
      const imagenSrc = escaparHtml(p.image || IMAGEN_DEFECTO);
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
    src: p.image || IMAGEN_DEFECTO,
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
      return (
        `<div class="cliente-item"><${tag} class="cliente-nombre"${href}>${nombre}</${tag}>` +
        `<div class="cliente-ano">${renderizarPeriodo(c)}</div></div>`
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
  renderizarMetaHead,
  extraerMetaDeDetalle,
};
