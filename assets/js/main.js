const RF_SITE = {
  name: 'Rincón de Freddy',
  url: './',
  phone: '+34 965 987 321',
  email: 'hola@rincondefreddy.es',
  address: 'Av. Jaime I, 48, Benidorm, Alicante',
  mapQuery: 'Rincón de Freddy Benidorm',
};

const RF_DATA = {
  featuredLinks: [
    { label: 'Historia', anchor: '#nosotros' },
    { label: 'Carta', anchor: '#carta' },
    { label: 'Galería', anchor: '#galeria' },
    { label: 'Blog', anchor: 'blog.html' },
  ],
  posts: [],
  menu: { featured: [], extra: [] },
  gallery: { images: [] },
};

function contentUrl(file) {
  // Resuelve la ruta a /content/*.json de forma relativa a la página actual,
  // para que funcione igual en index.html, blog.html y post.html.
  const base = window.location.pathname.replace(/[^/]*$/, '');
  return `${base}content/${file}`;
}

async function fetchJson(file, fallback) {
  try {
    const response = await fetch(contentUrl(file), { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

async function loadSiteData() {
  const [postsData, menuData, galleryData] = await Promise.all([
    fetchJson('posts.json', { posts: [] }),
    fetchJson('menu.json', { featured: [], extra: [] }),
    fetchJson('gallery.json', { images: [] }),
  ]);
  RF_DATA.posts = postsData.posts || [];
  RF_DATA.menu = { featured: menuData.featured || [], extra: menuData.extra || [] };
  RF_DATA.gallery = { images: galleryData.images || [] };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}
function createBlogCard(post, compact = false) {
  const article = document.createElement('article');
  article.className = 'blog-card reveal is-visible';
  article.innerHTML = `
    <img src="${post.image}" alt="${post.title}" loading="lazy">
    <div>
      <p class="blog-meta"><span>${post.category}</span><span>${formatDate(post.date)}</span></p>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <a class="btn ${compact ? 'btn-ghost' : 'btn-secondary'}" href="post.html?post=${encodeURIComponent(post.slug)}">Leer artículo</a>
    </div>
  `;
  return article;
}
function createDishCard(dish) {
  const article = document.createElement('article');
  article.className = 'dish-card';
  article.innerHTML = `
    <img src="${dish.image}" alt="${dish.alt || dish.title}" loading="lazy">
    <div>
      <h3>${dish.title}</h3>
      <p>${dish.description}</p>
      <strong>${dish.price}</strong>
    </div>
  `;
  return article;
}
function initNavigation() {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (toggle && nav) {
    const closeMenu = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); };
    toggle.addEventListener('click', () => { const isOpen = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(isOpen)); toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú'); });
    nav.addEventListener('click', (event) => { if (event.target.matches('a')) closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
  }
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a[href^="#"]');
    if (!target) return;
    const element = document.querySelector(target.getAttribute('href'));
    if (!element) return;
    event.preventDefault();
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
function initRevealAnimations() {
  const nodes = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { nodes.forEach((node) => node.classList.add('is-visible')); return; }
  const observer = new IntersectionObserver((entries, instance) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); instance.unobserve(entry.target); } }); }, { threshold: 0.18 });
  nodes.forEach((node) => observer.observe(node));
}
function initBackToTop() {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;
  const toggleVisibility = () => button.classList.toggle('is-visible', window.scrollY > 500);
  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function initLazyLoading() { document.querySelectorAll('img').forEach((image) => { if (!image.hasAttribute('loading') && !image.classList.contains('hero-image')) image.loading = 'lazy'; image.decoding = 'async'; }); }
function renderLatestPosts() {
  const container = document.querySelector('#latest-posts');
  if (!container) return;
  container.replaceChildren(...RF_DATA.posts.slice(0, 3).map((post) => createBlogCard(post, true)));
}
function renderMenu() {
  const featuredContainer = document.querySelector('#menu-featured');
  if (featuredContainer) featuredContainer.replaceChildren(...RF_DATA.menu.featured.map((dish) => createDishCard(dish)));
  const extraContainer = document.querySelector('#menu-extra-list');
  if (extraContainer) {
    extraContainer.replaceChildren(...RF_DATA.menu.extra.map((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      return li;
    }));
  }
}
function renderGallery() {
  const container = document.querySelector('#gallery-grid');
  if (!container) return;
  container.replaceChildren(...RF_DATA.gallery.images.map((image) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${image.src}" alt="${image.alt}" loading="lazy">`;
    return item;
  }));
}
function updateBlogPostingSchema() {
  const element = document.querySelector('#blogposting-schema');
  if (!element || !RF_DATA.posts.length) return;
  const post = RF_DATA.posts[0];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: { '@type': 'Organization', name: 'Rincón de Freddy' },
    datePublished: post.date,
    dateModified: post.date,
    image: [post.image],
    description: post.excerpt,
    mainEntityOfPage: `post.html?post=${encodeURIComponent(post.slug)}`,
    publisher: {
      '@type': 'Organization',
      name: 'Rincón de Freddy',
      logo: { '@type': 'ImageObject', url: 'assets/img/logo.png' },
    },
  };
  element.textContent = JSON.stringify(schema, null, 2);
}
function setSharedData() { window.RF_SITE = RF_SITE; window.RF_DATA = RF_DATA; window.RF_UTILS = { formatDate, createBlogCard }; }
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initRevealAnimations();
  initBackToTop();
  initLazyLoading();
  await loadSiteData();
  setSharedData();
  renderLatestPosts();
  renderMenu();
  renderGallery();
  updateBlogPostingSchema();
  document.dispatchEvent(new CustomEvent('rf:data-ready'));
});
