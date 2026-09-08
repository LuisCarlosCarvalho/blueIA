import {
  Sliders,
  Palette,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useConfigStore } from '@/store/configStore'
import { useAuthStore } from '@/store/authStore'
import { PropertiesPanel } from './PropertiesPanel'
import { DesignPanel } from './DesignPanel'

export function RightSidebar() {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const inspectorTab = useEditorStore((s) => s.inspectorTab)
  const setInspectorTab = useEditorStore((s) => s.setInspectorTab)
  const viewport = useEditorStore((s) => s.viewport)
  const user = useAuthStore((s) => s.user)
  const isAdmin = Boolean(user?.labels?.includes('admin'))

  const blocks = useConfigStore((s) => {
    const pages = s.config.pages
    if (!pages || pages.length === 0) return s.config.blocks
    const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
    return page.blocks
  })
  const updateBlock = useConfigStore((s) => s.updateBlock)

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  if (!selectedBlock) {
    return (
      <aside className="hidden xl:flex w-[310px] bg-background border-l border-border flex-col shrink-0 overflow-hidden">
        <div className="p-3 border-b border-border bg-secondary/30">
          <span className="text-xs font-bold text-foreground">Design Global</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DesignPanel />
        </div>
      </aside>
    )
  }

  const currentLayout = selectedBlock.layout || {
    paddingTop: 'md',
    paddingBottom: 'md',
    maxWidth: 'boxed',
    align: 'center',
  }

  const currentBg = selectedBlock.background || {
    type: 'color',
    color: 'transparent',
  }

  return (
    <aside className="hidden xl:flex w-[310px] bg-background border-l border-border flex-col shrink-0 overflow-hidden">
      {/* Header with Element Info */}
      <div className="p-3 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Inspetor</span>
          <h3 className="text-xs font-bold text-foreground capitalize truncate max-w-[200px]">
            {selectedBlock.type} ({selectedBlock.variant})
          </h3>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
          {selectedBlock.id.slice(-6)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-secondary/20 p-1 shrink-0">
        <button
          type="button"
          onClick={() => setInspectorTab('design')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            inspectorTab === 'design'
              ? 'bg-background text-primary shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette size={13} />
          <span>Design</span>
        </button>

        <button
          type="button"
          onClick={() => setInspectorTab('layout')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            inspectorTab === 'layout'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders size={13} />
          <span>Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setInspectorTab('advanced')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            inspectorTab === 'advanced'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Code2 size={13} />
          <span>Avançado</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: DESIGN */}
        {inspectorTab === 'design' && (
          <div className="space-y-4">
            {/* Edição Direta de Propriedades de Conteúdo */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Conteúdo do Bloco
              </span>
              <PropertiesPanel block={selectedBlock} />
            </div>

            {/* Fundo da Secção */}
            <div className="pt-3 border-t border-border space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Fundo da Secção
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {['color', 'gradient', 'image'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      updateBlock(selectedBlock.id, {
                        background: { ...currentBg, type: t as any },
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border capitalize text-center transition-all ${
                      currentBg.type === t
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t === 'color' ? 'Cor' : t === 'gradient' ? 'Gradiente' : 'Imagem'}
                  </button>
                ))}
              </div>

              {currentBg.type === 'color' && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(currentBg as any).color || '#09090b'}
                    onChange={(e) =>
                      updateBlock(selectedBlock.id, {
                        background: { type: 'color', color: e.target.value },
                      })
                    }
                    className="w-8 h-8 rounded border border-border bg-secondary cursor-pointer p-0.5"
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    {(currentBg as any).color || 'Cor sólida'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LAYOUT */}
        {inspectorTab === 'layout' && (
          <div className="space-y-4">
            {/* Viewport Indicator Badge */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 border border-border text-xs">
              <span className="text-muted-foreground">Editando para:</span>
              <span className="font-bold text-primary capitalize flex items-center gap-1">
                <span>{viewport}</span>
                {viewport !== 'desktop' && (
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Override responsivo)
                  </span>
                )}
              </span>
            </div>

            {/* Padding Vertical */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Espaçamento Vertical</label>
                {viewport !== 'desktop' && (
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.responsive?.[viewport]?.paddingTop ? 'Personalizado' : 'Herdado'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'none', label: '0' },
                  { id: 'sm', label: 'Curto' },
                  { id: 'md', label: 'Médio' },
                  { id: 'lg', label: 'Amplo' },
                  { id: 'xl', label: 'Max' },
                ].map((p) => {
                  const activeValue =
                    viewport === 'mobile'
                      ? selectedBlock.responsive?.mobile?.paddingTop ?? selectedBlock.responsive?.tablet?.paddingTop ?? currentLayout.paddingTop
                      : viewport === 'tablet'
                      ? selectedBlock.responsive?.tablet?.paddingTop ?? currentLayout.paddingTop
                      : currentLayout.paddingTop

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (viewport === 'desktop') {
                          updateBlock(selectedBlock.id, {
                            layout: { ...currentLayout, paddingTop: p.id as any, paddingBottom: p.id as any },
                          })
                        } else {
                          const prevResp = selectedBlock.responsive || {}
                          const target = prevResp[viewport] || {}
                          updateBlock(selectedBlock.id, {
                            responsive: {
                              ...prevResp,
                              [viewport]: { ...target, paddingTop: p.id as any, paddingBottom: p.id as any },
                            },
                          })
                        }
                      }}
                      className={`py-1 rounded text-xs font-medium border text-center transition-all ${
                        activeValue === p.id
                          ? 'border-primary bg-primary/15 text-primary font-semibold'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Largura Máxima */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Largura do Bloco</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'narrow', label: 'Estreito' },
                  { id: 'boxed', label: 'Padrão' },
                  { id: 'full', label: 'Total' },
                ].map((w) => {
                  const activeWidth =
                    viewport === 'mobile'
                      ? selectedBlock.responsive?.mobile?.maxWidth ?? selectedBlock.responsive?.tablet?.maxWidth ?? currentLayout.maxWidth
                      : viewport === 'tablet'
                      ? selectedBlock.responsive?.tablet?.maxWidth ?? currentLayout.maxWidth
                      : currentLayout.maxWidth

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        if (viewport === 'desktop') {
                          updateBlock(selectedBlock.id, {
                            layout: { ...currentLayout, maxWidth: w.id as any },
                          })
                        } else {
                          const prevResp = selectedBlock.responsive || {}
                          const target = prevResp[viewport] || {}
                          updateBlock(selectedBlock.id, {
                            responsive: {
                              ...prevResp,
                              [viewport]: { ...target, maxWidth: w.id as any },
                            },
                          })
                        }
                      }}
                      className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                        activeWidth === w.id
                          ? 'border-primary bg-primary/15 text-primary font-semibold'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {w.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Alinhamento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Alinhamento de Conteúdo</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'left', label: 'Esquerda', icon: AlignLeft },
                  { id: 'center', label: 'Centro', icon: AlignCenter },
                  { id: 'right', label: 'Direita', icon: AlignRight },
                ].map((a) => {
                  const activeAlign =
                    viewport === 'mobile'
                      ? selectedBlock.responsive?.mobile?.align ?? selectedBlock.responsive?.tablet?.align ?? currentLayout.align
                      : viewport === 'tablet'
                      ? selectedBlock.responsive?.tablet?.align ?? currentLayout.align
                      : currentLayout.align

                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        if (viewport === 'desktop') {
                          updateBlock(selectedBlock.id, {
                            layout: { ...currentLayout, align: a.id as any },
                          })
                        } else {
                          const prevResp = selectedBlock.responsive || {}
                          const target = prevResp[viewport] || {}
                          updateBlock(selectedBlock.id, {
                            responsive: {
                              ...prevResp,
                              [viewport]: { ...target, align: a.id as any },
                            },
                          })
                        }
                      }}
                      className={`py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                        activeAlign === a.id
                          ? 'border-primary bg-primary/15 text-primary font-semibold'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <a.icon size={13} />
                      <span>{a.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AVANÇADO (Diagnóstico Técnico) */}
        {inspectorTab === 'advanced' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Metadados do Bloco
              </span>
              <div className="p-2.5 rounded-lg bg-secondary/70 border border-border text-xs space-y-1 font-mono">
                <div>ID: {selectedBlock.id}</div>
                <div>Tipo: {selectedBlock.type}</div>
                <div>Variante: {selectedBlock.variant}</div>
                <div>Oculto: {selectedBlock.hidden ? 'Sim' : 'Não'}</div>
              </div>
            </div>

            {isAdmin ? (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  JSON Schema (Admin)
                </span>
                <pre className="p-2.5 rounded-lg bg-background border border-border text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-60">
                  {JSON.stringify(selectedBlock, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 text-center text-xs text-muted-foreground">
                Dados avançados de schema restritos a administradores.
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
