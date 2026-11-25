# piruetasxyz.github.io

## Acerca de

Página web programada con HTML, CSS y JS.

Alojada en GitHub Pages.

## Cómo se genera el sitio

El contenido de cada página (títulos, secciones, galerías, fichas
técnicas, tarjetas de personas y de proyectos) vive en YAML bajo
`datos/` y se hornea directo en el HTML en tiempo de build, con los
scripts `scripts/generar-*.js` (que usan las plantillas compartidas en
`scripts/lib/plantillas-sitio.js`). Cada script corre solo vía GitHub
Actions (`.github/workflows/generar-*.yml`) cada vez que se sube un
cambio a su YAML correspondiente, y commitea el HTML generado de
vuelta al repositorio.

Antes el sitio hacía esto en el navegador (`js/render.js` hacía
`fetch` del YAML y armaba el DOM al cargar cada página), pero eso
dejaba las páginas vacías para cualquier herramienta que no ejecutara
JS o no esperara ese `fetch` — en particular, para exportar el sitio a
PDF. Ahora el HTML ya trae el contenido puesto, y el JS que queda
(`js/nav.js`, `js/script.js`, `js/visor-3d.js`,
`js/proyectos-hero.js`) es solo mejoras progresivas (menú, toggle de
idioma, visor 3D, rotación del hero de proyectos), no lo que pone el
contenido ahí.

Para regenerar todo a mano:

```sh
node scripts/generar-proyectos.js
node scripts/generar-clientes.js
node scripts/generar-personas.js
```

## Imágenes

Este repositorio no guarda imágenes: todas viven en
[piruetas-web-media](https://github.com/piruetasxyz/piruetas-web-media),
en carpetas `AAAA-cliente-proyecto/`, y el YAML las enlaza vía
GitHub Pages de ese repositorio, que hereda el dominio `piruetas.xyz`
(`https://piruetas.xyz/piruetas-web-media/...`). No se usa jsDelivr
porque su espejo de GitHub no sirve repositorios de más de 50 MB.

Las páginas de proyectos y clientes muestran primero el texto y
después cada imagen en su propia fila de ancho completo, nunca texto e
imagen lado a lado. El orden es: `imagenes` (o `hero`, si no hay
`imagenes`) y después `galeria`. Cada imagen queda enlazada a su
archivo para verla en tamaño completo:

```yaml
chufebu:
  imagenes:
    - image: 'https://piruetas.xyz/piruetas-web-media/2026-piruetas-chufebu/svg/chufebu-placa.svg'
      alt:
        es: 'placa de chufebu v0.1 rev-a'
        en: 'chufebu v0.1 rev-a board'
    - image: 'https://piruetas.xyz/piruetas-web-media/2026-piruetas-chufebu/svg/chufebu-esquematico.svg'
      alt:
        es: 'esquemático de chufebu v0.1 rev-a'
        en: 'chufebu v0.1 rev-a schematic'
```

Un video (por ejemplo, un render 3D de una placa) va en la misma
lista con `video:` en vez de `image:`. Se muestra en su propia fila
igual que una imagen, en loop, sin sonido y sin enlace a su archivo,
y el `alt` va como `aria-label`. Los videos viven en la carpeta
`mp4/` de piruetas-web-media y nunca se usan para el preview en redes
sociales:

```yaml
    - video: 'https://piruetas.xyz/piruetas-web-media/2026-piruetas-chufebu/mp4/chufebu-placa-3d-giro.mp4'
      alt:
        es: 'render 3D de la placa de chufebu v0.1 rev-a, girando'
        en: '3D render of the chufebu v0.1 rev-a board, turning'
```

## Preview en redes sociales

Cada página trae sus meta tags Open Graph / Twitter Card horneados
(ver `renderizarMetaHead` en `scripts/lib/plantillas-sitio.js`). La
imagen del preview se elige así:

1. `imagen_social` de la entrada en el YAML, si existe.
2. si no, la primera de `imagenes` (o `hero.image`).
3. si no, la primera imagen de `galeria`.
4. si no hay ninguna, el logo (`2022-piruetas-logo/jpg/piruetas-v0.jpg` en piruetas-web-media), con tarjeta
   chica (`summary`) porque es cuadrado.

Nunca se hace una imagen de preview a mano. Si la imagen elegida
vive en [piruetas-web-media](https://github.com/piruetasxyz/piruetas-web-media)
(`AAAA-cliente-proyecto/jpg|png|svg/<nombre>`), `og:image` apunta a su
versión `AAAA-cliente-proyecto/redes/<nombre>.jpg`: un JPG de
1200×628 px que genera un GitHub Action de ese repositorio
(`scripts/generar-redes-sociales.sh`) para cada imagen que se sube.
Las fotos se recortan al centro y los SVG (esquemáticos, placas) se
centran completos sobre fondo blanco, porque WhatsApp, Facebook, X y
LinkedIn no muestran SVG. Se usa `.jpg` y no `.webp` porque algunas
apps (LinkedIn, iMessage antiguo) no muestran webp en el preview.

Para que el preview muestre otra imagen que no sea la primera de la
página, `imagen_social` apunta a la imagen original (no a la de
`redes/`), por ejemplo:

```yaml
imagen_social: 'https://piruetas.xyz/piruetas-web-media/2025-piruetas-parla/jpg/parla-placa.jpg'
```

Al agregar una imagen nueva, primero se sube a piruetas-web-media y
se espera a que su Action commitee la versión `redes/`; recién
después se sube el cambio de `datos.yaml` acá.

Para probar cómo se ve un link: https://www.opengraph.xyz/ o el
[depurador de Facebook](https://developers.facebook.com/tools/debug/),
que además sirve para refrescar el caché cuando se cambia la imagen.

## Licencia

MIT
