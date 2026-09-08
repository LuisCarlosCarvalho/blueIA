import { useState, useMemo } from 'react'
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
import { CanvasToolbar } from './CanvasToolbar'
import { JsonDrawer } from './JsonDrawer'
import { GenerationOverlay } from './GenerationOverlay'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { RenderBlock } from '@/blocks/registry'
import { resolveTheme, themeToCSS } from '@/lib/theme-presets'
import { useGoogleFonts } from '@/lib/useGoogleFonts'

type TinkTab = 'ai' | 'navigator' | 'inspector'

export function BoltTinkAiLayout() {
  const [activeTab, setActiveTab] = useState<TinkTab>('ai')
  const [promptInput, setPromptInput] = useState('')

  const blocks = useConfigStore((s) => {
    const pages = s.config.pages
    if (!pages || pages.length === 0) return s.config.blocks
    const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
    return page.blocks
  })

  const theme = useConfigStore((s) => s.config.theme)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const selectBlock = useEditorStore((s) => s.selectBlock)
  const selectElement = useEditorStore((s) => s.selectElement)
  const viewport = useEditorStore((s) => s.viewport)
  const zoom = useEditorStore((s) => s.zoom)

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const cssVars = useMemo(() => themeToCSS(resolved), [resolved])
  useGoogleFonts([resolved.fontSans, resolved.fontDisplay, resolved.fontMono])

  const maxWidth = viewport === 'desktop' ? '1200px' : viewport === 'tablet' ? '768px' : '375px'

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

  return (
    <div className="h-full flex flex-col relative bg-background text-foreground select-none">
      <div className="flex-1 flex overflow-hidden">
        {/* PAINEL ESQUERDO: ASSISTENTE BOLT TINK IA */}
        <div className="w-[420px] shrink-0 border-r border-border bg-card flex flex-col h-full z-10">
          {/* 1. Abas Superiores */}
          <div className="p-3 border-b border-border bg-card/60 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Sparkles size={14} />
              <span>IA</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('navigator')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'navigator'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <ListTree size={14} />
              <span>Navegador</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'inspector'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Sliders size={14} />
              <span>Inspetor</span>
            </button>
          </div>

          {/* 2. Área Central do Painel */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center">
            {activeTab === 'ai' && (
              <div className="flex flex-col items-center text-center space-y-4 my-auto animate-fade-in">
                {/* Ícone Blue Bolt Próprio */}
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
                      <span className="text-[10px] text-muted-foreground font-mono">{b.id}</span>
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
                      <span className="text-xs font-semibold capitalize text-foreground">{selectedBlock.type}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Variante:</span>
                      <span className="text-xs font-semibold capitalize text-foreground">{selectedBlock.variant || 'padrão'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Modo de Layout:</span>
                      <span className="text-xs font-semibold text-primary">{selectedBlock.layout?.mode || 'estruturado'}</span>
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
          <div className="p-4 border-t border-border bg-card/80 space-y-3">
            {/* Linha de Contexto do Elemento & Ações */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
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

            {/* Campo de Entrada de Mensagem */}
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

            {/* Indicação Discreta: IA em Preparação */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-medium text-foreground">Bolt Tink IA</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">IA em preparação</span>
            </div>
          </div>
        </div>

        {/* CANVAS À DIREITA: VISUALIZAÇÃO REAL DA PÁGINA */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-background">
          <CanvasToolbar />

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
                style={{
                  width: '100%',
                  maxWidth,
                  ...cssVars,
                  color: 'var(--color-text-0)',
                  backgroundColor: 'var(--color-bg-1)',
                  borderColor: 'var(--color-border-default)',
                } as React.CSSProperties}
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
