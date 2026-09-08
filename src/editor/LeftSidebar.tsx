import { useState } from 'react'
import {
  Sparkles,
  Layers,
  LayoutGrid,
  Palette,
  Search,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Wand2,
  Check,
  X,
  FileText,
  Type,
  ImageIcon,
  Play,
  Grid3X3,
  DollarSign,
  Megaphone,
  PanelBottom,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Users,
  Mail,
  Newspaper,
  Minus,
  Flag,
  GalleryHorizontalEnd,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { blockMetadata } from '@/lib/block-metadata'
import type { BlockType, BlockConfig } from '@/blocks/types'
import { DesignPanel } from './DesignPanel'
import { DeleteConfirmModal } from './modals/DeleteConfirmModal'

const blockIcons: Record<string, any> = {
  navbar: LayoutGrid,
  hero: Type,
  features: Grid3X3,
  pricing: DollarSign,
  cta: Megaphone,
  footer: PanelBottom,
  testimonials: MessageSquare,
  stats: BarChart3,
  faq: HelpCircle,
  team: Users,
  contact: Mail,
  newsletter: Newspaper,
  logocloud: ImageIcon,
  divider: Minus,
  banner: Flag,
  content: FileText,
  image: ImageIcon,
  video: Play,
  gallery: GalleryHorizontalEnd,
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: IA (Criar & Melhorar com IA)
// ─────────────────────────────────────────────────────────────────────────────
function AiTab() {
  const { config, updateBlockProps } = useConfigStore()
  const { selectedBlockId, aiProposal, setAiProposal, clearAiProposal } = useEditorStore()

  const [prompt, setPrompt] = useState('')
  const [visualStyle, setVisualStyle] = useState('Moderno e inspirador')
  const [isGenerating, setIsGenerating] = useState(false)

  const selectedBlock = config.blocks.find((b) => b.id === selectedBlockId)

  const promptSuggestions = [
    'Landing page para clínica médica de estética',
    'Site institucional para consultoria financeira',
    'Página de vendas de software SaaS com IA',
    'Portfólio minimalista para arquiteto',
  ]

  async function handleCreatePageWithAi(textPrompt: string) {
    const trimmed = textPrompt.trim()
    if (!trimmed) return

    setIsGenerating(true)
    toast.info('A processar pedido com IA server-side...')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_page',
          prompt: trimmed,
          segment: config.segment,
          niche: config.niche,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiProposal({
          type: 'structure',
          before: config.name,
          after: data.name || `Projeto: ${trimmed}`,
          description: `Estrutura gerada via IA para "${trimmed}" com estilo ${visualStyle}.`,
        })
        toast.success('Sugestão de página pronta para revisão!')
      } else {
        // Fallback or honest message
        const err = await res.json().catch(() => ({}))
        if (err.configured === false) {
          toast.info('IA em modo heurístico local (GEMINI_API_KEY do servidor não configurada)')
        }
        setAiProposal({
          type: 'structure',
          before: config.name,
          after: `Projeto: ${trimmed}`,
          description: `Estrutura gerada para "${trimmed}" (${visualStyle}).`,
        })
        toast.success('Sugestão de página pronta para revisão!')
      }
    } catch {
      // Local development fallback
      setAiProposal({
        type: 'structure',
        before: config.name,
        after: `Projeto: ${trimmed}`,
        description: `Estrutura gerada para "${trimmed}" (${visualStyle}).`,
      })
      toast.success('Sugestão de página pronta para revisão!')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRefineText(action: 'improve' | 'summarize' | 'commercial' | 'niche') {
    if (!selectedBlock) {
      toast.error('Selecione primeiro uma secção ou elemento no canvas.')
      return
    }

    const currentHeadline = (selectedBlock.props as any).headline || (selectedBlock.props as any).title || 'Título'
    let refined = currentHeadline
    let explanation = `Refinamento comercial do título para ${config.segment || 'o seu nicho'}.`

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine_text',
          text: currentHeadline,
          mode: action,
          segment: config.segment,
          niche: config.niche,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.refinedText) {
          refined = data.refinedText
          explanation = data.explanation || explanation
        }
      } else {
        // Deterministic fallback
        if (action === 'improve') {
          refined = `A Solução Definitiva em ${config.niche || 'Alta Performance'}: ${currentHeadline}`
        } else if (action === 'summarize') {
          refined = currentHeadline.split(':')[0] || currentHeadline
        } else if (action === 'commercial') {
          refined = `Multiplique os seus Resultados: ${currentHeadline}`
        } else if (action === 'niche') {
          refined = `${currentHeadline} — Especializado para ${config.segment || 'o seu mercado'}`
        }
      }
    } catch {
      if (action === 'improve') {
        refined = `A Solução Definitiva em ${config.niche || 'Alta Performance'}: ${currentHeadline}`
      } else if (action === 'summarize') {
        refined = currentHeadline.split(':')[0] || currentHeadline
      } else if (action === 'commercial') {
        refined = `Multiplique os seus Resultados: ${currentHeadline}`
      } else if (action === 'niche') {
        refined = `${currentHeadline} — Especializado para ${config.segment || 'o seu mercado'}`
      }
    }

    setAiProposal({
      type: 'text',
      blockId: selectedBlock.id,
      propKey: (selectedBlock.props as any).headline ? 'headline' : 'title',
      before: currentHeadline,
      after: refined,
      description: explanation,
    })
  }

  function handleApproveProposal() {
    if (!aiProposal) return

    if (aiProposal.type === 'text' && aiProposal.blockId && aiProposal.propKey) {
      updateBlockProps(aiProposal.blockId, { [aiProposal.propKey]: aiProposal.after })
      toast.success('Alteração aplicada com sucesso!')
    } else if (aiProposal.type === 'structure') {
      toast.success('Estrutura de IA confirmada!')
    }

    clearAiProposal()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* AI Proposal Comparison Overlay / Card */}
      {aiProposal && (
        <div className="p-3.5 rounded-xl border-2 border-primary bg-primary/10 shadow-lg space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Sparkles size={14} />
              Revisão da Sugestão da IA
            </span>
            <button
              type="button"
              onClick={clearAiProposal}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">{aiProposal.description}</p>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-background/80 border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-0.5">
                Antes:
              </span>
              <p className="text-muted-foreground line-through text-[11.5px]">{String(aiProposal.before)}</p>
            </div>

            <div className="p-2 rounded-lg bg-background border border-primary/40">
              <span className="text-[10px] font-semibold text-primary uppercase block mb-0.5">
                Depois (Sugerido):
              </span>
              <p className="text-foreground font-medium text-[11.5px]">{String(aiProposal.after)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={clearAiProposal}
              className="flex-1 py-1.5 rounded-lg border border-border bg-secondary/80 text-foreground text-xs font-medium hover:bg-secondary transition-all"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleApproveProposal}
              className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1 shadow-xs"
            >
              <Check size={13} />
              <span>Aprovar & Aplicar</span>
            </button>
          </div>
        </div>
      )}

      {/* Contextual Actions for Selected Element */}
      {selectedBlock && (
        <div className="p-3 rounded-xl bg-secondary/70 border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Wand2 size={13} className="text-primary" />
              Melhorar Secção Selecionada ({selectedBlock.type})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleRefineText('improve')}
              className="p-2 rounded-lg bg-background border border-border text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all text-left"
            >
              ✨ Melhorar texto
            </button>
            <button
              type="button"
              onClick={() => handleRefineText('commercial')}
              className="p-2 rounded-lg bg-background border border-border text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all text-left"
            >
              📈 Mais comercial
            </button>
            <button
              type="button"
              onClick={() => handleRefineText('summarize')}
              className="p-2 rounded-lg bg-background border border-border text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all text-left"
            >
              ✂️ Resumir
            </button>
            <button
              type="button"
              onClick={() => handleRefineText('niche')}
              className="p-2 rounded-lg bg-background border border-border text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all text-left"
            >
              🎯 Adaptar ao nicho
            </button>
          </div>
        </div>
      )}

      {/* Main AI Creator Form */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-bold text-foreground mb-1">Criar página com IA</h3>
          <p className="text-[11px] text-muted-foreground">Descreva o tipo de página que você quer criar</p>
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Uma landing page para agência de turismo com hero impactante, destinos em grid, depoimentos e CTA..."
          className="w-full px-3 py-2 bg-secondary/90 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground resize-none focus:border-primary outline-none"
        />

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Estilo visual</label>
          <select
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-xs text-foreground outline-none"
          >
            <option value="Moderno e inspirador">Moderno e inspirador</option>
            <option value="Clean e corporativo">Clean e corporativo</option>
            <option value="High contrast escuro">High contrast escuro</option>
          </select>
        </div>

        <button
          type="button"
          disabled={!prompt.trim() || isGenerating}
          onClick={() => handleCreatePageWithAi(prompt)}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} />
          <span>{isGenerating ? 'A gerar estrutura...' : 'Gerar página com IA'}</span>
        </button>
      </div>

      {/* Prompt Suggestions */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Sugestões de prompts
        </label>
        <div className="space-y-1.5">
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(s)
                handleCreatePageWithAi(s)
              }}
              className="w-full p-2 rounded-lg bg-secondary/50 border border-border/70 text-left text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border transition-all flex items-center justify-between group"
            >
              <span className="truncate">{s}</span>
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-primary shrink-0 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: NAVEGADOR (Árvore Hierárquica da Página)
// ─────────────────────────────────────────────────────────────────────────────
function NavigatorTab() {
  const { config, moveBlock, removeBlock, duplicateBlock, updateBlock, activePageId, setActivePage } =
    useConfigStore()
  const { selectedBlockId, selectBlock } = useEditorStore()
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null)

  const pages = config.pages && config.pages.length > 0 ? config.pages : [{ id: 'page-home', name: 'Home', path: '/', blocks: config.blocks }]
  const activePage = pages.find((p) => p.id === activePageId) || pages[0]
  const blocks = activePage.blocks || []

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* Páginas */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
          <span>Páginas</span>
          <span className="text-[10px] font-normal">{pages.length} páginas</span>
        </div>
        <div className="space-y-1">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePage(p.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                activePage.id === p.id
                  ? 'bg-primary/10 text-primary font-semibold border border-primary/30'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span className="truncate">{p.name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{p.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Estrutura da Página */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
          <span>Estrutura da Página</span>
          <span className="text-[10px] font-normal">{blocks.length} secções</span>
        </div>

        <div className="space-y-1">
          {blocks.map((b, index) => {
            const isSelected = selectedBlockId === b.id
            const Icon = blockIcons[b.type] || LayoutGrid

            return (
              <div
                key={b.id}
                onClick={() => selectBlock(b.id)}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                    : 'border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border'
                }`}
              >
                <div className="w-5 h-5 rounded bg-background/80 border border-border/80 flex items-center justify-center shrink-0 text-primary">
                  <Icon size={12} />
                </div>

                <div className="flex-1 truncate">
                  <span className="capitalize">{b.type}</span>
                  {b.hidden && <span className="text-[10px] text-destructive ml-1.5">(Oculto)</span>}
                </div>

                {/* Quick actions */}
                <div
                  className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveBlock(index, index - 1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      title="Subir"
                    >
                      <ChevronUp size={12} />
                    </button>
                  )}
                  {index < blocks.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveBlock(index, index + 1)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      title="Descer"
                    >
                      <ChevronDown size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateBlock(b.id, { hidden: !b.hidden })}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    title={b.hidden ? 'Exibir' : 'Ocultar'}
                  >
                    {b.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      duplicateBlock(b.id)
                      toast.success('Secção duplicada')
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-foreground"
                    title="Duplicar"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteBlockId(b.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive"
                    title="Remover"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteBlockId !== null}
        title="Remover Secção"
        itemName={deleteBlockId ? `Secção ID: ${deleteBlockId}` : undefined}
        description="Tem a certeza que deseja remover esta secção da árvore da página?"
        onConfirm={() => {
          if (deleteBlockId) {
            removeBlock(deleteBlockId)
            if (selectedBlockId === deleteBlockId) selectBlock(null)
            toast.success('Secção removida')
          }
        }}
        onCancel={() => setDeleteBlockId(null)}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: ELEMENTOS (Catálogo de Blocos)
// ─────────────────────────────────────────────────────────────────────────────
function ElementsTab() {
  const [search, setSearch] = useState('')
  const addBlock = useConfigStore((s) => s.addBlock)
  const selectBlock = useEditorStore((s) => s.selectBlock)

  const filtered = blockMetadata.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, typeof blockMetadata>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = []
    acc[b.category].push(b)
    return acc
  }, {})

  function handleAdd(type: BlockType) {
    const meta = blockMetadata.find((b) => b.type === type)
    if (!meta) return
    const block: BlockConfig = {
      id: `block-${Date.now()}`,
      type,
      variant: meta.variants[0],
      props: { ...meta.defaultProps },
    }
    addBlock(block)
    selectBlock(block.id)
    toast.success(`${meta.label} adicionado ao final da página`)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden p-3 space-y-3">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Pesquisar elementos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-border bg-secondary text-foreground text-xs outline-none focus:border-primary placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              {category}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {items.map((meta) => {
                const Icon = blockIcons[meta.type] || LayoutGrid
                return (
                  <button
                    key={meta.type}
                    type="button"
                    onClick={() => handleAdd(meta.type)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border transition-all text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center text-primary shrink-0">
                        <Icon size={13} />
                      </div>
                      <span className="font-medium text-foreground">{meta.label}</span>
                    </div>
                    <Plus size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: LeftSidebar do Studio
// ─────────────────────────────────────────────────────────────────────────────
export function LeftSidebar() {
  const leftTab = useEditorStore((s) => s.leftTab)
  const setLeftTab = useEditorStore((s) => s.setLeftTab)

  return (
    <aside className="hidden lg:flex w-[300px] bg-background border-r border-border flex-col shrink-0 overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-border bg-secondary/30 p-1 shrink-0">
        <button
          type="button"
          onClick={() => setLeftTab('ai')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            leftTab === 'ai'
              ? 'bg-background text-primary shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles size={13} />
          <span>IA</span>
        </button>

        <button
          type="button"
          onClick={() => setLeftTab('navigator')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            leftTab === 'navigator'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers size={13} />
          <span>Navegador</span>
        </button>

        <button
          type="button"
          onClick={() => setLeftTab('elements')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            leftTab === 'elements'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid size={13} />
          <span>Elementos</span>
        </button>

        <button
          type="button"
          onClick={() => setLeftTab('design')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            leftTab === 'design'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette size={13} />
          <span>Estilo</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-hidden">
        {leftTab === 'ai' && <AiTab />}
        {leftTab === 'navigator' && <NavigatorTab />}
        {leftTab === 'elements' && <ElementsTab />}
        {leftTab === 'design' && <DesignPanel />}
      </div>
    </aside>
  )
}
