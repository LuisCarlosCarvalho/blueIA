import { useState } from 'react'
import type { BlockConfig } from '../types'
import {
  Blocks,
  Code,
  Bot,
  Zap,
  Shield,
  Globe,
  Layers,
  Palette,
  Rocket,
  Star,
  Lock,
  Settings,
  Plus,
  Copy,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { InlineText } from '@/editor/InlineText'
import { SortableCard } from '@/editor/SortableCard'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { DeleteConfirmModal } from '@/editor/modals/DeleteConfirmModal'

interface FeatureItem {
  id?: string
  icon?: string
  title: string
  description: string
}

interface FeaturesProps {
  label?: string
  title: string
  subtitle?: string
  items: FeatureItem[]
}

const iconMap: Record<string, LucideIcon> = {
  Blocks,
  Code,
  Bot,
  Zap,
  Shield,
  Globe,
  Layers,
  Palette,
  Rocket,
  Star,
  Lock,
  Settings,
}

function getIcon(name?: string): LucideIcon {
  if (!name) return Zap
  return iconMap[name] || Zap
}

function FeaturesGrid({ blockId, props }: { blockId: string; props: FeaturesProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const previewMode = useEditorStore((s) => s.previewMode)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const items: FeatureItem[] = (props.items || []).map((item, idx) => ({
    ...item,
    id: item.id || `feature-${idx}-${item.title.slice(0, 10)}`,
  }))

  function handleUpdateItem(index: number, updates: Partial<FeatureItem>) {
    const updated = items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateBlockProps(blockId, { items: updated })
  }

  function handleAddItem() {
    const newItem: FeatureItem = {
      id: `feature-${Date.now()}`,
      icon: 'Zap',
      title: 'Nova Funcionalidade',
      description: 'Descreva aqui o benefício e o valor entregue ao seu cliente.',
    }
    updateBlockProps(blockId, { items: [...items, newItem] })
  }

  function handleDuplicateItem(index: number) {
    const item = items[index]
    const clone: FeatureItem = { ...item, id: `feature-${Date.now()}`, title: `${item.title} (Cópia)` }
    const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
    updateBlockProps(blockId, { items: updated })
  }

  function handleRemoveItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    updateBlockProps(blockId, { items: updated })
    setDeleteIndex(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => (item.id || `feature-${items.indexOf(item)}`) === active.id)
    const newIndex = items.findIndex((item) => (item.id || `feature-${items.indexOf(item)}`) === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = [...items]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      updateBlockProps(blockId, { items: reordered })
    }
  }

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      {/* Header */}
      <div className="reveal-fade-up reveal-d1 text-center mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">
          <InlineText
            value={props.label || 'Diferenciais'}
            onChange={(val) => updateBlockProps(blockId, { label: val })}
          />
        </div>
        <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
          <InlineText
            value={props.title}
            as="h2"
            multiline
            onChange={(val) => updateBlockProps(blockId, { title: val })}
          />
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          <InlineText
            value={props.subtitle || 'Recursos desenvolvidos para o seu sucesso.'}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(blockId, { subtitle: val })}
          />
        </p>
      </div>

      {/* Dnd Sortable Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item, idx) => item.id || `feature-${idx}`)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3 gap-4">
            {items.map((item, i) => {
              const Icon = getIcon(item.icon)
              const cardId = item.id || `feature-${i}`

              const cardActions = (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(i)}
                    className="p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground shadow-xs transition-all"
                    title="Duplicar cartão"
                  >
                    <Copy size={11} />
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(i)}
                      className="p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-destructive shadow-xs transition-all"
                      title="Remover cartão"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </>
              )

              return (
                <SortableCard
                  key={cardId}
                  id={cardId}
                  actions={cardActions}
                  className="bg-secondary border border-border rounded-xl p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">
                    <InlineText
                      value={item.title}
                      as="h3"
                      onChange={(val) => handleUpdateItem(i, { title: val })}
                    />
                  </h3>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                    <InlineText
                      value={item.description}
                      as="p"
                      multiline
                      onChange={(val) => handleUpdateItem(i, { description: val })}
                    />
                  </p>
                </SortableCard>
              )
            })}

            {/* Botão + Adicionar Cartão no próprio Canvas */}
            {!previewMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddItem()
                }}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all min-h-[140px] group/add"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover/add:scale-110 transition-transform">
                  <Plus size={18} />
                </div>
                <span className="text-xs font-semibold">+ Adicionar Cartão de Funcionalidade</span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal de confirmação para remoção de item */}
      <DeleteConfirmModal
        isOpen={deleteIndex !== null}
        title="Remover Cartão"
        itemName={deleteIndex !== null ? items[deleteIndex]?.title : undefined}
        description="Tem a certeza que deseja remover este cartão do grid?"
        onConfirm={() => {
          if (deleteIndex !== null) handleRemoveItem(deleteIndex)
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </section>
  )
}

function FeaturesList({ blockId, props }: { blockId: string; props: FeaturesProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const previewMode = useEditorStore((s) => s.previewMode)
  const items = props.items || []

  function handleUpdateItem(index: number, updates: Partial<FeatureItem>) {
    const updated = items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateBlockProps(blockId, { items: updated })
  }

  function handleAddItem() {
    const newItem: FeatureItem = {
      icon: 'Zap',
      title: 'Nova Funcionalidade',
      description: 'Descreva aqui o detalhe e valor para o cliente.',
    }
    updateBlockProps(blockId, { items: [...items, newItem] })
  }

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      <div className="reveal-fade-up reveal-d1 text-center mb-10">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">
          <InlineText
            value={props.label || 'Recursos'}
            onChange={(val) => updateBlockProps(blockId, { label: val })}
          />
        </div>
        <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
          <InlineText
            value={props.title}
            as="h2"
            multiline
            onChange={(val) => updateBlockProps(blockId, { title: val })}
          />
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          <InlineText
            value={props.subtitle || 'Diferenciais da nossa plataforma.'}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(blockId, { subtitle: val })}
          />
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {items.map((item, i) => {
          const Icon = getIcon(item.icon)
          return (
            <div
              key={i}
              className="reveal-fade-up flex gap-4 p-4 rounded-xl bg-secondary border border-border transition-all hover:border-primary/40"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-0.5">
                  <InlineText
                    value={item.title}
                    as="h3"
                    onChange={(val) => handleUpdateItem(i, { title: val })}
                  />
                </h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                  <InlineText
                    value={item.description}
                    as="p"
                    multiline
                    onChange={(val) => handleUpdateItem(i, { description: val })}
                  />
                </p>
              </div>
            </div>
          )
        })}

        {!previewMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAddItem()
            }}
            className="w-full py-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus size={15} />
            <span>+ Adicionar Item à Lista</span>
          </button>
        )}
      </div>
    </section>
  )
}

export function FeaturesBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as FeaturesProps

  if (block.variant === 'list') {
    return <FeaturesList blockId={block.id} props={props} />
  }

  return <FeaturesGrid blockId={block.id} props={props} />
}
