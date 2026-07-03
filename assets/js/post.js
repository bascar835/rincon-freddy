function getCurrentPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post') || window.location.hash.replace('#', '');
  return window.RF_DATA.posts.find((post) => post.slug === slug) || window.RF_DATA.posts[0];
}
function setMetaTag(selector, attribute, value) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[property=')) {
      const property = selector.match(/meta\[property=['"]([^'"]+)['"]\]/)?.[1];
      if (property) element.setAttribute('property', property);
    } else {
      const name = selector.match(/meta\[name=['"]([^'"]+)['"]\]/)?.[1];
      if (name) element.setAttribute('name', name);
    }
    document.head.append(element);
  }
  element.setAttribute(attribute, value);
}
function buildPostContent(post) {
  const container = document.querySelector('#post-content');
  if (!container) return;
  container.replaceChildren();
  post.content.forEach((section, index) => {
    const wrapper = document.createElement('section');
    wrapper.className = 'post-section';
    wrapper.innerHTML = `
      <h2>${section.heading}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
    `;
    container.append(wrapper);
    if (index === 0) {
      const intro = document.createElement('p');
      intro.className = 'tag';
      intro.textContent = post.category;
      container.prepend(intro);
    }
  });
}
function renderShareButtons(post) {
  const targets = [document.querySelector('#post-share-top'), document.querySelector('#post-share-bottom')].filter(Boolean);
  const shareUrl = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(post.slug)}`;
  const text = `${post.title} - Rincón de Freddy`;
  targets.forEach((target) => {
    target.replaceChildren();
    const nativeShare = document.createElement('button');
    nativeShare.type = 'button';
    nativeShare.className = 'share-btn';
    nativeShare.textContent = 'Compartir';
    nativeShare.addEventListener('click', async () => {
      if (navigator.share) {
        try { await navigator.share({ title: post.title, text, url: shareUrl }); return; }
        catch (error) { if (error.name !== 'AbortError') console.error(error); }
      }
      await navigator.clipboard.writeText(shareUrl);
      nativeShare.textContent = 'Enlace copiado';
      window.setTimeout(() => { nativeShare.textContent = 'Compartir'; }, 1800);
    });
    const whatsapp = document.createElement('a');
    whatsapp.className = 'share-btn';
    whatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    whatsapp.textContent = 'WhatsApp';
    const xShare = document.createElement('a');
    xShare.className = 'share-btn';
    xShare.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    xShare.target = '_blank';
    xShare.rel = 'noopener noreferrer';
    xShare.textContent = 'X';
    target.append(nativeShare, whatsapp, xShare);
  });
}
function renderRelated(post) {
  const container = document.querySelector('#post-related');
  if (!container) return;
  const related = window.RF_DATA.posts.filter((item) => item.slug !== post.slug).slice(0, 3);
  container.replaceChildren(...related.map((item) => window.RF_UTILS.createBlogCard(item, true)));
}
function updateStructuredData(post) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: { '@type': 'Organization', name: 'Rincón de Freddy' },
    datePublished: post.date,
    dateModified: post.date,
    image: [post.image],
    description: post.excerpt,
    mainEntityOfPage: `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(post.slug)}`,
    publisher: { '@type': 'Organization', name: 'Rincón de Freddy', logo: { '@type': 'ImageObject', url: 'assets/img/logo.png' } },
  };
  const element = document.querySelector('#blogposting-schema');
  if (element) element.textContent = JSON.stringify(schema, null, 2);
}
function applyPostMeta(post) {
  document.title = `${post.title} | Rincón de Freddy`;
  setMetaTag('meta[name="description"]', 'content', post.excerpt);
  setMetaTag('meta[name="keywords"]', 'content', `${post.category.toLowerCase()}, gastronomía, Benidorm, Rincón de Freddy`);
  setMetaTag('link[rel="canonical"]', 'href', `post.html?post=${encodeURIComponent(post.slug)}`);
  setMetaTag('meta[property="og:title"]', 'content', post.title);
  setMetaTag('meta[property="og:description"]', 'content', post.excerpt);
  setMetaTag('meta[property="og:url"]', 'content', `post.html?post=${encodeURIComponent(post.slug)}`);
  setMetaTag('meta[property="og:image"]', 'content', post.image);
  setMetaTag('meta[name="twitter:title"]', 'content', post.title);
  setMetaTag('meta[name="twitter:description"]', 'content', post.excerpt);
  setMetaTag('meta[name="twitter:image"]', 'content', post.image);
}
function renderPost() {
  const post = getCurrentPost();
  if (!post) return;
  const title = document.querySelector('#post-title');
  const category = document.querySelector('#post-category');
  const meta = document.querySelector('#post-meta');
  const image = document.querySelector('#post-image');
  const author = document.querySelector('#post-author');
  if (title) title.textContent = post.title;
  if (category) category.textContent = post.category;
  if (meta) meta.innerHTML = `<span>${window.RF_UTILS.formatDate(post.date)}</span><span>${post.author}</span><span>${post.category}</span>`;
  if (image) { image.src = post.image; image.alt = post.title; }
  if (author) author.textContent = post.author;
  applyPostMeta(post);
  buildPostContent(post);
  renderShareButtons(post);
  renderRelated(post);
  updateStructuredData(post);
}
document.addEventListener('DOMContentLoaded', renderPost);
