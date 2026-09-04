import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, Sparkles, Trash2, FolderOpen, Copy, Pencil } from 'lucide-react'
import { useProjectsStore, type Project } from '@/store/projectsStore'
import { useConfigStore, defaultConfig } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { hexToRgb } from '@/lib/theme-presets'
import { SegmentSelect } from '@/components/SegmentSelect'

const suggestions = [
  {
    label: 'Landing page SaaS',
    prompt: 'Cria uma landing page SaaS para uma ferramenta de gestão de projetos chamada "FlowBoard". Inclui um hero com título apelativo sobre produtividade, grelha de funcionalidades com quadros de tarefas e analytics. Adiciona preços (Grátis, Pro $12/mês, Enterprise). Usa um tema escuro e moderno com detalhes a azul.',
  },
  {
    label: 'Site de Portfólio',
    prompt: 'Cria um site de portfólio para o designer freelance Alex Chen. Inclui secção hero com título forte, galeria com 4-6 casos de estudo, depoimentos de clientes e formulário de contacto. Usa uma estética minimalista e sofisticada com tons neutros.',
  },
  {
    label: 'Website de Restaurante',
    prompt: 'Cria um website para o restaurante italiano de luxo "Trattoria Luna". Inclui hero sobre cozinha autêntica, secção de funcionalidades focando na massa fresca e forno a lenha. Adiciona filosofia do chef, avaliações e call-to-action para reservas. Usa tons quentes e terrosos com pormenores dourados.',
  },
  {
    label: 'Startup de IA',
    prompt: 'Cria uma landing page para a startup de IA "NeuralFlow". Inclui hero forte sobre automatização, grelha de funcionalidades com extração inteligente e segurança enterprise. Adiciona estatísticas, tabela de comparação e testemunhos de CTOs. Usa um tema escuro elegante com detalhes em verde.',
  },
]

const filters = ['Todos', 'Publicado', 'Rascunho'] as const
type Filter = (typeof filters)[number]

const fallbackAccents = ['#22c55e', '#3b82f6', '#f472b6', '#8b5cf6', '#e8a838', '#06b6d4', '#10b981', '#ef4444']

