# Diagnóstico técnico — Blue Bolt Page Studio

Data: 2026-09-10. Repositório analisado: `C:/Users/carva/OneDrive/Desktop/Bult2.0`.
Referência local: `main`, HEAD `3f32014`. Auditoria de análise e diagnóstico; nenhuma implementação, instalação, atualização, commit, push, publicação ou operação de base de dados foi realizada.

## 1. Resumo executivo

O projeto tem uma base real de editor React, com blocos, templates, edição visual, estado global e autenticação Appwrite. Ainda não é uma plataforma integralmente validada para produção.

O build passou e os testes disponíveis passaram: 8 testes Vitest e 22 testes do schema. O lint falhou com **86 erros e 1 aviso**. A existência de testes verdes não valida os fluxos completos: os testes de publicação cobrem helpers, e o schema canónico ainda não é utilizado pelos caminhos reais de entrada e exportação.

O Studio Bolt contém a maior parte do comportamento. O Bolt Tink IA compartilha estado e barra superior, mas é uma interface parcial: botões sem ação, inspetor informativo e ausência da orquestração de geração, recuperação e gravação de projetos do Studio Bolt.

Os projetos são persistidos em localStorage, sem isolamento por utilizador. Guardar/publicar na barra nova apenas informa que a integração está em preparação. Existe uma API de publicação antiga, mas o cabeçalho enviado pelo cliente não corresponde ao exigido pelo servidor.

O importador ZIP não converte HTML: examina nomes em cabeçalhos locais e devolve o template Agency fixo. O exportador cobre 13 dos 25 tipos registrados, não exporta todas as páginas e depende de scripts remotos. Há caminhos de URLs e interpolação de conteúdo que precisam de validação antes de qualquer expansão da publicação.

A verificação visual ficou **bloqueada por indisponibilidade de navegador**. O Vite iniciou e respondeu a HTTP, mas isso não comprova que Dashboard/Editor renderizam nem que o console está livre de erros.

## 2. Arquitetura atual

### Stack e versões

Versões instaladas confirmadas por `npm.cmd ls --depth=0` (exit 0):

| Camada | Versões |
|---|---|
| Runtime local | Node.js 24.18.0 |
| UI | React e React DOM 19.2.4; React Router DOM 7.13.1 |
| Build e tipos | Vite 7.3.1; TypeScript 5.9.3; plugin React 5.1.4 |
| CSS | Tailwind CSS e plugin Vite 4.2.1 |
| Estado | Zustand 5.0.11; Immer 11.1.4 |
| Drag and drop | @dnd-kit/core 6.3.1; sortable 10.0.0; utilities 3.2.2 |
| Dados e autenticação | appwrite 26.2.0; node-appwrite 29.0.0 |
| Contratos e arquivos | Zod 4.5.4; JSZip 3.10.1 |
| Qualidade | ESLint 9.39.3; Vitest 4.0.18 |

