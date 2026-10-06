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
    <div class="nav-section">
        <h3 class="nav-brand"><a href="/index.html">piruetas</a></h3>
    </div>

    <div class="nav-section nav-idioma">
        <div>
            <button id="lang-btn" class="boton-piruetas"><span data-lang="en">en</span> / <span data-lang="es">es</span></button>
        </div>
        <button class="boton-piruetas nav-toggle" aria-expanded="false" aria-controls="divLeftMenu"><span class="es">menú</span><span class="en">menu</span></button>
    </div>

    <div class="nav-section">
        <h3 class="nav-titulo"><a href="/proyectos/index.html"><span class="es">proyectos</span><span class="en">projects</span></a></h3>
        <div class="nav-contenido">
            <h5>popusintes</h5>
            <ol>
                <li><a href="/proyectos/chufebu/index.html">chufebu</a> (2026)</li>
                <li><a href="/proyectos/chufe/index.html">chufe</a> (2026)</li>
            </ol>

            <h5><span class="es">bibliotecas</span><span class="en">libraries</span></h5>
            <ol>
                <li><a href="/proyectos/boton/index.html">Boton</a></li>
                <li><a href="/proyectos/perilla/index.html">Perilla</a></li>
            </ol>

            <!-- ocultos por ahora: redondela, gerassic organ, talleres momentos
            <h5>software</h5>
            <ol>
                <li><a href="/proyectos/redondela/index.html">redondela</a></li>
            </ol>

            <h5>hardware</h5>
            <ol>
                <li><a href="/proyectos/gerassic-organ/index.html">gerassic organ</a></li>
            </ol>

            <h5><span class="es">enseñanza</span><span class="en">teaching</span></h5>
            <ol>
                <li><a href="/proyectos/talleres-momentos/index.html">talleres momentos</a> (2023)</li>
            </ol>
            -->
        </div>
    </div>

    <div class="nav-section">
        <h3 class="nav-titulo"><a href="/clientes/index.html"><span class="es">clientes</span><span class="en">clients</span></a></h3>
        <div class="nav-contenido">
            <ol>
                <li><a href="/clientes/claudia-gonzalez-godoy/index.html">claudia gonzález godoy</a></li>
                <li><a href="/clientes/biblioteca-cuir/index.html">bibliotecaCuir</a></li>
                <li><a href="/clientes/sokio/index.html">sokio</a></li>
                <li><a href="/clientes/universidad-diego-portales/index.html">universidad diego portales</a></li>
            </ol>
        </div>
    </div>

    <div class="nav-section">
        <h3 class="nav-titulo"><a href="/personas/index.html"><span class="es">personas</span><span class="en">people</span></a></h3>
    </div>

    <div class="nav-section">
        <h3 class="nav-titulo"><a href="https://piruetas.xyz/tienda"><span class="es">tienda</span><span class="en">shop</span></a></h3>
    </div>
`;

const menuSide = document.getElementById('divLeftMenu');
menuSide.innerHTML = navbarContent;

// en pantallas angostas el menú queda arriba de la página, con las
// secciones cerradas hasta apretar este botón
const navToggle = menuSide.querySelector('.nav-toggle');
navToggle.addEventListener('click', () => {
  const abierto = menuSide.classList.toggle('abierto');
  navToggle.setAttribute('aria-expanded', String(abierto));
});

// marca con la "cajita" el enlace de la página actual y el título de
// su sección (ej: en /proyectos/parla/ se marcan parla y proyectos)
function normalizarRuta(ruta) {
  return ruta.replace(/index\.html$/, '').replace(/\/+$/, '/') || '/';
}

const rutaActual = normalizarRuta(window.location.pathname);
menuSide.querySelectorAll('a[href^="/"]').forEach((link) => {
  const rutaLink = normalizarRuta(link.getAttribute('href'));
  const esSeccion = link.closest('.nav-titulo') && rutaLink !== '/';
  if (rutaLink === rutaActual || (esSeccion && rutaActual.startsWith(rutaLink))) {
    link.classList.add('nav-active');
  }
});
