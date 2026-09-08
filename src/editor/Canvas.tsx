import { useMemo } from 'react'
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
} from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { CanvasEmpty } from './CanvasEmpty'
import { BlockWrapper } from '@/blocks/BlockWrapper'
import { RenderBlock } from '@/blocks/registry'
import { resolveTheme, themeToCSS } from '@/lib/theme-presets'
import { useGoogleFonts } from '@/lib/useGoogleFonts'

export function Canvas() {
  const blocks = useConfigStore((s) => {
    const pages = s.config.pages
    if (!pages || pages.length === 0) return s.config.blocks
    const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
    return page.blocks
  })
  const moveBlock = useConfigStore((s) => s.moveBlock)
  const theme = useConfigStore((s) => s.config.theme)
  const { selectedBlockId, selectBlock, viewport, zoom, previewMode } = useEditorStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement so regular clicks on buttons/inputs/text work immediately
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const cssVars = useMemo(() => themeToCSS(resolved), [resolved])
  useGoogleFonts([resolved.fontSans, resolved.fontDisplay, resolved.fontMono])

  const maxWidth = viewport === 'desktop' ? '1200px' : viewport === 'tablet' ? '768px' : '375px'

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      moveBlock(oldIndex, newIndex)
      toast.success('Ordem das secções atualizada')
    }
  }

  if (blocks.length === 0) {
    return <CanvasEmpty />
  }

  const canvasContent = (
    <div
      className="@container border rounded-xl min-h-[400px] relative z-[1] overflow-hidden transition-all duration-300"
      style={{
        width: '100%',
        maxWidth,
        ...cssVars,
        color: 'var(--color-text-0)',
        backgroundColor: 'var(--color-bg-1)',
        borderColor: 'var(--color-border-default)',
      } as React.CSSProperties}
      onClick={(e) => {
        if (e.target === e.currentTarget) selectBlock(null)
      }}
      role="region"
      aria-label={`Site preview, ${blocks.length} blocks, ${viewport} viewport`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
          disabled={previewMode}
        >
          {blocks.map((block) => (
            <BlockWrapper
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={() => selectBlock(block.id)}
            >
              <RenderBlock block={block} />
            </BlockWrapper>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )

  return (
    <div className="flex-1 flex items-start justify-center p-6 overflow-auto relative">
      {/* Dot grid background */}
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
        {viewport === 'tablet' ? (
          <div>
            {/* Tablet frame */}
            <div className="border-[12px] border-bg-4 rounded-2xl bg-muted shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="rounded-lg overflow-hidden">
                {canvasContent}
              </div>
            </div>
          </div>
        ) : viewport === 'mobile' ? (
          <div>
            {/* Phone frame */}
            <div className="border-[10px] border-bg-4 rounded-[2rem] bg-muted shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              {/* Notch */}
              <div className="flex justify-center -mt-[4px] mb-1">
                <div className="w-24 h-5 bg-muted rounded-b-xl" />
              </div>
              <div className="rounded-xl overflow-hidden">
                {canvasContent}
              </div>
              {/* Home indicator */}
              <div className="flex justify-center mt-2 pb-1">
                <div className="w-28 h-1 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          canvasContent
        )}
      </div>
    </div>
  )
}
