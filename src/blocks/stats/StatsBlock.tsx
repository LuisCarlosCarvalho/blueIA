import { useState } from 'react'
import type { BlockConfig } from '../types'
import { Plus, Copy, Trash2 } from 'lucide-react'
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
  arrayMove,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { InlineText } from '@/editor/InlineText'
import { SortableCard } from '@/editor/SortableCard'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { DeleteConfirmModal } from '@/editor/modals/DeleteConfirmModal'

interface StatItem {
  id?: string
  value: string
  label: string
}

interface StatsProps {
  title?: string
  items?: StatItem[]
  stats?: StatItem[]
}

const defaultStats: StatItem[] = [
  { id: 'stat-1', value: '+98%', label: 'Satisfação de Clientes' },
  { id: 'stat-2', value: '+500', label: 'Projetos Entregues' },
  { id: 'stat-3', value: '24/7', label: 'Suporte Dedicado' },
  { id: 'stat-4', value: '10x', label: 'Eficiência Operacional' },
]

export function StatsBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const previewMode = useEditorStore((s) => s.previewMode)
  const props = (block.props || {}) as unknown as StatsProps
  const rawItems = props.stats || props.items || defaultStats
  const items: StatItem[] = rawItems.map((item, idx) => ({
    ...item,
    id: item.id || `stat-${idx}-${(item.label || 'item').slice(0, 10)}`,
  }))
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex)
      updateBlockProps(block.id, { stats: reordered, items: reordered })
      toast.success('Ordem das métricas atualizada')
    }
  }

  function handleUpdateItem(index: number, updates: Partial<StatItem>) {
    const updated = items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateBlockProps(block.id, { stats: updated, items: updated })
  }

  function handleAddItem() {
    const newItem: StatItem = { id: `stat-${Date.now()}`, value: '100%', label: 'Nova Métrica' }
    const updated = [...items, newItem]
    updateBlockProps(block.id, { stats: updated, items: updated })
  }

  function handleDuplicateItem(index: number) {
    const item = items[index]
    const clone = { ...item, id: `stat-${Date.now()}` }
    const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
    updateBlockProps(block.id, { stats: updated, items: updated })
  }

  function handleRemoveItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    updateBlockProps(block.id, { stats: updated, items: updated })
    setDeleteIndex(null)
  }

  return (
    <section className="px-6 @md:px-10 py-12 @md:py-16">
      {props.title && (
        <h2 className="reveal-fade-up reveal-d1 text-xl font-bold tracking-tight text-center mb-8">
          <InlineText
            value={props.title}
            as="h2"
            onChange={(val) => updateBlockProps(block.id, { title: val })}
          />
        </h2>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item, idx) => item.id || `stat-${idx}`)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {items.map((item, i) => {
              const cardId = item.id || `stat-${i}`
              const cardActions = (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(i)}
                    className="p-1 rounded bg-background/80 text-muted-foreground hover:text-foreground shadow-xs"
                    title="Duplicar métrica"
                  >
                    <Copy size={10} />
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(i)}
                      className="p-1 rounded bg-background/80 text-muted-foreground hover:text-destructive shadow-xs"
                      title="Remover métrica"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </>
              )

              return (
                <SortableCard
                  key={cardId}
                  id={cardId}
                  actions={cardActions}
                  className="reveal-fade-up text-center p-4 rounded-xl bg-secondary border border-border transition-all hover:border-primary/40"
                >
                  <div className="text-3xl @md:text-4xl font-bold tracking-tight text-primary mb-1">
                    <InlineText
                      value={item.value}
                      onChange={(val) => handleUpdateItem(i, { value: val })}
                    />
                  </div>
                  <div className="text-[12px] text-muted-foreground font-medium">
                    <InlineText
                      value={item.label}
                      onChange={(val) => handleUpdateItem(i, { label: val })}
                    />
                  </div>
                </SortableCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {!previewMode && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAddItem()
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all"
          >
            <Plus size={13} />
            <span>Adicionar Métrica</span>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteIndex !== null}
        title="Remover Métrica"
        itemName={deleteIndex !== null ? items[deleteIndex]?.label : undefined}
        description="Tem a certeza que deseja remover esta métrica estatística?"
        onConfirm={() => {
          if (deleteIndex !== null) handleRemoveItem(deleteIndex)
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </section>
  )
}
