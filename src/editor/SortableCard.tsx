import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'

interface SortableCardProps {
  id: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function SortableCard({ id, children, className = '', actions }: SortableCardProps) {
  const previewMode = useEditorStore((s) => s.previewMode)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id, disabled: previewMode })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
    opacity: isDragging ? 0.4 : 1,
  }

  if (previewMode) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group/sortable-card transition-all ${className} ${
        isDragging ? 'shadow-2xl ring-2 ring-primary/80 scale-[0.98] cursor-grabbing' : ''
      } ${isOver && !isDragging ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_16px_rgba(59,130,246,0.6)]' : ''}`}
    >
      {/* Alça discreta e ações do cartão */}
      <div
        className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/sortable-card:opacity-100 transition-opacity z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 rounded-md bg-background/90 border border-border text-muted-foreground hover:text-primary hover:border-primary/40 shadow-xs cursor-grab active:cursor-grabbing transition-all"
          title="Arrastar para reordenar cartão"
        >
          <GripVertical size={12} />
        </button>
        {actions}
      </div>

      {/* Conteúdo com desativação temporária durante o drag */}
      <div className={isDragging ? 'pointer-events-none select-none opacity-60' : ''}>
        {children}
      </div>
    </div>
  )
}

