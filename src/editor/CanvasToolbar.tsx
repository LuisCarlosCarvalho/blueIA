import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  HelpCircle,
  Download,
  Save,
  ChevronDown,
  Globe,
  Link2,
  Calendar,
  Layers,
  ArrowLeft,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore, type Viewport } from '@/store/editorStore'
import { useConfigStore } from '@/store/configStore'
import { useProjectsStore } from '@/store/projectsStore'
import { useAuthStore } from '@/store/authStore'
import { exportToHTML, downloadHTML } from '@/lib/export-html'

const viewports: { value: Viewport; icon: typeof Monitor; label: string }[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
]

export function CanvasToolbar() {
  const navigate = useNavigate()
  const {
    viewport,
    setViewport,
    zoom,
    setZoom,
    togglePreview,
    previewMode,
    activeProjectId,
    toggleShortcutsModal,
    toggleJsonDrawer,
  } = useEditorStore()

  const { undo, redo, canUndo, canRedo } = useConfigStore()
  const undoStack = useConfigStore((s) => s.undoStack)
  const redoStack = useConfigStore((s) => s.redoStack)
  const config = useConfigStore((s) => s.config)
  const setConfig = useConfigStore((s) => s.setConfig)
  const projects = useProjectsStore((s) => s.projects)

  const user = useAuthStore((s) => s.user)
  const isAdmin = Boolean(user?.labels?.includes('admin'))

  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [, setExporting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [projectNameDraft, setProjectNameDraft] = useState(config.name || 'Página Sem Título')

  const publishMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null
  const projectName = activeProject?.name || config.name || 'Meu Projeto'

  useEffect(() => {
    setProjectNameDraft(projectName)
  }, [projectName])

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (publishMenuRef.current && !publishMenuRef.current.contains(e.target as Node)) {
        setIsPublishMenuOpen(false)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSave() {
    toast.info('Persistência segura em preparação', {
      description: 'As alterações estão ativas e preservadas na memória da sua sessão.',
      duration: 3500,
    })
  }

  function handlePublishAction(action: string) {
    setIsPublishMenuOpen(false)
    if (action === 'export') {
      handleExport()
      return
    }
    toast.info(`Publicação (${action}) em preparação`, {
      description: 'A publicação de páginas será ativada após validação da API server-side.',
      duration: 3500,
    })
  }

  async function handleExport() {
    setExporting(true)
    try {
      const html = await exportToHTML(config, { settings: activeProject?.settings })
      const filename = `${(config.name || 'pagina').toLowerCase().replace(/\s+/g, '-')}.html`
      downloadHTML(html, filename)
      toast.success('Página exportada em HTML standalone com sucesso!')
    } catch {
      toast.error('Erro ao exportar página.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="h-12 border-b border-border bg-background px-3 sm:px-4 flex items-center justify-between gap-2 select-none shrink-0 z-30">
      {/* Lado Esquerdo: Voltar + Nome do Projeto + Status Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary"
          title="Voltar aos Projetos"
        >
          <ArrowLeft size={16} />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px]">
              ⚡
            </div>
            <span className="font-bold text-xs text-foreground hidden sm:inline">Blue Bolt</span>
            <span className="text-muted-foreground text-xs hidden md:inline">Studio</span>
          </div>
        </button>

        <div className="w-px h-5 bg-border hidden sm:block" />

        {/* Nome do Projeto Editável */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={projectNameDraft}
              onChange={(e) => setProjectNameDraft(e.target.value)}
              onBlur={() => {
                setIsEditingName(false)
                if (projectNameDraft.trim()) {
                  setConfig({ ...config, name: projectNameDraft.trim() })
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingName(false)
                  if (projectNameDraft.trim()) {
                    setConfig({ ...config, name: projectNameDraft.trim() })
                  }
                }
              }}
              autoFocus
              className="px-2 py-0.5 rounded bg-secondary border border-primary text-xs font-semibold text-foreground outline-none max-w-[160px]"
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingName(true)}
              title="Duplo clique para renomear"
              className="text-xs font-semibold text-foreground truncate max-w-[140px] md:max-w-[200px] cursor-pointer hover:text-primary transition-colors"
            >
              {projectNameDraft}
            </span>
          )}

          {/* Badge de Estado em Memória */}
          <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Em memória
          </span>
        </div>
      </div>

      {/* Centro: Viewport Selector + Zoom Controls + Desfazer/Refazer */}
      <div className="flex items-center gap-2">
        {/* Desfazer / Refazer */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              const label = undoStack[undoStack.length - 1]?.label
              undo()
              if (label) toast(`Desfazer: ${label}`, { duration: 1500 })
            }}
            disabled={!canUndo()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              const label = redoStack[redoStack.length - 1]?.label
              redo()
              if (label) toast(`Refazer: ${label}`, { duration: 1500 })
            }}
            disabled={!canRedo()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-0.5 hidden sm:block" />

        {/* Viewport Switcher */}
        <div className="flex items-center rounded-xl bg-secondary/80 p-0.5 border border-border/80">
          {viewports.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              title={label}
              aria-pressed={viewport === value}
              onClick={() => setViewport(value)}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-all ${
                viewport === value
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={13} />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-secondary/60 border border-border text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setZoom(zoom - 10)}
            className="p-1 hover:text-foreground"
            title="Diminuir Zoom"
          >
            <ZoomOut size={12} />
          </button>
          <span className="font-mono text-[11px] w-8 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom(zoom + 10)}
            className="p-1 hover:text-foreground"
            title="Aumentar Zoom"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      {/* Lado Direito: Pré-visualizar + Guardar + Menu Publicar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Pré-visualizar */}
        <button
          type="button"
          onClick={togglePreview}
          className={`h-8 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
            previewMode
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Alternar Modo Pré-visualização"
        >
          <Eye size={13} />
          <span className="hidden sm:inline">{previewMode ? 'Sair' : 'Pré-visualizar'}</span>
        </button>

        {/* Guardar */}
        <button
          type="button"
          onClick={handleSave}
          className="h-8 px-3 rounded-xl border border-border bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary transition-all flex items-center gap-1.5"
          title="Guardar em memória"
        >
          <Save size={13} className="text-primary" />
          <span className="hidden sm:inline">Guardar</span>
        </button>

        {/* Menu Publicar Dropdown */}
        <div className="relative" ref={publishMenuRef}>
          <button
            type="button"
            onClick={() => setIsPublishMenuOpen(!isPublishMenuOpen)}
            className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <span>Publicar</span>
            <ChevronDown size={13} />
          </button>

          {isPublishMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 rounded-xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-scale-in">
              <button
                type="button"
                onClick={() => handlePublishAction('publicar_agora')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
              >
                <Globe size={14} className="text-primary" />
                <span>Publicar agora</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishAction('ver_publicado')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <Eye size={14} />
                <span>Ver site publicado</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishAction('copiar_link')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <Link2 size={14} />
                <span>Copiar link</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishAction('dominio_proprio')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <Layers size={14} />
                <span>Publicar em domínio próprio</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublishAction('agendar')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <Calendar size={14} />
                <span>Agendar publicação</span>
              </button>
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onClick={() => handlePublishAction('export')}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-primary font-semibold hover:bg-primary/10 transition-colors text-left"
              >
                <Download size={14} />
                <span>Exportar páginas (HTML)</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu 3 Pontos */}
        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="w-8 h-8 rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-all"
            title="Ações Secundárias"
          >
            <MoreVertical size={14} />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-48 rounded-xl border border-border bg-card p-1.5 shadow-2xl z-50 animate-scale-in">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false)
                  toggleShortcutsModal()
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
              >
                <HelpCircle size={14} />
                <span>Atalhos do Teclado (?)</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false)
                    toggleJsonDrawer()
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-primary font-semibold hover:bg-primary/10 transition-colors text-left"
                >
                  <Sparkles size={14} />
                  <span>Diagnóstico JSON (Admin)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
