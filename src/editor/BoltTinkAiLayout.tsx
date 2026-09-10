import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  ListTree,
  Sliders,
  Send,
  Plus,
  Pencil,
  Layers,
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { EditorTopBar } from './EditorTopBar'
import { JsonDrawer } from './JsonDrawer'
import { GenerationOverlay } from './GenerationOverlay'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { RenderBlock } from '@/blocks/registry'
import { resolveTheme, themeToCSS } from '@/lib/theme-presets'
import { useGoogleFonts } from '@/lib/useGoogleFonts'

// ──────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────

const PANEL_STORAGE_KEY = 'bb-tink-panel-width'
const MIN_PANEL_WIDTH = 280
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 420
/** Minimum canvas width — prevents canvas from disappearing */
const MIN_CANVAS_WIDTH = 320

function clampPanelWidth(w: number, containerWidth?: number): number {
  let max = MAX_PANEL_WIDTH
  if (containerWidth != null) {
    max = Math.min(MAX_PANEL_WIDTH, containerWidth - MIN_CANVAS_WIDTH - 4)
  }
  return Math.max(MIN_PANEL_WIDTH, Math.min(max, w))
}

function readStoredPanelWidth(): number {
  try {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) return clampPanelWidth(parsed)
    }
  } catch {
    // localStorage unavailable — use default
  }
  return DEFAULT_PANEL_WIDTH
}

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

type TinkTab = 'ai' | 'navigator' | 'inspector'

// ──────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────

