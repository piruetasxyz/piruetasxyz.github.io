document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <div id="topbar-buttons">
        <div class="topbar-row" id="menu-toggle-row">
            <span class="es">menú:</span><span class="en">menu:</span>
            <button id="menu-btn" class="boton-piruetas">
                <span class="es"><span data-state="show">mostrar</span> / <span data-state="hide">esconder</span></span>
                <span class="en"><span data-state="show">show</span> / <span data-state="hide">hide</span></span>
            </button>
        </div>
        <div class="topbar-row">
            <span class="es">leng:</span><span class="en">lang:</span>
            <button id="lang-btn" class="boton-piruetas"><span data-lang="en">en</span> / <span data-lang="es">es</span></button>
        </div>
    </div>
`,
);

document.body.insertAdjacentHTML(
  'beforeend',
  `
    <footer class="colophon-banner">
        <div class="colophon-line">
            <span class="es">piruetas.xyz está hecho a mano con HTML, CSS y JS</span>
            <span class="en">piruetas.xyz is handmade with HTML, CSS and JS</span>
        </div>
        <div class="colophon-line">
            <span class="es">sin rastreo, sin cookies, sin contador de visitas</span>
            <span class="en">no tracking, no cookies, no visitor counter</span>
        </div>
        <div class="colophon-line">
            <span class="es">tipografía Necto Mono por <a href="https://www.collletttivo.it/" target="_blank" rel="noopener">Collletttivo</a></span>
            <span class="en">typography Necto Mono by <a href="https://www.collletttivo.it/" target="_blank" rel="noopener">Collletttivo</a></span>
        </div>
    </footer>
`,
);

const navbarContent = `
    <h1><a id="nav-inicio" href="/index.html"><span class="es">inicio</span><span class="en">home</span></a></h1>
    <h1><a id="nav-proyectos" href="/proyectos/index.html"><span class="es">proyectos</span><span class="en">projects</span></a></h1>

    <h1>
        <a id="nav-tienda" href="https://piruetas.xyz/tienda">
            <span class="es">tienda</span><span class="en">shop</span>
        </a>
    </h1>

    <h1><a id="nav-personas" href="/personas/index.html"><span class="es">personas</span><span class="en">people</span></a></h1>
    <h1><a id="nav-clientes" href="/clientes/index.html"><span class="es">clientes</span><span class="en">clients</span></a></h1>

    <hr style="border: 0; border-top: 1px solid black; margin: 20px 0;">

    <h3>popusintes</h3>
    <ol>
        <li><a id="nav-parla" href="/proyectos/parla/index.html">parla</a> (2025)</li>
        <li><a id="nav-osca" href="/proyectos/osca/index.html">osca</a> (soon)</li>
    </ol>

    <h3>software</h3>
    <ol>
        <li><a id="nav-redondela" href="/proyectos/redondela/index.html">redondela</a></li>
    </ol>

    <h3>hardware</h3>
    <ol>
        <li><a id="nav-gerassic-organ" href="/proyectos/gerassic-organ/index.html">gerassic organ</a></li>
    </ol>

    <h3 class="es">enseñanza</h3><h3 class="en">teaching</h3>
    <ol>
        <li><a id="nav-talleres-momentos" href="/proyectos/talleres-momentos/index.html">talleres momentos</a> (2023)</li>
    </ol>
`;

document.getElementById('divLeftMenu').innerHTML = navbarContent;

// highlight the nav link(s) matching the current page in the same
// "cajita" boxed style used for page titles elsewhere on the site
const navSectionForPage = {
  inicio: ['nav-inicio'],
  proyectos: ['nav-proyectos'],
  parla: ['nav-proyectos', 'nav-parla'],
  osca: ['nav-proyectos', 'nav-osca'],
  redondela: ['nav-proyectos', 'nav-redondela'],
  'gerassic-organ': ['nav-proyectos', 'nav-gerassic-organ'],
  'investigacion-gerassic-organ': ['nav-proyectos', 'nav-gerassic-organ'],
  'talleres-momentos': ['nav-proyectos', 'nav-talleres-momentos'],
  'maquinitas-tidal': ['nav-proyectos'],
  personas: ['nav-personas'],
  clientes: ['nav-clientes'],
  'biblioteca-cuir': ['nav-clientes'],
  sokio: ['nav-clientes'],
  'universidad-diego-portales': ['nav-clientes'],
  tienda: ['nav-tienda'],
};
const activeIds = navSectionForPage[document.body.dataset.page] || [];
activeIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.classList.add('nav-active');
});

const menuBtn = document.getElementById('menu-btn');
const menuSide = document.getElementById('divLeftMenu');
const menuSpans = menuBtn.querySelectorAll('[data-state]');

window.setMenuOpen = function (isOpen) {
  menuSide.classList.toggle('active', isOpen);
  menuSpans.forEach((span) => {
    span.classList.toggle(
      'toggle-active',
      span.dataset.state === (isOpen ? 'show' : 'hide'),
    );
  });
  localStorage.setItem('menuOpen', isOpen ? 'true' : 'false');
};

setMenuOpen(localStorage.getItem('menuOpen') === 'true');

// enable the slide transition only after the restored state has
// painted once, so navigating between pages doesn't replay the
// open/close animation on load
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.classList.add('menu-ready');
  });
});

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  setMenuOpen(!menuSide.classList.contains('active'));
});
