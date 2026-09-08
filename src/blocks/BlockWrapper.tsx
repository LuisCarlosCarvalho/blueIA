import { type ReactNode, useRef, useEffect, useState } from 'react'
import {
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Palette,
  Sparkles,
  GripVertical,
  Move,
  ArrowLeftRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { useScrollReveal } from '@/lib/useScrollReveal'
import type { BlockConfig } from './types'
import { DeleteConfirmModal } from '@/editor/modals/DeleteConfirmModal'
import { SectionDesignPopover } from '@/editor/SectionDesignPopover'

interface Props {
  block: BlockConfig
  isSelected: boolean
  onSelect: () => void
  children: ReactNode
}

export function BlockWrapper({ block, isSelected, onSelect, children }: Props) {
  const blocks = useConfigStore((s) => {
    const pages = s.config.pages
    if (!pages || pages.length === 0) return s.config.blocks
    const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
    return page.blocks
  })
  const { duplicateBlock, removeBlock, moveBlock, updateBlock } = useConfigStore()
  const { selectedBlockId, selectBlock, previewMode } = useEditorStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref: revealRef, isRevealed } = useScrollReveal(!previewMode)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDesignPopoverOpen, setIsDesignPopoverOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: block.id, disabled: previewMode })

  const index = blocks.findIndex((b) => b.id === block.id)
  const isFirst = index === 0
  const isLast = index === blocks.length - 1

  useEffect(() => {
    if (isSelected && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  // No modo de pré-visualização, secções ocultas não são renderizadas
  if (previewMode) {
    if (block.hidden) return null
    return (
      <div
        ref={revealRef}
        className={`scroll-revealed relative ${isRevealed ? 'scroll-revealed' : ''}`}
        style={getBackgroundStyle(block)}
      >
        {renderBackgroundMedia(block)}
        <div className={`relative z-10 ${getLayoutPaddingClass(block)}`}>
          {children}
        </div>
      </div>
    )
  }

  function getBackgroundStyle(b: BlockConfig): React.CSSProperties {
    const bg = b.background
    if (!bg) return {}
    if (bg.type === 'color' && bg.color) {
      return { backgroundColor: bg.color }
    }
    if (bg.type === 'gradient' && (bg as any).from && (bg as any).to) {
      return {
        backgroundImage: `linear-gradient(135deg, ${(bg as any).from}, ${(bg as any).to})`,
      }
    }
    return {}
  }

  function renderBackgroundMedia(b: BlockConfig) {
    const bg = b.background
    if (!bg) return null

    if (bg.type === 'image' && (bg as any).url) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img
            src={(bg as any).url}
            alt="Fundo da secção"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: (bg as any).overlayOpacity ?? 0.5 }}
          />
        </div>
      )
    }

    if (bg.type === 'video' && (bg as any).url) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            src={(bg as any).url}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: (bg as any).overlayOpacity ?? 0.6 }}
          />
        </div>
      )
    }

    return null
  }

  function getLayoutPaddingClass(b: BlockConfig): string {
    const layout = b.layout
    if (!layout) return ''
    const pt =
      layout.paddingTop === 'none'
        ? 'pt-0'
        : layout.paddingTop === 'sm'
        ? 'pt-6'
        : layout.paddingTop === 'lg'
        ? 'pt-24'
        : layout.paddingTop === 'xl'
        ? 'pt-32'
        : ''
    const pb =
      layout.paddingBottom === 'none'
        ? 'pb-0'
        : layout.paddingBottom === 'sm'
        ? 'pb-6'
        : layout.paddingBottom === 'lg'
        ? 'pb-24'
        : layout.paddingBottom === 'xl'
        ? 'pb-32'
        : ''
    return `${pt} ${pb}`
  }

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.35 : 1,
    ...getBackgroundStyle(block),
  }

  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const isDirectlySelected = isSelected && (!selectedElementId || selectedElementId === block.id)

  return (
    <>
      {/* Indicador visual azul de inserção no Canvas ao arrastar sobre a secção */}
      {isOver && !isDragging && (
        <div className="relative py-1 z-40">
          <div className="h-1 bg-primary rounded-full mx-4 shadow-[0_0_14px_rgba(59,130,246,0.9)] ring-2 ring-primary/40 animate-pulse transition-all" />
        </div>
      )}

      <div
        ref={(el) => {
          setNodeRef(el)
          ;(scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          ;(revealRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        onClick={(e) => {
          if (isDragging) return
          e.stopPropagation()
          useEditorStore.getState().selectElement(null)
          onSelect()
        }}
        className={`scroll-revealed relative group transition-all duration-200 border-b border-border/40 ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${block.hidden ? 'opacity-40 grayscale-[40%]' : ''} ${
          isDirectlySelected
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl z-20 shadow-xl'
            : 'hover:outline hover:outline-1 hover:outline-primary/40'
        } ${isDragging ? 'shadow-2xl ring-2 ring-primary/80 scale-[0.99] cursor-grabbing' : ''}`}
        style={sortableStyle}
      >
        {/* Render media de fundo */}
        {renderBackgroundMedia(block)}

        {/* Tag identificadora de tipo */}
        <div
          className={`absolute top-2 left-3 z-30 transition-all pointer-events-none ${
            isDirectlySelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-background/90 text-primary border border-primary/30 shadow-md backdrop-blur-md flex items-center gap-1">
            <Sparkles size={10} />
            <span>{block.type}</span>
            {block.hidden && (
              <span className="text-destructive font-normal normal-case ml-1 flex items-center gap-0.5">
                <EyeOff size={10} /> Oculto
              </span>
            )}
          </span>
        </div>

        {/* BARRA DE AÇÕES CONTEXTUAIS DA SECÇÃO (apenas quando selecionada diretamente) */}
        {!isDragging && (
          <div
            className={`absolute top-2 right-3 z-30 flex items-center gap-1 transition-all ${
              isDirectlySelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dedicated Drag Handle - Modo Exclusivo de Arrastar Secção */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center shadow-md transition-all cursor-grab active:cursor-grabbing"
              title="Arrastar para reordenar secção no Canvas"
            >
              <GripVertical size={14} />
            </button>

            {/* Alternador de Modo: Estruturado vs Livre */}
            <button
              type="button"
              onClick={() => {
                const nextMode = block.layout?.mode === 'free' ? 'structured' : 'free'
                updateBlock(block.id, {
                  layout: { ...(block.layout || {}), mode: nextMode },
                })
                toast.success(
                  nextMode === 'free'
                    ? '✨ Modo de Posicionamento Livre ativado'
                    : '🧱 Modo Estruturado (Grid/Flex) ativado'
                )
              }}
              className={`px-2 h-7 rounded-lg border text-xs font-semibold flex items-center gap-1 shadow-md transition-all ${
                block.layout?.mode === 'free'
                  ? 'bg-primary text-primary-foreground border-primary/50'
                  : 'bg-background/90 border-border text-muted-foreground hover:text-primary hover:border-primary/40'
              }`}
              title="Alternar entre Layout Estruturado e Posicionamento Livre"
            >
              <Move size={12} />
              <span className="hidden sm:inline">{block.layout?.mode === 'free' ? 'Livre' : 'Estruturado'}</span>
            </button>

            {/* Intra-Bloco: Inverter Imagem/Texto (Hero Estruturado) */}
            {block.type === 'hero' && block.layout?.mode !== 'free' && (
              <button
                type="button"
                onClick={() => {
                  const currentDir = block.layout?.direction || 'row'
                  const nextDir =
                    currentDir === 'row' ? 'row-reverse' : currentDir === 'row-reverse' ? 'col' : 'row'
                  updateBlock(block.id, {
                    layout: { ...(block.layout || {}), direction: nextDir },
                  })
                  toast.success(
                    nextDir === 'row-reverse'
                      ? 'Imagem posicionada à esquerda'
                      : nextDir === 'col'
                      ? 'Imagem posicionada abaixo'
                      : 'Imagem posicionada à direita'
                  )
                }}
                className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center shadow-md transition-all"
                title="Inverter / Alterar disposição de imagem e texto"
              >
                <ArrowLeftRight size={13} />
              </button>
            )}

            {/* Intra-Bloco: Alinhamento rápido */}
            {block.layout?.mode !== 'free' && (
              <button
                type="button"
                onClick={() => {
                  const currentAlign = block.layout?.align || 'center'
                  const nextAlign =
                    currentAlign === 'center' ? 'left' : currentAlign === 'left' ? 'right' : 'center'
                  updateBlock(block.id, {
                    layout: { ...(block.layout || {}), align: nextAlign },
                  })
                  toast.success(
                    nextAlign === 'left'
                      ? 'Alinhamento à esquerda'
                      : nextAlign === 'right'
                      ? 'Alinhamento à direita'
                      : 'Alinhamento centralizado'
                  )
                }}
                className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center shadow-md transition-all"
                title="Alterar alinhamento (Esquerda / Centro / Direita)"
              >
                {block.layout?.align === 'left' ? (
                  <AlignLeft size={13} />
                ) : block.layout?.align === 'right' ? (
                  <AlignRight size={13} />
                ) : (
                  <AlignCenter size={13} />
                )}
              </button>
            )}

            {/* Mover para cima (fallback acessível) */}
            {!isFirst && (
              <button
                type="button"
                onClick={() => moveBlock(index, index - 1)}
                className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center shadow-md transition-all"
                title="Mover para cima"
              >
                <ChevronUp size={14} />
              </button>
            )}

          {/* Mover para baixo (fallback acessível) */}
          {!isLast && (
            <button
              type="button"
              onClick={() => moveBlock(index, index + 1)}
              className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center shadow-md transition-all"
              title="Mover para baixo"
            >
              <ChevronDown size={14} />
            </button>
          )}

          {/* Editar Design / Fundo */}
          <button
            type="button"
            onClick={() => setIsDesignPopoverOpen(true)}
            className="px-2.5 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center gap-1.5 text-xs font-semibold shadow-md transition-all"
            title="Editar Fundo e Espaçamento"
          >
            <Palette size={13} className="text-primary" />
            <span className="hidden sm:inline">Design</span>
          </button>

          {/* Ocultar / Exibir */}
          <button
            type="button"
            onClick={() => {
              updateBlock(block.id, { hidden: !block.hidden })
              toast(block.hidden ? 'Secção visível' : 'Secção oculta na pré-visualização')
            }}
            className={`w-7 h-7 rounded-lg bg-background/90 border border-border flex items-center justify-center shadow-md transition-all ${
              block.hidden
                ? 'text-destructive hover:text-foreground hover:bg-secondary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title={block.hidden ? 'Exibir secção' : 'Ocultar secção'}
          >
            {block.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          {/* Duplicar */}
          <button
            type="button"
            onClick={() => {
              duplicateBlock(block.id)
              toast.success('Secção duplicada com sucesso')
            }}
            className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center shadow-md transition-all"
            title="Duplicar secção"
          >
            <Copy size={13} />
          </button>

          {/* Remover com confirmação */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-7 h-7 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 flex items-center justify-center shadow-md transition-all"
            title="Remover secção"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

        {/* Conteúdo do Bloco */}
        <div className={`relative z-10 ${getLayoutPaddingClass(block)} ${isDragging ? 'pointer-events-none select-none opacity-40' : ''}`}>
          {children}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Remover Secção"
        itemName={`Secção: ${block.type}`}
        description="Tem a certeza que deseja remover esta secção da página? A alteração pode ser desfeita a qualquer momento pelo botão Desfazer."
        onConfirm={() => {
          if (selectedBlockId === block.id) selectBlock(null)
          removeBlock(block.id)
          toast.success('Secção removida')
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Popover de Design da Secção */}
      <SectionDesignPopover
        block={block}
        isOpen={isDesignPopoverOpen}
        onClose={() => setIsDesignPopoverOpen(false)}
      />
    </>
  )
}
