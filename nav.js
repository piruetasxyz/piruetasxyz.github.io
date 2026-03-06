const navbarContent = `
    <h1>
        <a href="#" id="english">en</a> /
        <a href="#" id="espanol">es</a>
    </h1>
    <h1><a href="/">home</a></h1>
    <h1><a href="/store"><span class="es">tienda</span><span class="en">store</span></a></h1>
    <h1><a href="/info">info</a></h1>
    <h1><a href="/people"><span class="es">personas</span><span class="en">people</span></a></h1>
    
    <hr style="border: 0; border-top: 1px solid black; margin: 20px 0;">
    
    <h3>popusintes</h3>
    <ol>
        <li><a href="/proyectos/parla">parla</a> (2025)</li>
        <li><a href="/proyectos/osca">osca</a> (soon)</li>
    </ol>

    <h3>software</h3>
    <ol>
        <li><a href="/proyectos/maquinitas-tidal">maquinitas-tidal</a></li>
    </ol>

    <h3>hardware</h3>
    <ol>
        <li><a href="/proyectos/gerassic-organ">gerassic organ</a></li>
    </ol>

    <h3>teaching</h3>
    <ol>
        <li><a href="/proyectos/talleres-momentos">talleres momentos</a> (2023)</li>
    </ol>
`;

document.getElementById('divLeftMenu').innerHTML = navbarContent;

const menuBtn = document.getElementById('menu-btn');
const menuSide = document.getElementById('divLeftMenu');

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuSide.classList.toggle('active');
    menuBtn.innerText = menuSide.classList.contains('active') ? 'cerrar' : 'menú';
});