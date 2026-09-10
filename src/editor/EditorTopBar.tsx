/**
 * EditorTopBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Barra superior ÚNICA do editor — funde TopNav + CanvasToolbar numa só faixa
 * de 100% da largura útil.
 *
 * Layout (esquerda → direita):
 *   [logo + nav links] │ [zoom + viewport + undo/redo] │ [preview + save + publish] │ [user + avatar + logout]
 *
 * Regras de segurança:
 *   • Nenhum dado sensível exposto no browser.
 *   • Logout delega em useAuthStore.logout().
 *   • Export/publish não fazem escritas automáticas na BD.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Pencil,
  Settings,
  LogOut,
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

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/editor', label: 'Editor', icon: Pencil },
  { to: '/settings', label: 'Definições', icon: Settings },
]

const VIEWPORTS: { value: Viewport; icon: typeof Monitor; label: string }[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EditorTopBar() {
  const navigate = useNavigate()

  // ── Auth ────────────────────────────────────────────────────────────────
  const { user, logout } = useAuthStore()
  const isAdmin = Boolean(user?.labels?.includes('admin'))
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U'

  // ── Editor store ────────────────────────────────────────────────────────
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

  // ── Config store ────────────────────────────────────────────────────────
  const { undo, redo, canUndo, canRedo } = useConfigStore()
  const undoStack = useConfigStore((s) => s.undoStack)
  const redoStack = useConfigStore((s) => s.redoStack)
  const config = useConfigStore((s) => s.config)
  const setConfig = useConfigStore((s) => s.setConfig)

  // ── Projects ─────────────────────────────────────────────────────────────
  const projects = useProjectsStore((s) => s.projects)
  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null
  const projectName = activeProject?.name || config.name || 'Meu Projeto'

  // ── Local state ──────────────────────────────────────────────────────────
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [, setExporting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [projectNameDraft, setProjectNameDraft] = useState(projectName)

  // keep draft in sync with active project changes
  useEffect(() => {
    setProjectNameDraft(projectName)
  }, [projectName])

  const publishMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
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

  // ── Handlers ─────────────────────────────────────────────────────────────

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

  function commitProjectName() {
    setIsEditingName(false)
    if (projectNameDraft.trim()) {
      setConfig({ ...config, name: projectNameDraft.trim() })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <header
      className="h-14 shrink-0 bg-background border-b border-border flex items-center px-3 gap-0 sticky top-0 z-50 select-none"
      role="banner"
    >
      {/* ── GRUPO 1: Logo + Nav links ─────────────────────────────────── */}
      <div className="flex items-center gap-0 shrink-0 h-full">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center mr-4 select-none shrink-0"
          title="Blue Bolt Page Studio"
        >
          <img
            src="/assets/brand/logo.png"
            alt="Blue Bolt Page Studio"
            className="h-9 w-auto object-contain"
          />
        </NavLink>

        {/* Nav links */}
        <nav className="hidden md:flex h-full items-stretch gap-0" aria-label="Editor navigation">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 flex items-center text-[13px] relative transition-colors whitespace-nowrap gap-1.5
                 after:content-[""] after:absolute after:bottom-0 after:left-2 after:right-2
                 after:h-0.5 after:rounded-t after:transition-all after:duration-200
                 ${
                   isActive
                     ? 'text-foreground after:bg-primary after:opacity-100'
                     : 'text-muted-foreground hover:text-foreground after:bg-transparent after:opacity-0'
                 }`
              }
            >
              <Icon size={13} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Separador visual */}
      <div className="w-px h-6 bg-border mx-1 shrink-0 hidden md:block" />

      {/* ── GRUPO 2: Nome do projecto + viewport + zoom + undo/redo ──────── */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        {/* Nome do projecto editável — só visível em XL+ */}
        <div className="hidden xl:flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={projectNameDraft}
              onChange={(e) => setProjectNameDraft(e.target.value)}
              onBlur={commitProjectName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitProjectName()
                if (e.key === 'Escape') setIsEditingName(false)
              }}
              autoFocus
              className="px-2 py-0.5 rounded bg-secondary border border-primary text-xs font-semibold text-foreground outline-none max-w-[150px]"
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingName(true)}
              title="Duplo clique para renomear"
              className="text-xs font-semibold text-foreground truncate max-w-[130px] cursor-pointer hover:text-primary transition-colors"
            >
              {projectNameDraft}
            </span>
          )}

          {/* Badge "Em memória" — só em 2XL+ */}
          <span className="hidden 2xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Em memória
          </span>
        </div>

        {/* Separador */}
        <div className="w-px h-5 bg-border mx-1 shrink-0 hidden lg:block" />

        {/* Zoom controls */}
        <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-secondary/60 border border-border text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setZoom(zoom - 10)}
            className="p-1 hover:text-foreground transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut size={12} />
          </button>
          <span className="font-mono text-[11px] w-8 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom(zoom + 10)}
            className="p-1 hover:text-foreground transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn size={12} />
          </button>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center rounded-xl bg-secondary/80 p-0.5 border border-border/80">
          {VIEWPORTS.map(({ value, icon: Icon, label }) => (
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
              <span className="hidden xl:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Separador */}
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* Undo / Redo */}
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
      </div>

      {/* Espaçador flexível — empurra o grupo direito para a extremidade */}
      <div className="flex-1" />

      {/* ── GRUPO 3: Preview + Save + Publish + More ─────────────────────── */}
      <div className="flex items-center gap-1 shrink-0">
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
          <span className="hidden xl:inline">{previewMode ? 'Sair' : 'Pré-visualizar'}</span>
        </button>

        {/* Guardar */}
        <button
          type="button"
          onClick={handleSave}
          className="h-8 px-3 rounded-xl border border-border bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary transition-all flex items-center gap-1.5"
          title="Guardar em memória"
        >
          <Save size={13} className="text-primary" />
          <span className="hidden xl:inline">Guardar</span>
        </button>

        {/* Menu Publicar */}
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

      {/* Separador */}
      <div className="w-px h-6 bg-border mx-3 shrink-0" />

      {/* ── GRUPO 4: User info + avatar + logout ─────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {user && (
          <>
            {/* Nome + badge ADMIN (visível a partir de lg) */}
            <div className="hidden lg:flex flex-col items-end min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-foreground leading-tight truncate max-w-[120px]">
                  {user.name || 'Utilizador'}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 tracking-wider shrink-0">
                    ADMIN
                  </span>
                )}
              </div>
              {/* Email apenas em ecrãs muito largos */}
              <span className="hidden xl:block text-[10px] text-muted-foreground leading-tight truncate max-w-[140px]">{user.email}</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[12px] font-semibold text-foreground shrink-0">
              {initials}
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Terminar sessão"
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
