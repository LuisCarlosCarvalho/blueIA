import { useState, useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { Move } from 'lucide-react'
import type { FreeElementPosition, BreakpointKey } from '@/blocks/types'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'

export interface FreeElementDef {
  id: string
  name?: string
  resizable?: 'all' | 'horizontal' | 'none'
  preserveRatio?: boolean
  defaultPosition: {
    desktop: FreeElementPosition
    tablet?: Partial<FreeElementPosition>
    mobile?: Partial<FreeElementPosition>
  }
  content: ReactNode
}

const HUMAN_NAME_MAP: Record<string, string> = {
  headline: 'Título',
  subheadline: 'Subtítulo',
  badge: 'Destaque',
  cta: 'Botões',
  primaryCta: 'Botão principal',
  secondaryCta: 'Botão secundário',
  image: 'Imagem',
}

interface FreeLayoutContainerProps {
  blockId: string
  elements: FreeElementDef[]
  minHeight?: number
  className?: string
}

export function FreeLayoutContainer({
  blockId,
  elements,
  minHeight = 480,
  className = '',
}: FreeLayoutContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const blocks = useConfigStore((s) => {
    const pages = s.config.pages
    if (!pages || pages.length === 0) return s.config.blocks
    const page = pages.find((p) => p.id === s.activePageId) ?? pages[0]
    return page.blocks
  })
  const updateBlock = useConfigStore((s) => s.updateBlock)
  const previewMode = useEditorStore((s) => s.previewMode)
  const viewport = useEditorStore((s) => s.viewport) as BreakpointKey

  const block = blocks.find((b) => b.id === blockId)
  const freeLayout = block?.layout?.freeLayout || {}

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [, setResizingId] = useState<string | null>(null)
  const [, setResizeHandle] = useState<string | null>(null)

  const [activeGuideX, setActiveGuideX] = useState<number | null>(null)
  const [activeGuideY, setActiveGuideY] = useState<number | null>(null)

  const dragStartRef = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
    origWidth: number
    origHeight: number
    ratio: number
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, origWidth: 0, origHeight: 0, ratio: 1 })

  function getResolvedPosition(elDef: FreeElementDef): FreeElementPosition {
    const elementId = elDef.id
    const desktopCustom = freeLayout.desktop?.[elementId]
    const tabletCustom = freeLayout.tablet?.[elementId]
    const mobileCustom = freeLayout.mobile?.[elementId]

    const desktopPos: FreeElementPosition = {
      ...elDef.defaultPosition.desktop,
      ...(desktopCustom || {}),
    }

    if (viewport === 'desktop') return desktopPos

    if (viewport === 'tablet') {
      return {
        ...desktopPos,
        ...(elDef.defaultPosition.tablet || {}),
        ...(tabletCustom || {}),
      }
    }

    const tabletPos = {
      ...desktopPos,
      ...(elDef.defaultPosition.tablet || {}),
      ...(tabletCustom || {}),
    }

    const mobilePos = {
      ...tabletPos,
      ...(elDef.defaultPosition.mobile || {}),
      ...(mobileCustom || {}),
    }

    const maxWidth = 340
    if (mobilePos.x + (mobilePos.width || 200) > maxWidth) {
      const clampedWidth = Math.min(mobilePos.width || 200, maxWidth - 20)
      const clampedX = Math.max(10, Math.min(mobilePos.x, maxWidth - clampedWidth))
      return { ...mobilePos, x: clampedX, width: clampedWidth }
    }

    return mobilePos
  }

  function handleSavePosition(elementId: string, newPos: Partial<FreeElementPosition>) {
    if (!block) return
    const currentBucket = freeLayout[viewport] || {}
    const elementDef = elements.find((e) => e.id === elementId)
    if (!elementDef) return

    const resolved = getResolvedPosition(elementDef)
    const updatedPos: FreeElementPosition = {
      ...resolved,
      ...newPos,
    }

    const updatedFreeLayout = {
      ...freeLayout,
      [viewport]: {
        ...currentBucket,
        [elementId]: updatedPos,
      },
    }

    updateBlock(blockId, {
      layout: {
        ...(block.layout || {}),
        freeLayout: updatedFreeLayout,
      },
    })
  }

  function startDrag(e: ReactPointerEvent, elementId: string) {
    if (previewMode) return
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    setSelectedElementId(elementId)
    setDraggingId(elementId)

    const elDef = elements.find((el) => el.id === elementId)
    if (!elDef) return
    const pos = getResolvedPosition(elDef)

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      origWidth: pos.width || 240,
      origHeight: pos.height || 60,
      ratio: (pos.width || 240) / (pos.height || 60),
    }

    function onPointerMove(moveEvent: PointerEvent) {
      const dx = moveEvent.clientX - dragStartRef.current.startX
      const dy = moveEvent.clientY - dragStartRef.current.startY

      const cWidth = container?.clientWidth || 1000
      const cHeight = container?.clientHeight || minHeight
      const elWidth = dragStartRef.current.origWidth
      const elHeight = dragStartRef.current.origHeight

      let nextX = Math.max(0, Math.min(dragStartRef.current.origX + dx, cWidth - elWidth))
      let nextY = Math.max(0, Math.min(dragStartRef.current.origY + dy, cHeight - elHeight))

      const centerX = (cWidth - elWidth) / 2
      if (Math.abs(nextX - centerX) < 12) {
        nextX = centerX
        setActiveGuideX(cWidth / 2)
      } else {
        setActiveGuideX(null)
      }

      handleSavePosition(elementId, { x: Math.round(nextX), y: Math.round(nextY) })
    }

    function onPointerUp() {
      setDraggingId(null)
      setActiveGuideX(null)
      setActiveGuideY(null)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function startResize(e: ReactPointerEvent, elementId: string, handle: string) {
    if (previewMode) return
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    setResizingId(elementId)
    setResizeHandle(handle)

    const elDef = elements.find((el) => el.id === elementId)
    if (!elDef) return
    const pos = getResolvedPosition(elDef)
    const preserveRatio = elDef.preserveRatio !== false && elDef.id === 'image'

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      origWidth: pos.width || 240,
      origHeight: pos.height || 60,
      ratio: (pos.width || 240) / (pos.height || 60),
    }

    function onPointerMove(moveEvent: PointerEvent) {
      const dx = moveEvent.clientX - dragStartRef.current.startX
      const dy = moveEvent.clientY - dragStartRef.current.startY

      const cWidth = container?.clientWidth || 1000
      const cHeight = container?.clientHeight || minHeight
      const orig = dragStartRef.current

      let newWidth = orig.origWidth
      let newHeight = orig.origHeight
      let newX = orig.origX
      let newY = orig.origY

      if (handle.includes('e')) {
        newWidth = Math.max(80, Math.min(orig.origWidth + dx, cWidth - orig.origX))
      }
      if (handle.includes('w')) {
        const potentialWidth = orig.origWidth - dx
        if (potentialWidth >= 80 && orig.origX + dx >= 0) {
          newWidth = potentialWidth
          newX = orig.origX + dx
        }
      }

      if (preserveRatio && (handle === 'se' || handle === 'ne' || handle === 'sw' || handle === 'nw')) {
        newHeight = Math.round(newWidth / orig.ratio)
        if (handle.includes('n')) {
          newY = orig.origY + (orig.origHeight - newHeight)
        }
      } else {
        if (handle.includes('s')) {
          newHeight = Math.max(30, Math.min(orig.origHeight + dy, cHeight - orig.origY))
        }
        if (handle.includes('n')) {
          const potentialHeight = orig.origHeight - dy
          if (potentialHeight >= 30 && orig.origY + dy >= 0) {
            newHeight = potentialHeight
            newY = orig.origY + dy
          }
        }
      }

      const savePayload: Partial<FreeElementPosition> = {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newWidth),
      }

      if (elDef?.resizable === 'all' || elDef?.id === 'image') {
        savePayload.height = Math.round(newHeight)
      }

      handleSavePosition(elementId, savePayload)
    }

    function onPointerUp() {
      setResizingId(null)
      setResizeHandle(null)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none transition-all ${className}`}
      style={{ minHeight }}
      onClick={(e) => {
        e.stopPropagation()
        useEditorStore.getState().selectBlock(blockId)
        useEditorStore.getState().selectElement(null)
        setSelectedElementId(null)
      }}
    >
      {/* Guia visual de alinhamento central */}
      {activeGuideX !== null && (
        <div
          className="absolute top-0 bottom-0 border-l border-dashed border-primary/80 z-40 pointer-events-none animate-pulse"
          style={{ left: `${activeGuideX}px` }}
        />
      )}
      {activeGuideY !== null && (
        <div
          className="absolute left-0 right-0 border-t border-dashed border-primary/80 z-40 pointer-events-none animate-pulse"
          style={{ top: `${activeGuideY}px` }}
        />
      )}

      {/* Elementos Livres */}
      {elements.map((elDef) => {
        const pos = getResolvedPosition(elDef)
        const isSelected =
          (selectedElementId === elDef.id ||
            useEditorStore.getState().selectedElementId === `${blockId}.${elDef.id}`) &&
          !previewMode
        const isDragging = draggingId === elDef.id
        const isOverriddenInBreakpoint = Boolean(freeLayout[viewport]?.[elDef.id])
        const humanName = elDef.name || HUMAN_NAME_MAP[elDef.id] || 'Elemento'

        const resizableMode = elDef.resizable ?? (elDef.id === 'image' ? 'all' : elDef.id === 'badge' ? 'none' : 'horizontal')
        const handles =
          resizableMode === 'all'
            ? ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w']
            : resizableMode === 'horizontal'
            ? ['e', 'w']
            : []

        return (
          <div
            key={elDef.id}
            data-element-id={`${blockId}.${elDef.id}`}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedElementId(elDef.id)
              useEditorStore.getState().selectBlock(blockId)
              useEditorStore.getState().selectElement(`${blockId}.${elDef.id}`)
            }}
            onPointerDown={(e) => {
              useEditorStore.getState().selectBlock(blockId)
              useEditorStore.getState().selectElement(`${blockId}.${elDef.id}`)
              startDrag(e, elDef.id)
            }}
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: pos.width ? `${pos.width}px` : 'auto',
              height: resizableMode === 'all' && pos.height ? `${pos.height}px` : 'auto',
              zIndex: isSelected ? 30 : pos.zIndex || 10,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            className={`transition-shadow group/free-el ${
              isSelected
                ? 'ring-2 ring-primary ring-offset-1 rounded-sm shadow-xl'
                : 'hover:ring-1 hover:ring-primary/40 rounded-xs'
            }`}
          >
            {/* Wix Studio-Style Selection Frame & Controls */}
            {isSelected && (
              <>
                {/* Drag Handle Top Bar Pill - Mostra estritamente o nome amigável humano */}
                <div
                  className="absolute -top-7 left-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-t-md bg-primary text-primary-foreground text-[10px] font-bold shadow-md cursor-grab active:cursor-grabbing select-none pointer-events-auto z-40"
                  onPointerDown={(e) => startDrag(e, elDef.id)}
                >
                  <Move size={10} />
                  <span>{humanName}</span>
                  {isOverriddenInBreakpoint && (
                    <span className="px-1 py-0.2 rounded-xs bg-black/30 text-[9px] font-normal uppercase">
                      {viewport}
                    </span>
                  )}
                </div>

                {/* Dimension Badge */}
                <div className="absolute -bottom-6 right-0 px-1.5 py-0.5 rounded-xs bg-background/90 text-foreground border border-border text-[9px] font-mono shadow-xs select-none pointer-events-none z-40">
                  {Math.round(pos.width || 200)}px
                </div>

                {/* Resize Handles apropriados conforme tipo de elemento */}
                {handles.map((handle) => {
                  const getHandleClass = () => {
                    switch (handle) {
                      case 'nw': return '-top-1.5 -left-1.5 cursor-nwse-resize'
                      case 'ne': return '-top-1.5 -right-1.5 cursor-nesw-resize'
                      case 'se': return '-bottom-1.5 -right-1.5 cursor-nwse-resize'
                      case 'sw': return '-bottom-1.5 -left-1.5 cursor-nesw-resize'
                      case 'n': return '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize'
                      case 's': return '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize'
                      case 'e': return 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize'
                      case 'w': return 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize'
                      default: return ''
                    }
                  }

                  return (
                    <div
                      key={handle}
                      onPointerDown={(e) => startResize(e, elDef.id, handle)}
                      className={`absolute w-3 h-3 rounded-full bg-primary border-2 border-background shadow-xs z-40 pointer-events-auto ${getHandleClass()}`}
                    />
                  )
                })}
              </>
            )}

            {/* Conteúdo do Elemento Livre */}
            <div className="w-full h-full pointer-events-auto">
              {elDef.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
