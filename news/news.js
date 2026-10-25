/**
 * Daily News pages: theme toggle in sync with the main site, the list of days, and the
 * client-side rendering of each day's Markdown post.
 */
(function () {
  'use strict';

  function initializeTheme() {
    const toggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const saved = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.setAttribute('data-theme', saved);
    if (!toggle) return;
    toggle.textContent = saved === 'dark' ? '☀️' : '🌙';
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  async function loadIndex() {
    const response = await fetch('index.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('index.json: ' + response.status);
    const posts = await response.json();
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function formatDate(iso) {
    const date = new Date(iso + 'T12:00:00Z');
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function renderList() {
    const container = document.getElementById('dn-list');
    if (!container) return;
    try {
      const posts = await loadIndex();
      if (!posts.length) {
        container.innerHTML = '<p class="dn-empty">Nothing yet. The first digest arrives tomorrow morning.</p>';
        return;
      }
      container.innerHTML = posts.map((post) => `
        <a class="dn-card" href="${escapeHtml(post.date)}.html">
          <div class="dn-card-date">${formatDate(post.date)}</div>
          <div class="dn-card-title">${escapeHtml(post.title)}</div>
          <p class="dn-card-lede">${escapeHtml(post.lede)}</p>
          <div class="dn-card-stats">${post.items} stories · ${post.papers} papers for me</div>
        </a>`).join('');
    } catch (error) {
      container.innerHTML = '<p class="dn-empty">The list could not be loaded.</p>';
      console.error(error);
    }
  }

  async function renderPost() {
    const article = document.getElementById('dn-post');
    if (!article) return;
    const date = article.dataset.date;
    try {
      const response = await fetch(`posts/${date}.md`, { cache: 'no-store' });
      if (!response.ok) throw new Error('post: ' + response.status);
      const markdown = (await response.text()).replace(/^---[\s\S]*?---\n/, '');
      article.innerHTML = marked.parse(markdown);
      const posts = await loadIndex();
      const index = posts.findIndex((p) => p.date === date);
      const newer = index > 0 ? posts[index - 1] : null;
      const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
      const nav = document.getElementById('dn-nav');
      if (nav) {
        nav.innerHTML =
          (older ? `<a href="${older.date}.html">← ${escapeHtml(older.title)}</a>` : '<span></span>') +
          (newer ? `<a href="${newer.date}.html">${escapeHtml(newer.title)} →</a>` : '<a href="./">All daily news</a>');
      }
    } catch (error) {
      article.innerHTML = '<p class="dn-empty">This post could not be loaded.</p>';
      console.error(error);
    }
  }

  function init() {
    initializeTheme();
    renderList();
    renderPost();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
