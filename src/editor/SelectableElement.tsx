import { type ReactNode, type MouseEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'

interface SelectableElementProps {
  id: string
  name: string
  blockId: string
  children: ReactNode
  className?: string
}

export function SelectableElement({
  id,
  name,
  blockId,
  children,
  className = '',
}: SelectableElementProps) {
  const previewMode = useEditorStore((s) => s.previewMode)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const selectBlock = useEditorStore((s) => s.selectBlock)

  const isSelected = selectedElementId === id && !previewMode

  if (previewMode) {
    return <div className={`inline-block max-w-full ${className}`}>{children}</div>
  }

  function handleClick(e: MouseEvent) {
    e.stopPropagation()
    selectBlock(blockId)
    selectElement(id)
  }

  return (
    <div
      onClick={handleClick}
      data-element-id={id}
      className={`relative inline-block max-w-full transition-all duration-150 group/selectable ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-sm z-30 shadow-md'
          : 'hover:ring-1 hover:ring-primary/40 rounded-xs'
      } ${className}`}
    >
      {/* Barra de Ações Contextuais Exclusiva do Elemento Interno */}
      {isSelected && (
        <>
          <div
            className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-foreground text-background text-[10px] font-semibold shadow-xl whitespace-nowrap animate-scale-in z-40 select-none pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sparkles size={10} className="text-primary" />
            <span>{name}</span>
          </div>

          {/* 4 Corner Anchors para feedback visual de seleção de elemento pontual */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-xs pointer-events-none ring-1 ring-background z-40" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-xs pointer-events-none ring-1 ring-background z-40" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-xs pointer-events-none ring-1 ring-background z-40" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-xs pointer-events-none ring-1 ring-background z-40" />
        </>
      )}

      {children}
    </div>
  )
}

