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
  HelpCircle,
  Save,
  ChevronDown,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore, type Viewport } from '@/store/editorStore'
import { useAuthStore } from '@/store/authStore'
import { useImportStudioStore } from '../ImportStudioStore'
import { editorAdapter } from '../GrapesEditorAdapter'

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

export function ImportStudioTopBar() {
  const navigate = useNavigate()

  const { user, logout } = useAuthStore()
  const isAdmin = Boolean(user?.labels?.includes('admin'))
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  const { zoom, setZoom, studioModel, setStudioModel, toggleShortcutsModal } = useEditorStore()
  
  const { viewport, setViewport, saveState, activeProjectId, saveToDB, deleteFromDB } = useImportStudioStore()

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleManualSync() {
    if (!activeProjectId) return
    const userId = user?.$id || 'local_user'
    try {
      await saveToDB(userId, activeProjectId)
      toast.success('Projeto guardado localmente')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao guardar projeto')
    }
  }

  function handleUndo() {
    editorAdapter.undo()
  }

  function handleRedo() {
    editorAdapter.redo()
  }

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

      <div className="w-px h-6 bg-border mx-1 shrink-0 hidden md:block" />

      {/* Workspace Mode Selector */}
      <div className="hidden md:flex items-center rounded-xl bg-secondary/80 p-0.5 border border-border/80 mr-2">
        <select
          value={studioModel}
          onChange={(e) => {
            setStudioModel(e.target.value as 'studio_bolt' | 'bolt_tink_ai' | 'import_studio')
            toast.success(`Modo alterado para ${e.target.options[e.target.selectedIndex].text}`)
          }}
          className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer px-2 py-1 h-full appearance-none"
        >
          <option value="studio_bolt">Studio Bolt</option>
          <option value="bolt_tink_ai">Bolt Tink IA</option>
          <option value="import_studio">Studio Elementor</option>
        </select>
        <ChevronDown size={12} className="text-muted-foreground mr-1" />
      </div>

      {/* ── GRUPO 2: Nome do projeto ──────── */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
          Projeto Importado
        </span>
        <button
          type="button"
          onClick={handleManualSync}
          title={saveState === 'saving' ? 'Guardando...' : saveState === 'error' ? 'Erro ao guardar' : 'Projeto guardado localmente'}
          className={`hidden 2xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium transition-colors cursor-pointer shrink-0 ${
            saveState !== 'saved'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              saveState !== 'saved' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          {saveState === 'saving' ? 'Guardando...' : 'Local'}
        </button>

        <div className="w-px h-5 bg-border mx-1 shrink-0 hidden lg:block" />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleUndo}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>
      </div>

      {/* ── GRUPO 3: VIEWPORT (Centrado) ─────────────────────── */}
      <div className="flex items-center justify-center flex-1">
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
        <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-secondary/60 border border-border text-xs text-muted-foreground ml-2">
          <button type="button" onClick={() => setZoom(zoom - 10)} className="p-1 hover:text-foreground" title="Diminuir Zoom"><ZoomOut size={12} /></button>
          <span className="font-mono text-[11px] w-8 text-center">{zoom}%</span>
          <button type="button" onClick={() => setZoom(zoom + 10)} className="p-1 hover:text-foreground" title="Aumentar Zoom"><ZoomIn size={12} /></button>
        </div>
      </div>

      {/* ── GRUPO 4: Save + More ─────────────────────── */}
      <div className="flex items-center gap-1 shrink-0 flex-1 justify-end">
        <button
          type="button"
          onClick={handleManualSync}
          disabled={saveState === 'saving'}
          className="h-8 px-3 rounded-xl border border-border bg-secondary/80 text-foreground text-xs font-semibold hover:bg-secondary transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap disabled:opacity-50"
          title="Guardar localmente"
        >
          <Save size={13} className="text-primary shrink-0" />
          <span className="hidden xl:inline">Guardar</span>
        </button>

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
              {activeProjectId && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMoreMenuOpen(false)
                      if (confirm("Tem certeza que quer apagar este projeto local?")) {
                        const userId = user?.$id || 'local_user'
                        try {
                          await deleteFromDB(userId, activeProjectId)
                          toast.success('Projeto apagado')
                          setStudioModel('studio_bolt')
                        } catch(e) {
                          toast.error('Erro ao apagar projeto')
                        }
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    <Trash2 size={14} />
                    <span>Apagar Projeto</span>
                  </button>
                  <div className="my-1 border-t border-border" />
                </>
              )}
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
            </div>
          )}
        </div>
      </div>

      <div className="w-px h-6 bg-border mx-3 shrink-0" />

      {/* ── GRUPO 5: User ─────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {user && (
          <>
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
              <span className="hidden xl:block text-[10px] text-muted-foreground leading-tight truncate max-w-[140px]">{user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[12px] font-semibold text-foreground shrink-0">
              {initials}
            </div>
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
