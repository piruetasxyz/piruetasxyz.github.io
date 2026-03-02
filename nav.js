let navbar = `
 <nav class="navegacion">
    <h1>
    <a href="./" id="english">en</a> /
    <a href="./" id="espanol">es</a>
    </h1>
    <h1><a href="/">home</a></h1>
    <h1><a href="https://piruetas.xyz/tienda" data-i18n="store"></a></h1>
    <h1><a href="/info">info</a></h1>
    <h1><a href="/people" data-i18n="people"></a></h1>
    <h1 data-i18n="projects"></h1>

    <h3 data-i18n="popusintes"></h3>
    <ol>
        <li>
            <a href="/projects/parla" data-i18n="projects-parla">
            </a>
            <span data-i18n="projects-parla-years"></span>
        </li>

        <li>
            <a href="/projects/osca" data-i18n="projects-osca">
            </a>
            <span data-i18n="projects-osca-years"></span>
        </li>

    </ol>

    <h3>software</h3>
    <ol>
        <li>
            <a href="/projects/maquinitas-tidal" data-i18n="projects-maquinitas-tidal">
            </a>
            <span data-i18n="projects-maquinitas-tidal-years"></span>
        </li>
    </ol>
    
    <h3>hardware</h3>
    <ol>
        <li>
            <a href="/projects/gerassic-organ" data-i18n="projects-gerassic-organ">
            </a>
            <span data-i18n="projects-gerassic-organ-years"></span>
        </li>
    </ol>

    <h3>teaching</h3>
    <ol>
        <li>
            <a href="/projects/talleres-momentos" data-i18n="projects-talleres-momentos">
            </a>
            <span data-i18n="projects-talleres-momentos-years"></span>
        </li>
    </ol>
    </nav>
`;

let divLeftMenu = document.getElementById('divLeftMenu');

divLeftMenu.insertAdjacentHTML('afterbegin', navbar);