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
  posts: [
    {
      slug: 'desayunos-con-sabor-mediterraneo',
      title: 'Desayunos desde las 5:30 AM en Benidorm',
      date: '2026-07-03',
      author: 'Rincón de Freddy',
      category: 'Desayunos',
      image: 'assets/img/blog-post-1.jpg',
      excerpt: 'Ven a Rincón de Freddy y disfruta de desayunos desde las 5:30 AM, tapas caseras, sardinas a la plancha y el mejor ambiente para compartir.',
      content: [
        { heading: '¿Buscas un sitio donde disfrutar del auténtico sabor de Benidorm?', paragraphs: ['En Rincón de Freddy te esperamos con desayunos desde las 5:30 AM, tapas caseras, sardinas a la plancha y el mejor ambiente para compartir con familia y amigos.', 'Cada visita es una excusa para disfrutar de buena comida, buen café y una atención cercana.'] },
        { heading: 'Un comienzo temprano para quienes madrugan en Benidorm', paragraphs: ['Abrimos muy pronto para que puedas desayunar antes de empezar la jornada, parar un momento entre paseo y paseo o sentarte a tomar algo con calma. La idea es sencilla: ofrecer un espacio cómodo, una atención amable y una propuesta que funcione desde primera hora.', 'La terraza y la barra están pensadas para quienes valoran una parada rápida y para quienes prefieren quedarse un rato más.'] },
        { heading: 'Benidorm, terraza y sabor de casa', paragraphs: ['📍 Av. Jaime I, 48 – Benidorm', '#Benidorm #TapasBenidorm #DesayunosBenidorm #RinconDeFreddy #CostaBlanca'] }
      ]
    },
    {
      slug: 'benidorm-entre-mesa-y-mar',
      title: '¡Hoy juega Ecuador!',
      date: '2026-06-25',
      author: 'Rincón de Freddy',
      category: 'Ambiente',
      image: 'assets/img/blog-post-2.jpg',
      excerpt: 'Desde España apoyamos a La Tri con el mismo sabor de casa. ¿Cuál es tu pronóstico para el partido? Déjanos tu marcador en los comentarios.',
      content: [
        { heading: '¡Hoy juega Ecuador!', paragraphs: ['Desde España apoyamos a La Tri con el mismo sabor de casa. 💛💙❤️', '¿Cuál es tu pronóstico para el partido?', '👇 Déjanos tu marcador en los comentarios.'] },
        { heading: 'Te esperamos desde las 5:30 AM', paragraphs: ['📍 Te esperamos desde las 5:30 AM.', '#benidorm #españa #bartapas #mundial2026 #ecuador'] },
        { heading: 'Ambiente de barrio y fútbol en la mesa', paragraphs: ['Rincón de Freddy sigue siendo un punto de encuentro para desayunar, tapear y compartir la pasión por los partidos importantes. El ambiente es cercano, la atención es directa y siempre hay una mesa lista para vivir el fútbol con sabor de casa.'] }
      ]
    }
  ],
};

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
document.addEventListener('DOMContentLoaded', () => { setSharedData(); initNavigation(); initRevealAnimations(); initBackToTop(); initLazyLoading(); renderLatestPosts(); updateBlogPostingSchema(); });
