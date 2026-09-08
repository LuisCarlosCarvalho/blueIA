import { useState } from 'react'
import type { BlockConfig } from '../types'
import { Check, Star, Plus, Copy, Trash2 } from 'lucide-react'
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

interface PricingTier {
  id?: string
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  cta: string
  featured?: boolean
}

interface PricingProps {
  label?: string
  title: string
  subtitle?: string
  tiers?: PricingTier[]
  plans?: PricingTier[]
}

const defaultTiers: PricingTier[] = [
  {
    id: 'tier-1',
    name: 'Essencial',
    price: '29€',
    period: '/mês',
    description: 'Para profissionais individuais e início de atividade',
    features: ['Acesso a recursos básicos', 'Suporte por email', 'Exportação padrão'],
    cta: 'Começar Agora',
  },
  {
    id: 'tier-2',
    name: 'Profissional',
    price: '69€',
    period: '/mês',
    description: 'Para negócios que buscam alta performance',
    features: ['Tudo do Essencial', 'Suporte Prioritário 24/7', 'Domínio personalizado', 'Recursos avançados'],
    cta: 'Escolher Pro',
    featured: true,
  },
  {
    id: 'tier-3',
    name: 'Enterprise',
    price: '149€',
    period: '/mês',
    description: 'Para operações que exigem escala e consultoria',
    features: ['Tudo do Pro', 'Onboarding dedicado', 'SLA garantido', 'Consultoria estratégica'],
    cta: 'Falar com Consultor',
  },
]

function PricingSimple({ blockId, props }: { blockId: string; props: PricingProps }) {
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

  const rawTiers = props.tiers || props.plans || defaultTiers
  const tiers: PricingTier[] = rawTiers.map((t, idx) => ({
    ...t,
    id: t.id || `tier-${idx}-${t.name.slice(0, 10)}`,
  }))

  function handleUpdateTier(index: number, updates: Partial<PricingTier>) {
    const updated = tiers.map((tier, i) => (i === index ? { ...tier, ...updates } : tier))
    updateBlockProps(blockId, { tiers: updated, plans: updated })
  }

  function handleAddTier() {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      name: 'Novo Plano',
      price: '49€',
      period: '/mês',
      description: 'Descrição resumida do público-alvo',
      features: ['Benefício 1', 'Benefício 2', 'Benefício 3'],
      cta: 'Aderir',
    }
    const updated = [...tiers, newTier]
    updateBlockProps(blockId, { tiers: updated, plans: updated })
  }

  function handleDuplicateTier(index: number) {
    const tier = tiers[index]
    const clone: PricingTier = { ...tier, id: `tier-${Date.now()}`, name: `${tier.name} (Cópia)` }
    const updated = [...tiers.slice(0, index + 1), clone, ...tiers.slice(index + 1)]
    updateBlockProps(blockId, { tiers: updated, plans: updated })
  }

  function handleRemoveTier(index: number) {
    const updated = tiers.filter((_, i) => i !== index)
    updateBlockProps(blockId, { tiers: updated, plans: updated })
    setDeleteIndex(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tiers.findIndex((t) => (t.id || `tier-${tiers.indexOf(t)}`) === active.id)
    const newIndex = tiers.findIndex((t) => (t.id || `tier-${tiers.indexOf(t)}`) === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = [...tiers]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      updateBlockProps(blockId, { tiers: reordered, plans: reordered })
    }
  }

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      <div className="reveal-fade-up reveal-d1 text-center mb-10">
        <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
          <InlineText
            value={props.title || 'Planos & Investimento'}
            as="h2"
            multiline
            onChange={(val) => updateBlockProps(blockId, { title: val })}
          />
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          <InlineText
            value={props.subtitle || 'Escolha a opção perfeita para acelerar o seu negócio.'}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(blockId, { subtitle: val })}
          />
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tiers.map((t, idx) => t.id || `tier-${idx}`)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {tiers.map((tier, i) => {
              const cardId = tier.id || `tier-${i}`

              const cardActions = (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateTier(i)}
                    className="p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground shadow-xs"
                    title="Duplicar plano"
                  >
                    <Copy size={11} />
                  </button>
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(i)}
                      className="p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-destructive shadow-xs"
                      title="Remover plano"
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
                  className={`rounded-xl p-6 flex flex-col transition-all ${
                    tier.featured
                      ? 'bg-secondary border-2 border-primary shadow-lg ring-1 ring-primary/30'
                      : 'bg-secondary border border-border hover:border-primary/40'
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star size={10} fill="currentColor" />
                      Destaque
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-1">
                      <InlineText
                        value={tier.name}
                        as="h3"
                        onChange={(val) => handleUpdateTier(i, { name: val })}
                      />
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      <InlineText
                        value={tier.description || 'Para começar'}
                        as="p"
                        onChange={(val) => handleUpdateTier(i, { description: val })}
                      />
                    </p>
                  </div>

            <div className="mb-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">
                <InlineText
                  value={tier.price}
                  onChange={(val) => handleUpdateTier(i, { price: val })}
                />
              </span>
              <span className="text-muted-foreground text-sm">
                <InlineText
                  value={tier.period || '/mês'}
                  onChange={(val) => handleUpdateTier(i, { period: val })}
                />
              </span>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                  <Check size={14} className="text-primary shrink-0 mt-0.5" />
                  <InlineText
                    value={feature}
                    onChange={(val) => {
                      const updatedFeatures = [...tier.features]
                      updatedFeatures[j] = val
                      handleUpdateTier(i, { features: updatedFeatures })
                    }}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tier.featured
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                  : 'bg-background border border-border text-foreground hover:bg-secondary'
              }`}
            >
              <InlineText
                value={tier.cta || 'Começar'}
                onChange={(val) => handleUpdateTier(i, { cta: val })}
              />
            </button>
          </SortableCard>
        )
      })}

        {!previewMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleAddTier()
            }}
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all min-h-[200px] group/add"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover/add:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <span className="text-xs font-semibold">+ Adicionar Plano de Preço</span>
          </button>
        )}
          </div>
        </SortableContext>
      </DndContext>

      <DeleteConfirmModal
        isOpen={deleteIndex !== null}
        title="Remover Plano"
        itemName={deleteIndex !== null ? tiers[deleteIndex]?.name : undefined}
        description="Tem a certeza que deseja remover este plano de preços?"
        onConfirm={() => {
          if (deleteIndex !== null) handleRemoveTier(deleteIndex)
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </section>
  )
}

export function PricingBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as PricingProps
  return <PricingSimple blockId={block.id} props={props} />
}