export function BoltTinkAiLayout() {
  const [activeTab, setActiveTab] = useState<TinkTab>('ai')
  const [promptInput, setPromptInput] = useState('')
  const [panelWidth, setPanelWidth] = useState<number>(readStoredPanelWidth)
  const [isDragging, setIsDragging] = useState(false)

  // ── Selectors (useShallow for objects/arrays to prevent unnecessary re-renders)
  const blocks = useConfigStore(
    useShallow((s) => {
      const pages = s.config.pages
      if (!pages || pages.length === 0) return s.config.blocks
      const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
      return page.blocks
    }),
  )

  const theme = useConfigStore(useShallow((s) => s.config.theme))

  const { selectedBlockId, selectedElementId, selectBlock, selectElement, viewport, zoom } =
    useEditorStore(
      useShallow((s) => ({
        selectedBlockId: s.selectedBlockId,
        selectedElementId: s.selectedElementId,
        selectBlock: s.selectBlock,
        selectElement: s.selectElement,
        viewport: s.viewport,
        zoom: s.zoom,
      })),
    )

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId),
    [blocks, selectedBlockId],
  )

  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const cssVars = useMemo(() => themeToCSS(resolved), [resolved])
  useGoogleFonts([resolved.fontSans, resolved.fontDisplay, resolved.fontMono])

  const maxWidth =
    viewport === 'desktop' ? '1200px' : viewport === 'tablet' ? '768px' : '375px'

  // Indicação formatada do elemento selecionado
  const selectedLabel = useMemo(() => {
    if (selectedElementId) {
      const parts = selectedElementId.split('.')
      const elName = parts[parts.length - 1]
      return `<${elName}>`
    }
    if (selectedBlock) {
      return `<${selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}>`
    }
    return '<body>'
  }, [selectedElementId, selectedBlock])

  // ──────────────────────────────────────────────────────────────────────
  // Resizable divider — Pointer Events API
  // Uses setPointerCapture so drag works even when pointer leaves the element.
  // ──────────────────────────────────────────────────────────────────────

  const containerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      // Capture the pointer so pointermove/pointerup fire on this element
      // even after the pointer leaves it.
      dividerRef.current?.setPointerCapture(e.pointerId)
      dragStartX.current = e.clientX
      dragStartWidth.current = panelWidth
      setIsDragging(true)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [panelWidth],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      const containerWidth = containerRef.current?.clientWidth
      const delta = e.clientX - dragStartX.current
      setPanelWidth(clampPanelWidth(dragStartWidth.current + delta, containerWidth))
    },
    [isDragging],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      dividerRef.current?.releasePointerCapture(e.pointerId)
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Persist to localStorage only when drag ends
      setPanelWidth((w) => {
        try {
          localStorage.setItem(PANEL_STORAGE_KEY, String(w))
        } catch {
          // localStorage unavailable — continue without saving
        }
        return w
      })
    },
    [isDragging],
  )

  // Cleanup body styles if component unmounts mid-drag
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  // ──────────────────────────────────────────────────────────────────────
  // Responsive: collapse left panel on small screens
  // ──────────────────────────────────────────────────────────────────────

  // On very small screens (< 768px), show only the canvas (or allow toggling)
  // We keep the panel but allow it to shrink to MIN_PANEL_WIDTH naturally.
  // The divider is hidden on mobile to prevent layout breakage.
  const isMobileViewport = viewport === 'mobile'

  // ──────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col relative bg-background text-foreground select-none overflow-hidden">
      {/*
        ┌─────────────────────────────────────────────────────────────────┐
        │  BARRA SUPERIOR CONTÍNUA — 100% da largura útil do editor      │
        │  Irmã do contentor flex-1 abaixo. Não herda max-width do       │
        │  canvas. Atravessa toda a largura entre TopNav e o limite       │
        │  direito da janela.                                             │
        └─────────────────────────────────────────────────────────────────┘
      */}
      <EditorTopBar />

      {/* Área principal: painel esquerdo + divisor + canvas */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">

        {/* ── PAINEL ESQUERDO: ASSISTENTE BOLT TINK IA ── */}
        <div
          className="shrink-0 border-r border-border bg-card flex flex-col h-full z-10"
          style={{
            width: isMobileViewport ? '100%' : panelWidth,
            minWidth: MIN_PANEL_WIDTH,
            maxWidth: MAX_PANEL_WIDTH,
            // willChange only during drag — avoids compositing layers at rest
            willChange: isDragging ? 'width' : 'auto',
          }}
        >
          {/* 1. Abas Superiores */}
          <div className="p-3 border-b border-border bg-card/60 flex items-center gap-1 shrink-0">
            {(
              [
                { id: 'ai', icon: Sparkles, label: 'IA' },
                { id: 'navigator', icon: ListTree, label: 'Navegador' },
                { id: 'inspector', icon: Sliders, label: 'Inspetor' },
              ] as const
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* 2. Área Central do Painel */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center">
            {activeTab === 'ai' && (
              <div className="flex flex-col items-center text-center space-y-4 my-auto animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-md">
                  <Bot size={28} className="animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-[300px]">
                  <h3 className="text-base font-bold text-foreground">Comece uma conversa</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Selecione um elemento ou descreva a alteração que deseja fazer na página.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'navigator' && (
              <div className="h-full flex flex-col space-y-2 animate-fade-in">
                <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Estrutura da Página ({blocks.length} secções)
                </div>
                <div className="space-y-1.5">
                  {blocks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        selectBlock(b.id)
                        selectElement(null)
                      }}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        selectedBlockId === b.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-secondary/40 text-foreground hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-primary" />
                        <span className="capitalize">{b.type}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[80px]">
                        {b.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inspector' && (
              <div className="h-full flex flex-col space-y-3 animate-fade-in">
                <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Propriedades do Elemento
                </div>
                {selectedBlock ? (
                  <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Tipo de Secção:</span>
                      <span className="text-xs font-semibold capitalize text-foreground">
                        {selectedBlock.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Variante:</span>
                      <span className="text-xs font-semibold capitalize text-foreground">
                        {selectedBlock.variant || 'padrão'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Modo de Layout:</span>
                      <span className="text-xs font-semibold text-primary">
                        {selectedBlock.layout?.mode || 'estruturado'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    Clique numa secção no canvas para inspecionar.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Compositor Inferior */}
          <div className="p-4 border-t border-border bg-card/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] font-mono text-primary font-semibold truncate">
                  {selectedLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md border border-border bg-secondary/80 text-foreground text-[11px] font-medium flex items-center gap-1 hover:bg-secondary transition-all cursor-pointer"
                  title="Editar elemento selecionado"
                >
                  <Pencil size={11} className="text-primary" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md border border-border bg-secondary/80 text-foreground text-[11px] font-medium flex items-center gap-1 hover:bg-secondary transition-all cursor-pointer"
                  title="Gerar nova secção ou página com IA"
                >
                  <Plus size={11} className="text-primary" />
                  <span>Gerar página</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="O que deseja alterar?"
                rows={3}
                className="w-full p-3 pr-10 rounded-xl border border-border bg-secondary text-foreground text-xs placeholder:text-muted-foreground/70 outline-none focus:border-primary transition-all resize-none font-sans"
              />
              <button
                type="button"
                className="absolute right-2.5 bottom-2.5 w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
                title="Enviar instrução"
              >
                <Send size={13} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-medium text-foreground">Bolt Tink IA</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">IA em preparação</span>
            </div>
          </div>
        </div>

        {/*
          ── DIVISOR VERTICAL REDIMENSIONÁVEL ──
          Pointer Events: setPointerCapture garante que pointermove/pointerup
          continuam a ser recebidos mesmo que o ponteiro saia do elemento.
          Oculto em mobile (isMobileViewport) para não destruir o layout.
        */}
        {!isMobileViewport && (
          <div
            ref={dividerRef}
            role="separator"
            aria-label="Redimensionar painel de IA"
            aria-orientation="vertical"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`
              w-1 shrink-0 relative flex items-center justify-center
              cursor-col-resize z-20 select-none group
              transition-colors duration-150
              ${isDragging ? 'bg-primary/60' : 'bg-border hover:bg-primary/40'}
            `}
          >
            {/* Handle visual — dots indicator */}
            <div
              className={`
                flex flex-col gap-[3px] transition-opacity duration-150
                ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              `}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${isDragging ? 'bg-primary' : 'bg-muted-foreground/60'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── CANVAS À DIREITA ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background">
          <div className="flex-1 flex items-start justify-center p-6 overflow-auto relative">
            {/* Grid background Blue Bolt */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--color-bg-3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div
              className="relative z-[1] w-full flex justify-center transition-transform duration-200 ease-out origin-top"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <div
                className="@container border border-border/80 rounded-xl min-h-[400px] relative z-[1] overflow-hidden shadow-2xl transition-all duration-300"
                style={
                  {
                    width: '100%',
                    maxWidth,
                    ...cssVars,
                    color: 'var(--color-text-0)',
                    backgroundColor: 'var(--color-bg-1)',
                    borderColor: 'var(--color-border-default)',
                  } as React.CSSProperties
                }
              >
                {blocks.map((block) => {
                  const isSelected = selectedBlockId === block.id
                  return (
                    <div
                      key={block.id}
                      onClick={() => {
                        selectBlock(block.id)
                        selectElement(null)
                      }}
                      className={`relative transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg z-20'
                          : 'hover:outline hover:outline-1 hover:outline-primary/40'
                      }`}
                    >
                      <RenderBlock block={block} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <JsonDrawer />
          <GenerationOverlay />
        </div>
      </div>
    </div>
  )
}
