import { useState } from 'react'
import { toast } from 'sonner'
import {
  Layout, Type, Grid3X3, DollarSign, Megaphone, PanelBottom,
  MessageSquare, BarChart3, HelpCircle, Users, Mail, Newspaper, Image,
  Copy, Trash2, GripVertical, Plus, Search, Minus, Flag,
  FileText, ImageIcon, Play, GalleryHorizontalEnd,
} from 'lucide-react'
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { blockMetadata } from '@/lib/block-metadata'
import type { BlockType, BlockConfig } from '@/blocks/types'

const blockIcons: Record<BlockType, typeof Layout> = {
  navbar: Layout, hero: Type, features: Grid3X3, pricing: DollarSign,
  cta: Megaphone, footer: PanelBottom, testimonials: MessageSquare,
  stats: BarChart3, faq: HelpCircle, team: Users, contact: Mail,
  newsletter: Newspaper, logocloud: Image, divider: Minus, banner: Flag,
  content: FileText, image: ImageIcon, video: Play, gallery: GalleryHorizontalEnd,
  'services-grid': Grid3X3, 'portfolio-grid': GalleryHorizontalEnd,
  timeline: FileText, 'team-grid': Users, 'logo-strip': Image,
  'contact-form': Mail, 'project-modal': Layout,
}

const blockLabels: Record<BlockType, string> = {
  navbar: 'Navbar', hero: 'Hero', features: 'Features', pricing: 'Pricing',
  cta: 'CTA', footer: 'Footer', testimonials: 'Testimonials', stats: 'Stats',
  faq: 'FAQ', team: 'Team', contact: 'Contact', newsletter: 'Newsletter',
  logocloud: 'Logo Cloud', divider: 'Divider', banner: 'Banner',
  content: 'Content', image: 'Image', video: 'Video', gallery: 'Gallery',
  'services-grid': 'Services Grid', 'portfolio-grid': 'Portfolio Grid',
  timeline: 'Timeline (About)', 'team-grid': 'Team Grid', 'logo-strip': 'Logo Strip',
  'contact-form': 'Contact Form', 'project-modal': 'Project Modal',
}

function SortableLayer({ block, isSelected, onSelect, onDuplicate, onRemove }: {
  block: BlockConfig
  isSelected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const Icon = blockIcons[block.type] || Layout

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group px-2.5 py-2 rounded-md text-[12.5px] flex items-center gap-2 transition-all cursor-pointer select-none relative ${
        isSelected ? 'bg-primary-glow text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground cursor-grab active:cursor-grabbing"
        aria-label={`Drag to reorder ${blockLabels[block.type]}`}
      >
        <GripVertical size={12} />
      </div>

      <div className={`w-[26px] h-[26px] rounded flex items-center justify-center text-[11px] shrink-0 border ${
        isSelected ? 'border-primary/30 bg-primary-glow' : 'border-border bg-muted'
      }`}>
        <Icon size={13} />
      </div>

      <span className="font-medium flex-1">{blockLabels[block.type]}</span>

      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate() }}
          className="w-[22px] h-[22px] rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          aria-label={`Duplicate ${blockLabels[block.type]}`}
        >
          <Copy size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="w-[22px] h-[22px] rounded flex items-center justify-center text-muted-foreground hover:bg-status-red/10 hover:text-destructive transition-all"
          aria-label={`Remove ${blockLabels[block.type]}`}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

function AddComponentPopover({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const filtered = blockMetadata.filter((b) =>
    b.label.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, typeof blockMetadata>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = []
    acc[b.category].push(b)
    return acc
  }, {})

  return (
    <div className="absolute bottom-[52px] left-2 right-2 bg-secondary border border-border rounded-lg p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-10 max-h-[280px] overflow-y-auto">
      <input
        autoFocus
        type="text"
        placeholder="Search components..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="w-full px-2 py-1.5 rounded border border-border bg-muted text-foreground text-[11.5px] outline-none focus:border-primary mb-1"
      />
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1.5 pt-2 pb-1">
            {category}
          </div>
          {items.map((meta) => {
            const Icon = blockIcons[meta.type] || Layout
            return (
              <button
                key={meta.type}
                onClick={() => { onAdd(meta.type); onClose() }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
              >
                <div className="w-[22px] h-[22px] rounded border border-border bg-muted flex items-center justify-center text-[10px] shrink-0">
                  <Icon size={12} />
                </div>
                <span>{meta.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{meta.variants.length}v</span>
              </button>
            )
          })}
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="px-2 py-3 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Search size={12} />
          No components match "{search}"
        </div>
      )}
    </div>
  )
}

export function LayersPanel() {
  const blocks = useConfigStore((s) => {
    const pages = s.config.pages
    if (!pages || pages.length === 0) return s.config.blocks
    const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
    return page.blocks
  })
  const { duplicateBlock, removeBlock, moveBlock, addBlock } = useConfigStore()
  const { selectedBlockId, selectBlock } = useEditorStore()
  const [showPopover, setShowPopover] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      moveBlock(oldIndex, newIndex)
    }
  }

  function handleAddBlock(type: BlockType) {
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
    toast(`${meta.label} added`)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Layers
        </span>
        <span className="text-[10px] text-muted-foreground">{blocks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableLayer
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => selectBlock(block.id)}
                onDuplicate={() => { duplicateBlock(block.id); toast('Block duplicated') }}
                onRemove={() => {
                  if (selectedBlockId === block.id) selectBlock(null)
                  removeBlock(block.id)
                  toast('Block removed', {
                    action: {
                      label: 'Undo',
                      onClick: () => {
                        useConfigStore.getState().undo()
                        toast('Block restored')
                      },
                    },
                    duration: 3000,
                  })
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add component */}
      <div className="p-2 border-t border-border relative">
        <button
          onClick={() => setShowPopover(!showPopover)}
          className="w-full py-2 rounded-md border border-dashed border-border text-muted-foreground text-xs flex items-center justify-center gap-1.5 transition-all hover:border-primary hover:text-primary hover:bg-primary-glow2"
        >
          <Plus size={13} />
          Add Component
        </button>
        {showPopover && (
          <AddComponentPopover onAdd={handleAddBlock} onClose={() => setShowPopover(false)} />
        )}
      </div>
    </div>
  )
}
