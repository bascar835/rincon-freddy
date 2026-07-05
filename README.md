# rincon-freddy
Sitio web oficial de Rincón de Freddy (Benidorm) desarrollado con HTML, CSS y JavaScript para GitHub Pages.

## SEO automático

Cada vez que se publica un cambio en `main` (por ejemplo, al editar algo desde el panel `/cms/`), la GitHub Action `.github/workflows/deploy.yml` ejecuta `build/generate-seo-pages.py` y despliega el resultado en GitHub Pages. Este script:

- Genera una página HTML propia por cada artículo del blog (`post-<slug>.html`) con su título, imagen/vídeo, descripción y datos estructurados para que se vea bien al compartir en WhatsApp/redes y para buscadores.
- Escribe directamente en `index.html` la carta, la galería y los últimos artículos, y en `blog.html` el listado completo.
- Regenera `sitemap.xml` y `robots.txt` con las URLs reales del sitio.

No hace falta ejecutarlo a mano ni antes ni después de publicar: el despliegue en GitHub Pages siempre lo hace por ti. Si quieres previsualizarlo en tu ordenador antes de subir cambios, puedes correr `python3 build/generate-seo-pages.py` localmente.

**Importante:** para que el despliegue funcione, en GitHub ve a *Settings → Pages* y en "Build and deployment" elige **GitHub Actions** como origen (no "Deploy from a branch").