function projectHash(name: string): number {
  return name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function projectAccent(project: Project): string {
  if (project.config?.theme?.accent) return project.config.theme.accent
  return fallbackAccents[projectHash(project.name) % fallbackAccents.length]
}

function PromptSection() {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function generate(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    // TODO: AI generation logic goes here. Disabled for now.
    toast('Criação com IA em desenvolvimento.')
  }

  const isFocused = prompt.length > 0

  return (
    <div className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/[0.07] rounded-full blur-[150px]" />
      </div>

      <div className="relative flex flex-col items-center pt-16 pb-6 px-6">
        <h1 className="text-[36px] font-sans font-bold tracking-tight mb-2 text-center animate-fade-in-up stagger-1">O que pretende criar hoje?</h1>
        <p className="text-muted-foreground text-[15px] mb-8 text-center animate-fade-in-up stagger-2">Descreva o seu site e a IA cria a estrutura, conteúdo e estilo.</p>

        {/* Prompt card - gradient border wrapper */}
        <div className={`w-full max-w-[680px] rounded-2xl p-px transition-all duration-300 animate-scale-in stagger-3 ${
          isFocused
            ? 'bg-gradient-to-b from-green/40 via-green/20 to-green/5 shadow-[0_0_80px_rgba(34,197,94,0.15)]'
            : 'bg-gradient-to-b from-border-hover via-border-default to-border-subtle shadow-[0_0_60px_rgba(34,197,94,0.06)] hover:from-green/25 hover:via-green/10 hover:to-green/5 hover:shadow-[0_0_80px_rgba(34,197,94,0.1)]'
        }`}>
          <div className="bg-background rounded-[15px] overflow-hidden">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  generate(prompt)
                }
              }}
              rows={3}
              placeholder="Uma landing page para uma aplicação de fitness..."
              className="w-full px-5 pt-5 pb-3 bg-transparent text-foreground text-[14px] placeholder:text-muted-foreground resize-none leading-relaxed"
            />

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <div className="flex items-center gap-1.5 animate-fade-in stagger-4">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { setPrompt(s.prompt); textareaRef.current?.focus() }}
                    className="px-2.5 py-1 rounded-full text-muted-foreground text-[11px] border border-border hover:text-foreground hover:bg-muted hover:border-border transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {prompt.trim() && (
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl'}+Enter
                  </span>
                )}
                <button
                  onClick={() => generate(prompt)}
                  disabled={true}
                  title="Em desenvolvimento. Geração de IA chegará em breve."
                  className="px-5 py-2.5 rounded-xl bg-primary/50 text-black/50 text-[13px] font-semibold transition-all cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  Criar com IA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const renameProject = useProjectsStore((s) => s.renameProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const duplicateProject = useProjectsStore((s) => s.duplicateProject)
  const setConfig = useConfigStore((s) => s.setConfig)
  const setActiveProject = useEditorStore((s) => s.setActiveProject)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [name, setName] = useState(project.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  useEffect(() => {
    return () => { if (confirmTimer.current) clearTimeout(confirmTimer.current) }
  }, [])

  function commitRename() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== project.name) {
      renameProject(project.id, trimmed)
    } else {
      setName(project.name)
    }
    setEditing(false)
  }

  function openProject() {
    setActiveProject(project.id)
    setConfig(project.config || defaultConfig)
    navigate('/editor')
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirming) {
      deleteProject(project.id)
    } else {
      setConfirming(true)
      confirmTimer.current = setTimeout(() => setConfirming(false), 2000)
    }
  }

  const accent = projectAccent(project)
  const rgb = hexToRgb(accent)
  const layout = projectHash(project.name) % 3

  return (
    <div
      onClick={openProject}
      className="group bg-background border border-border rounded-xl overflow-hidden cursor-pointer card-lift hover:border-border hover:card-lift-hover"
    >
      {/* Thumbnail */}
      <div className="h-32 bg-secondary relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
          style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }}
        />

        {/* Action buttons */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); duplicateProject(project.id); toast('Projeto duplicado') }}
            aria-label={`Duplicate ${project.name}`}
            className="p-1.5 rounded-md border bg-background/80 border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:border-primary/30 transition-all"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDelete}
            aria-label={confirming ? `Confirm delete ${project.name}` : `Delete ${project.name}`}
            className={`rounded-md border transition-all ${
              confirming
                ? 'px-2 py-1 bg-status-red/90 border-destructive text-white text-[10px] font-medium opacity-100'
                : 'p-1.5 bg-background/80 border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:border-destructive/30'
            }`}
          >
            {confirming ? 'Apagar?' : <Trash2 size={12} />}
          </button>
        </div>

        {/* Wireframe - varies by project name hash */}
        <div className="absolute inset-3 flex flex-col gap-1.5 p-2.5">
          {layout === 0 && (
            <>
              <div className="h-2 rounded-sm w-2/3" style={{ background: `rgba(${rgb}, 0.15)` }} />
              <div className="h-1.5 bg-muted/40 rounded-sm w-1/2" />
              <div className="flex gap-1.5 mt-auto">
                <div className="flex-1 h-6 rounded" style={{ background: `rgba(${rgb}, 0.07)` }} />
                <div className="flex-1 h-6 rounded" style={{ background: `rgba(${rgb}, 0.07)` }} />
                <div className="flex-1 h-6 rounded" style={{ background: `rgba(${rgb}, 0.07)` }} />
              </div>
            </>
          )}
          {layout === 1 && (
            <>
              <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-2 rounded-sm w-3/4" style={{ background: `rgba(${rgb}, 0.15)` }} />
                  <div className="h-1.5 bg-muted/40 rounded-sm w-full" />
                  <div className="h-1.5 bg-muted/40 rounded-sm w-2/3" />
                  <div className="h-4 rounded w-1/2 mt-auto" style={{ background: `rgba(${rgb}, 0.12)` }} />
                </div>
                <div className="w-16 rounded" style={{ background: `rgba(${rgb}, 0.06)` }} />
              </div>
            </>
          )}
          {layout === 2 && (
            <>
              <div className="flex justify-center mt-1">
                <div className="h-2 rounded-sm w-1/3" style={{ background: `rgba(${rgb}, 0.15)` }} />
              </div>
              <div className="flex justify-center">
                <div className="h-1.5 bg-muted/40 rounded-sm w-2/3" />
              </div>
              <div className="flex gap-1 mt-auto justify-center">
                <div className="w-12 h-4 rounded" style={{ background: `rgba(${rgb}, 0.12)` }} />
                <div className="w-12 h-4 rounded bg-muted/30" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setName(project.name); setEditing(false) }
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] font-semibold mb-1 bg-transparent border-b border-primary outline-none w-full"
          />
        ) : (
          <div
            className="text-[13px] font-semibold mb-1 transition-colors text-foreground flex items-center gap-1.5 group/name"
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
            title="Double-click to rename"
          >
            <span className="truncate">{project.name}</span>
            <Pencil size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover/name:opacity-60 transition-opacity shrink-0" />
          </div>
        )}
        <div className="text-[10.5px] text-muted-foreground flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                project.status === 'published' ? 'bg-primary' : 'bg-status-yellow'
              }`}
            />
            {project.status === 'published' ? 'Publicado' : 'Rascunho'}
          </span>
          <span className="text-muted-foreground">{project.updatedAt}</span>
        </div>
      </div>
    </div>
  )
}

function IdentificacaoProjeto() {
  const [nomeProjeto, setNomeProjeto] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [segmento, setSegmento] = useState('')
  const [ramo, setRamo] = useState('')

  return (
    <div className="w-full max-w-[680px] mx-auto mt-8 mb-4">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground tracking-tight">Identificação do Projeto e Cliente</h2>
        <p className="text-[13px] text-muted-foreground mb-6">Dados fundamentais de catálogo e organização interna</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium text-foreground">Nome do Projeto <span className="text-destructive">*</span></label>
              <input
                type="text"
                required
                value={nomeProjeto}
                onChange={(e) => setNomeProjeto(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Ex: Landing Page SaaS"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium text-foreground">Nome do Cliente / Empresa <span className="text-destructive">*</span></label>
              <input
                type="text"
                required
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Ex: Blue IA"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium text-foreground">Segmento do Negócio <span className="text-destructive">*</span></label>
              <SegmentSelect
                value={segmento}
                onChange={setSegmento}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium text-foreground">Ramo de Atividade / Nicho Específico <span className="text-destructive">*</span></label>
              <input
                type="text"
                required
                value={ramo}
                onChange={(e) => setRamo(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Ex: Software de Inteligência Artificial"
              />
            </div>
          </div>
          {/* No submit button yet, as it's just client side state validation */}
        </form>
      </div>
    </div>
  )
}

export function Dashboard() {
  const projects = useProjectsStore((s) => s.projects)
  const [filter, setFilter] = useState<Filter>('Todos')
  const [search, setSearch] = useState('')

  const filtered = projects.filter((p) => {
    if (filter === 'Publicado' && p.status !== 'published') return false
    if (filter === 'Rascunho' && p.status !== 'draft') return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="h-full overflow-y-auto pb-12">
      <PromptSection />

      <IdentificacaoProjeto />

      {/* Projects section */}
      {projects.length > 0 && (
        <>
          <div className="px-4 md:px-12 pt-4">
            <div className="border-t border-border" />
          </div>

          <div className="px-4 md:px-12 pt-5 flex flex-col sm:flex-row gap-2 items-start sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[13px] font-semibold text-muted-foreground animate-fade-in">
                Os seus projetos
                <span className="text-muted-foreground font-normal ml-1.5">({projects.length})</span>
              </h2>
              <div className="flex gap-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                      filter === f
                        ? 'text-foreground bg-muted border border-border'
                        : 'text-muted-foreground border border-transparent hover:text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 rounded-md border border-border bg-secondary text-foreground text-[12px] w-44 outline-none focus:border-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="px-4 md:px-12 pt-4 pb-12 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
              {filtered.map((p, i) => (
                <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 md:px-12 pt-8 pb-12 flex flex-col items-center text-center">
              <FolderOpen size={28} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-[13px]">Nenhum projeto encontrado</p>
              <button
                onClick={() => { setFilter('Todos'); setSearch('') }}
                className="mt-2 text-primary text-[12px] hover:text-primary-dim transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
