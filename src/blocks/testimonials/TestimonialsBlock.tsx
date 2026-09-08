import { useState } from 'react'
import { Star, Quote, Plus, Copy, Trash2 } from 'lucide-react'
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
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { SortableCard } from '@/editor/SortableCard'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { DeleteConfirmModal } from '@/editor/modals/DeleteConfirmModal'

interface Testimonial {
  id?: string
  name?: string
  author?: string
  role: string
  quote: string
  rating?: number
  avatar?: string
}

interface TestimonialsProps {
  label?: string
  title?: string
  subtitle?: string
  items?: Testimonial[]
  testimonials?: Testimonial[]
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Dr. Miguel Santos',
    role: 'Diretor Executivo',
    quote: 'A experiência e dedicação da equipa transformaram a nossa presença digital e a captação de novas oportunidades.',
    rating: 5,
  },
  {
    id: 'test-2',
    author: 'Eng.ª Teresa Martins',
    role: 'Gestora de Operações',
    quote: 'Profissionalismo impecável, entrega no prazo e suporte acima da média. Altamente recomendado.',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}
        />
      ))}
    </div>
  )
}

function TestimonialsCards({ blockId, props }: { blockId: string; props: TestimonialsProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const previewMode = useEditorStore((s) => s.previewMode)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const rawItems = props.testimonials || props.items || defaultTestimonials
  const items: Testimonial[] = rawItems.map((t, idx) => ({
    ...t,
    id: t.id || `test-${idx}-${(t.author || t.name || 'item').slice(0, 10)}`,
    author: t.author || t.name || 'Cliente',
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex)
      updateBlockProps(blockId, { testimonials: reordered, items: reordered })
      toast.success('Ordem dos depoimentos atualizada')
    }
  }

  function handleUpdateItem(index: number, updates: Partial<Testimonial>) {
    const updated = items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateBlockProps(blockId, { testimonials: updated, items: updated })
  }

  function handleAddItem() {
    const newItem: Testimonial = {
      id: `test-${Date.now()}`,
      author: 'Novo Cliente',
      role: 'Cargo / Empresa',
      quote: 'Insira aqui o depoimento ou feedback positivo sobre o seu produto ou serviço.',
      rating: 5,
    }
    const updated = [...items, newItem]
    updateBlockProps(blockId, { testimonials: updated, items: updated })
  }

  function handleDuplicateItem(index: number) {
    const item = items[index]
    const clone = { ...item, id: `test-${Date.now()}`, author: `${item.author} (Cópia)` }
    const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
    updateBlockProps(blockId, { testimonials: updated, items: updated })
  }

  function handleRemoveItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    updateBlockProps(blockId, { testimonials: updated, items: updated })
    setDeleteIndex(null)
  }

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      <div className="reveal-fade-up reveal-d1 text-center mb-10">
        <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
          <InlineText
            value={props.title || 'O que dizem os nossos clientes'}
            as="h2"
            multiline
            onChange={(val) => updateBlockProps(blockId, { title: val })}
          />
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          <InlineText
            value={props.subtitle || 'Depoimentos reais de quem confia na nossa entrega.'}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(blockId, { subtitle: val })}
          />
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item, idx) => item.id || `test-${idx}`)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {items.map((item, i) => {
              const cardId = item.id || `test-${i}`
              const cardActions = (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(i)}
                    className="p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground shadow-xs"
                    title="Duplicar depoimento"
                  >
                    <Copy size={11} />
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(i)}
                      className="p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-destructive shadow-xs"
                      title="Remover depoimento"
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
                  className="bg-secondary border border-border rounded-xl p-5 transition-all hover:border-primary/40"
                >
                  <Quote size={20} className="text-primary/30 mb-3" />
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 italic">
                    "
                    <InlineText
                      value={item.quote}
                      multiline
                      onChange={(val) => handleUpdateItem(i, { quote: val })}
                    />
                    "
                  </p>
                  {item.rating && <StarRating rating={item.rating} />}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-semibold text-primary">
                      {item.author ? item.author.charAt(0) : 'C'}
                    </div>
                    <div>
                      <div className="text-[12.5px] font-semibold">
                        <InlineText
                          value={item.author || 'Cliente'}
                          onChange={(val) => handleUpdateItem(i, { author: val, name: val })}
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <InlineText
                          value={item.role || 'Cargo'}
                          onChange={(val) => handleUpdateItem(i, { role: val })}
                        />
                      </div>
                    </div>
                  </div>
                </SortableCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {!previewMode && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAddItem()
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>+ Adicionar Depoimento</span>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteIndex !== null}
        title="Remover Depoimento"
        itemName={deleteIndex !== null ? items[deleteIndex]?.author : undefined}
        description="Tem a certeza que deseja remover este depoimento?"
        onConfirm={() => {
          if (deleteIndex !== null) handleRemoveItem(deleteIndex)
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </section>
  )
}

export function TestimonialsBlock({ block }: { block: BlockConfig }) {
  const props = (block.props || {}) as unknown as TestimonialsProps
  return <TestimonialsCards blockId={block.id} props={props} />
}
