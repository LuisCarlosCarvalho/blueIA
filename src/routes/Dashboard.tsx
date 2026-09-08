import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  ArrowUp,
  FolderOpen,
  Copy,
  Trash2,
  Pencil,
  Sparkles,
} from 'lucide-react'
import { useProjectsStore, type Project } from '@/store/projectsStore'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { hexToRgb } from '@/lib/theme-presets'
import { dashboardTemplates, type DashboardTemplateItem } from '@/lib/templates'

const filters = ['Todos', 'Publicado', 'Rascunho'] as const
type Filter = (typeof filters)[number]

const fallbackAccents = [
  '#22c55e',
  '#3b82f6',
  '#f472b6',
  '#8b5cf6',
  '#e8a838',
  '#06b6d4',
  '#10b981',
  '#ef4444',
]

function projectHash(name: string): number {
  return name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function projectAccent(project: Project): string {
  if (project.config?.theme?.accent) return project.config.theme.accent
  return fallbackAccents[projectHash(project.name) % fallbackAccents.length]
}

/* -------------------------------------------------------------------------- */
/* 1. Prompt Principal de IA                                                   */
/* -------------------------------------------------------------------------- */
function PromptSection() {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()
  const addProject = useProjectsStore((s) => s.addProject)
  const setActiveProject = useEditorStore((s) => s.setActiveProject)

  function handleCreateWithAi() {
    const trimmed = prompt.trim()
    if (!trimmed) {
      toast.error('Por favor, descreva o site que pretende criar.')
      textareaRef.current?.focus()
      return
    }

    // Criar projeto com a prompt inserida
    const projectName = trimmed.split(' ').slice(0, 3).join(' ') || 'Novo Projeto IA'
    const projectId = addProject(projectName.charAt(0).toUpperCase() + projectName.slice(1))
    setActiveProject(projectId)

    // Notificação honesta de geração
    toast.info('A preparar a estrutura do site com IA...')
    navigate('/editor')
  }

  return (
    <div className="flex flex-col items-center text-center pt-2 md:pt-4">
      <h1 className="text-[28px] sm:text-[34px] md:text-[38px] font-bold text-foreground tracking-tight mb-2 select-none">
        O que pretende criar hoje?
      </h1>
      <p className="text-[14px] sm:text-[15px] text-muted-foreground mb-7 sm:mb-8 max-w-[580px] leading-relaxed">
        Descreva o seu site e a IA cria a estrutura, conteúdo e estilo.
      </p>

      {/* Caixa de Prompt Ampla */}
      <div className="w-full max-w-[740px] relative group text-left">
        <div className="relative rounded-[22px] border border-border bg-card shadow-xs transition-all duration-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-[0_0_35px_rgba(59,130,246,0.12)]">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleCreateWithAi()
              }
            }}
            rows={4}
            placeholder="Peça para criar uma página... ex.: página de vendas para meu curso, com gatilhos de conversão"
            className="w-full p-5 pb-14 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-[14px] sm:text-[15px] leading-relaxed outline-none resize-none"
          />

          {/* Botões Internos Inferiores */}
          <div className="absolute left-4 bottom-3.5 flex items-center">
            <button
              type="button"
              onClick={() => {
                setPrompt('Cria uma landing page moderna para consultoria com secção de serviços, depoimentos e agendamento')
                textareaRef.current?.focus()
              }}
              className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              title="Adicionar sugestão de prompt"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="absolute right-4 bottom-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateWithAi}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                prompt.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground hover:text-foreground border border-border/60'
              }`}
              title="Criar com IA"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. Miniaturas Artísticas dos Templates                                     */
/* -------------------------------------------------------------------------- */
function TemplateMockupPreview({ style }: { style: DashboardTemplateItem['previewStyle'] }) {
  switch (style) {
    case 'writemate':
      return (
        <div className="w-full h-full bg-[#0a0d14] relative overflow-hidden flex flex-col items-center justify-center p-3 select-none">
          {/* Ambient Glow */}
          <div className="absolute top-0 w-32 h-20 bg-indigo-500/25 blur-xl rounded-full" />
          <div className="absolute bottom-0 w-32 h-16 bg-cyan-500/20 blur-xl rounded-full" />
          {/* Mini Nav */}
          <div className="w-full flex justify-between items-center opacity-60 mb-auto">
            <div className="w-10 h-1.5 bg-slate-400 rounded-xs" />
            <div className="flex gap-1">
              <div className="w-4 h-1 bg-slate-600 rounded-xs" />
              <div className="w-4 h-1 bg-slate-600 rounded-xs" />
            </div>
          </div>
          {/* Centered Headline Wireframe */}
          <div className="w-3/4 h-2.5 bg-gradient-to-r from-indigo-200 to-cyan-100 rounded-xs mb-1.5 shadow-sm" />
          <div className="w-1/2 h-1.5 bg-slate-500/80 rounded-xs mb-3" />
          {/* Mini CTA Pill */}
          <div className="w-14 h-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xs">
            <div className="w-6 h-1 bg-white rounded-xs" />
          </div>
        </div>
      )

    case 'fincash':
      return (
        <div className="w-full h-full bg-[#080d0a] relative overflow-hidden flex items-center justify-center p-3 select-none">
          {/* Ambient Glow */}
          <div className="absolute right-2 top-2 w-28 h-28 bg-emerald-500/20 blur-xl rounded-full" />
          {/* Phone Wireframe */}
          <div className="w-20 h-28 rounded-xl border border-emerald-500/30 bg-[#0f1712] p-1.5 shadow-lg flex flex-col justify-between">
            <div className="w-full flex justify-between items-center">
              <div className="w-3 h-1 bg-emerald-400 rounded-xs" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
            </div>
            <div className="space-y-1 my-auto">
              <div className="w-10 h-2 bg-white rounded-xs" />
              <div className="w-14 h-1.5 bg-emerald-400/70 rounded-xs" />
            </div>
            <div className="w-full h-4 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center px-1">
              <div className="w-6 h-1 bg-emerald-300 rounded-xs" />
            </div>
          </div>
        </div>
      )

    case 'nexstudio':
      return (
        <div className="w-full h-full bg-[#f8fafc] dark:bg-[#0c0e12] relative overflow-hidden flex flex-col justify-between p-3 select-none">
          {/* Ambient Metallic Glow */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400/20 via-transparent to-transparent" />
          <div className="w-full flex justify-between items-center">
            <div className="w-12 h-2 bg-foreground/80 rounded-xs font-bold" />
            <div className="w-4 h-4 rounded-full border border-foreground/20" />
          </div>
          {/* 3D Sphere Graphic wireframe */}
          <div className="my-auto self-center relative w-16 h-16 rounded-full bg-gradient-to-tr from-slate-800 via-slate-500 to-slate-200 shadow-md flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-white/30 backdrop-blur-xs" />
          </div>
          <div className="w-2/3 h-1.5 bg-foreground/50 rounded-xs" />
        </div>
      )

    case 'genesis':
      return (
        <div className="w-full h-full bg-[#090514] relative overflow-hidden flex items-center justify-center p-3 select-none">
          {/* Dual Orb Lighting */}
          <div className="absolute left-2 top-3 w-20 h-20 bg-fuchsia-600/35 blur-xl rounded-full" />
          <div className="absolute right-2 bottom-3 w-20 h-20 bg-indigo-600/35 blur-xl rounded-full" />
          {/* Centered Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-1.5">
            <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[7px] text-violet-200">
              SERVERLESS CLOUD
            </div>
            <div className="w-24 h-2.5 bg-white rounded-xs" />
            <div className="w-16 h-1 bg-violet-300/60 rounded-xs" />
            <div className="flex gap-1 pt-1">
              <div className="w-7 h-4 rounded-sm bg-white/10 border border-white/10" />
              <div className="w-7 h-4 rounded-sm bg-white/10 border border-white/10" />
            </div>
          </div>
        </div>
      )

    case 'techself':
      return (
        <div className="w-full h-full bg-[#fdfdfd] dark:bg-[#12151b] relative overflow-hidden flex flex-col justify-between p-3 select-none border-b border-border/40">
          <div className="w-full flex justify-between items-center">
            <div className="w-8 h-2 bg-primary rounded-xs" />
            <div className="w-3 h-3 rounded-full bg-secondary" />
          </div>
          {/* Product grid mockup */}
          <div className="grid grid-cols-3 gap-1.5 my-auto">
            <div className="h-12 rounded-lg bg-secondary/80 border border-border/60 flex flex-col justify-end p-1">
              <div className="w-full h-1 bg-foreground/40 rounded-xs" />
            </div>
            <div className="h-12 rounded-lg bg-primary/10 border border-primary/20 flex flex-col justify-end p-1">
              <div className="w-full h-1 bg-primary rounded-xs" />
            </div>
            <div className="h-12 rounded-lg bg-secondary/80 border border-border/60 flex flex-col justify-end p-1">
              <div className="w-full h-1 bg-foreground/40 rounded-xs" />
            </div>
          </div>
          <div className="w-16 h-1.5 bg-foreground/60 rounded-xs" />
        </div>
      )

    case 'pixels':
      return (
        <div className="w-full h-full bg-[#0d0a11] relative overflow-hidden flex flex-col justify-between p-3 select-none">
          {/* Pink Aura */}
          <div className="absolute top-1 right-3 w-24 h-16 bg-rose-500/25 blur-lg rounded-full" />
          <div className="w-full flex justify-between items-center">
            <div className="w-10 h-1.5 bg-rose-300 rounded-xs" />
            <div className="w-2 h-2 bg-rose-500 rounded-full" />
          </div>
          {/* Editorial Frame */}
          <div className="my-auto self-center w-28 h-14 rounded-md border border-rose-500/40 bg-[#171220] p-1.5 flex gap-1.5 shadow-sm">
            <div className="w-10 h-full rounded-sm bg-rose-500/20" />
            <div className="flex-1 flex flex-col justify-center gap-1">
              <div className="w-full h-1.5 bg-white/80 rounded-xs" />
              <div className="w-3/4 h-1 bg-rose-200/50 rounded-xs" />
            </div>
          </div>
          <div className="w-12 h-1 bg-rose-400/60 rounded-xs" />
        </div>
      )

    case 'agentix':
      return (
        <div className="w-full h-full bg-[#070a14] relative overflow-hidden flex items-center justify-center p-3 select-none">
          {/* Indigo Arch Portal */}
          <div className="absolute top-0 w-36 h-28 rounded-full border border-blue-500/30 bg-gradient-to-b from-blue-600/20 to-transparent" />
          <div className="relative z-10 flex flex-col items-center space-y-2 text-center">
            <div className="w-20 h-2 bg-blue-100 rounded-xs" />
            <div className="flex gap-1.5">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                <Sparkles size={10} className="text-blue-300" />
              </div>
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-400/40" />
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-400/40" />
            </div>
          </div>
        </div>
      )

    case 'mapple':
      return (
        <div className="w-full h-full bg-[#0a0f0d] relative overflow-hidden flex flex-col justify-between p-3 select-none">
          {/* Corporate Green Accent */}
          <div className="absolute bottom-0 left-0 w-32 h-16 bg-emerald-600/20 blur-xl rounded-full" />
          <div className="w-full flex justify-between items-center">
            <div className="w-12 h-1.5 bg-slate-300 rounded-xs" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500/30" />
          </div>
          {/* Dashboard Desk wireframe */}
          <div className="my-auto flex gap-1.5 items-end">
            <div className="flex-1 h-12 rounded-sm bg-white/5 border border-white/10 p-1 flex flex-col justify-between">
              <div className="w-6 h-1 bg-emerald-400 rounded-xs" />
              <div className="w-full h-3 bg-white/10 rounded-xs" />
            </div>
            <div className="w-10 h-16 rounded-sm bg-white/5 border border-white/10 p-1">
              <div className="w-full h-full bg-emerald-500/15 rounded-xs" />
            </div>
          </div>
          <div className="w-14 h-1 bg-slate-500 rounded-xs" />
        </div>
      )

    default:
      return (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-card border border-border" />
        </div>
      )
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Secção de Templates (Grelha 4x2)                                        */
/* -------------------------------------------------------------------------- */
function TemplatesSection() {
  const navigate = useNavigate()
  const addProject = useProjectsStore((s) => s.addProject)
  const updateProjectConfig = useProjectsStore((s) => s.updateProjectConfig)
  const setActiveProject = useEditorStore((s) => s.setActiveProject)
  const setConfig = useConfigStore((s) => s.setConfig)

  function handleSelectTemplate(template: DashboardTemplateItem) {
    const siteConfig = template.build(template.name)
    const projectId = addProject(template.name)
    setActiveProject(projectId)
    updateProjectConfig(projectId, siteConfig)
    setConfig(siteConfig)
    toast.success(`Template ${template.name} selecionado com sucesso!`)
    navigate('/editor')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
          Templates
        </h2>
      </div>

      {/* Grelha 4 colunas desktop / 2 tablet / 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {dashboardTemplates.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelectTemplate(item)}
            className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-pointer flex flex-col"
          >
            {/* Miniatura visual em mockup */}
            <div className="h-36 w-full relative overflow-hidden bg-secondary border-b border-border/50">
              <TemplateMockupPreview style={item.previewStyle} />
            </div>

            {/* Informações do Template */}
            <div className="p-3.5 space-y-0.5">
              <h3 className="text-[13.5px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {item.name}
              </h3>
              <p className="text-[11.5px] text-muted-foreground font-medium">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. Cartão de Projeto Individual                                            */
/* -------------------------------------------------------------------------- */
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
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
    }
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
    setConfig(project.config || ({} as any))
    navigate('/editor')
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirming) {
      deleteProject(project.id)
      toast.success('Projeto removido')
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
      className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col"
    >
      {/* Thumbnail */}
      <div className="h-32 bg-secondary relative overflow-hidden border-b border-border/50">
        <div
          className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
          style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }}
        />

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 z-10 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              duplicateProject(project.id)
              toast.success('Projeto duplicado')
            }}
            aria-label={`Duplicate ${project.name}`}
            className="p-1.5 rounded-lg border bg-background/90 border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:border-primary/30 transition-all shadow-xs"
            title="Duplicar projeto"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDelete}
            aria-label={confirming ? `Confirm delete ${project.name}` : `Delete ${project.name}`}
            className={`rounded-lg border transition-all shadow-xs ${
              confirming
                ? 'px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-medium opacity-100'
                : 'p-1.5 bg-background/90 border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:border-destructive/30'
            }`}
            title="Apagar projeto"
          >
            {confirming ? 'Apagar?' : <Trash2 size={12} />}
          </button>
        </div>

        {/* Wireframe */}
        <div className="absolute inset-3 flex flex-col gap-1.5 p-2.5">
          {layout === 0 && (
            <>
              <div className="h-2 rounded-xs w-2/3" style={{ background: `rgba(${rgb}, 0.2)` }} />
              <div className="h-1.5 bg-muted/40 rounded-xs w-1/2" />
              <div className="flex gap-1.5 mt-auto">
                <div className="flex-1 h-6 rounded-md" style={{ background: `rgba(${rgb}, 0.08)` }} />
                <div className="flex-1 h-6 rounded-md" style={{ background: `rgba(${rgb}, 0.08)` }} />
                <div className="flex-1 h-6 rounded-md" style={{ background: `rgba(${rgb}, 0.08)` }} />
              </div>
            </>
          )}
          {layout === 1 && (
            <>
              <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-2 rounded-xs w-3/4" style={{ background: `rgba(${rgb}, 0.2)` }} />
                  <div className="h-1.5 bg-muted/40 rounded-xs w-full" />
                  <div className="h-1.5 bg-muted/40 rounded-xs w-2/3" />
                  <div className="h-4 rounded-md w-1/2 mt-auto" style={{ background: `rgba(${rgb}, 0.15)` }} />
                </div>
                <div className="w-16 rounded-md" style={{ background: `rgba(${rgb}, 0.08)` }} />
              </div>
            </>
          )}
          {layout === 2 && (
            <>
              <div className="flex justify-center mt-1">
                <div className="h-2 rounded-xs w-1/3" style={{ background: `rgba(${rgb}, 0.2)` }} />
              </div>
              <div className="flex justify-center">
                <div className="h-1.5 bg-muted/40 rounded-xs w-2/3" />
              </div>
              <div className="flex gap-1.5 mt-auto justify-center">
                <div className="w-12 h-4 rounded-md" style={{ background: `rgba(${rgb}, 0.15)` }} />
                <div className="w-12 h-4 rounded-md bg-muted/30" />
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
              if (e.key === 'Escape') {
                setName(project.name)
                setEditing(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] font-semibold mb-1 bg-transparent border-b border-primary outline-none w-full text-foreground"
          />
        ) : (
          <div
            className="text-[13px] font-semibold mb-1 transition-colors text-foreground flex items-center gap-1.5 group/name"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
            title="Duplo clique para renomear"
          >
            <span className="truncate">{project.name}</span>
            <Pencil
              size={10}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover/name:opacity-60 transition-opacity shrink-0"
            />
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

/* -------------------------------------------------------------------------- */
/* 5. Secção "Os seus projetos"                                               */
/* -------------------------------------------------------------------------- */
function ProjectsSection() {
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
    <div className="space-y-4 pt-4">
      {/* Linha Divisória */}
      <div className="border-t border-border" />

      {/* Barra de Filtros e Pesquisa */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-[13px] font-semibold text-muted-foreground">
            Os seus projetos <span className="font-normal text-muted-foreground/80">({projects.length})</span>
          </h2>
          <div className="flex gap-1 bg-secondary/60 p-0.5 rounded-lg border border-border/50">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  filter === f
                    ? 'text-foreground bg-card border border-border shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Input Pesquisar */}
        <div className="relative w-full sm:w-auto">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-foreground text-[12px] w-full sm:w-48 outline-none focus:border-primary focus:bg-card placeholder:text-muted-foreground/70 transition-all"
          />
        </div>
      </div>

      {/* Lista / Grelha de Projetos */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center text-center rounded-2xl border border-dashed border-border bg-secondary/20">
          <FolderOpen size={28} className="text-muted-foreground mb-2 opacity-60" />
          <p className="text-muted-foreground text-[13px] font-medium">Nenhum projeto encontrado</p>
          {(filter !== 'Todos' || search) && (
            <button
              onClick={() => {
                setFilter('Todos')
                setSearch('')
              }}
              className="mt-2.5 text-primary text-[12px] font-medium hover:underline cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 6. Dashboard Completa                                                      */
/* -------------------------------------------------------------------------- */
export function Dashboard() {
  return (
    <div className="min-h-full w-full bg-background pb-16">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20 space-y-12 sm:space-y-14">
        <PromptSection />
        <TemplatesSection />
        <ProjectsSection />
      </div>
    </div>
  )
}
