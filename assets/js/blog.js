function getPostsForBlog() { return [...window.RF_DATA.posts]; }
function renderBlog() {
  const searchInput = document.querySelector('[data-blog-search]');
  const categoryButtons = document.querySelectorAll('[data-category]');
  const postsContainer = document.querySelector('#blog-posts');
  const paginationContainer = document.querySelector('#blog-pagination');
  const resultsInfo = document.querySelector('#blog-results-info');
  if (!postsContainer || !paginationContainer || !resultsInfo) return;
  const state = { search: '', category: 'all', page: 1, perPage: 4 };
  const allPosts = getPostsForBlog();
  const matches = (post) => {
    const search = state.search.trim().toLowerCase();
    const categoryMatches = state.category === 'all' || post.category.toLowerCase() === state.category;
    const haystack = `${post.title} ${post.excerpt} ${post.category} ${post.content.map((section) => section.paragraphs.join(' ')).join(' ')}`.toLowerCase();
    const searchMatches = !search || haystack.includes(search);
    return categoryMatches && searchMatches;
  };
  const render = () => {
    const filtered = allPosts.filter(matches);
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.perPage;
    const visible = filtered.slice(start, start + state.perPage);
    postsContainer.replaceChildren(...visible.map((post) => window.RF_UTILS.createBlogCard(post)));
    resultsInfo.textContent = `${filtered.length} artículo${filtered.length === 1 ? '' : 's'} encontrados · página ${state.page} de ${totalPages}`;
    paginationContainer.replaceChildren();
    if (totalPages > 1) {
      for (let index = 1; index <= totalPages; index += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = String(index);
        button.className = index === state.page ? 'is-active' : '';
        button.setAttribute('aria-label', `Ir a la página ${index}`);
        button.addEventListener('click', () => { state.page = index; render(); postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        paginationContainer.append(button);
      }
    }
  };
  if (searchInput) searchInput.addEventListener('input', () => { state.search = searchInput.value; state.page = 1; render(); });
  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => { categoryButtons.forEach((item) => item.classList.remove('is-active')); button.classList.add('is-active'); state.category = button.dataset.category || 'all'; state.page = 1; render(); });
  });
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('q');
  if (query && searchInput) { searchInput.value = query; state.search = query; }
  render();
}
document.addEventListener('rf:data-ready', renderBlog);
