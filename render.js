/* Global render.js
   - Detects `data-page` on <body>
   - Loads YAML for that page (tries several relative paths)
   - Renders two patterns: `personas` and `proyectos`
   - Depends on js-yaml being available as a global (jsyaml or JS_YAML)
*/
(function () {
  const dataPage = document.body && document.body.dataset && document.body.dataset.page;
  if (!dataPage) return;

  // Build candidate YAML locations, with support for language folders (es/en)
  const pageLang = (document.documentElement && document.documentElement.lang) || (document.body && document.body.lang) || '';
  const candidatesSet = new Set();
  function addCandidate(p) { if (p) candidatesSet.add(p); }

  // Special handling for the projects index page
  if (dataPage === 'proyectos' || dataPage === 'projects') {
    if (pageLang) {
      addCandidate(`${pageLang}/projects/projects.yaml`);
      addCandidate(`${pageLang}/proyectos/proyectos.yaml`);
    }
    addCandidate(`projects/projects.yaml`);
    addCandidate(`proyectos/proyectos.yaml`);
    addCandidate(`./projects.yaml`);
    addCandidate(`../projects/projects.yaml`);
    addCandidate(`/projects/projects.yaml`);
  } else {
    // For page-specific YAML (e.g., project detail like 'parla') prefer same-folder yaml and projects folder
    if (pageLang) {
      addCandidate(`${pageLang}/projects/${dataPage}/${dataPage}.yaml`);
      addCandidate(`${pageLang}/proyectos/${dataPage}/${dataPage}.yaml`);
      addCandidate(`${pageLang}/${dataPage}/${dataPage}.yaml`);
    }
    addCandidate(`proyectos/${dataPage}/${dataPage}.yaml`);
    addCandidate(`./${dataPage}.yaml`);
    addCandidate(`${dataPage}.yaml`);
    addCandidate(`../projects/${dataPage}/${dataPage}.yaml`);
    addCandidate(`projects/${dataPage}/${dataPage}.yaml`);
    addCandidate(`/projects/${dataPage}/${dataPage}.yaml`);
    addCandidate(`../proyectos/${dataPage}/${dataPage}.yaml`);
    addCandidate(`/proyectos/${dataPage}/${dataPage}.yaml`);
  }

  const yamlCandidates = Array.from(candidatesSet);

  function findYamlLib() {
    return window.jsyaml || window.JS_YAML || window.jsyaml || (window.jsyaml_min && window.jsyaml_min);
  }

  async function fetchFirstSuccessful(urls) {
    for (const u of urls) {
      try {
        const res = await fetch(u);
        if (!res.ok) continue;
        const text = await res.text();
        return { text, url: u };
      } catch (e) {
        // try next
      }
    }
    throw new Error('No YAML file found among candidates: ' + urls.join(', '));
  }

  function createPersonaCard(p) {
    const card = document.createElement('div');
    card.className = 'persona-card';

    if (p.foto) {
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

    if (Array.isArray(p.links) && p.links.length) {
      const links = document.createElement('div');
      links.className = 'persona-links';
      p.links.forEach((l) => {
        const a = document.createElement('a');
        a.href = l.url || '#';
        a.target = '_blank';
        a.className = 'boton-piruetas';
        if (l.label && typeof l.label === 'object') {
          const les = document.createElement('span');
          les.className = 'es';
          les.textContent = l.label.es || '';
          const len = document.createElement('span');
          len.className = 'en';
          len.textContent = l.label.en || '';
          a.appendChild(les);
          a.appendChild(len);
        } else {
          a.textContent = l.label || l.url || 'link';
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
    if (h1es) h1es.textContent = (data.ui && data.ui.title && data.ui.title.es) || '';
    if (h1en) h1en.textContent = (data.ui && data.ui.title && data.ui.title.en) || '';

    const h2es = document.querySelector('h2.cajita .es');
    const h2en = document.querySelector('h2.cajita .en');
    if (h2es) h2es.textContent = (data.ui && data.ui.collaborators_header && data.ui.collaborators_header.es) || '';
    if (h2en) h2en.textContent = (data.ui && data.ui.collaborators_header && data.ui.collaborators_header.en) || '';

    const miembrosContainer = document.getElementById('miembros');
    const colaboradoresContainer = document.getElementById('colaboradores');
    if (miembrosContainer) miembrosContainer.innerHTML = '';
    if (colaboradoresContainer) colaboradoresContainer.innerHTML = '';

    (data.miembros || []).forEach((m) => {
      if (miembrosContainer) miembrosContainer.appendChild(createPersonaCard(m));
    });

    (data.colaboradores || []).forEach((c) => {
      if (colaboradoresContainer) colaboradoresContainer.appendChild(createPersonaCard(c));
    });
  }

  function renderProyectos(data) {
    // expects data.proyectos array with fields: meta, tag, image, link, title, subtitle
    const container = document.getElementById('proyectos') || document.querySelector('.proyectos-list');
    if (!container) {
      console.warn('No proyectos container found (expected #proyectos or .proyectos-list)');
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
      metaLeft.textContent = typeof p.meta === 'object' ? (p.meta.es || p.meta.en || '') : (p.meta || '');
      header.appendChild(metaLeft);
      if (p.tag) {
        const tag = document.createElement('div');
        tag.className = 'proyecto-tag';
        tag.textContent = typeof p.tag === 'object' ? (p.tag.es || p.tag.en || '') : p.tag;
        header.appendChild(tag);
      }

      // image wrapped in link
      const link = document.createElement(p.link ? 'a' : 'div');
      if (p.link) link.href = p.link;
      link.className = 'proyecto-link';
      const imgWrap = document.createElement('div');
      imgWrap.className = 'proyecto-imgwrap';
      const img = document.createElement('img');
      img.src = p.image || '/media/piruetas-v0.jpg';
      if (p.alt && typeof p.alt === 'object') img.alt = p.alt.es || p.alt.en || '';
      else img.alt = p.alt || (p.titulo && (p.titulo.es || p.titulo.en)) || 'piruetas';
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
      sub.textContent = typeof p.subtitulo === 'object' ? (p.subtitulo.es || p.subtitulo.en || '') : (p.subtitulo || '');

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
    const heroDescEs = document.querySelector('.hero-description .es');
    const heroDescEn = document.querySelector('.hero-description .en');
    if (hero && (data.proyectos || []).length) {
      // pick specific projects to rotate (parla and redondela)
      const desired = ['parla', 'redondela'];
      const candidates = (data.proyectos || []).filter((p) => {
        const t = ((p.titulo && (p.titulo.es || p.titulo.en)) || '').toString().toLowerCase();
        return desired.includes(t);
      });
      const rotList = candidates.length ? candidates : (data.proyectos || []);
      let idx = 0;
      // ensure placeholder initially
      hero.src = hero.src || '/media/piruetas-v0.jpg';
      function show(i) {
        const p = rotList[i];
        if (!p) return;
        hero.src = p.image || '/media/piruetas-v0.jpg';
        hero.alt = (p.alt && (p.alt.es || p.alt.en)) || (p.titulo && (p.titulo.es || p.titulo.en)) || 'piruetas';
        if (heroLink && p.link) heroLink.href = p.link;
        if (heroTitleEs) heroTitleEs.textContent = (p.titulo && p.titulo.es) || '';
        if (heroTitleEn) heroTitleEn.textContent = (p.titulo && p.titulo.en) || '';
        if (heroDescEs) heroDescEs.textContent = (p.subtitulo && p.subtitulo.es) || '';
        if (heroDescEn) heroDescEn.textContent = (p.subtitulo && p.subtitulo.en) || '';
      }
      show(idx);
      setInterval(() => {
        idx = (idx + 1) % rotList.length;
        show(idx);
      }, 5000);
    }
  }

  function renderProjectDetail(data) {
    const container = document.querySelector('.contenido-texto') || document.querySelector('.project-content');
    if (!container) {
      console.warn('No project content container found');
      return;
    }

    // set title
    const h1 = container.querySelector('h1.cajita');
    if (h1 && data.ui && data.ui.title) {
      const esSpan = h1.querySelector('.es');
      const enSpan = h1.querySelector('.en');
      if (esSpan) esSpan.textContent = data.ui.title.es || '';
      if (enSpan) enSpan.textContent = data.ui.title.en || '';
    }

    // clear existing sections except the title
    // remove all children after the title
    let startRemoving = false;
    const children = Array.from(container.childNodes);
    children.forEach((node) => {
      if (node.nodeType === 1 && node.matches('h1.cajita')) {
        startRemoving = true;
        return;
      }
      if (startRemoving) node.remove();
    });

    (data.sections || []).forEach((sec) => {
      const h2 = document.createElement('h2');
      h2.className = 'cajita';
      const es = document.createElement('span');
      es.className = 'es';
      es.textContent = (sec.title && sec.title.es) || '';
      const en = document.createElement('span');
      en.className = 'en';
      en.textContent = (sec.title && sec.title.en) || '';
      h2.appendChild(es);
      h2.appendChild(en);
      container.appendChild(h2);

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
    if (h1es) h1es.textContent = (data.ui && data.ui.title && data.ui.title.es) || '';
    if (h1en) h1en.textContent = (data.ui && data.ui.title && data.ui.title.en) || '';

    const container = document.getElementById('clientes');
    if (!container) {
      console.warn('No clientes container found (expected #clientes)');
      return;
    }
    container.innerHTML = '';
    (data.clientes || []).forEach((c) => {
      const row = document.createElement('div');
      row.className = 'cliente-item';
      const name = document.createElement('div');
      name.className = 'cliente-nombre';
      name.textContent = c.nombre || '';
      const year = document.createElement('div');
      year.className = 'cliente-ano';
      year.textContent = c.ano ? String(c.ano) : '';
      row.appendChild(name);
      row.appendChild(year);
      container.appendChild(row);
    });
  }

  (async function main() {
    const yamlLib = findYamlLib();
    if (!yamlLib || typeof yamlLib.load !== 'function') {
      console.error('render.js: js-yaml library not found. Include js-yaml via CDN or lib/js-yaml.min.js');
      return;
    }

    try {
      const { text, url } = await fetchFirstSuccessful(yamlCandidates);
      const data = yamlLib.load(text);
      if (!data) throw new Error('Parsed YAML is empty');

      if (data.sections) {
        // project detail YAML with sections
        renderProjectDetail(data);
      } else if (dataPage === 'personas') {
        renderPersonas(data);
      } else if (dataPage === 'clientes') {
        renderClientes(data);
      } else if (dataPage === 'proyectos' || dataPage === 'projects' || data.proyectos) {
        renderProyectos(data);
      } else {
        console.warn('render.js: unsupported data-page', dataPage);
      }
    } catch (err) {
      console.error('render.js error:', err);
    }
  })();
})();
