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

  // ----- Projetos: buscar repositórios do GitHub -----
  var GITHUB_USER = 'isaquefl';
  var projectsList = document.getElementById('projects-list');
  var projectsLoading = document.getElementById('projects-loading');

  function formatDate(str) {
    if (!str) return '';
    var d = new Date(str);
    var months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return months[d.getMonth()] + '/' + d.getFullYear();
  }

  function renderProjects(repos) {
    if (!projectsList) return;
    projectsList.removeChild(projectsLoading);
    if (!repos || repos.length === 0) {
      projectsList.innerHTML = '<p class="projects-empty">Nenhum repositório público ainda. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>.</p>';
      return;
    }
    repos.forEach(function (repo) {
      var card = document.createElement('a');
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'project-card';
      card.innerHTML =
        '<span class="project-name">' + escapeHtml(repo.name) + '</span>' +
        (repo.description ? '<p class="project-desc">' + escapeHtml(repo.description) + '</p>' : '') +
        '<div class="project-meta">' +
        (repo.language ? '<span class="project-lang">' + escapeHtml(repo.language) + '</span>' : '') +
        (repo.updated_at ? '<span class="project-date">' + formatDate(repo.updated_at) + '</span>' : '') +
        '</div>';
      projectsList.appendChild(card);
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showProjectsError() {
    if (!projectsList || !projectsLoading) return;
    projectsList.removeChild(projectsLoading);
    projectsList.innerHTML = '<p class="projects-empty">Não foi possível carregar os repositórios. <a href="https://github.com/' + GITHUB_USER + '?tab=repositories" target="_blank" rel="noopener noreferrer">Ver projetos no GitHub</a>.</p>';
  }

  if (projectsList && projectsLoading) {
    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=30&type=owner')
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(function (data) {
        var repos = Array.isArray(data) ? data.filter(function (r) { return !r.fork; }) : [];
        renderProjects(repos);
      })
      .catch(function () {
        showProjectsError();
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
