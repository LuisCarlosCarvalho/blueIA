# Blue Bolt Page Studio

> **Plataforma inteligente da Blue Bolt para criação, edição visual e estruturação de páginas digitais com arquitetura JSON-first, IA integrada e segurança de nível empresarial.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Cloud_Auth-fd366e.svg)](https://appwrite.io/)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Design System Blue Bolt](#-design-system-blue-bolt)
- [Segurança & Autenticação (RBAC)](#-segurança--autenticação-rbac)
- [Módulos & Funcionalidades](#-módulos--funcionalidades)
- [Guia de Deploy (Vercel & Git)](#-guia-de-deploy-vercel--git)
- [Desenvolvimento Local](#-desenvolvimento-local)
- [Boas Práticas & Governança](#-boas-práticas--governança)

---

## 🚀 Visão Geral

O **Blue Bolt Page Studio** combina a flexibilidade de um editor visual drag-and-drop com o poder da geração de páginas assistida por Inteligência Artificial (Google Gemini). 

A arquitetura adota o modelo **JSON-first**, onde cada página é representada por um documento estruturado e tipado. Isso garante:
- **Previsibilidade:** Sem código frágil ou dependências ocultas;
- **Compatibilidade:** Exportação direta para HTML standalone de alta performance;
- **Integração com IA:** Modelos de linguagem editam a árvore de blocos com precisão determinística.

---

## 🎨 Design System Blue Bolt

Todas as interfaces e decisões visuais do projeto seguem rigorosamente o **Blue Bolt Design System** (`docs/DESIGN_SYSTEM_BLUE_BOLT.md`):

### 1. Tokens e Cores Semânticas
As cores são gerenciadas através de variáveis CSS baseadas em HSL no Tailwind CSS v4:
- `--background` / `--foreground`: Superfícies e tipografia primária com contraste verificado (WCAG AA).
- `--primary` / `--primary-foreground`: Azul assinatura da Blue Bolt para ações principais e destaques.
- `--card` / `--card-foreground`: Cartões com elevação sutil e bordas estruturadas (`--border`).
- `--muted` / `--muted-foreground`: Elementos secundários, metadados e legendas.
- `--destructive`: Ações críticas e mensagens de erro.

### 2. Tipografia e Espaçamento
- **Fonte Padrão:** `Inter` (sans-serif moderno) com pesos 400, 500, 600 e 700.
- **Hierarquia:** Títulos estruturados com `text-xl`, `text-2xl` e tracking equilibrado.
- **Espaçamento e Layout:** Layout fluido de largura total com padding responsivo (`px-4 md:px-8 xl:px-10`), sem margens mortas excessivas.

### 3. Rolagem Natural da Página
- **Regra de Rolagem:** O contentor principal de rotas administrativas e definições (`/settings`, `/dashboard`, etc.) utiliza **rolagem nativa do navegador**.
- **Sem barras concorrentes:** É proibido o uso de `overflow-y-auto` ou alturas fixas (`h-screen`) no container pai, mantendo barras de rolagem restritas apenas a modais ou dropdowns quando estritamente necessário.

---

## 🔒 Segurança & Autenticação (RBAC)

### 1. Autenticação com Appwrite Cloud
- Sessões gerenciadas via SDK Web oficial do Appwrite (`appwrite`).
- Suporte a login por Email/Senha e provedores OAuth (Google, GitHub).

### 2. Controle de Acesso Baseado em Funções (RBAC)
- Permissões de administrador são derivadas em tempo real das **labels de sessão** do usuário (`user?.labels?.includes('admin')`).
- **Abas Restritas a Administradores em `/settings`:**
  1. *Painel Admin* (Métricas do sistema, usuários e saúde)
  2. *Integrações de IA* (Configurações de modelos e cotas Gemini)
  3. *Gestão de Templates* (Criação e importação Elementor JSON)
  4. *Importação e Exportação* (Backups em lote e restauração)
- Usuários padrão visualizam apenas as 4 abas públicas (*Geral*, *SEO*, *Chaves de API*, *Ajuda e Suporte*).

### 3. Gestão de Segredos & Integridade
- **Segurança de Chaves:** Chaves de API e segredos de servidor nunca são expostos no código do cliente.
- **Sanitização:** Sem injeção de HTML cru, `eval` ou carregamento de scripts externos inseguros.
- **Transparência de Estado:** Comunicação clara sobre o status real dos serviços integrados (sem simulação de validação server-side ativa antes de sua efetiva configuração).

---

## 🧩 Módulos & Funcionalidades

| Módulo | Descrição |
|---|---|
| **Editor Visual** | Canvas interativo com 19 tipos de blocos e 42 variantes (Hero, Navbar, Features, Preços, etc.). |
| **Geração por IA** | Criação instantânea de layouts completos a partir de prompts descritivos com Gemini. |
| **Definições & Admin** | Painel modular e responsivo em grid com barra lateral de navegação e área de conteúdo fluida. |
| **Gestão de Templates** | Biblioteca de templates pré-configurados com suporte a importação de JSON do Elementor. |
| **Exportação HTML** | Download de páginas independentes prontas para produção sem dependências de runtime. |

---

## 🚢 Guia de Deploy (Vercel & Git)

### 1. Preparação das Variáveis de Ambiente
Crie as variáveis de produção no painel da sua plataforma de hospedagem (Vercel) com base no `.env.example`:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=seu_project_id_aqui
GEMINI_API_KEY=sua_gemini_api_key_aqui
```

> **Atenção:** Nunca faça commit de arquivos `.env`, `.env.local` ou chaves privadas no Git.

### 2. Deploy na Vercel (Recomendado via GitHub)

1. **Vincule o repositório:**
   - Acesse o painel da [Vercel](https://vercel.com).
   - Clique em **"Add New Project"** e selecione o repositório `blueIA`.
2. **Configurações do Projeto:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Adicione as Variáveis de Ambiente:**
   - Em *Environment Variables*, adicione as chaves listadas acima.
4. **Clique em "Deploy":**
   - A cada novo push para a branch `main`, a Vercel executará o pipeline de build e deploy automaticamente.

### 3. Deploy via Vercel CLI (Opcional)
Caso prefira realizar o deploy diretamente pelo terminal:

```bash
# Instalar a CLI da Vercel globalmente
npm i -g vercel

# Autenticar e realizar deploy de preview
vercel

# Publicar em produção
vercel --prod
```

### 4. Deploy de Código via Git

Sempre valide o build antes de enviar alterações para o repositório remoto:

```bash
# 1. Verificar tipagem TypeScript
npx tsc --noEmit

# 2. Executar build de produção
npm run build

# 3. Adicionar arquivos modificados (sem .env)
git add .

# 4. Criar commit estruturado
git commit -m "feat: atualizacao da interface e documentacao Blue Bolt"

# 5. Enviar para a branch principal
git push origin main
```

---

## 💻 Desenvolvimento Local

```bash
# 1. Clonar o repositório
git clone https://github.com/LuisCarlosCarvalho/blueIA.git
cd blueIA

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Preencha as credenciais necessárias no .env.local

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

---

## 🛡️ Boas Práticas & Governança

1. **Estados de Interface:** Todo componente e funcionalidade deve tratar 4 estados fundamentais:
   - `Loading` (esqueleto ou indicador de carregamento)
   - `Empty` (mensagem de vazio amigável com ação de CTA)
   - `Error` (aviso claro com opção de nova tentativa)
   - `Success` (feedback visual positivo)
2. **Protocolo de Verificação:** Nenhuma alteração é considerada concluída sem passar por:
   - Verificação de tipos (`tsc`)
   - Build de produção (`vite build`)
   - Teste visual responsivo (Mobile e Desktop)
3. **Segurança de Banco de Dados:** Nenhuma rotina deve realizar escritas automáticas ou mutações de schema sem validação e autorização explícita.

---

*Blue Bolt Page Studio — Desenvolvido com foco em excelência visual, velocidade e segurança.*
