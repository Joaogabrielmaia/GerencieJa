# ⚡ GerêncieJá Enterprise SaaS

Plataforma Enterprise de Gestão de Projetos, Ciclos Ágeis (Sprints), Kanban Interativo e Metas/OKRs. Desenvolvida em Node.js com Express em arquitetura MVC, banco de dados SQLite relacional e Design System monocromático de alto contraste com background interativo em Canvas 3D.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js (v4.19.2)
- **Frontend / SSR**: EJS (v3.1.10), TailwindCSS (CDN), Lucide Icons, Chart.js, Vanilla Canvas 3D (`particles.js`)
- **Banco de Dados**: SQLite3 (`sqlite3 ^5.1.7`) via SQL Puro nativo com auto-initialization de schema e seed
- **Arquitetura**: MVC (Model-View-Controller) Monolítico Server-Side Rendered (SSR)

---

## 🚀 Instalação & Execução Local

### Pré-requisitos
- Node.js `v18.0.0` ou superior.
- Git instalado.

### 1. Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd project_management_system
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar o Projeto

#### Modo de Desenvolvimento (com auto-reload)
```bash
npm run dev
```

#### Modo de Produção
```bash
npm start
```

Acesse a aplicação em: `http://localhost:3333`

---

## 🌐 Deploy Automático no Render.com

Este repositório está **100% pronto para Deploy Automático** no [Render.com](https://render.com) com suporte ao Blueprint (`render.yaml`).

### Passo a Passo para Deploy:

1. Faça o **push** deste repositório para a sua conta no GitHub.
2. Acesse o dashboard do [Render.com](https://dashboard.render.com).
3. Clique no botão **New +** e selecione **Blueprint**.
4. Conecte o seu repositório do GitHub.
5. O Render detectará automaticamente o arquivo `render.yaml` e aplicará os seguintes parâmetros:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm rebuild sqlite3`
   - **Start Command**: `npm start`
   - **Node Version**: `20.10.0`
6. Clique em **Apply** e aguarde o deploy concluir com sucesso!

---

## 🗄️ Estrutura do Banco de Dados (SQLite)

O banco de dados SQLite é gerenciado automaticamente na inicialização do servidor HTTP:
- O arquivo `.sqlite` é mantido em `./database/database.sqlite` (ou no caminho configurado via variável `DATABASE_PATH`).
- As tabelas são criadas automaticamente a partir do [schema.sql](file:///C:/Users/Joaog/.gemini/antigravity/scratch/project_management_system/database/schema.sql).
- Dados iniciais de demonstração são inseridos via [seed.sql](file:///C:/Users/Joaog/.gemini/antigravity/scratch/project_management_system/database/seed.sql) caso a base esteja vazia.

---

## 📄 Licença

Este projeto é um software proprietário pronto para uso comercial.
