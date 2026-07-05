#!/usr/bin/env python3
"""
Regenera sitemap.xml, robots.txt y una página estática (post-<slug>.html)
por cada artículo de content/posts.json, con su propio título, descripción,
imagen/vídeo y datos estructurados ya escritos en el HTML (para que
WhatsApp, Facebook, Twitter/X y buscadores los vean sin depender de
JavaScript, y para que no dependan de la query string ?post=...).

Cómo usarlo:
  1. Publica o edita artículos normalmente desde el panel /cms/.
  2. Cuando quieras refrescar el SEO (por ejemplo, tras añadir un artículo
     nuevo o cambiar precios/textos), ejecuta desde la raíz del proyecto:
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


def load_json(name, default):
    path = ROOT / "content" / name
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


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


def render_featured_media(post, image_url):
    """Réplica en HTML estático de assets/js/main.js renderFeaturedMedia()."""
    media = post.get("featured_media") or {}
    if media.get("type") == "video" and media.get("video"):
        return f'<video id="post-image" class="post-image" controls preload="metadata" src="{media["video"]}"></video>'
    return f'<img id="post-image" src="{post.get("image", "")}" alt="{post["title"]}" class="post-image">'


def render_content_sections(post):
    """Réplica en HTML estático de assets/js/post.js buildPostContent(), para
    que el cuerpo del artículo también esté disponible sin ejecutar JS."""
    sections = post.get("content") or []
    if not sections:
        excerpt = post.get("excerpt", "")
        paragraphs = "".join(f"<p>{line}</p>" for line in excerpt.split("\n") if line.strip())
        return f'<section class="post-section">{paragraphs}</section>'

    html_parts = []
    for index, section in enumerate(sections):
        heading = section.get("heading", "")
        paragraphs = section.get("paragraphs") or []
        body = (f"<h2>{heading}</h2>" if heading else "") + "".join(f"<p>{p}</p>" for p in paragraphs)
        media_html = ""
        for item in section.get("media") or []:
            caption = f'<figcaption class="post-media-caption">{item["caption"]}</figcaption>' if item.get("caption") else ""
            if item.get("type") == "video" and item.get("video"):
                media_html += f'<figure class="post-media post-media-video"><video controls preload="metadata" src="{item["video"]}"></video>{caption}</figure>'
            elif item.get("type") == "image" and item.get("image"):
                media_html += f'<figure class="post-media"><img src="{item["image"]}" alt="{item.get("caption", "")}" loading="lazy">{caption}</figure>'
        tag = f'<p class="tag">{post["category"]}</p>' if index == 0 else ""
        html_parts.append(f'{tag}<section class="post-section">{body}{media_html}</section>')
    return "".join(html_parts)


MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
            "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def format_date_es(value):
    year, month, day = value.split("-")
    return f"{int(day):02d} de {MESES_ES[int(month) - 1]} de {year}"


def render_dish_card(dish):
    alt = dish.get("alt") or dish["title"]
    description_html = f'<p>{dish["description"]}</p>' if dish.get("description") else ""
    price_html = f'<strong>{dish["price"]}</strong>' if dish.get("price") else ""
    return (
        '<article class="dish-card">'
        '<div class="media-frame">'
        f'<img src="{dish["image"]}" alt="{alt}" loading="lazy">'
        '</div>'
        f'<div><h3>{dish["title"]}</h3>{description_html}{price_html}</div>'
        '</article>'
    )


def render_menu_categories(menu):
    categories = menu.get("categories") or []
    html_parts = []
    for category in categories:
        cards = "".join(render_dish_card(item) for item in category.get("items") or [])
        html_parts.append(
            f'<div class="menu-category"><h3>{category["title"]}</h3>'
            f'<div class="card-grid card-grid-featured">{cards}</div></div>'
        )
    return "".join(html_parts)


def render_gallery(gallery):
    images = gallery.get("images") or []
    return "".join(
        f'<div class="gallery-item"><img src="{img["src"]}" alt="{img.get("alt", "")}" loading="lazy"></div>'
        for img in images
    )


def render_blog_card(post, compact=True):
    btn_class = "btn-ghost" if compact else "btn-secondary"
    return (
        '<article class="blog-card reveal is-visible">'
        '<div class="media-frame">'
        f'<img src="{post["image"]}" alt="{post["title"]}" loading="lazy">'
        f'<span class="card-badge">{post["category"]}</span>'
        '</div>'
        f'<div><p class="blog-meta"><span>{format_date_es(post["date"])}</span></p>'
        f'<h3>{post["title"]}</h3><p>{post["excerpt"]}</p>'
        f'<a class="btn {btn_class}" href="post-{post["slug"]}.html">Leer artículo</a></div>'
        '</article>'
    )


def render_latest_posts(posts):
    return "".join(render_blog_card(post, compact=True) for post in posts[:3])


def update_index_html(menu, gallery, posts):
    path = ROOT / "index.html"
    doc = path.read_text(encoding="utf-8")

def replace_div_content(doc, open_tag, new_content):
    """Sustituye el contenido interior de un <div ...> concreto, contando
    la profundidad de <div>/</div> para encontrar su cierre correcto aunque
    dentro haya otros divs anidados (tarjetas, media-frames, etc.). Esto hace
    que el script se pueda ejecutar varias veces sin ir arrastrando HTML
    de ejecuciones anteriores."""
    idx = doc.find(open_tag)
    if idx == -1:
        return doc
    start = idx + len(open_tag)
    depth = 1
    for m in re.finditer(r'<div\b|</div>', doc[start:]):
        if m.group() == '</div>':
            depth -= 1
            if depth == 0:
                end = start + m.start()
                return doc[:start] + new_content + doc[end:]
        else:
            depth += 1
    return doc


def update_index_html(menu, gallery, posts):
    path = ROOT / "index.html"
    doc = path.read_text(encoding="utf-8")

    doc = replace_div_content(doc, '<div class="container menu-categories" id="menu-categories">', render_menu_categories(menu))
    doc = replace_div_content(doc, '<div class="gallery-grid" id="gallery-grid">', render_gallery(gallery))
    doc = replace_div_content(doc, '<div class="container card-grid blog-grid" id="latest-posts">', render_latest_posts(posts))

    path.write_text(doc, encoding="utf-8")
    print("index.html actualizado (carta, galería y últimos artículos ya escritos en el HTML)")


def update_blog_html(posts):
    """blog.html lista todos los artículos; se deja que main.js/blog.js filtren
    y busquen en vivo, pero se pre-rellena con todas las tarjetas para que
    también estén disponibles sin depender de JavaScript."""
    path = ROOT / "blog.html"
    doc = path.read_text(encoding="utf-8")
    open_tag = '<div class="container card-grid blog-grid" id="blog-posts" aria-live="polite">'
    if open_tag not in doc:
        return
    cards = "".join(render_blog_card(post, compact=False) for post in posts)
    doc = replace_div_content(doc, open_tag, cards)
    path.write_text(doc, encoding="utf-8")
    print("blog.html actualizado (listado ya escrito en el HTML)")


def generate_post_pages(posts):
    template = (ROOT / "post.html").read_text(encoding="utf-8")

    for post in posts:
        slug = post["slug"]
        url = f"{BASE}post-{slug}.html"
        title_tag = f"{post['title']} | Rincón de Freddy"
        description = post["excerpt"].split("\n")[0]
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
        doc = doc.replace('<meta property="og:type" content="article">',
                           '<meta property="og:type" content="article">')
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
            "author": {"@type": "Organization", "name": post.get("author", "Rincón de Freddy")},
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
            '<div class="post-meta" id="post-meta"></div>',
            f'<div class="post-meta" id="post-meta"><span>{post["date"]}</span><span>{post.get("author", "Rincón de Freddy")}</span><span>{post["category"]}</span></div>'
        )
        doc = doc.replace(
            '<img id="post-image" src="assets/img/blog-post-1.jpg" alt="Imagen destacada del artículo" class="post-image">',
            render_featured_media(post, image_url)
        )
        doc = doc.replace(
            '<div id="post-content" class="post-content"></div>',
            f'<div id="post-content" class="post-content">{render_content_sections(post)}</div>'
        )
        doc = doc.replace(
            '<strong id="post-author">Rincón de Freddy</strong>',
            f'<strong id="post-author">{post.get("author", "Rincón de Freddy")}</strong>'
        )
        doc = doc.replace(
            '  <script src="assets/js/main.js" defer></script>',
            f'  <script>window.RF_POST_SLUG = "{slug}";</script>\r\n  <script src="assets/js/main.js" defer></script>'
        )

        (ROOT / f"post-{slug}.html").write_text(doc, encoding="utf-8", newline="")
        print(f"post-{slug}.html generado")


if __name__ == "__main__":
    posts = load_posts()
    menu = load_json("menu.json", {"categories": []})
    gallery = load_json("gallery.json", {"images": []})

    write_sitemap(posts)
    write_robots()
    generate_post_pages(posts)
    update_index_html(menu, gallery, posts)
    update_blog_html(posts)
    print("\nListo. Revisa los archivos y súbelos junto con tu contenido.")
