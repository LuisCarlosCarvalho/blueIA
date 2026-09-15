import { useEffect, useState, useRef } from 'react'
import { Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { editorAdapter } from '../GrapesEditorAdapter'

export function ContextToolbar() {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [elementName, setElementName] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    const selected = editor.getSelected()
    if (!selected) {
      setIsVisible(false)
      return
    }

    const el = selected.getEl()
    if (!el) {
      setIsVisible(false)
      return
    }

    // Canvas iframe wrapper
    const canvas = editor.Canvas
    const iframe = canvas.getFrameEl()
    if (!iframe) return

    const iframeRect = iframe.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    // Calculate position relative to the viewport
    // elRect is relative to the iframe's viewport.
    // We add iframeRect.top/left to get absolute position on screen.
    let top = iframeRect.top + elRect.top - 40 // 40px above the element
    let left = iframeRect.left + elRect.left

    // If toolbar goes above the iframe, place it inside the element or below it
    if (top < iframeRect.top) {
      top = iframeRect.top + elRect.top + 10 // push inside
    }

    // Clamp left to avoid going outside screen/iframe
    const maxLeft = iframeRect.right - 150 // approximate toolbar width
    if (left > maxLeft) left = maxLeft
    if (left < iframeRect.left) left = iframeRect.left

    // Check if element is completely scrolled out of view
    if (elRect.bottom < 0 || elRect.top > iframeRect.height) {
      setIsVisible(false)
      return
    }

    setPosition({ top, left })
    setElementName(selected.getName() || selected.get('type') || 'Elemento')
    setIsVisible(true)
  }

  useEffect(() => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    const handleSelect = () => updatePosition()
    const handleDeselect = () => setIsVisible(false)
    const handleUpdate = () => {
      if (editor.getSelected()) updatePosition()
    }

    editor.on('component:selected', handleSelect)
    editor.on('component:deselected', handleDeselect)
    editor.on('canvas:scroll', handleUpdate)
    editor.on('canvas:update', handleUpdate)
    editor.on('frame:scroll', handleUpdate)
    editor.on('component:update', handleUpdate)

    // Resize observer on the wrapper
    const resizeObserver = new ResizeObserver(() => handleUpdate())
    const canvasWrapper = document.querySelector('.gjs-cv-canvas')
    if (canvasWrapper) resizeObserver.observe(canvasWrapper)

    window.addEventListener('resize', handleUpdate)

    return () => {
      editor.off('component:selected', handleSelect)
      editor.off('component:deselected', handleDeselect)
      editor.off('canvas:scroll', handleUpdate)
      editor.off('canvas:update', handleUpdate)
      editor.off('frame:scroll', handleUpdate)
      editor.off('component:update', handleUpdate)
      window.removeEventListener('resize', handleUpdate)
      resizeObserver.disconnect()
    }
  }, [])

  if (!isVisible) return null

  const handleDuplicate = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const selected = editor.getSelected()
    if (selected) {
      const collection = selected.collection
      if (collection) {
        const index = collection.indexOf(selected)
        collection.add(selected.clone(), { at: index + 1 })
      }
    }
  }

  const handleDelete = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const selected = editor.getSelected()
    if (selected) {
      selected.remove()
      setIsVisible(false)
    }
  }

  const handleMoveUp = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const selected = editor.getSelected()
    if (selected) {
      const collection = selected.collection
      if (collection) {
        const index = collection.indexOf(selected)
        if (index > 0) {
          collection.remove(selected)
          collection.add(selected, { at: index - 1 })
          editor.select(selected)
        }
      }
    }
  }

  const handleMoveDown = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const selected = editor.getSelected()
    if (selected) {
      const collection = selected.collection
      if (collection) {
        const index = collection.indexOf(selected)
        if (index < collection.length - 1) {
          collection.remove(selected)
          collection.add(selected, { at: index + 1 })
          editor.select(selected)
        }
      }
    }
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center bg-primary text-primary-foreground rounded-lg shadow-xl px-1 py-1 gap-1 animate-scale-in"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider select-none border-r border-primary-foreground/20">
        {elementName}
      </div>
      
      <button 
        onClick={handleMoveUp}
        className="p-1.5 hover:bg-black/20 rounded-md transition-colors"
        title="Mover para Cima"
      >
        <ArrowUp size={14} />
      </button>
      
      <button 
        onClick={handleMoveDown}
        className="p-1.5 hover:bg-black/20 rounded-md transition-colors"
        title="Mover para Baixo"
      >
        <ArrowDown size={14} />
      </button>

      <button 
        onClick={handleDuplicate}
        className="p-1.5 hover:bg-black/20 rounded-md transition-colors"
        title="Duplicar"
      >
        <Copy size={14} />
      </button>
      
      <button 
        onClick={handleDelete}
        className="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors"
        title="Apagar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
