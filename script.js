/**
 * Portfolio - Isaque Félix
 * Menu mobile, scroll suave, F5 mantém posição, fundo com código,
 * e catálogo de projetos por categoria (GitHub + backoffice Supabase).
 */

(function () {
  'use strict';

  // ----- Ano no rodapé -----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- F5: manter posição do scroll -----
  function saveScroll() {
    try { sessionStorage.setItem('portfolioScroll', String(window.scrollY)); } catch (e) {}
  }
  function restoreScroll() {
    try {
      if (window.location.hash) return;
      var y = sessionStorage.getItem('portfolioScroll');
      if (y !== null && y !== '') {
        sessionStorage.removeItem('portfolioScroll');
        window.scrollTo(0, parseInt(y, 10));
      }
    } catch (e) {}
  }
  window.addEventListener('scroll', (function () {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(saveScroll, 150);
    };
  })());
  window.addEventListener('pagehide', saveScroll);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(restoreScroll);
    });
  } else {
    requestAnimationFrame(restoreScroll);
  }

  // ----- Menu: clicar leva à seção e atualiza a URL -----
  var navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', href);
        }
      });
    });
  }

  // ----- Menu mobile (toggle) -----
  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-label', navLinks.classList.contains('is-open') ? 'Fechar menu' : 'Abrir menu');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
      });
    });
  }

  // ----- Fundo: linhas de código (moderado) -----
  var codeData = [
    { text: 'const app = express()', type: 'js' },
    { text: 'function Component() { return <div /> }', type: 'js' },
    { text: 'document.querySelector(".container")', type: 'js' },
    { text: 'npm install react', type: 'js' },
    { text: '<div class="card">', type: 'html' },
    { text: '<section id="hero">', type: 'html' },
    { text: 'export default function Page()', type: 'js' },
    { text: 'local plr = game.Players.LocalPlayer', type: 'lua' },
    { text: 'task.wait(0.1)', type: 'lua' },
    { text: '.container { max-width: 960px }', type: 'css' },
    { text: 'transition: opacity 0.4s ease', type: 'css' },
    { text: 'def index(request):', type: 'py' },
    { text: 'import pandas as pd', type: 'py' },
    { text: 'SELECT * FROM projects', type: 'sql' },
    { text: 'GROUP BY category', type: 'sql' },
  ];

  function initCodeBackground() {
    var canvas = document.getElementById('codeCanvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function spawnLine() {
      var item = codeData[Math.floor(Math.random() * codeData.length)];
      var el = document.createElement('div');
      el.className = 'code-line code-' + item.type;
      el.textContent = item.text;
      el.style.left = (Math.random() * 75 + 5) + '%';
      var duration = 18 + Math.random() * 14;
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = (Math.random() * 4) + 's';
      canvas.appendChild(el);
      setTimeout(function () {
        if (el.parentNode) el.remove();
      }, (duration + 4) * 1000);
    }

    for (var i = 0; i < 8; i++) {
      setTimeout(spawnLine, i * 600);
    }
    setInterval(spawnLine, 2800);
  }

  initCodeBackground();

  // ===================================================================
  //  PROJETOS — GitHub + Supabase (backoffice), agrupados por categoria
  // ===================================================================
  var CFG = window.PORTFOLIO_CONFIG || {};
  var GITHUB_USER = CFG.githubUser || 'isaquefl';
  var projectsLoading = document.getElementById('projects-loading');
  var featuredWrap = document.getElementById('projects-featured');
  var categoriesWrap = document.getElementById('projects-categories');
  var reposSubtitleEl = document.getElementById('projects-repos-subtitle');

  // Categorias padrão (fallback caso o Supabase não responda).
  var FALLBACK_CATEGORIES = [
    { slug: 'sites', label: 'Sites & Aplicações', description: 'Aplicações web completas, em produção.', icon: 'icon-globe', position: 1 },
    { slug: 'tools', label: 'Ferramentas & Frameworks', description: 'Bibliotecas e ferramentas open-source reutilizáveis.', icon: 'icon-terminal', position: 2 },
    { slug: 'gamedev', label: 'Game Dev & Roblox', description: 'Jogos e ferramentas em Lua/Luau e modelagem 3D.', icon: 'icon-cube', position: 3 },
    { slug: 'ai', label: 'IA & Data / Scrapers', description: 'Integrações de LLM, geração de conteúdo e coleta de dados.', icon: 'icon-code', position: 4 },
    { slug: 'automation', label: 'Automação & Bots', description: 'Bots e automações ponta-a-ponta (Discord, WhatsApp, Telegram).', icon: 'icon-server', position: 5 }
  ];
  var OTHERS = { slug: '__others', label: 'Mais projetos', description: 'Outros repositórios públicos.', icon: 'icon-code', position: 999 };

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text == null ? '' : text;
    return div.innerHTML;
  }

  function formatDate(str) {
    if (!str) return '';
    var d = new Date(str);
    if (isNaN(d)) return '';
    var months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return months[d.getMonth()] + '/' + d.getFullYear();
  }

  function hostBadge(url) {
    if (!url) return null;
    if (/vercel\.app/i.test(url)) return { label: 'Vercel', color: 'slate' };
    if (/pages\.dev/i.test(url)) return { label: 'Cloudflare', color: 'amber' };
    if (/github\.io/i.test(url)) return { label: 'GitHub Pages', color: 'slate' };
    return null;
  }

  function badgesHtml(badges) {
    if (!badges || !badges.length) return '';
    var html = badges.map(function (b) {
      if (!b || !b.label) return '';
      var color = (b.color || 'slate').toLowerCase();
      return '<span class="badge badge-' + escapeHtml(color) + '">' + escapeHtml(b.label) + '</span>';
    }).join('');
    return html ? '<div class="project-badges">' + html + '</div>' : '';
  }

  function techHtml(tech) {
    if (!tech || !tech.length) return '';
    var html = tech.map(function (t) {
      return t ? '<span class="project-tech-item">' + escapeHtml(t) + '</span>' : '';
    }).join('');
    return html ? '<div class="project-tech">' + html + '</div>' : '';
  }

  function buildCard(p) {
    var hasLink = !!p.url;
    var card = document.createElement(hasLink ? 'a' : 'article');
    card.className = 'project-card' + (p.featured ? ' project-card-featured' : '');
    if (hasLink) {
      card.href = p.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    var meta = [];
    if (p.language) meta.push('<span class="project-lang">' + escapeHtml(p.language) + '</span>');
    if (p.repo_url && p.url && p.repo_url !== p.url) {
      meta.push('<a class="project-sublink" href="' + escapeHtml(p.repo_url) + '" target="_blank" rel="noopener noreferrer">Código</a>');
    }
    if (p.date) meta.push('<span class="project-date">' + formatDate(p.date) + '</span>');

    card.innerHTML =
      '<span class="project-name">' + escapeHtml(p.title) + '</span>' +
      badgesHtml(p.badges) +
      (p.subtitle ? '<p class="project-subtitle">' + escapeHtml(p.subtitle) + '</p>' : '') +
      (p.description ? '<p class="project-desc">' + escapeHtml(p.description) + '</p>' : '') +
      techHtml(p.tech) +
      (meta.length ? '<div class="project-meta">' + meta.join('') + '</div>' : '');
    return card;
  }

  // Busca dados do backoffice (Supabase REST). Falha de forma segura.
  function fetchOverrides() {
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) {
      return Promise.resolve({ projects: [], settings: {}, categories: [] });
    }
    var headers = { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey };
    var base = CFG.supabaseUrl.replace(/\/$/, '');
    var pReq = fetch(base + '/rest/v1/projects?select=*&order=position.asc', { headers })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    var sReq = fetch(base + '/rest/v1/settings?key=eq.site&select=value', { headers })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    var cReq = fetch(base + '/rest/v1/portfolio_categories?select=*&visible=eq.true&order=position.asc', { headers })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return Promise.all([pReq, sReq, cReq]).then(function (res) {
      var settings = (Array.isArray(res[1]) && res[1][0] && res[1][0].value) || {};
      return {
        projects: Array.isArray(res[0]) ? res[0] : [],
        settings: settings,
        categories: Array.isArray(res[2]) ? res[2] : []
      };
    });
  }

  function fetchRepos() {
    return fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=100&type=owner')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (d) { return Array.isArray(d) ? d.filter(function (x) { return !x.fork; }) : []; })
      .catch(function () { return null; });
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null && value !== '') el.textContent = value;
  }
  function setHtml(id, value) {
    var el = document.getElementById(id);
    if (el && value != null && value !== '') el.innerHTML = value;
  }
  function setContact(id, href, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (href) el.setAttribute('href', href);
    if (value != null && value !== '') {
      var v = el.querySelector('.contact-value');
      if (v) v.textContent = value;
    }
  }

  function applySettings(settings) {
    if (reposSubtitleEl && settings.reposSubtitle) reposSubtitleEl.textContent = settings.reposSubtitle;
    var fTitle = document.getElementById('projects-featured-title');
    if (fTitle && settings.featuredTitle) fTitle.textContent = settings.featuredTitle;

    var hero = settings.hero || {};
    setText('hero-name', hero.name);
    setText('hero-role', hero.role);
    setText('hero-tagline', hero.tagline);
    setText('hero-cta', hero.ctaText);

    var about = settings.about || {};
    if (about.pt) setHtml('about-pt', mdBold(about.pt));
    if (about.en) setHtml('about-en', mdBold(about.en));

    var c = settings.contact || {};
    if (c.email) setContact('contact-email', 'mailto:' + c.email, c.email);
    if (c.whatsapp) {
      var digits = String(c.whatsapp).replace(/\D/g, '');
      setContact('contact-whatsapp', 'https://wa.me/' + digits, c.whatsappLabel || c.whatsapp);
    }
    if (c.linkedin) setContact('contact-linkedin', c.linkedin, c.linkedinLabel || handleFromUrl(c.linkedin));
    if (c.github) setContact('contact-github', c.github, c.githubLabel || handleFromUrl(c.github));
  }

  function mdBold(text) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  function handleFromUrl(url) {
    return String(url).replace(/\/$/, '').split('/').pop();
  }

  function buildList(repos, data) {
    var overrides = data.projects || [];
    var settings = data.settings || {};
    var byRepo = {};
    var manual = [];
    overrides.forEach(function (o) {
      if (o.kind === 'manual') manual.push(o);
      else byRepo[(o.key || '').toLowerCase()] = o;
    });

    var items = [];

    // 1) Repositórios do GitHub + ajustes do backoffice
    if (settings.showGithubRepos !== false && Array.isArray(repos)) {
      repos.forEach(function (repo) {
        var ov = byRepo[repo.name.toLowerCase()] || {};
        if (ov.hidden) return;
        var live = ov.url || repo.homepage || '';
        var badges = (ov.badges && ov.badges.length) ? ov.badges.slice() : [];
        if (live) {
          var hb = hostBadge(live);
          if (!badges.some(function (b) { return b && /online/i.test(b.label); })) {
            badges.unshift({ label: 'Online', color: 'green' });
          }
          if (hb && !badges.some(function (b) { return b && b.label === hb.label; })) badges.push(hb);
        }
        items.push({
          title: ov.title || repo.name,
          subtitle: ov.subtitle || '',
          description: ov.description || repo.description || '',
          url: live || repo.html_url,
          repo_url: repo.html_url,
          language: ov.language || repo.language || '',
          badges: badges,
          tech: ov.tech || [],
          category: ov.category || null,
          featured: !!ov.featured,
          position: typeof ov.position === 'number' ? ov.position : 1000,
          date: repo.updated_at
        });
      });
    }

    // 2) Projetos manuais do backoffice (Vercel/Cloudflare sem repo público, etc.)
    manual.forEach(function (m) {
      if (m.hidden) return;
      var badges = (m.badges && m.badges.length) ? m.badges.slice() : [];
      if (m.url) {
        var hb = hostBadge(m.url);
        if (!badges.some(function (b) { return b && /online/i.test(b.label); })) {
          badges.unshift({ label: 'Online', color: 'green' });
        }
        if (hb && !badges.some(function (b) { return b && b.label === hb.label; })) badges.push(hb);
      }
      items.push({
        title: m.title || m.key,
        subtitle: m.subtitle || '',
        description: m.description || '',
        url: m.url || '',
        repo_url: m.repo_url || '',
        language: m.language || '',
        badges: badges,
        tech: m.tech || [],
        category: m.category || null,
        featured: !!m.featured,
        position: typeof m.position === 'number' ? m.position : 0,
        date: m.updated_at
      });
    });

    items.sort(function (a, b) { return (a.position - b.position) || 0; });
    return items;
  }

  function iconSvg(id) {
    return '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + escapeHtml(id || 'icon-code') + '"/></svg>';
  }

  function render(items, categories) {
    var featured = items.filter(function (i) { return i.featured; });
    var normal = items.filter(function (i) { return !i.featured; });

    // ----- Destaques -----
    var featuredTitle = document.getElementById('projects-featured-title');
    if (featuredWrap) {
      featuredWrap.innerHTML = '';
      featured.forEach(function (p) { featuredWrap.appendChild(buildCard(p)); });
    }
    if (featuredTitle) featuredTitle.style.display = featured.length ? '' : 'none';

    // ----- Categorias -----
    if (!categoriesWrap) return;
    categoriesWrap.innerHTML = '';

    var cats = (categories && categories.length) ? categories.slice() : FALLBACK_CATEGORIES.slice();
    cats.sort(function (a, b) { return (a.position || 0) - (b.position || 0); });

    // Agrupa os itens não-destacados por categoria.
    var groups = {};
    normal.forEach(function (it) {
      var key = it.category || OTHERS.slug;
      (groups[key] = groups[key] || []).push(it);
    });

    var order = cats.slice();
    if (groups[OTHERS.slug]) order.push(OTHERS);

    var rendered = 0;
    order.forEach(function (cat) {
      var list = groups[cat.slug];
      if (!list || !list.length) return;
      rendered++;

      var section = document.createElement('div');
      section.className = 'category-section';
      section.setAttribute('data-animate', '');

      var header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML =
        '<span class="category-icon">' + iconSvg(cat.icon) + '</span>' +
        '<div class="category-heading">' +
          '<h4 class="category-label">' + escapeHtml(cat.label) +
            ' <span class="category-count">' + list.length + '</span></h4>' +
          (cat.description ? '<p class="category-desc">' + escapeHtml(cat.description) + '</p>' : '') +
        '</div>';
      section.appendChild(header);

      var grid = document.createElement('div');
      grid.className = 'projects-grid';
      list.forEach(function (p) { grid.appendChild(buildCard(p)); });
      section.appendChild(grid);

      categoriesWrap.appendChild(section);
      // re-observa para animação
      if (window.__io) window.__io.observe(section);
    });

    if (!rendered && !featured.length) {
      categoriesWrap.innerHTML = '<p class="projects-empty">Nenhum projeto ainda. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>.</p>';
    }
    if (projectsLoading && projectsLoading.parentNode) projectsLoading.remove();
  }

  if (categoriesWrap || featuredWrap) {
    Promise.all([fetchRepos(), fetchOverrides()]).then(function (res) {
      var repos = res[0];
      var data = res[1];
      applySettings(data.settings || {});
      if (repos === null && (!data.projects || !data.projects.length)) {
        if (projectsLoading && projectsLoading.parentNode) projectsLoading.remove();
        if (categoriesWrap) {
          categoriesWrap.innerHTML = '<p class="projects-empty">Não foi possível carregar os projetos agora. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>.</p>';
        }
        return;
      }
      render(buildList(repos || [], data), data.categories);
    });
  }

  // ----- Animações no scroll (moderadas) -----
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    },
    { rootMargin: '0px 0px -50px 0px', threshold: 0.08 }
  );
  window.__io = observer;
  document.querySelectorAll('[data-animate]').forEach(function (el) { observer.observe(el); });
})();
