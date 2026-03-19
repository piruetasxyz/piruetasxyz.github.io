const navbarContent = `
    <h1>
        <a href="#" id="english">en</a> /
        <a href="#" id="espanol">es</a>
    </h1>
    <h1><a href="/index.html">home</a></h1>
    
    <h1>
        <a href="https://piruetas.xyz/tienda">
            <span class="es">tienda</span><span class="en">shop</span>
        </a>
    </h1>
    
    <h1><a href="/info.html">info</a></h1>
    <h1><a href="/people/index.html"><span class="es">personas</span><span class="en">people</span></a></h1>
    
    <hr style="border: 0; border-top: 1px solid black; margin: 20px 0;">
    
    <h3 class="es">popusintes</h3><h3 class="en">popusynths</h3>
    <ol>
        <li><a href="/projects/parla/index.html">parla</a> (2025)</li>
        <li><a href="/projects/osca/index.html">osca</a> (soon)</li>
    </ol>

    <h3>software</h3>
    <ol>
        <li><a href="/projects/redondela/index.html">redondela</a></li>
    </ol>

    <h3>hardware</h3>
    <ol>
        <li><a href="/projects/gerassic-organ/index.html">gerassic organ</a></li>
    </ol>

    <h3 class="es">enseñanza</h3><h3 class="en">teaching</h3>
    <ol>
        <li><a href="/projects/talleres-momentos/index.html">talleres momentos</a> (2023)</li>
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