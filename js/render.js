/* Global render.js
   - Detects `data-page` on <body>
   - Tries to load a standalone YAML file for the section first, at
     /datos/<data-page>.yaml (e.g. /datos/clientes.yaml)
   - For any other page, checks /datos/clientes.yaml for a matching
     top-level key, so individual client detail pages (e.g.
     claudia-gonzalez-godoy) don't need their own YAML file
   - Falls back to the shared /datos/datos.yaml and looks up
     data[dataPage], for sections that haven't been split out yet
   - Depends on js-yaml being available as a global (jsyaml or JS_YAML)
*/
(function () {
  const dataPage =
    document.body &&
    document.body.dataset &&
    document.body.dataset.page;
  if (!dataPage) return;

  const DATOS_URL = '/datos/datos.yaml';
  const DATOS_PROPIOS_URL = '/datos/' + dataPage + '.yaml';
  const DATOS_CLIENTES_URL = '/datos/clientes.yaml';

  // exposed so script.js can refresh gallery alt text on language toggle
  window.refreshGaleriaAlt = function () {
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const key = 'alt' + (lang === 'es' ? 'Es' : 'En');
    document.querySelectorAll('.galeria-item img').forEach((img) => {
      img.alt = img.dataset[key] || '';
    });
  };

  function findYamlLib() {
    return (
      window.jsyaml ||
      window.JS_YAML ||
      window.jsyaml ||
      (window.jsyaml_min && window.jsyaml_min)
    );
  }

  function createPersonaCard(p) {
    const card = document.createElement('div');
    card.className = 'persona-card';
    const tieneDescripcion =
      p.descripcion && (p.descripcion.es || p.descripcion.en);
    if (!tieneDescripcion) {
      card.classList.add('persona-card-compacta');
    }

    if (p.modelo3d) {
      const foto = document.createElement('div');
      foto.className = 'persona-foto';
      const visor = document.createElement('div');
      visor.className = 'visor-3d';
      visor.dataset.modelo3d = p.modelo3d;
      foto.appendChild(visor);
      card.appendChild(foto);
    } else if (p.foto) {
      const foto = document.createElement('div');
      foto.className = 'persona-foto';
      const img = document.createElement('img');
      img.src = p.foto;
      img.alt = p.nombre || '';
      foto.appendChild(img);
      card.appendChild(foto);
    }

    const info = document.createElement('div');
    info.className = 'persona-info';

    const h2 = document.createElement('h2');
    h2.className = 'nombre-destacado';
    if (p.nombre && typeof p.nombre === 'object') {
      const nes = document.createElement('span');
      nes.className = 'es';
      nes.textContent = p.nombre.es || '';
      const nen = document.createElement('span');
      nen.className = 'en';
      nen.textContent = p.nombre.en || '';
      h2.appendChild(nes);
      h2.appendChild(nen);
    } else {
      h2.appendChild(document.createTextNode(p.nombre || ''));
    }
    if (p.pronombres) {
      const sp = document.createElement('span');
      sp.className = 'pronombres';
      if (typeof p.pronombres === 'object') {
        const pes = document.createElement('span');
        pes.className = 'es';
        pes.textContent = p.pronombres.es || '';
        const pen = document.createElement('span');
        pen.className = 'en';
        pen.textContent = p.pronombres.en || '';
        sp.appendChild(document.createTextNode(' '));
        sp.appendChild(pes);
        sp.appendChild(pen);
      } else {
        sp.appendChild(document.createTextNode(' ' + p.pronombres));
      }
      h2.appendChild(sp);
    }
    info.appendChild(h2);

    if (p.rol) {
      if (typeof p.rol === 'object') {
        const rolEs = document.createElement('p');
        rolEs.className = 'rol es';
        rolEs.textContent = p.rol.es || '';
        const rolEn = document.createElement('p');
        rolEn.className = 'rol en';
        rolEn.textContent = p.rol.en || '';
        info.appendChild(rolEs);
        info.appendChild(rolEn);
      } else {
        const rol = document.createElement('p');
        rol.className = 'rol';
        rol.textContent = p.rol;
        info.appendChild(rol);
      }
    }

    if (p.descripcion && p.descripcion.es) {
      const pes = document.createElement('p');
      pes.className = 'es';
      pes.textContent = p.descripcion.es;
      info.appendChild(pes);
    }
    if (p.descripcion && p.descripcion.en) {
      const pen = document.createElement('p');
      pen.className = 'en';
      pen.textContent = p.descripcion.en;
      info.appendChild(pen);
    }

    if (Array.isArray(p.enlaces) && p.enlaces.length) {
      const links = document.createElement('div');
      links.className = 'persona-links';
      p.enlaces.forEach((l) => {
        const a = document.createElement('a');
        a.href = l.url || '#';
        a.target = '_blank';
        a.className = 'boton-piruetas';
        if (l.etiqueta && typeof l.etiqueta === 'object') {
          const les = document.createElement('span');
          les.className = 'es';
          les.textContent = l.etiqueta.es || '';
          const len = document.createElement('span');
          len.className = 'en';
          len.textContent = l.etiqueta.en || '';
          a.appendChild(les);
          a.appendChild(len);
        } else {
          a.textContent = l.etiqueta || l.url || 'link';
        }
        links.appendChild(a);
      });
      info.appendChild(links);
    }

    card.appendChild(info);
    return card;
  }

  function renderPersonas(data) {
    const h1es = document.querySelector('h1.cajita .es');
    const h1en = document.querySelector('h1.cajita .en');
    if (h1es) h1es.textContent = data.es || '';
    if (h1en) h1en.textContent = data.en || '';

    const gruposContainer = document.getElementById('grupos');
    if (!gruposContainer) {
      console.warn('No grupos container found (expected #grupos)');
      return;
    }
    gruposContainer.innerHTML = '';

    (data.grupos || []).forEach((grupo) => {
      const h2 = document.createElement('h2');
      h2.className = 'cajita';
      const h2es = document.createElement('span');
      h2es.className = 'es';
      h2es.textContent = (grupo.encabezado && grupo.encabezado.es) || '';
      const h2en = document.createElement('span');
      h2en.className = 'en';
      h2en.textContent = (grupo.encabezado && grupo.encabezado.en) || '';
      h2.appendChild(h2es);
      h2.appendChild(h2en);
      gruposContainer.appendChild(h2);

      const list = document.createElement('div');
      list.className = 'personas-list';
      (grupo.miembros || []).forEach((m) => {
        list.appendChild(createPersonaCard(m));
      });
      gruposContainer.appendChild(list);
    });
  }

  function renderProyectos(data) {
    // expects data.proyectos array with fields: meta, tag, image, link, title, subtitle
    const container =
      document.getElementById('proyectos') ||
      document.querySelector('.proyectos-list');
    if (!container) {
      console.warn(
        'No proyectos container found (expected #proyectos or .proyectos-list)',
      );
      return;
    }
    container.innerHTML = '';
    (data.proyectos || []).forEach((p) => {
      const article = document.createElement('article');
      article.className = 'proyecto-item';

      // header with meta (left) and tag (right)
      const header = document.createElement('div');
      header.className = 'proyecto-header';
      const metaLeft = document.createElement('div');
      metaLeft.className = 'proyecto-meta-left';
      metaLeft.textContent =
        typeof p.meta === 'object'
          ? p.meta.es || p.meta.en || ''
          : p.meta || '';
      header.appendChild(metaLeft);
      if (p.etiqueta) {
        const tag = document.createElement('div');
        tag.className = 'proyecto-tag';
        tag.textContent =
          typeof p.etiqueta === 'object'
            ? p.etiqueta.es || p.etiqueta.en || ''
            : p.etiqueta;
        header.appendChild(tag);
      }

      // image wrapped in link
      const link = document.createElement(p.enlace ? 'a' : 'div');
      if (p.enlace) link.href = p.enlace;
      link.className = 'proyecto-link';
      const imgWrap = document.createElement('div');
      imgWrap.className = 'proyecto-imgwrap';
      const img = document.createElement('img');
      img.src = p.image || '/media/piruetas-v0.jpg';
      if (p.alt && typeof p.alt === 'object')
        img.alt = p.alt.es || p.alt.en || '';
      else
        img.alt =
          p.alt ||
          (p.titulo && (p.titulo.es || p.titulo.en)) ||
          'piruetas';
      imgWrap.appendChild(img);
      link.appendChild(imgWrap);

      // title and subtitle
      const h3 = document.createElement('h3');
      h3.className = 'proyecto-title';
      if (p.titulo && typeof p.titulo === 'object') {
        const tes = document.createElement('span');
        tes.className = 'es';
        tes.textContent = p.titulo.es || '';
        const ten = document.createElement('span');
        ten.className = 'en';
        ten.textContent = p.titulo.en || '';
        h3.appendChild(tes);
        h3.appendChild(ten);
      } else {
        h3.textContent = p.titulo || '';
      }
      const sub = document.createElement('p');
      sub.className = 'proyecto-sub';
      sub.textContent =
        typeof p.subtitulo === 'object'
          ? p.subtitulo.es || p.subtitulo.en || ''
          : p.subtitulo || '';

      article.appendChild(header);
      article.appendChild(link);
      article.appendChild(h3);
      article.appendChild(sub);
      container.appendChild(article);
    });

    // If a hero exists on the page, setup rotating hero from projects
    const hero = document.getElementById('hero-img');
    const heroLink = document.getElementById('hero-link');
    const heroTitleEs = document.querySelector('.hero-title .es');
    const heroTitleEn = document.querySelector('.hero-title .en');
    const heroDescEs = document.querySelector(
      '.hero-description .es',
    );
    const heroDescEn = document.querySelector(
      '.hero-description .en',
    );
    if (hero && (data.proyectos || []).length) {
      // pick specific projects to rotate (parla and redondela)
      const desired = ['parla', 'redondela'];
      const candidates = (data.proyectos || []).filter((p) => {
        const t = ((p.titulo && (p.titulo.es || p.titulo.en)) || '')
          .toString()
          .toLowerCase();
        return desired.includes(t);
      });
      const rotList = candidates.length
        ? candidates
        : data.proyectos || [];
      let idx = 0;
      // ensure placeholder initially
      hero.src = hero.src || '/media/piruetas-v0.jpg';
      function show(i) {
        const p = rotList[i];
        if (!p) return;
        hero.src = p.image || '/media/piruetas-v0.jpg';
        hero.alt =
          (p.alt && (p.alt.es || p.alt.en)) ||
          (p.titulo && (p.titulo.es || p.titulo.en)) ||
          'piruetas';
        if (heroLink && p.enlace) heroLink.href = p.enlace;
        if (heroTitleEs)
          heroTitleEs.textContent = (p.titulo && p.titulo.es) || '';
        if (heroTitleEn)
          heroTitleEn.textContent = (p.titulo && p.titulo.en) || '';
        if (heroDescEs)
          heroDescEs.textContent =
            (p.subtitulo && p.subtitulo.es) || '';
        if (heroDescEn)
          heroDescEn.textContent =
            (p.subtitulo && p.subtitulo.en) || '';
      }
      show(idx);
      setInterval(() => {
        idx = (idx + 1) % rotList.length;
        show(idx);
      }, 5000);
    }
  }

  function renderProjectDetail(data) {
    const container =
      document.querySelector('.contenido-texto') ||
      document.querySelector('.project-content');
    if (!container) {
      console.warn('No project content container found');
      return;
    }

    // set titulo (either a nested `titulo: {es, en}`, or `es`/`en` directly on data)
    const h1 = container.querySelector('h1.cajita');
    const tituloData = data.titulo || data;
    if (h1) {
      const esSpan = h1.querySelector('.es');
      const enSpan = h1.querySelector('.en');
      if (esSpan) esSpan.textContent = (tituloData && tituloData.es) || '';
      if (enSpan) enSpan.textContent = (tituloData && tituloData.en) || '';
    }

    // clear existing sections except the titulo
    // remove all children after the titulo
    let startRemoving = false;
    const children = Array.from(container.childNodes);
    children.forEach((node) => {
      if (node.nodeType === 1 && node.matches('h1.cajita')) {
        startRemoving = true;
        return;
      }
      if (startRemoving) node.remove();
    });

    if (Array.isArray(data.galeria) && data.galeria.length) {
      const grid = document.createElement('div');
      grid.className = 'galeria-grid';
      data.galeria.forEach((item) => {
        const a = document.createElement('a');
        a.className = 'galeria-item';
        a.href = item.image || '';
        a.target = '_blank';
        a.rel = 'noopener';
        const img = document.createElement('img');
        img.src = item.image || '';
        img.loading = 'lazy';
        img.dataset.altEs = (item.alt && item.alt.es) || '';
        img.dataset.altEn = (item.alt && item.alt.en) || '';
        a.appendChild(img);
        grid.appendChild(a);
      });
      container.appendChild(grid);
      window.refreshGaleriaAlt();
    }

    const tieneFicha =
      data.materiales || data.software || (data.equipo && data.equipo.length);
    if (tieneFicha) {
      const ficha = document.createElement('dl');
      ficha.className = 'ficha-tecnica';

      function addFilaTexto(labelEs, labelEn, valor) {
        if (!valor) return;
        const dt = document.createElement('dt');
        const dtEs = document.createElement('span');
        dtEs.className = 'es';
        dtEs.textContent = labelEs;
        const dtEn = document.createElement('span');
        dtEn.className = 'en';
        dtEn.textContent = labelEn;
        dt.appendChild(dtEs);
        dt.appendChild(dtEn);

        const dd = document.createElement('dd');
        const ddEs = document.createElement('span');
        ddEs.className = 'es';
        ddEs.textContent = valor.es || '';
        const ddEn = document.createElement('span');
        ddEn.className = 'en';
        ddEn.textContent = valor.en || '';
        dd.appendChild(ddEs);
        dd.appendChild(ddEn);

        ficha.appendChild(dt);
        ficha.appendChild(dd);
      }

      addFilaTexto('materiales', 'materials', data.materiales);
      addFilaTexto('software', 'software', data.software);

      if (Array.isArray(data.equipo) && data.equipo.length) {
        const dt = document.createElement('dt');
        const dtEs = document.createElement('span');
        dtEs.className = 'es';
        dtEs.textContent = 'equipo';
        const dtEn = document.createElement('span');
        dtEn.className = 'en';
        dtEn.textContent = 'team';
        dt.appendChild(dtEs);
        dt.appendChild(dtEn);
        ficha.appendChild(dt);

        const dd = document.createElement('dd');
        const ul = document.createElement('ul');
        ul.className = 'equipo-list';
        data.equipo.forEach((miembro) => {
          const li = document.createElement('li');
          const nombre = document.createElement('span');
          nombre.className = 'equipo-nombre';
          nombre.textContent = miembro.nombre || '';
          li.appendChild(nombre);
          if (miembro.rol && (miembro.rol.es || miembro.rol.en)) {
            const rolEs = document.createElement('span');
            rolEs.className = 'es equipo-rol';
            rolEs.textContent = miembro.rol.es || '';
            const rolEn = document.createElement('span');
            rolEn.className = 'en equipo-rol';
            rolEn.textContent = miembro.rol.en || '';
            li.appendChild(rolEs);
            li.appendChild(rolEn);
          }
          ul.appendChild(li);
        });
        dd.appendChild(ul);
        ficha.appendChild(dd);
      }

      container.appendChild(ficha);
    }

    (data.sections || []).forEach((sec) => {
      if (sec.titulo && (sec.titulo.es || sec.titulo.en)) {
        const h2 = document.createElement('h2');
        h2.className = 'cajita';
        const es = document.createElement('span');
        es.className = 'es';
        es.textContent = sec.titulo.es || '';
        const en = document.createElement('span');
        en.className = 'en';
        en.textContent = sec.titulo.en || '';
        h2.appendChild(es);
        h2.appendChild(en);
        container.appendChild(h2);
      }

      const p = document.createElement('p');
      if (sec.content) {
        // content may contain HTML markup; prefer setting innerHTML
        const esP = document.createElement('span');
        esP.className = 'es';
        esP.innerHTML = sec.content.es || '';
        const enP = document.createElement('span');
        enP.className = 'en';
        enP.innerHTML = sec.content.en || '';
        p.appendChild(esP);
        p.appendChild(enP);
      }
      container.appendChild(p);
    });
  }

  function renderClientes(data) {
    const h1es = document.querySelector('h1.cajita .es');
    const h1en = document.querySelector('h1.cajita .en');
    if (h1es) h1es.textContent = data.es || '';
    if (h1en) h1en.textContent = data.en || '';

    const container = document.getElementById('clientes');
    if (!container) {
      console.warn(
        'No clientes container found (expected #clientes)',
      );
      return;
    }
    container.innerHTML = '';
    (data.clientes || []).forEach((c) => {
      const row = document.createElement('div');
      row.className = 'cliente-item';
      const name = document.createElement(c.enlace ? 'a' : 'div');
      name.className = 'cliente-nombre';
      if (c.enlace) name.href = c.enlace;
      name.textContent = c.nombre || '';
      const year = document.createElement('div');
      year.className = 'cliente-ano';
      year.textContent = c.anho ? String(c.anho) : '';
      row.appendChild(name);
      row.appendChild(year);
      container.appendChild(row);
    });
  }

  (async function main() {
    const yamlLib = findYamlLib();
    if (!yamlLib || typeof yamlLib.load !== 'function') {
      console.error(
        'render.js: js-yaml library not found. Include js-yaml via CDN or lib/js-yaml.min.js',
      );
      return;
    }

    try {
      let data;

      const resPropio = await fetch(DATOS_PROPIOS_URL);
      if (resPropio.ok) {
        const text = await resPropio.text();
        data = yamlLib.load(text);
        if (!data) throw new Error('Parsed YAML is empty: ' + DATOS_PROPIOS_URL);
      }

      if (!data && DATOS_PROPIOS_URL !== DATOS_CLIENTES_URL) {
        const resClientes = await fetch(DATOS_CLIENTES_URL);
        if (resClientes.ok) {
          const text = await resClientes.text();
          const clientesData = yamlLib.load(text);
          if (clientesData && clientesData[dataPage]) {
            data = clientesData[dataPage];
          }
        }
      }

      if (!data) {
        const res = await fetch(DATOS_URL);
        if (!res.ok) throw new Error('Could not fetch ' + DATOS_URL);
        const text = await res.text();
        const datos = yamlLib.load(text);
        if (!datos) throw new Error('Parsed YAML is empty');

        data = datos[dataPage];
        if (!data) {
          throw new Error(
            'No entry for data-page "' + dataPage + '" in ' + DATOS_URL,
          );
        }
      }

      if (data.sections) {
        // project detail YAML with sections
        renderProjectDetail(data);
      } else if (dataPage === 'personas') {
        renderPersonas(data);
      } else if (dataPage === 'clientes') {
        renderClientes(data);
      } else if (
        dataPage === 'proyectos' ||
        dataPage === 'projects' ||
        data.proyectos
      ) {
        renderProyectos(data);
      } else {
        console.warn('render.js: unsupported data-page', dataPage);
      }

      if (window.refreshDocumentTitle) window.refreshDocumentTitle();
    } catch (err) {
      console.error('render.js error:', err);
    }
  })();
})();
