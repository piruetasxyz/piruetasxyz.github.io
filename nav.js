let navbar = `
 <nav class="navegacion">
    <h1>
    <a href="#" id="english">en</a> /
    <a href="#" id="espanol">es</a>
    </h1>
    <h1><a href="/">home</a></h1>
    <h1><a href="https://piruetas.xyz/tienda"><span class="es">tienda</span><span class="en">store</span></a></h1>
    <h1><a href="/info">info</a></h1>
    <h1><a href="/people"><span class="es">personas</span><span class="en">people</span></a></h1>
    <h1><span class="es">proyectos</span><span class="en">projects</span></h1>

    <h3>popusintes</h3>
    <ol>
        <li>
            <a href="/projects/parla">parla</a>
            <span class="es">2025 - ahora</span><span class="en">2025 - now</span>
        </li>
        <li>
            <a href="/projects/osca">osca</a>
            coming soon
        </li>
    </ol>

    <h3>software</h3>
    <ol>
        <li>
            <a href="/projects/maquinitas-tidal">maquinitas-tidal</a>
            <span class="es">2019 - ahora</span><span class="en">2019 - now</span>
        </li>
    </ol>

    <h3>hardware</h3>
    <ol>
        <li>
            <a href="/projects/gerassic-organ">gerassic organ</a>
            <span class="es">2022 - ahora</span><span class="en">2022 - now</span>
        </li>
    </ol>

    <h3>teaching</h3>
    <ol>
        <li>
            <a href="/projects/talleres-momentos">talleres momentos</a>
            2023
        </li>
    </ol>
    </nav>
`;

let divLeftMenu = document.getElementById('divLeftMenu');

divLeftMenu.insertAdjacentHTML('afterbegin', navbar);
