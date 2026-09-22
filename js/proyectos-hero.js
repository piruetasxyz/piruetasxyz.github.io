/* Rotación del hero de /proyectos/. Antes esto vivía dentro de
   renderProyectos en render.js y armaba el hero desde datos/datos.yaml
   fetcheado en runtime; ahora el primer frame ya viene horneado en
   #hero-img/#hero-link (ver heroInicial en
   scripts/lib/plantillas-sitio.js), y este script solo lee, de las
   tarjetas .proyecto-item[data-hero] que ya están en el HTML, la
   imagen y el enlace a los que rotar cada 5s — sin fetch, sin YAML.
*/
(function () {
  const tarjetas = Array.from(
    document.querySelectorAll('.proyecto-item[data-hero]'),
  ).sort((a, b) => Number(a.dataset.hero) - Number(b.dataset.hero));
  if (!tarjetas.length) return;

  const hero = document.getElementById('hero-img');
  const heroLink = document.getElementById('hero-link');
  if (!hero) return;

  function mostrar(indice) {
    const tarjeta = tarjetas[indice];
    if (!tarjeta) return;
    const img = tarjeta.querySelector('.proyecto-imgwrap img');
    const link = tarjeta.querySelector('a.proyecto-link');
    if (img) {
      hero.src = img.src;
      hero.alt = img.alt;
    }
    if (heroLink && link && link.href) heroLink.href = link.href;
  }

  if (tarjetas.length > 1) {
    let indice = 0;
    setInterval(() => {
      indice = (indice + 1) % tarjetas.length;
      mostrar(indice);
    }, 5000);
  }
})();