Dependências diretas de produção declaradas em `package.json`: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@tailwindcss/vite`, `appwrite`, `clsx`, `dotenv`, `immer`, `jszip`, `lucide-react`, `node-appwrite`, `react`, `react-dom`, `react-router-dom`, `sonner`, `tailwind-merge`, `tailwindcss`, `zod`, `zustand`.

Dependências diretas de desenvolvimento: `@eslint/js`, `@types/node`, `@types/react`, `@types/react-dom`, `@vercel/node`, `@vitejs/plugin-react`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `typescript`, `typescript-eslint`, `vite`, `vitest`.

Os ranges declarados podem diferir das versões instaladas; por exemplo, React está declarado como `^19.2.0`. JSZip está instalado, mas não é utilizado pelo importador atual.

### Comandos e configuração

| Script | Comando |
|---|---|
| dev | vite |
| build | tsc -b && vite build |
| lint | eslint . |
| test | vitest run |
| preview | vite preview |

`vite.config.ts` configura React, Tailwind, alias `@` para `src` e testes em `tests/**/*.test.ts`. Não há proxy nem runtime serverless local configurado. Tailwind é configurado via CSS v4; não existe o `tailwind.config.ts` descrito na referência histórica do design system.

`tsconfig.app.json` inclui `src`; `tsconfig.node.json` inclui somente `vite.config.ts`. **O build não verifica os tipos das rotas API nem dos scripts de setup**. `tsconfig.json` é um projeto de referências com `files: []`; por isso `tsc --noEmit` sozinho não substitui `tsc -b`.

`.trunk/trunk.yaml` declara ESLint 8.10.0, enquanto o projeto usa ESLint 9 e flat config. A configuração Trunk também declara ferramentas de segurança e formatação, mas elas não foram executadas nem instaladas nesta auditoria. Essa divergência requer alinhamento antes de considerar Trunk o gate oficial.

### Estrutura e fluxo

- `src/routes`: páginas da SPA.
- `src/editor`: layouts, canvas, painéis, edição inline, histórico e seleção.
- `src/blocks`: tipos, registro e implementações dos 25 blocos.
- `src/store`: quatro stores Zustand.
- `src/lib`: templates, tema, exportação, geração, Appwrite, importador e schema.
- `api`: funções Vercel de geração, publicação e imagens.
- `scripts`: teste isolado do schema e provisionamento Appwrite.
- `tests`: testes do exportador e helpers de segurança de deploy.
- `docs`: design system, especificações de editor e arquitetura multitecnologia, licenças.
- `public`: identidade visual, vídeo de login, poster e assets Agency.
- `scratch/sb-agency`: referência externa com fontes Pug/SCSS/JS e scripts próprios; não é o runtime da SPA.

Fluxo principal: autenticação → Dashboard em `/` → criar projeto local/selecionar template → definir config e projeto ativo → `/editor` escolhe um dos layouts → blocos React renderizam o JSON → alterações atualizam Zustand/localStorage. Somente Studio Bolt executa a orquestração de geração e sincronização com o catálogo local de projetos.

### Rotas frontend

| Rota | Comportamento no código |
|---|---|
| /login | Login público por email e palavra-passe |
| / | Dashboard autenticado |
| /new | Redireciona para / |
| /editor | Studio Bolt ou Bolt Tink IA |
| /components | Biblioteca de componentes |
| /deploy | Exportação e caminho antigo de publicação |
| /settings | Definições e abas administrativas por label |
| * | NotFound dentro da área autenticada |

**Não existe rota `/dashboard`**: o Dashboard é a rota raiz. Uma resposta HTTP 200 do Vite para `/dashboard` é apenas o fallback da SPA.

### Backend e integrações

| Endpoint | Comportamento observado estaticamente | Limitações |
|---|---|---|
| POST /api/generate | Gemini via chave server-side; geração, refinamento e sugestões | Sem verificação de sessão; limites incompletos de input; resposta sem schema |
| GET /api/pexels | Proxy de pesquisa de imagens | Sem autenticação, rate limit ou timeout explícito; parâmetros sem limites rígidos |
| POST /api/deploy | Envia index.html à Vercel com target production | Chave compartilhada; sem ownership por conta; contrato de cabeçalho divergente |

Appwrite Web é usado para conta/sessão. O cliente Databases é exportado, mas não há CRUD remoto de projetos/revisões conectado ao fluxo. Google Fonts e assets externos aparecem nos temas/blocos. Analytics Google/PostHog são gerados opcionalmente no HTML exportado; não são prova de integração operacional.

## 3. Mapa de ficheiros importantes

| Ficheiro | Responsabilidade e observação |
|---|---|
| AGENTS.md | Regras obrigatórias de segurança, design, dados e verificação |
| README.md | Orientação geral; contém alegações que excedem a implementação |
| src/App.tsx | Rotas e PrivateRoute |
| src/layout/AppLayout.tsx | Shell, TopNav fora do editor, toaster e modais |
| src/routes/Dashboard.tsx | Prompt, templates, projetos, filtros e pesquisa local |
| src/routes/Editor.tsx | Seleção entre os dois layouts |
| src/editor/EditorLayout.tsx | Recuperação, auto-save local e geração |
| src/editor/BoltTinkAiLayout.tsx | Layout alternativo, divisor persistido e UI parcial de IA |
| src/editor/EditorTopBar.tsx | Barra unificada, viewport, histórico, preview e ações informativas |
| src/editor/Canvas.tsx | DnD de secções e viewport do canvas |
| src/blocks/BlockWrapper.tsx | Seleção, secções, fundos e preview; hook condicional |
| src/blocks/registry.tsx | 25 renderizadores e erro por bloco |
| src/editor/InlineText.tsx | Contenteditable com texto puro e confirmação/cancelamento |
| src/editor/SortableCard.tsx | Alças de reordenação de cartões |
| src/editor/FreeLayoutContainer.tsx | Posições e resize por breakpoint |
| src/editor/LeftSidebar.tsx | IA, navegador, elementos e design |
| src/editor/RightSidebar.tsx | Inspetor; oculto abaixo de xl |
| src/editor/JsonDrawer.tsx | JSON editável com validação superficial |
| src/store/configStore.ts | Documento, páginas, mutações e Undo/Redo |
| src/store/projectsStore.ts | Catálogo local, settings e metadados de publicação |
| src/store/editorStore.ts | Seleção, modo, geração, viewport e projeto ativo em memória |
| src/store/authStore.ts | Sessão; logout não limpa dados dos projetos |
| src/lib/schemas/blue-bolt-template.ts | Contrato Zod e helpers ZIP isolados do pipeline |
| src/lib/zip-template-importer.ts | Leitura manual de cabeçalhos ZIP e Agency fixo |
| src/lib/export-html.ts | Exportador independente do registry, com cobertura menor |
| src/lib/generate-site.ts | Geração direta com chave local, servidor e fallback |
| src/lib/publish-site.ts | Cliente de publicação com cabeçalho incompatível |
| src/routes/Settings.tsx | Definições, RBAC visual e módulos administrativos parciais |
| scripts/setup-appwrite.ts | Plano/apply de tabelas, colunas e índices |
| scripts/blue-bolt-schema.test.ts | 22 testes isolados do contrato |
| vercel.json | Rewrites e duração das funções |
| docs/BLUE_BOLT_MULTI_TECH_ARCHITECTURE.md | Plano de adaptadores, sanitização e sandbox; não equivale a entrega |
| walkthrough.md | Alegações de verificação anterior com imagens fora do repositório |

## 4. Funcionalidades existentes e estado real

Legenda: “Funcional e validado” limita-se ao âmbito do teste explicitamente indicado. Nenhum fluxo visual foi validado nesta sessão.

### Studio e Editor

| Recurso | Classificação | Evidência e limite |
|---|---|---|
| Studio Bolt | Implementado, mas não validado | Layout, canvas e painéis conectados; browser indisponível |
| Bolt Tink IA | Parcial | Compositor sem handlers; inspetor só mostra tipo/variante/layout; sem orquestração compartilhada |
| Troca/persistência de modo | Implementado, mas não validado | bb-studio-model, valores permitidos e tratamento de storage indisponível |
| Divisor Tink | Implementado, mas não validado | Pointer capture e bb-tink-panel-width; mínimo 280 e máximo 600 |
| Canvas | Implementado, mas não validado | RenderBlock, seleção, tema, viewport e empty state no Studio |
| Barra superior | Parcial | Unificada em ambos os modos; Guardar/Publicar são toasts; exportação existe |
| Painel IA Studio | Parcial | Refinamento aplica props; proposta de estrutura só emite confirmação, não aplica os blocos retornados |
| Painel IA Tink | Planeado/documentado, mas ausente | Botões Enviar, Editar e Gerar página não têm onClick |
| Navegador/Inspetor Studio | Implementado, mas não validado | Lista, ordenação, seleção e propriedades; inspetor escondido abaixo de xl |
| Navegador/Inspetor Tink | Parcial | Lista seleciona; propriedades são informativas |
| Seleção de blocos/elementos | Implementado, mas não validado | selectedBlockId e selectedElementId; integração varia por bloco/layout |
| Edição inline | Com problema ou risco identificado | Texto puro é positivo; atalhos globais ignoram inputs, mas não contenteditable |
| DnD de secções | Parcial | Studio possui DndContext/SortableContext; Tink renderiza wrappers simples |
| DnD de cartões | Implementado, mas não validado | Features, Gallery, FAQ, Pricing, Stats e Testimonials usam SortableCard |
| Layout livre | Parcial | Encontrado no Hero; não é universal nem refletido pelo exportador |
| Desktop/Tablet/Mobile | Parcial | Canvas usa limites 1200/768/375; overrides por bloco; Tink confunde viewport do site com largura do painel |
| Undo/Redo | Com problema ou risco identificado | 50 snapshots; activePageId não é restaurado; renamePage não gera snapshot |
| Pré-visualização interna | Com problema ou risco identificado | Hook após retorno de preview em BlockWrapper; Tink não oculta o painel nem usa o mesmo wrapper |
| Pré-visualização HTML | Com problema ou risco identificado | window.open com noopener seguido de document.write; precisa de validação real |
| Guardar | Parcial | Toast informa preparação; existem gravações automáticas locais, não gravação remota |
| Publicar | Com problema ou risco identificado | Barra nova não publica; rota antiga tem contrato de chave quebrado |

Ao entrar no Tink com uma geração pendente iniciada no Dashboard, o layout não chama `useGenerationOrchestration`. A consequência prevista é overlay sem conclusão nesse modo. Também não chama `useAutoSaveToProject`: a config continua persistida pelo seu store, mas não é sincronizada com o catálogo como no Studio Bolt. São conclusões de rastreio de código, não reprodução visual.

`AgentPanel.tsx` contém um assistente baseado em regras e temporizador, mas não é o painel renderizado pelos layouts atuais. Componentes antigos como `CanvasToolbar` e o wizard merecem revisão de referências antes de serem confundidos com o fluxo ativo.

### Dashboard e templates

| Recurso | Classificação | Evidência e limite |
|---|---|---|
| Dashboard | Implementado, mas não validado | Rota /, projetos locais e catálogo |
| Prompt de criação IA | Parcial | Studio orquestra; servidor pode cair em template; Tink não executa geração |
| Templates predefinidos | Implementado, mas não validado | builders em templates/page-templates/agency-template |
| Gestão de templates | Parcial | Ações de versões, miniaturas e estado dão feedback temporário; sem catálogo remoto |
| Projetos, pesquisa e filtros | Implementado, mas não validado | Filtros locais por nome/status; sem consulta à base |
| JSON canónico v1 | Parcial | Schema real e testado; store continua SiteConfig legado e exportação JSON é raw config |
| Validações Zod isoladas | Funcional e validado | 22 testes passaram; não prova aplicação do contrato no produto |
| Importação JSON no drawer | Com problema ou risco identificado | Só verifica name e arrays antes de setConfig |
| Importação Elementor | Parcial | JSON.parse apenas confirma sintaxe; nenhum adaptador de widgets |
| Importação HTML/Bootstrap | Planeado/documentado, mas ausente | Não existe conversão do conteúdo enviado |
| Importação ZIP | Com problema ou risco identificado | Qualquer lista não vazia pode virar Agency; sanitizedHtmlCount é fixado sem sanitização |
| Importação React/TSX | Planeado/documentado, mas ausente | Sem parser AST ou pipeline; TS/TSX são bloqueados no ZIP |
| ZIP traversal e extensões | Parcial | Há checagens de nomes/extensões, mas não validam integralmente o arquivo |
| Anti-zip-bomb | Parcial | Helpers testados; importador não os chama nem valida diretório central completo |
| Exportação HTML | Com problema ou risco identificado | 13 tipos, só config.blocks, dependências remotas e riscos de input |
| Metadados SEO do exportador | Funcional e validado | Testes restritos a metadados, snippets e ausência de opcionais |

O importador não extrai os conteúdos; não foi demonstrada execução de scripts de ZIP. O risco comprovado é a falsa indicação de conversão/sanitização e validação incompleta. Ao implementar extração real, os controles anti-bomb devem entrar antes da descompressão.

### Backend, dados e estados

| Recurso | Classificação | Evidência e limite |
|---|---|---|
| Login email/palavra-passe | Implementado, mas não validado | SDK Appwrite, loading/error; sessão real não exercitada |
| OAuth Google/GitHub | Planeado/documentado, mas ausente | README anuncia; fluxo não encontrado no Login atual |
| PrivateRoute e abas admin | Implementado, mas não validado | Gating no cliente por user/labels; não equivale a autorização de API |
| Autorização das APIs por sessão | Planeado/documentado, mas ausente | Generate/Pexels não verificam sessão; deploy usa chave compartilhada |
| Persistência de projetos | Com problema ou risco identificado | localStorage global por origem; sem isolamento por conta |
| Revisões imutáveis remotas | Planeado/documentado, mas ausente | Tabelas documentadas; sem API integrada |
| Setup Appwrite | Implementado, mas não validado | dry-run por padrão e confirmação para apply; não executado |
| Loading/empty/error | Parcial | Login, canvas, geração e importador possuem estados; diversas ações dão sucesso sem realizar a operação |
| Contactos/newsletter | Parcial | UI/validação local; nenhum endpoint de submissão correspondente identificado |

## 5. Entregas recentes e pendências

Histórico local dos 10 commits pedidos, sem consultar o remoto:

| Commit | Data | Entrega descrita |
|---|---|---|
| 3f32014 | 2026-09-10 | Responsividade EditorTopBar em 1536px |
| 468279e | 2026-09-10 | Remoção de overflow-hidden e informação do utilizador |
| 2389da7 | 2026-09-10 | Barra unificada substitui TopNav/CanvasToolbar no editor |
| 73bdce0 | 2026-09-10 | Canonical/og:url para blue-ia-eta.vercel.app |
| cbe1146 | 2026-09-09 | Tink, divisor e modo persistido |
| 0da2c80 | 2026-09-09 | Ajuste anterior de canonical e testes de schema |
| f0647a4 | 2026-09-09 | Schema canónico Zod |
| f63bb1b | 2026-09-08 | Atualização ampla do Studio |
| d432765 | 2026-09-04 | SDK Appwrite e ping |
| ed4427e | 2026-09-04 | Configuração Appwrite e verificação automática |

O código confirma as estruturas novas, mas não a responsividade em browser nesta auditoria. “Production confirmado” na mensagem de commit é uma alegação histórica, não uma inspeção atual da Vercel.

Permanecem incompletos: integração do contrato nas entradas, conversão de templates, persistência remota, autorização por sessão, publicação consistente, paridade Tink/Studio e paridade editor/exportador. A documentação mistura fases futuras, checkmarks e implementações antigas; `walkthrough.md` aponta para imagens locais de outro agente, que não foram usadas como evidência desta auditoria.

## 6. Resultados das validações

### Comandos, códigos de saída e resultados

| Comando/tentativa | Exit code | Resultado |
|---|---:|---|
| git status --short inicial | 0 | Sem saída: árvore inicialmente limpa |
| git log --oneline -10 | 0 | Histórico registrado na secção 5 |
| git branch --show-current | 0 | main |
| npx --no-install tsc --noEmit | 1 | PowerShell bloqueou npx.ps1 |
| npm run build | 1 | PowerShell bloqueou npm.ps1 |
| npm run lint | 1 | PowerShell bloqueou npm.ps1 |
| npm test | 1 | PowerShell bloqueou npm.ps1 |
| npx.cmd --no-install tsc --noEmit | 0 | Sem saída; limite do projeto de referências explicado acima |
| npm.cmd run build no sandbox | 1 | esbuild: acesso negado a ../../..; não resolveu vite.config.ts |
| npm.cmd run build fora do sandbox, autorizado | 0 | tsc -b e Vite passaram |
| npm.cmd run lint | 1 | 87 problems: 86 errors, 1 warning |
| npm.cmd test no sandbox | 1 | Mesma falha de acesso do esbuild ao carregar config |
| npm.cmd test fora do sandbox, autorizado | 0 | 2 ficheiros, 8 testes passaram |
| npx.cmd --no-install tsx scripts/blue-bolt-schema.test.ts no sandbox | 1 | uv_os_get_passwd retornou ENOMEM |
| Mesmo teste de schema fora do sandbox, autorizado | 0 | 22 passed, 0 failed |
| git diff --check | 0 | Sem erros de whitespace; numa execução posterior houve aviso LF/CRLF no lockfile |
| npm.cmd ls --depth=0 | 0 | Dependências diretas presentes |
| npm.cmd run dev -- --host 127.0.0.1 no sandbox | 1 | Falha de acesso do esbuild |
| Mesmo dev fora do sandbox, autorizado | Em execução durante a sonda | Vite pronto em 596 ms, porta 5173 |
| Sonda em memória tsx -e do exportador/schema | 1 | Cannot find module '@/lib/theme-presets' |
| Repetição com --tsconfig tsconfig.app.json | 0 | Sem saída observável; **inconclusiva**, não usada como validação |

O modificador `--no-install` foi usado para impedir download de ferramentas. A política de execução do PowerShell não foi alterada; usaram-se os executáveis `.cmd`. O teste de schema existe localmente, embora `tsx` não conste como dependência direta; a reprodução deve ser formalizada futuramente.

Erros de ambiente relevantes, preservados:
- `PSSecurityException / UnauthorizedAccess`: execução de scripts desabilitada para npm.ps1/npx.ps1.
- `Cannot read directory "../../..": Acesso negado.`
- `Could not resolve ".../vite.config.ts"`
- `SystemError [ERR_SYSTEM_ERROR]: uv_os_get_passwd returned ENOMEM (not enough memory)`

Build: 1835 módulos, 13,43 s na fase Vite; HTML 2,41 kB; CSS 107,13 kB (gzip 16,16 kB); JS 843,34 kB (gzip 234,56 kB). Aviso: chunk maior que 500 kB.

Os testes de segurança de deploy cobrem sanitização do slug, mensagens e origem/referer. **Não cobrem** o header do cliente contra o handler, ownership, sessão nem publicação real. Os 3 testes de exportação não exercitam cobertura de tipos, páginas, layout livre, URLs perigosas ou fidelidade visual.

### Browser, HTTP, API e base de dados: distinção obrigatória

- **Browser:** bloqueado. A CLI agent-browser não foi encontrada no PATH; não foi instalada. A ferramenta alternativa respondeu literalmente `No browser is available`. Dashboard, Editor, responsividade e console **não verificados visualmente**.
- **HTTP local:** GET em `/`, `/login`, `/editor` e `/dashboard` retornou 200 text/html. Demonstra servidor/fallback, não a renderização React ou o login.
- **API local:** GET em `/api/generate` retornou 200 com conteúdo JavaScript no Vite, não uma resposta do handler serverless. Não foram enviados POSTs a Gemini ou Vercel.
- **API externa:** não validada operacionalmente. Nenhuma geração paga, autenticação real ou publicação.
- **Base de dados:** não consultada nem modificada. Existência das tabelas, permissões, índices e integridade remota não confirmadas.
- **Build/tipos:** verificação efetiva de src e vite.config.ts; não de todo o backend.
- **Arquivos gerados:** o build autorizado produziu dist e caches de ferramentas ignorados pelo Git. A única entrega autoral é este relatório.

### Lint: interpretação

Há problemas reais de hooks e grande volume de `any`. Os avisos de pureza em callbacks devem ser avaliados individualmente; o diagnóstico do linter não comprova que todo Date.now execute durante render. O problema de ordem de hooks em BlockWrapper é visível no código: retorno em preview antes do hook da linha 177.

O anexo ao final preserva a saída do lint com espaços repetidos reduzidos, sem alterar os textos dos diagnósticos.

## 7. Problemas e riscos por prioridade

### Crítico

Nenhum comprometimento crítico foi comprovado nesta auditoria. Não houve exploração, acesso a sessões, auditoria completa do histórico de segredos ou verificação da exposição das APIs em produção. A ausência de comprovação não equivale a certificação de segurança.

### Alto

**A1 — Fronteira de segurança inconsistente na geração e dados locais.** `generate-site.ts:20` lê `blueia-gemini-key` do localStorage e envia a chave diretamente a Gemini. A UI atual desabilita o input, mas o caminho legado continua ativo para chaves já armazenadas. `projectsStore.ts` também persiste `deployAccessKey` dentro de settings. As chaves de storage não incluem user ID; logout não limpa config/projetos. Outro utilizador autenticado na mesma origem/perfil pode recuperar o catálogo local anterior. Não foi inspecionado o storage real nem comprovada presença de chave.

**A2 — APIs de custo sem autenticação por sessão.** `api/generate.ts` e `api/pexels.ts` aceitam pedidos sem validar conta. Rate limit de geração é só Map por instância/IP, não quota por utilizador. Pexels não possui limitador. Impacto depende das funções e chaves estarem configuradas em produção.

**A3 — Entradas e exportação permitem conteúdo fora do contrato.** `JsonDrawer.tsx:54` aceita JSON superficial e chama setConfig; geração também faz validação parcial. `parseAndValidateTemplate` não é chamado nesses caminhos. `export-html.ts:33` escapa caracteres de HTML, mas preserva esquemas como javascript: em href. Fontes e cores são interpoladas em script/style sem validação estrutural na fronteira; JSON.stringify de analytics não neutraliza fechamento de tag script. Há vetor plausível de script no HTML exportado, não explorado em navegador.

**A4 — Pré-visualização pode violar ordem de hooks.** `BlockWrapper.tsx:69` retorna antes de `useEditorStore` na linha 177. O lint confirma rules-of-hooks. Alternar preview pode causar erro de hooks e atingir o ErrorBoundary global. O erro fica no wrapper, fora do boundary interno de RenderBlock.

**A5 — Exportação perde partes do site.** O registry contém 25 tipos e o dispatcher de exportação apenas 13. `divider`, `banner`, `content`, `image`, `video`, `gallery`, `services-grid`, `portfolio-grid`, `timeline`, `team-grid`, `logo-strip` e `contact-form` resultam em comentário “Unknown block type”. Funções de renderização adicionais no mesmo arquivo não estão todas ligadas ao dispatcher. Só config.blocks é exportado; pages, freeLayout e demais configurações não possuem equivalência completa.

**A6 — Publicação incompatível e incompleta.** `publish-site.ts:58` envia `x-blueia-deploy-key`; `api/deploy.ts` exige `x-openpage-deploy-key`. Mesmo com configuração válida, esse cliente não satisfaz a autenticação do handler. A barra nova apenas informa preparação; settings desabilita a chave. API publica em production, com slug derivado do nome sem namespace de proprietário. O cliente pode marcar published antes de readyState READY e prefere um alias inferido à URL efetiva.

**A7 — ZIP apresenta sucesso sem importar conteúdo.** `zip-template-importer.ts:171–196` aceita qualquer arquivo com entradas e constrói Agency. Declara HTML sanitizado sem ler HTML. Usa cabeçalhos locais, não valida corretamente todas as variantes de ZIP/diretório central/data descriptors. Helpers anti-bomb e path estendido ficam desconectados. Isso invalida a promessa funcional e de segurança exibida ao utilizador.

**A8 — Tink não preserva o fluxo funcional do Studio.** Falta auto-save no catálogo, geração e recuperação ativa; botões visíveis sem ação. Selecionar esse modo afeta trabalho, não só aparência.

### Médio

- **M1 — Modelo duplicado de páginas:** config.blocks e pages competem. setActivePage só muda ID; exportação e partes de IA continuam lendo blocks. Undo de addPage pode deixar activePageId apontando para página inexistente, enquanto o canvas mostra fallback e mutações procuram o ID antigo.
- **M2 — Atalhos durante edição:** useKeyboardShortcuts só exclui INPUT/TEXTAREA/SELECT; InlineText usa contenteditable e só interrompe Enter/Escape. Digitar 1–5, j, h ou p pode navegar/acionar ações do editor.
- **M3 — Drag e histórico:** FreeLayoutContainer grava posição em cada pointermove, cria snapshots completos e atualiza localStorage. Deslocamento usa clientX/clientY sem compensar zoom; comportamento precisa de teste em 50%/150%.
- **M4 — Responsividade desigual:** inspetor Studio oculto abaixo de xl; Tink define largura de painel pelo viewport do site, com width 100% em mobile e minWidth fixo. Canvas pequeno pode ficar sem espaço. Não medido no browser.
- **M5 — Proteção de runtime incompleta:** API não entra no tsc -b; schema test não entra em npm test; cobertura funcional pequena.
- **M6 — Setup promete mais que executa:** script diz que limites serão verificados antes de criar tabelas, mas applyPlan cria tabelas antes das colunas. Não há transação/rollback nem configuração demonstrada de ACL/row ownership. main().catch(console.error) pode não definir exit code de falha. Script não executado.
- **M7 — Design system parcialmente migrado:** tokens HSL/Inter existem, mas tokens legados como --color-bg-3 são usados fora do canvas onde não são definidos; cores fixas Agency e classes antigas persistem. Scrollbar-nativa/oculta são blocos vazios. A referência descreve outra base histórica com shadcn/next-themes.
- **M8 — Exportação “standalone” depende de rede:** Tailwind Play CDN, Google Fonts e analytics opcionais. Contradiz README e regra de scripts remotos. Tema exportado configura cores legadas enquanto markup usa tokens novos, exigindo teste de fidelidade.
- **M9 — Validação de URL por prefixo:** LinkUrlSchema aceita caminhos começados por /, incluindo URLs relativas a protocolo (//host); AssetUrlSchema aceita prefixos sem parse completo. Não equivale a política de destinos confiáveis.
- **M10 — Mensagens de sucesso enganosas:** confirmação de estrutura IA não aplica estrutura; JSON Elementor só valida sintaxe; ações administrativas simulam feedback. Há timeout de geração, mas refinamento não possui loading dedicado equivalente.
- **M11 — Erros externos:** generate devolve corpo bruto de erro upstream em details e não limita todos os campos; timer não é limpo nos retornos 400 dentro do try. Revisar sem assumir que segredos foram efetivamente divulgados.

### Baixo

- **B1:** package.json mantém nome, homepage e repositório OpenPage, divergentes de Blue Bolt.
- **B2:** README anuncia OAuth, segurança integral e exportação sem runtime sem evidência correspondente.
- **B3:** datas “Just now” não são timestamps reais; projects[0] representa ordem de criação, não necessariamente último editado.
- **B4:** strings em inglês/português misturadas; normalizeLanguage do exportador não reconhece português.
- **B5:** código legado e referência scratch aumentam custo de manutenção.
- **B6:** walkthrough usa caminhos locais não portáveis.

## 8. Dívida técnica e performance

O JS principal de 843,34 kB concentra páginas e blocos importados estaticamente. Não há evidência de divisão por rota. Isso é relevante inclusive para abrir o login. O vídeo de login tem 6.312.520 bytes e tenta áudio sem mute antes de lidar com o bloqueio de autoplay; tempo de carregamento real não foi medido.

O histórico clona páginas/blocos via JSON.parse/stringify e armazena até 50 snapshots. O store persiste o documento inteiro e o catálogo contém outra cópia. Arrastar livremente pode provocar múltiplas serializações e gravações síncronas por frame. O JsonDrawer calcula JSON e syntax highlighting mesmo fechado.

Há contratos duplicados: metadata de blocos, tipos, schema, componentes e exportador. A divergência 25/13 demonstra o custo dessa duplicação. O primeiro passo arquitetural deve ser uma fronteira única de validação e testes de contrato, não ampliar o catálogo.

A configuração Trunk deve ser conciliada com ESLint 9; executar ferramentas de autofix agora violaria o escopo. Não foi realizada auditoria online de CVEs, portanto não se conclui que dependências estão livres de vulnerabilidades.

## 9. Segurança e variáveis de ambiente

Nenhum valor de credencial é incluído neste relatório. Inventário por nome:

| Nome | Onde é necessário |
|---|---|
| VITE_APPWRITE_ENDPOINT | Cliente Web, src/lib/appwrite.ts |
| VITE_APPWRITE_PROJECT_ID | Cliente Web, identificação pública do projeto |
| GEMINI_API_KEY | api/generate.ts, segredo server-side |
| GEMINI_MODEL | api/generate.ts, seleção opcional de modelo |
| PEXELS_API_KEY | api/pexels.ts, segredo server-side |
| VERCEL_DEPLOY_TOKEN | api/deploy.ts, segredo de publicação |
| VERCEL_TEAM_ID | api/deploy.ts, equipe opcional |
| OPENPAGE_DEPLOY_KEY | api/deploy.ts, chave compartilhada atual |
| OPENPAGE_ALLOWED_ORIGINS | api/deploy.ts, allowlist |
| APPWRITE_ENDPOINT | scripts/setup-appwrite.ts |
| APPWRITE_PROJECT_ID | scripts/setup-appwrite.ts |
| APPWRITE_DATABASE_ID | scripts/setup-appwrite.ts |
| APPWRITE_API_KEY | scripts/setup-appwrite.ts, segredo privilegiado |
| APPWRITE_SETUP_ENV_FILE | Escolha explícita do arquivo de configuração do setup |
| CONFIRM_APPWRITE_SCHEMA | Trava explícita para --apply |

`.env.example` enumera apenas APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID e APPWRITE_API_KEY; não cobre todo o runtime.

Nomes encontrados em `.env.local`: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID, APPWRITE_API_KEY, PEXELS_API_KEY, OPENPAGE_DEPLOY_KEY, OPENPAGE_ALLOWED_ORIGINS, APPWRITE_ENDPOINT e APPWRITE_PROJECT_ID. Isso **não confirma** valores válidos, disponibilidade no processo nem configuração na Vercel. GEMINI_API_KEY e VERCEL_DEPLOY_TOKEN não constam nesse arquivo; podem existir em outro ambiente, não consultado.

`git ls-files '.env*'` mostrou apenas .env.example. .env.local é coberto por *.local; .gitignore não cobre genericamente todos os nomes .env. Uma busca limitada por padrões comuns de chaves privadas, tokens GitHub e chaves de API nos arquivos analisados não encontrou correspondências completas. Não foi uma varredura de todo o histórico Git nem do storage real, portanto não certifica ausência de vazamentos.

Pontos positivos: credencial Appwrite administrativa só é referenciada no script; chave Vercel fica no servidor; comparação de chave de deploy usa timingSafeEqual; há limite de HTML e checagem de origem; inline usa texto puro; schema rejeita prototype pollution em testes.

Limites: origem não substitui autenticação; PrivateRoute e labels no cliente não protegem APIs; dados persistidos não são isolados por conta; schema isolado não protege entradas que não o chamam. JsonDrawer usa dangerouslySetInnerHTML, mas escapa o JSON antes de gerar spans: não foi demonstrado XSS nesse trecho específico. O risco do exportador é diferente e está descrito em A3.

## 10. Git e deploy: confirmado versus suposição

- Inicialmente, git status --short não mostrou alterações.
- Branch main, HEAD 3f32014; referência local origin/main apontava para o mesmo commit.
- Não houve fetch: sincronização atual com o servidor remoto não está confirmada.
- Durante a auditoria apareceu `?? .trunk/`. Não foi criado/editado por esta auditoria e foi preservado como alteração externa.
- O relatório é a única alteração autoral. Código e configuração não foram corrigidos.
- Rewrites Vercel preservam /api e enviam demais caminhos à SPA. generate tem maxDuration 60 e deploy 30.
- README descreve deploy automático por push na main. Vínculo Git/Vercel, proteção da branch, variáveis e deploy ativo não foram consultados.
- Domínio citado pelo último commit de metadados: blue-ia-eta.vercel.app; não é prova de disponibilidade, ownership ou versão publicada hoje.
- Nenhuma publicação foi executada. Nenhum script Appwrite foi executado.
- O servidor Vite iniciado para a auditoria foi encerrado ao final (interrupção explícita; processo terminou com exit 1). A verificação final mostrou somente `.trunk/` e este relatório como não rastreados; `git diff --stat` permaneceu vazio e `git diff --check` terminou com exit 0.

## 11. Plano de continuidade recomendado

| Fase | Trabalho pequeno e delimitado | Critério de saída |
|---|---|---|
| 1 — Segurança das fronteiras | Retirar caminho de chave no cliente; autenticar geração/Pexels; definir quotas; validar entradas/saídas na fronteira; proteger exportação por contexto | Requisições anónimas negadas; nenhuma chave privilegiada no cliente; payloads inseguros rejeitados; testes de contrato |
| 2 — Estabilidade do editor | Corrigir hook de preview, contenteditable/atalhos, sincronização de páginas e activePageId no histórico | Browser com conta de teste: editar, trocar página, Undo/Redo, preview sem crash |
| 3 — Paridade dos modos | Compartilhar geração, recuperação e sincronização; definir ações reais ou indisponibilidade explícita no Tink | Mesmo projeto preservado após troca de modo, navegação e reload |
| 4 — Persistência por utilizador | Definir política de drafts/migração; API autenticada e ownership; plano revisável de tabelas/ACL | Testes de isolamento entre duas contas; aprovação separada antes de aplicar schema |
| 5 — Exportação e publicação | Cobrir registry e páginas; CSS local compilado; corrigir contrato de deploy, ownership e estado READY | Exportação fiel e sem scripts remotos; teste de preview autorizado antes de produção |
| 6 — Importadores reais | Conectar schema; ZIP central directory/limites; sanitização e assets; depois HTML/Bootstrap/Elementor | Conteúdo importado corresponde à origem; fixtures adversariais e avisos de perdas |
| 7 — Qualidade e manutenção | Unificar lint/Trunk, typecheck backend, incluir schema em test, dividir bundle e atualizar docs | Gates reproduzíveis e evidência visual anexada à próxima entrega |

Não ampliar React/TSX arbitrário ou sandbox JavaScript antes dessas fundações. Nenhuma biblioteca foi selecionada para instalação nesta etapa.

## 12. Primeira tarefa sugerida e decisões pendentes

**Primeira tarefa: fechar o caminho de geração que usa chave no navegador e estabelecer autenticação server-side para /api/generate, com contrato validado e erro explícito.**

Justificativa: o caminho atual contraria a regra obrigatória de segredos, expõe consumo de serviço sem identidade verificada e propaga JSON insuficientemente validado ao editor. É um recorte menor que a persistência completa e reduz risco antes de ampliar a IA/Tink. Os critérios devem cobrir pedido anónimo, sessão inválida, input inválido, timeout, resposta inválida e ausência de chave no cliente. A alteração de código só começa na próxima fase autorizada.

Decisões/confirmações necessárias antes das implementações correspondentes:
1. Disponibilizar um navegador conectado e uma sessão de teste para validar Studio/Dashboard e comparar conta comum/admin; não enviar palavras-passe no relatório.
2. Definir se drafts locais continuam permitidos e como migrar/limpar os dados por conta sem perda.
3. Confirmar projeto/ambiente Appwrite e Vercel de teste e política de autorização; o estado de produção não foi comprovado.
4. Aprovar separadamente qualquer migração de base e eventual publicação de produção. Esta auditoria não fornece essa autorização.

## Anexo — Saída do lint

Saída da execução `npm.cmd run lint`, exit 1. Espaçamento repetido reduzido para legibilidade; caminhos absolutos convertidos em relativos.

```text

