import { useState } from 'react'
import { ImageIcon, Plus, Copy, Trash2 } from 'lucide-react'
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

interface GalleryImage {
  id?: string
  src?: string
  alt?: string
  caption?: string
}

interface GalleryProps {
  title?: string
  images?: GalleryImage[]
}

const defaultImages: GalleryImage[] = [
  { id: 'img-1', alt: 'Imagem 1', caption: 'Projeto 1' },
  { id: 'img-2', alt: 'Imagem 2', caption: 'Projeto 2' },
  { id: 'img-3', alt: 'Imagem 3', caption: 'Projeto 3' },
  { id: 'img-4', alt: 'Imagem 4', caption: 'Projeto 4' },
  { id: 'img-5', alt: 'Imagem 5', caption: 'Projeto 5' },
  { id: 'img-6', alt: 'Imagem 6', caption: 'Projeto 6' },
]

export function GalleryBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const previewMode = useEditorStore((s) => s.previewMode)
  const { variant, props } = block
  const galleryProps = (props || {}) as unknown as GalleryProps
  const rawImages = galleryProps.images && galleryProps.images.length > 0
    ? galleryProps.images
    : defaultImages
  const images: GalleryImage[] = rawImages.map((img, idx) => ({
    ...img,
    id: img.id || `gallery-img-${idx}`,
  }))
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(images, oldIndex, newIndex)
      updateBlockProps(block.id, { images: reordered })
      toast.success('Ordem das imagens atualizada')
    }
  }

  function handleUpdateCaption(index: number, caption: string) {
    const updated = images.map((img, i) => (i === index ? { ...img, caption } : img))
    updateBlockProps(block.id, { images: updated })
  }

  function handleAddImage() {
    const newImg: GalleryImage = {
      id: `img-${Date.now()}`,
      alt: `Nova Imagem ${images.length + 1}`,
      caption: 'Nova Legenda',
    }
    const updated = [...images, newImg]
    updateBlockProps(block.id, { images: updated })
  }

  function handleDuplicateImage(index: number) {
    const img = images[index]
    const clone = { ...img, id: `img-${Date.now()}`, caption: `${img.caption || 'Imagem'} (Cópia)` }
    const updated = [...images.slice(0, index + 1), clone, ...images.slice(index + 1)]
    updateBlockProps(block.id, { images: updated })
  }

  function handleRemoveImage(index: number) {
    const updated = images.filter((_, i) => i !== index)
    updateBlockProps(block.id, { images: updated })
    setDeleteIndex(null)
  }

  return (
    <div className="px-6 py-12 @lg:px-16 @lg:py-16">
      {galleryProps.title && (
        <h2 className="reveal-fade-up reveal-d1 text-2xl font-bold tracking-tight mb-8 text-center">
          <InlineText
            value={galleryProps.title}
            as="h2"
            onChange={(val) => updateBlockProps(block.id, { title: val })}
          />
        </h2>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((img, idx) => img.id || `gallery-img-${idx}`)} strategy={rectSortingStrategy}>
          <div className={variant === 'masonry' ? 'grid grid-cols-2 @lg:grid-cols-3 auto-rows-[160px] gap-4' : 'grid grid-cols-2 @lg:grid-cols-3 gap-4'}>
            {images.map((img, i) => {
              const cardId = img.id || `gallery-img-${i}`
              const cardActions = (
                <>
                  <button
                    type="button"
                    onClick={() => handleDuplicateImage(i)}
                    className="p-1 rounded bg-background/80 text-muted-foreground hover:text-foreground shadow-xs"
                    title="Duplicar imagem"
                  >
                    <Copy size={10} />
                  </button>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(i)}
                      className="p-1 rounded bg-background/80 text-muted-foreground hover:text-destructive shadow-xs"
                      title="Remover imagem"
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
                  className={`rounded-xl overflow-hidden border border-border bg-secondary flex flex-col group ${variant === 'masonry' && i % 3 === 0 ? 'row-span-2' : ''}`}
                >
                  <div className="w-full flex-1 min-h-[140px] bg-gradient-to-br from-bg-3 to-bg-4 flex items-center justify-center relative overflow-hidden">
                    {img.src ? (
                      <img src={img.src} alt={img.alt || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                        <ImageIcon size={28} className="opacity-60" />
                        <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">Imagem</span>
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2 bg-secondary/80 border-t border-border/40 text-[11.5px] text-muted-foreground">
                    <InlineText
                      value={img.caption || 'Adicionar legenda'}
                      onChange={(val) => handleUpdateCaption(i, val)}
                    />
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
              handleAddImage()
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all"
          >
            <Plus size={13} />
            <span>Adicionar Imagem</span>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteIndex !== null}
        title="Remover Imagem"
        itemName={deleteIndex !== null ? images[deleteIndex]?.caption || images[deleteIndex]?.alt : undefined}
        description="Tem a certeza que deseja remover esta imagem da galeria?"
        onConfirm={() => {
          if (deleteIndex !== null) handleRemoveImage(deleteIndex)
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  )
}
