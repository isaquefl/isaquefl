/**
 * Portfolio - Isaque Félix
 * Menu mobile, scroll suave para seções, F5 mantém posição, fundo com código.
 */

(function () {
  'use strict';

  // ----- Ano no rodapé -----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- F5: manter posição do scroll (evitar voltar ao topo/baixo) -----
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
    { text: '.container { max-width: 960px }', type: 'css' },
    { text: 'border-radius: var(--radius)', type: 'css' },
    { text: 'transition: opacity 0.4s ease', type: 'css' },
    { text: 'def index(request):', type: 'py' },
    { text: 'import pandas as pd', type: 'py' },
    { text: 'SELECT * FROM users', type: 'sql' },
    { text: 'GROUP BY category', type: 'sql' },
    { text: 'CREATE TABLE projects', type: 'sql' },
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
  //  PROJETOS — GitHub + Supabase (backoffice)
  //  Junta automaticamente os repositórios do GitHub com os ajustes do
  //  backoffice (descrições, marcadores/badges, destaques, projetos
  //  manuais de Vercel/Cloudflare e itens ocultos).
  // ===================================================================
  var CFG = window.PORTFOLIO_CONFIG || {};
  var GITHUB_USER = CFG.githubUser || 'isaquefl';
  var projectsList = document.getElementById('projects-list');
  var projectsLoading = document.getElementById('projects-loading');
  var featuredWrap = document.getElementById('projects-featured');
  var reposTitleEl = document.getElementById('projects-repos-title');
  var reposSubtitleEl = document.getElementById('projects-repos-subtitle');

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

  // Detecta onde o projeto está hospedado a partir da URL (para o marcador).
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

  // Constrói um card de projeto (usado para destaques e repositórios).
  function buildCard(p) {
    var hasLink = !!p.url;
    var card = document.createElement(hasLink ? 'a' : 'article');
    card.className = 'project-card' + (p.featured ? ' project-card-featured' : '');
    if (hasLink) {
      card.href = p.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
    if (p.description) {
      card.setAttribute('data-tooltip', p.description);
      card.classList.add('has-tooltip');
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
      (p.description ? '<p class="project-desc">' + escapeHtml(p.description) + '</p>' : '') +
      (meta.length ? '<div class="project-meta">' + meta.join('') + '</div>' : '');
    return card;
  }

  // Busca os dados do backoffice (Supabase REST). Falha de forma segura.
  function fetchOverrides() {
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) {
      return Promise.resolve({ projects: [], settings: {} });
    }
    var headers = { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey };
    var base = CFG.supabaseUrl.replace(/\/$/, '');
    var pReq = fetch(base + '/rest/v1/projects?select=*&order=position.asc', { headers })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    var sReq = fetch(base + '/rest/v1/settings?key=eq.site&select=value', { headers })
      .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    return Promise.all([pReq, sReq]).then(function (res) {
      var settings = (Array.isArray(res[1]) && res[1][0] && res[1][0].value) || {};
      return { projects: Array.isArray(res[0]) ? res[0] : [], settings: settings };
    });
  }

  function fetchRepos() {
    return fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=100&type=owner')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (d) { return Array.isArray(d) ? d.filter(function (x) { return !x.fork; }) : []; })
      .catch(function () { return null; }); // null = erro de rede; [] = vazio
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
    if (reposTitleEl && settings.reposTitle) reposTitleEl.textContent = settings.reposTitle;
    if (reposSubtitleEl && settings.reposSubtitle) reposSubtitleEl.textContent = settings.reposSubtitle;
    var fTitle = document.getElementById('projects-featured-title');
    if (fTitle && settings.featuredTitle) fTitle.textContent = settings.featuredTitle;

    // ----- Conteúdo do site (tudo editável pelo backoffice) -----
    var hero = settings.hero || {};
    setText('hero-name', hero.name);
    setText('hero-role', hero.role);
    setText('hero-tagline', hero.tagline);
    setText('hero-cta', hero.ctaText);

    var about = settings.about || {};
    // permite **negrito** simples no texto do sobre
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
        if (ov.hidden) return; // ocultado no backoffice
        var live = ov.url || repo.homepage || '';
        var badges = (ov.badges && ov.badges.length) ? ov.badges.slice() : [];
        // Marcador automático "Online" para projetos com deploy.
        if (live) {
          var hb = hostBadge(live);
          if (!badges.some(function (b) { return b && /online/i.test(b.label); })) {
            badges.unshift({ label: 'Online', color: 'green' });
          }
          if (hb && !badges.some(function (b) { return b && b.label === hb.label; })) badges.push(hb);
        }
        items.push({
          title: ov.title || repo.name,
          description: ov.description || repo.description || '',
          url: live || repo.html_url,
          repo_url: repo.html_url,
          language: ov.language || repo.language || '',
          badges: badges,
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
        if (hb && !badges.some(function (b) { return b && b.label === hb.label; })) badges.push(hb);
      }
      items.push({
        title: m.title || m.key,
        description: m.description || '',
        url: m.url || '',
        repo_url: m.repo_url || '',
        language: m.language || '',
        badges: badges,
        featured: !!m.featured,
        position: typeof m.position === 'number' ? m.position : 0,
        date: m.updated_at
      });
    });

    items.sort(function (a, b) { return (a.position - b.position) || 0; });
    return items;
  }

  function render(items) {
    var featured = items.filter(function (i) { return i.featured; });
    var normal = items.filter(function (i) { return !i.featured; });

    // Destaques
    var featuredTitle = document.getElementById('projects-featured-title');
    if (featuredWrap) {
      featuredWrap.innerHTML = '';
      featured.forEach(function (p) { featuredWrap.appendChild(buildCard(p)); });
    }
    if (featuredTitle) featuredTitle.style.display = featured.length ? '' : 'none';

    // Repositórios / demais
    if (projectsList) {
      projectsList.innerHTML = '';
      if (!normal.length && !featured.length) {
        projectsList.innerHTML = '<p class="projects-empty">Nenhum projeto ainda. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>.</p>';
        return;
      }
      normal.forEach(function (p) { projectsList.appendChild(buildCard(p)); });
    }
  }

  if (projectsList) {
    Promise.all([fetchRepos(), fetchOverrides()]).then(function (res) {
      var repos = res[0];
      var data = res[1];
      applySettings(data.settings || {});
      if (repos === null && (!data.projects || !data.projects.length)) {
        if (projectsLoading && projectsLoading.parentNode) projectsLoading.remove();
        projectsList.innerHTML = '<p class="projects-empty">Não foi possível carregar os projetos agora. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>.</p>';
        return;
      }
      render(buildList(repos || [], data));
    });
  }

  // ----- Animações no scroll (moderadas) -----
  var animated = document.querySelectorAll('[data-animate]');
  if (animated.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.08 }
    );
    animated.forEach(function (el) { observer.observe(el); });
  }
})();
