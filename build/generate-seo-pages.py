#!/usr/bin/env python3
"""
Regenera sitemap.xml, robots.txt y una página estática (post-<slug>.html)
por cada artículo de content/posts.json, con su propio título, descripción,
imagen y datos estructurados ya escritos en el HTML (para que WhatsApp,
Facebook, Twitter/X y buscadores los vean sin depender de JavaScript).

Cómo usarlo:
  1. Publica o edita artículos normalmente desde el panel /cms/.
  2. Cuando quieras refrescar el SEO (por ejemplo, tras añadir un artículo
     nuevo), ejecuta desde la raíz del proyecto:
         python3 build/generate-seo-pages.py
  3. Sube los archivos nuevos/modificados (sitemap.xml, robots.txt y los
     post-<slug>.html) junto con tu contenido.

Si cambias el dominio o la ruta donde vive la web, actualiza la constante
BASE de abajo.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://bascar835.github.io/rincon-freddy/"


def load_posts():
    data = json.loads((ROOT / "content" / "posts.json").read_text(encoding="utf-8"))
    return data["posts"]


def write_sitemap(posts):
    urls = [(BASE, "2026-07-04"), (BASE + "blog.html", "2026-07-04")]
    for post in posts:
        urls.append((f"{BASE}post-{post['slug']}.html", post["date"]))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod in urls:
        lines += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{lastmod}</lastmod>", "  </url>"]
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\r\n".join(lines) + "\r\n", encoding="utf-8", newline="")
    print("sitemap.xml actualizado")


def write_robots():
    content = f"User-agent: *\r\nAllow: /\r\n\r\nSitemap: {BASE}sitemap.xml\r\n"
    (ROOT / "robots.txt").write_text(content, encoding="utf-8", newline="")
    print("robots.txt actualizado")


def generate_post_pages(posts):
    template = (ROOT / "post.html").read_text(encoding="utf-8")

    for post in posts:
        slug = post["slug"]
        url = f"{BASE}post-{slug}.html"
        title_tag = f"{post['title']} | Rincón de Freddy"
        description = post["excerpt"]
        image_url = f"{BASE}{post['image']}"
        keywords = f"{post['category'].lower()}, gastronomía, Benidorm, Rincón de Freddy"

        doc = template
        doc = doc.replace("<title>Artículo | Rincón de Freddy</title>", f"<title>{title_tag}</title>")
        doc = re.sub(r'<meta name="description" content="[^"]*">',
                      f'<meta name="description" content="{description}">', doc, count=1)
        doc = re.sub(r'<meta name="keywords" content="[^"]*">',
                      f'<meta name="keywords" content="{keywords}">', doc, count=1)
        doc = doc.replace('<link rel="canonical" href="post.html">', f'<link rel="canonical" href="{url}">')
        doc = doc.replace('<meta property="og:title" content="Artículo | Rincón de Freddy">',
                           f'<meta property="og:title" content="{post["title"]}">')
        doc = re.sub(r'<meta property="og:description" content="[^"]*">',
                      f'<meta property="og:description" content="{description}">', doc, count=1)
        doc = doc.replace('<meta property="og:url" content="post.html">', f'<meta property="og:url" content="{url}">')
        doc = doc.replace('<meta property="og:image" content="assets/img/blog-post-1.jpg">',
                           f'<meta property="og:image" content="{image_url}">')
        doc = doc.replace('<meta name="twitter:title" content="Artículo | Rincón de Freddy">',
                           f'<meta name="twitter:title" content="{post["title"]}">')
        doc = re.sub(r'<meta name="twitter:description" content="[^"]*">',
                      f'<meta name="twitter:description" content="{description}">', doc, count=1)
        doc = doc.replace('<meta name="twitter:image" content="assets/img/blog-post-1.jpg">',
                           f'<meta name="twitter:image" content="{image_url}">')
        doc = doc.replace('"url": "post.html",\r\n    "address"', f'"url": "{url}",\r\n    "address"')
        doc = doc.replace('"name": "Rincón de Freddy",\r\n    "url": "post.html",\r\n    "potentialAction"',
                           f'"name": "Rincón de Freddy",\r\n    "url": "{url}",\r\n    "potentialAction"')
        doc = doc.replace('{"@type": "ListItem", "position": 3, "name": "Artículo", "item": "post.html"}',
                           f'{{"@type": "ListItem", "position": 3, "name": "{post["title"]}", "item": "{url}"}}')

        schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post["title"],
            "author": {"@type": "Organization", "name": "Rincón de Freddy"},
            "datePublished": post["date"],
            "dateModified": post["date"],
            "image": [image_url],
            "description": description,
            "mainEntityOfPage": url,
            "publisher": {"@type": "Organization", "name": "Rincón de Freddy",
                           "logo": {"@type": "ImageObject", "url": f"{BASE}assets/img/logo.png"}},
        }
        schema_json = json.dumps(schema, ensure_ascii=False, indent=2)
        doc = doc.replace('<script id="blogposting-schema" type="application/ld+json">{}</script>',
                           f'<script id="blogposting-schema" type="application/ld+json">{schema_json}</script>')

        doc = doc.replace('<h1 id="post-title">Título del artículo</h1>', f'<h1 id="post-title">{post["title"]}</h1>')
        doc = doc.replace('<p class="eyebrow" id="post-category">Blog</p>',
                           f'<p class="eyebrow" id="post-category">{post["category"]}</p>')
        doc = doc.replace(
            '<img id="post-image" src="assets/img/blog-post-1.jpg" alt="Imagen destacada del artículo" class="post-image">',
            f'<img id="post-image" src="{post["image"]}" alt="{post["title"]}" class="post-image">'
        )
        doc = doc.replace(
            '  <script src="assets/js/main.js" defer></script>',
            f'  <script>window.RF_POST_SLUG = "{slug}";</script>\r\n  <script src="assets/js/main.js" defer></script>'
        )

        (ROOT / f"post-{slug}.html").write_text(doc, encoding="utf-8", newline="")
        print(f"post-{slug}.html generado")


if __name__ == "__main__":
    posts = load_posts()
    write_sitemap(posts)
    write_robots()
    generate_post_pages(posts)
    print("\nListo. Revisa los archivos y súbelos junto con tu contenido.")
