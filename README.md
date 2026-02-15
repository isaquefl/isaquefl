# Isaque Félix · Portfolio

Portfolio em uma página. Pronto para **Git** e **GitHub Pages**.

---

## Abrir no Git e ativar GitHub Pages (essencial)

### 1. Subir o projeto no GitHub

No terminal, na pasta do projeto:

```bash
git init
git add .
git commit -m "Portfolio inicial"
git branch -M main
git remote add origin https://github.com/isaquefl/isaquefl.git
git push -u origin main
```

(Se o repositório tiver outro nome, troque `isaquefl/isaquefl.git` pelo seu, ex: `isaquefl/portfolio.git`.)

### 2. Ativar GitHub Pages

Depois do primeiro push:

1. Abra o repositório no GitHub.
2. Vá em **Settings** (Configurações).
3. No menu lateral, clique em **Pages** (em "Code and automation").
4. Em **Build and deployment** → **Source**, escolha **Deploy from a branch**.
5. Em **Branch**, selecione **main** e pasta **/ (root)**.
6. Clique em **Save**.

Em alguns minutos o site estará em:

- **https://isaquefl.github.io/isaquefl/** (se o repo for `isaquefl/isaquefl`)
- ou **https://isaquefl.github.io/NOME-DO-REPO/** (se o repo tiver outro nome)

Se o repositório for exatamente **isaquefl/isaquefl**, também funciona: **https://isaquefl.github.io**

---

## Technical Deep Dive

Este portfólio e os projetos recentes (Aptos & Contextly) seguem uma filosofia **Performance-First**.

### Stack de desenvolvimento

- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **Auth:** Better Auth / NextAuth com integração Google/GitHub OAuth
- **AI Engine:** Groq API (Llama 3.3 70B) para processamento em tempo real
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel Edge Network

### Educação e certificações

- **Harvard University (CC50):** Introdução à Ciência da Computação — 70h
- **Cisco:** Especialista em Redes e Infraestrutura Avançada
- **Estácio:** Graduando em Análise e Desenvolvimento de Sistemas (2024–2027)

---

## Repositório e deploy

- **Repositório:** [github.com/isaquefl](https://github.com/isaquefl) (ou o repo onde este código estiver).
- **Vercel:** Conecte o repositório na Vercel; o deploy é automático. A listagem de repositórios públicos usa a API do GitHub (`api.github.com/users/isaquefl/repos`) no navegador e continua funcionando no Vercel — não é necessário token nem chave.

## O que tem no projeto

- **index.html** — página única (Sobre, Formação, Experiências, Cursos, Habilidades, Projetos, Contato)
- **styles.css** — tema preto e branco, minimalista
- **script.js** — menu mobile, scroll, listagem de repositórios do GitHub (públicos)

Portfolio estático em HTML, CSS e JavaScript. Todos os repositórios públicos do usuário **isaquefl** aparecem na seção Projetos.

## Como publicar

**GitHub Pages:** Settings → Pages → Deploy from branch (main, /).

**Vercel:** Conecte o repositório; deploy automático.

## Contato

- [GitHub](https://github.com/isaquefl)
- [LinkedIn](https://www.linkedin.com/in/isaquefcontato/)

© 2026 Isaque Félix