scripts\setup-appwrite.ts
  1:28  error  'AppwriteException' is defined but never used  @typescript-eslint/no-unused-vars
  38:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  69:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  88:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  107:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  126:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  145:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  164:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  286:12  error  'e' is defined but never used  @typescript-eslint/no-unused-vars
  313:12  error  'error' is defined but never used  @typescript-eslint/no-unused-vars
  313:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\blocks\BlockWrapper.tsx
  93:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  93:62  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  95:60  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  95:81  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  105:39  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  109:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  115:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  121:39  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  129:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  134:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  177:29  error  React Hook "useEditorStore" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks

src\blocks\faq\FaqBlock.tsx
  95:18  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\faq\FaqBlock.tsx:95:18
  93 |  function handleAddItem() {
  94 |  const newItem: FaqItem = {
> 95 |  id: `faq-${Date.now()}`,
  |  ^^^^^^^^^^ Cannot call impure function
  96 |  question: 'Nova Pergunta Frequente',
  97 |  answer: 'Escreva aqui a resposta clara e objetiva para esclarecer as dúvidas dos seus clientes.',
  98 |  }  react-hooks/purity
  106:41  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\faq\FaqBlock.tsx:106:41
  104 |  function handleDuplicateItem(index: number) {
  105 |  const item = items[index]
> 106 |  const clone = { ...item, id: `faq-${Date.now()}`, question: `${item.question} (Cópia)` }
  |  ^^^^^^^^^^ Cannot call impure function
  107 |  const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
  108 |  updateBlockProps(block.id, { items: updated })
  109 |  }  react-hooks/purity

src\blocks\features\FeaturesBlock.tsx
  101:22  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\features\FeaturesBlock.tsx:101:22
  99 |  function handleAddItem() {
  100 |  const newItem: FeatureItem = {
> 101 |  id: `feature-${Date.now()}`,
  |  ^^^^^^^^^^ Cannot call impure function
  102 |  icon: 'Zap',
  103 |  title: 'Nova Funcionalidade',
  104 |  description: 'Descreva aqui o benefício e o valor entregue ao seu cliente.',  react-hooks/purity
  111:58  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\features\FeaturesBlock.tsx:111:58
  109 |  function handleDuplicateItem(index: number) {
  110 |  const item = items[index]
> 111 |  const clone: FeatureItem = { ...item, id: `feature-${Date.now()}`, title: `${item.title} (Cópia)` }
  |  ^^^^^^^^^^ Cannot call impure function
  112 |  const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
  113 |  updateBlockProps(blockId, { items: updated })
  114 |  }  react-hooks/purity

src\blocks\gallery\GalleryBlock.tsx
  87:18  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\gallery\GalleryBlock.tsx:87:18
  85 |  function handleAddImage() {
  86 |  const newImg: GalleryImage = {
> 87 |  id: `img-${Date.now()}`,
  |  ^^^^^^^^^^ Cannot call impure function
  88 |  alt: `Nova Imagem ${images.length + 1}`,
  89 |  caption: 'Nova Legenda',
  90 |  }  react-hooks/purity
  97:40  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\gallery\GalleryBlock.tsx:97:40
  95 |  function handleDuplicateImage(index: number) {
  96 |  const img = images[index]
>  97 |  const clone = { ...img, id: `img-${Date.now()}`, caption: `${img.caption || 'Imagem'} (Cópia)` }
  |  ^^^^^^^^^^ Cannot call impure function
  98 |  const updated = [...images.slice(0, index + 1), clone, ...images.slice(index + 1)]
  99 |  updateBlockProps(block.id, { images: updated })
  100 |  }  react-hooks/purity

src\blocks\gallery\PortfolioGridBlock.tsx
  86:9  error  Error: Cannot access variable before it is declared

`closeModal` is accessed before it is declared, which prevents the earlier access from updating when this value changes over time.

src\blocks\gallery\PortfolioGridBlock.tsx:86:9
  84 |  function handleKeyDown(e: KeyboardEvent) {
  85 |  if (e.key === 'Escape' && activeModal) {
> 86 |  closeModal()
  |  ^^^^^^^^^^ `closeModal` accessed before it is declared
  87 |  }
  88 |  }
  89 |  if (activeModal) {

src\blocks\gallery\PortfolioGridBlock.tsx:101:3
  99 |  }
  100 |
> 101 |  function closeModal() {
  |  ^^^^^^^^^^^^^^^^^^^^^^^
> 102 |  setActiveModal(null)
  | ^^^^^^^^^^^^^^^^^^^^^^^^
> 103 |  setTimeout(() => {
  | ^^^^^^^^^^^^^^^^^^^^^^^^
> 104 |  triggerRef.current?.focus()
  | ^^^^^^^^^^^^^^^^^^^^^^^^
> 105 |  }, 50)
  | ^^^^^^^^^^^^^^^^^^^^^^^^
> 106 |  }
  | ^^^^ `closeModal` is declared here
  107 |
  108 |  return (
  109 |  <section id="portfolio" className="py-24 px-6 sm:px-10 bg-[#f8f9fa] text-slate-900 font-sans">  react-hooks/immutability

src\blocks\pricing\PricingBlock.tsx
  101:19  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\pricing\PricingBlock.tsx:101:19
  99 |  function handleAddTier() {
  100 |  const newTier: PricingTier = {
> 101 |  id: `tier-${Date.now()}`,
  |  ^^^^^^^^^^ Cannot call impure function
  102 |  name: 'Novo Plano',
  103 |  price: '49€',
  104 |  period: '/mês',  react-hooks/purity
  115:55  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\pricing\PricingBlock.tsx:115:55
  113 |  function handleDuplicateTier(index: number) {
  114 |  const tier = tiers[index]
> 115 |  const clone: PricingTier = { ...tier, id: `tier-${Date.now()}`, name: `${tier.name} (Cópia)` }
  |  ^^^^^^^^^^ Cannot call impure function
  116 |  const updated = [...tiers.slice(0, index + 1), clone, ...tiers.slice(index + 1)]
  117 |  updateBlockProps(blockId, { tiers: updated, plans: updated })
  118 |  }  react-hooks/purity

src\blocks\stats\StatsBlock.tsx
  81:45  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\stats\StatsBlock.tsx:81:45
  79 |
  80 |  function handleAddItem() {
> 81 |  const newItem: StatItem = { id: `stat-${Date.now()}`, value: '100%', label: 'Nova Métrica' }
  |  ^^^^^^^^^^ Cannot call impure function
  82 |  const updated = [...items, newItem]
  83 |  updateBlockProps(block.id, { stats: updated, items: updated })
  84 |  }  react-hooks/purity
  88:42  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\stats\StatsBlock.tsx:88:42
  86 |  function handleDuplicateItem(index: number) {
  87 |  const item = items[index]
> 88 |  const clone = { ...item, id: `stat-${Date.now()}` }
  |  ^^^^^^^^^^ Cannot call impure function
  89 |  const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
  90 |  updateBlockProps(block.id, { stats: updated, items: updated })
  91 |  }  react-hooks/purity

src\blocks\testimonials\TestimonialsBlock.tsx
  113:19  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\testimonials\TestimonialsBlock.tsx:113:19
  111 |  function handleAddItem() {
  112 |  const newItem: Testimonial = {
> 113 |  id: `test-${Date.now()}`,
  |  ^^^^^^^^^^ Cannot call impure function
  114 |  author: 'Novo Cliente',
  115 |  role: 'Cargo / Empresa',
  116 |  quote: 'Insira aqui o depoimento ou feedback positivo sobre o seu produto ou serviço.',  react-hooks/purity
  125:42  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\blocks\testimonials\TestimonialsBlock.tsx:125:42
  123 |  function handleDuplicateItem(index: number) {
  124 |  const item = items[index]
> 125 |  const clone = { ...item, id: `test-${Date.now()}`, author: `${item.author} (Cópia)` }
  |  ^^^^^^^^^^ Cannot call impure function
  126 |  const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
  127 |  updateBlockProps(blockId, { testimonials: updated, items: updated })
  128 |  }  react-hooks/purity

src\components\creation\ProjectCreationWizard.tsx
  468:65  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  496:70  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\editor\FreeLayoutContainer.tsx
  179:11  error  'nextY' is never reassigned. Use 'const' instead  prefer-const

src\editor\InlineText.tsx
  164:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  172:52  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\editor\LeftSidebar.tsx
  45:34  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  149:53  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  149:94  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  199:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  556:20  error  Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

src\editor\LeftSidebar.tsx:556:20
  554 |  if (!meta) return
  555 |  const block: BlockConfig = {
> 556 |  id: `block-${Date.now()}`,
  |  ^^^^^^^^^^ Cannot call impure function
  557 |  type,
  558 |  variant: meta.variants[0],
  559 |  props: { ...meta.defaultProps },  react-hooks/purity

src\editor\RightSidebar.tsx
  140:64  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  158:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  167:36  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  223:77  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  223:105  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  231:76  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  231:104  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  272:75  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  280:74  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  321:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  329:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\editor\SectionDesignPopover.tsx
  178:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  179:55  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  226:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  235:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  262:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  270:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  299:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  307:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  370:78  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  399:64  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  399:92  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  425:75  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  450:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\lib\appwrite.ts
  14:23  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  15:14  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  15:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\lib\schemas\blue-bolt-template.ts
  689:72  error  Unnecessary escape character: \-  no-useless-escape
  836:6  error  Unexpected control character(s) in regular expression: \x00, \x1f  no-control-regex

src\lib\zip-template-importer.ts
  202:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\routes\Dashboard.tsx
  411:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\routes\Login.tsx
  59:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src\routes\Settings.tsx
  55:60  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  62:61  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  799:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  1532:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

src\routes\Settings.tsx:1532:7
  1530 |  useEffect(() => {
  1531 |  if (!isAdmin && adminOnlyTabs.includes(activeTab)) {
> 1532 |  setActiveTab('general')
  |  ^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  1533 |  }
  1534 |  }, [isAdmin, activeTab])
  1535 |  react-hooks/set-state-in-effect
  1534:6  warning  React Hook useEffect has a missing dependency: 'adminOnlyTabs'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

src\store\authStore.ts
  5:9  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  18:14  error  'e' is defined but never used  @typescript-eslint/no-unused-vars
  25:14  error  'e' is defined but never used  @typescript-eslint/no-unused-vars

src\store\editorStore.ts
  19:11  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  20:10  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 87 problems (86 errors, 1 warning)
  1 error and 0 warnings potentially fixable with the `--fix` option.


```
