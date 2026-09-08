import { useState } from 'react'
import { ChevronDown, Plus, Copy, Trash2 } from 'lucide-react'
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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { SortableCard } from '@/editor/SortableCard'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { DeleteConfirmModal } from '@/editor/modals/DeleteConfirmModal'

interface FaqItem {
  id?: string
  question: string
  answer: string
}

interface FaqProps {
  label?: string
  title?: string
  subtitle?: string
  items?: FaqItem[]
}

const defaultFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Como funciona o processo de adesão?',
    answer: 'O processo é totalmente transparente e online. Após o registo, terá acesso imediato a todas as funcionalidades do plano selecionado.',
  },
  {
    id: 'faq-2',
    question: 'Existe garantia de satisfação?',
    answer: 'Sim, oferecemos 14 dias de garantia incondicional com devolução integral do valor.',
  },
  {
    id: 'faq-3',
    question: 'Posso solicitar suporte técnico quando precisar?',
    answer: 'A nossa equipa de suporte está disponível para esclarecer dúvidas e acompanhar a evolução do seu projeto.',
  },
]

export function FaqBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const previewMode = useEditorStore((s) => s.previewMode)
  const props = (block.props || {}) as unknown as FaqProps
  const rawItems = props.items || defaultFaqs
  const items: FaqItem[] = rawItems.map((item, idx) => ({
    ...item,
    id: item.id || `faq-${idx}-${item.question.slice(0, 10)}`,
  }))
  const [openIndex, setOpenIndex] = useState<number | null>(0)
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
      updateBlockProps(block.id, { items: reordered })
      toast.success('Ordem das perguntas atualizada')
    }
  }

  function handleUpdateItem(index: number, updates: Partial<FaqItem>) {
    const updated = items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    updateBlockProps(block.id, { items: updated })
  }

  function handleAddItem() {
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: 'Nova Pergunta Frequente',
      answer: 'Escreva aqui a resposta clara e objetiva para esclarecer as dúvidas dos seus clientes.',
    }
    const updated = [...items, newItem]
    updateBlockProps(block.id, { items: updated })
    setOpenIndex(updated.length - 1)
  }

  function handleDuplicateItem(index: number) {
    const item = items[index]
    const clone = { ...item, id: `faq-${Date.now()}`, question: `${item.question} (Cópia)` }
    const updated = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)]
    updateBlockProps(block.id, { items: updated })
  }

  function handleRemoveItem(index: number) {
    const updated = items.filter((_, i) => i !== index)
    updateBlockProps(block.id, { items: updated })
    setDeleteIndex(null)
  }

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      <div className="reveal-fade-up reveal-d1 text-center mb-10">
        <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
          <InlineText
            value={props.title || 'Perguntas Frequentes'}
            as="h2"
            multiline
            onChange={(val) => updateBlockProps(block.id, { title: val })}
          />
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          <InlineText
            value={props.subtitle || 'Esclareça as suas dúvidas principais.'}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(block.id, { subtitle: val })}
          />
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item, idx) => item.id || `faq-${idx}`)} strategy={verticalListSortingStrategy}>
          <div className="max-w-2xl mx-auto space-y-3">
            {items.map((item, i) => {
              const isOpen = openIndex === i
              const cardId = item.id || `faq-${i}`
              const cardActions = (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(i)}
                    className="p-1 rounded bg-background/80 text-muted-foreground hover:text-foreground shadow-xs"
                    title="Duplicar pergunta"
                  >
                    <Copy size={11} />
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(i)}
                      className="p-1 rounded bg-background/80 text-muted-foreground hover:text-destructive shadow-xs"
                      title="Remover pergunta"
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
                  className="border border-border/80 rounded-xl p-3 bg-secondary/50 group/faq transition-all"
                >
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1 pr-14">
                      <span className="text-[13.5px] font-medium text-foreground">
                        <InlineText
                          value={item.question}
                          as="span"
                          onChange={(val) => handleUpdateItem(i, { question: val })}
                        />
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                      title={isOpen ? 'Recolher' : 'Expandir'}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="pb-2 pt-2 text-[12.5px] text-muted-foreground leading-relaxed border-t border-border/40 mt-2">
                      <InlineText
                        value={item.answer}
                        as="p"
                        multiline
                        onChange={(val) => handleUpdateItem(i, { answer: val })}
                      />
                    </div>
                  )}
                </SortableCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {!previewMode && (
        <div className="max-w-2xl mx-auto mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAddItem()
            }}
            className="w-full py-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus size={15} />
            <span>+ Adicionar Pergunta & Resposta</span>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteIndex !== null}
        title="Remover Pergunta"
        itemName={deleteIndex !== null ? items[deleteIndex]?.question : undefined}
        description="Tem a certeza que deseja remover este item de FAQ?"
        onConfirm={() => {
          if (deleteIndex !== null) handleRemoveItem(deleteIndex)
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </section>
  )
}
