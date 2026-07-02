/**
 * Portfolio - Isaque Félix
 * Menu mobile, scroll suave, F5 mantém posição, fundo com código,
 * tema claro/escuro, animações GSAP (com fallback e reduced-motion),
 * filtro por categoria e catálogo de projetos (GitHub + Supabase).
 *
 * IMPORTANTE: o pipeline de dados (fetchOverrides / fetchRepos / buildList)
 * é intocável — apenas a camada de apresentação foi redesenhada.
 */

(function () {
  'use strict';

  // ----- Preferências de movimento / disponibilidade do GSAP -----
  var REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GSAP_ON = !REDUCE_MOTION && !!(window.gsap && window.ScrollTrigger);
  if (GSAP_ON) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    // Sinaliza ao CSS que o GSAP assume o controle das entradas
    document.documentElement.classList.add('gsap-on');
  }

  // ----- Ano no rodapé -----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ==================================================================
  //  TEMA CLARO/ESCURO — persistido em localStorage
  //  (o estado inicial é aplicado por um script inline no <head>,
  //   antes do primeiro paint, para não haver "flash" de tema)
  // ==================================================================
  var THEME_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var current = 'dark';
    try {
      if (localStorage.getItem(THEME_KEY) === 'light') current = 'light';
    } catch (e) {}
    applyTheme(current);
    btn.addEventListener('click', function () {
      current = current === 'light' ? 'dark' : 'light';
      applyTheme(current);
      try { localStorage.setItem(THEME_KEY, current); } catch (e) {}
    });
  }

  initThemeToggle();

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

  // ----- Nav: sombra sutil ao rolar -----
  var navEl = document.querySelector('.nav');
  if (navEl) {
    var onNavScroll = function () {
      navEl.classList.toggle('nav--scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
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
          target.scrollIntoView({ behavior: REDUCE_MOTION ? 'auto' : 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', href);
        }
      });
    });
  }

  // ----- Menu mobile (toggle) -----
  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----- Fundo: linhas de código (mantido) -----
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
    if (!canvas || REDUCE_MOTION) return;

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
  //  (pipeline de dados preservado; somente a renderização mudou)
  // ===================================================================
  var CFG = window.PORTFOLIO_CONFIG || {};
  var GITHUB_USER = CFG.githubUser || 'isaquefl';
  var projectsLoading = document.getElementById('projects-loading');
  var featuredWrap = document.getElementById('projects-featured');
  var categoriesWrap = document.getElementById('projects-categories');
  var reposSubtitleEl = document.getElementById('projects-repos-subtitle');
  var filterBar = document.getElementById('projects-filter');

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

  /**
   * Card de projeto redesenhado: SEM ícone/cover, foco no título.
   * O card inteiro é um link (url > repo_url > perfil no GitHub).
   * Em repouso: título + chips de categoria/linguagem.
   * No hover/foco: revela subtítulo, tech tags, badges e "Abrir →".
   */
  function buildCard(p, catLabel) {
    var href = p.url || p.repo_url || ('https://github.com/' + GITHUB_USER);
    var card = document.createElement('a');
    card.className = 'project-card' + (p.featured ? ' project-card-featured' : '');
    card.href = href;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('data-category', p.category || OTHERS.slug);
    card.setAttribute('aria-label', 'Abrir projeto: ' + p.title + (p.subtitle ? ' — ' + p.subtitle : ''));

    // Chips visíveis em repouso (categoria + linguagem principal)
    var topChips = [];
    if (catLabel) topChips.push('<span class="chip chip-category">' + escapeHtml(catLabel) + '</span>');
    if (p.language) topChips.push('<span class="chip">' + escapeHtml(p.language) + '</span>');

    // Conteúdo revelado no hover
    var reveal = '';
    if (p.subtitle) reveal += '<p class="project-subtitle">' + escapeHtml(p.subtitle) + '</p>';
    if (p.description && p.description !== p.subtitle) {
      reveal += '<p class="project-desc">' + escapeHtml(p.description) + '</p>';
    }
    reveal += techHtml(p.tech);
    reveal += badgesHtml(p.badges);

    var footer = '<div class="project-card-footer">' +
      '<span class="project-open">Abrir <span class="arrow" aria-hidden="true">→</span></span>';
    // Link do código-fonte sem aninhar <a> dentro de <a> (span com role="link")
    if (p.repo_url && href !== p.repo_url) {
      footer += '<span class="project-sublink" role="link" tabindex="0" data-href="' +
        escapeHtml(p.repo_url) + '" aria-label="Ver código de ' + escapeHtml(p.title) + ' no GitHub">Código</span>';
    }
    if (p.date) footer += '<span class="project-date">' + formatDate(p.date) + '</span>';
    footer += '</div>';
    reveal += footer;

    card.innerHTML =
      '<div class="project-card-top">' +
        '<span class="project-name">' + escapeHtml(p.title) + '</span>' +
        (topChips.length ? '<div class="project-chips">' + topChips.join('') + '</div>' : '') +
      '</div>' +
      '<div class="project-card-reveal"><div class="project-card-reveal-inner">' + reveal + '</div></div>';
    return card;
  }

  // "Código" dentro do card-link: abre o repositório sem seguir o card
  document.addEventListener('click', function (e) {
    var s = e.target && e.target.closest ? e.target.closest('.project-sublink') : null;
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    var u = s.getAttribute('data-href');
    if (u) window.open(u, '_blank', 'noopener');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var s = e.target && e.target.closest ? e.target.closest('.project-sublink') : null;
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    var u = s.getAttribute('data-href');
    if (u) window.open(u, '_blank', 'noopener');
  });

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

  // ==================================================================
  //  FILTRO POR CATEGORIA (chips acessíveis + animação fade/scale)
  // ==================================================================
  var activeFilter = 'all';

  // A classe .filter-anim habilita a transição só durante a filtragem,
  // evitando conflito com hover e com os tweens do GSAP.
  function filterHide(el) {
    el.setAttribute('data-fstate', 'out');
    el.classList.add('filter-anim');
    void el.offsetWidth; // força reflow para a transição rodar
    el.classList.add('filter-out');
    setTimeout(function () {
      if (el.getAttribute('data-fstate') === 'out') {
        el.style.display = 'none';
        el.classList.remove('filter-anim');
      }
    }, REDUCE_MOTION ? 0 : 300);
  }

  function filterShow(el) {
    el.setAttribute('data-fstate', 'in');
    if (el.style.display === 'none') {
      el.style.display = '';
      el.classList.add('filter-out'); // parte do estado "escondido"
    }
    el.classList.add('filter-anim');
    void el.offsetWidth; // força reflow para a transição de entrada rodar
    el.classList.remove('filter-out');
    setTimeout(function () {
      if (el.getAttribute('data-fstate') === 'in') el.classList.remove('filter-anim');
    }, REDUCE_MOTION ? 0 : 300);
  }

  function applyFilter(slug) {
    activeFilter = slug;

    // Estado dos chips (aria-pressed para leitores de tela)
    if (filterBar) {
      filterBar.querySelectorAll('.filter-chip').forEach(function (chip) {
        chip.setAttribute('aria-pressed', chip.getAttribute('data-filter') === slug ? 'true' : 'false');
      });
    }

    // Seções de categoria
    if (categoriesWrap) {
      categoriesWrap.querySelectorAll('.category-section').forEach(function (sec) {
        var match = slug === 'all' || sec.getAttribute('data-category') === slug;
        (match ? filterShow : filterHide)(sec);
      });
    }

    // Cards em destaque (filtram individualmente)
    var anyFeatured = false;
    if (featuredWrap) {
      featuredWrap.querySelectorAll('.project-card').forEach(function (card) {
        var match = slug === 'all' || card.getAttribute('data-category') === slug;
        if (match) anyFeatured = true;
        (match ? filterShow : filterHide)(card);
      });
      featuredWrap.style.display = anyFeatured ? '' : 'none';
    }
    var fTitle = document.getElementById('projects-featured-title');
    if (fTitle) {
      fTitle.style.display = (anyFeatured && featuredWrap && featuredWrap.children.length) ? '' : 'none';
    }

    // Recalcula posições do ScrollTrigger após o layout mudar
    if (GSAP_ON) {
      setTimeout(function () { window.ScrollTrigger.refresh(); }, 320);
    }
  }

  function buildFilterBar(order, groups, featured) {
    if (!filterBar) return;
    filterBar.innerHTML = '';

    // Categorias que realmente têm projetos (na grade ou nos destaques)
    var featuredCats = {};
    featured.forEach(function (f) { featuredCats[f.category || OTHERS.slug] = true; });
    var available = order.filter(function (c) {
      return (groups[c.slug] && groups[c.slug].length) || featuredCats[c.slug];
    });
    if (available.length < 2) return; // filtro só faz sentido com 2+ categorias

    var chips = [{ slug: 'all', label: 'Todos' }].concat(available);
    chips.forEach(function (c) {
      var count = c.slug === 'all'
        ? null
        : ((groups[c.slug] || []).length + featured.filter(function (f) { return (f.category || OTHERS.slug) === c.slug; }).length);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip';
      btn.setAttribute('data-filter', c.slug);
      btn.setAttribute('aria-pressed', c.slug === activeFilter ? 'true' : 'false');
      btn.innerHTML = escapeHtml(c.label) +
        (count ? '<span class="filter-chip-count" aria-hidden="true">' + count + '</span>' : '');
      btn.addEventListener('click', function () { applyFilter(c.slug); });
      filterBar.appendChild(btn);
    });
  }

  // ==================================================================
  //  RENDER — destaques + agrupamento por categoria (dados preservados)
  // ==================================================================
  function render(items, categories) {
    var featured = items.filter(function (i) { return i.featured; });
    var normal = items.filter(function (i) { return !i.featured; });

    var cats = (categories && categories.length) ? categories.slice() : FALLBACK_CATEGORIES.slice();
    cats.sort(function (a, b) { return (a.position || 0) - (b.position || 0); });

    // Mapa slug → rótulo (para o chip de categoria dentro do card)
    var catLabels = {};
    cats.forEach(function (c) { catLabels[c.slug] = c.label; });
    catLabels[OTHERS.slug] = OTHERS.label;

    // ----- Destaques (cards maiores) -----
    var featuredTitle = document.getElementById('projects-featured-title');
    if (featuredWrap) {
      featuredWrap.innerHTML = '';
      featured.forEach(function (p) {
        featuredWrap.appendChild(buildCard(p, catLabels[p.category || OTHERS.slug]));
      });
      // anima a entrada dos destaques depois de popular
      if (featured.length) {
        featuredWrap.setAttribute('data-animate', '');
        if (window.__reveal) window.__reveal(featuredWrap);
      }
    }
    if (featuredTitle) featuredTitle.style.display = featured.length ? '' : 'none';

    // ----- Categorias -----
    if (!categoriesWrap) return;
    categoriesWrap.innerHTML = '';

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
      section.setAttribute('data-category', cat.slug);

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
      list.forEach(function (p) { grid.appendChild(buildCard(p, catLabels[cat.slug])); });
      section.appendChild(grid);

      categoriesWrap.appendChild(section);
      // re-observa para animação de entrada
      if (window.__reveal) window.__reveal(section);
    });

    // ----- Barra de filtro -----
    buildFilterBar(order, groups, featured);

    if (!rendered && !featured.length) {
      categoriesWrap.innerHTML = '<p class="projects-empty">Nenhum projeto ainda. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>.</p>';
    }
    if (projectsLoading && projectsLoading.parentNode) projectsLoading.remove();

    if (GSAP_ON) {
      setTimeout(function () { window.ScrollTrigger.refresh(); }, 100);
    }
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

  // ==================================================================
  //  ANIMAÇÕES — GSAP + ScrollTrigger quando disponíveis;
  //  IntersectionObserver + CSS como fallback. Nada roda com
  //  prefers-reduced-motion ativo.
  // ==================================================================

  // Revelação de um elemento (e stagger dos cards dentro dele) via GSAP
  function gsapReveal(el) {
    var gsap = window.gsap;
    var cards = el.querySelectorAll ? el.querySelectorAll('.project-card') : [];
    var tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
    tl.fromTo(el,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' }
    );
    if (cards.length) {
      tl.fromTo(cards,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' },
        '-=0.35'
      );
    }
  }

  if (GSAP_ON) {
    // Ponto único de "observação" — usado também pelo render() dinâmico
    window.__reveal = gsapReveal;

    // Entrada do hero: nome → role → tagline → CTA → indicador de scroll
    window.gsap.fromTo(
      ['.hero-name', '.hero-role', '.hero-tagline', '#hero-cta', '.hero-scroll'],
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.15, clearProps: 'transform' }
    );

    // Leve parallax no gradiente de fundo do hero
    window.gsap.to('.hero-bg', {
      yPercent: 28,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // Reveal on-scroll das seções estáticas
    document.querySelectorAll('[data-animate]').forEach(gsapReveal);
  } else {
    // Fallback: IntersectionObserver + classes CSS (como antes)
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.08 }
    );
    window.__reveal = function (el) { observer.observe(el); };
    document.querySelectorAll('[data-animate]').forEach(function (el) { observer.observe(el); });
  }
})();
