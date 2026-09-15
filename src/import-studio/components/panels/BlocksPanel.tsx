import { useEffect, useRef } from 'react'
import { editorAdapter } from '../../GrapesEditorAdapter'
import { Type, Square, Columns, Heading1, MousePointerClick, Image as ImageIcon, Minus, AlignVerticalSpaceAround } from 'lucide-react'

const BLOCKS = [
  { id: 'section', label: 'Section', icon: Square, content: '<section style="padding: 50px; min-height: 100px; background-color: #f8f9fa;" data-gjs-type="default">Section</section>' },
  { id: 'column-1', label: '1 Column', icon: Square, content: '<div style="display: flex; padding: 20px;" data-gjs-type="default"><div style="flex: 1; min-height: 50px; border: 1px dashed #ccc;" data-gjs-type="default"></div></div>' },
  { id: 'column-2', label: '2 Columns', icon: Columns, content: '<div style="display: flex; padding: 20px;" data-gjs-type="default"><div style="flex: 1; min-height: 50px; border: 1px dashed #ccc;" data-gjs-type="default"></div><div style="flex: 1; min-height: 50px; border: 1px dashed #ccc;" data-gjs-type="default"></div></div>' },
  { id: 'heading', label: 'Heading', icon: Heading1, content: '<h2 data-gjs-type="text">Heading</h2>' },
  { id: 'text', label: 'Text', icon: Type, content: '<p data-gjs-type="text">Insert your text here</p>' },
  { id: 'button', label: 'Button', icon: MousePointerClick, content: '<a href="#" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;" data-gjs-type="link">Button</a>' },
  { id: 'image', label: 'Image', icon: ImageIcon, content: { type: 'image', activeOnRender: 1 } },
  { id: 'divider', label: 'Divider', icon: Minus, content: '<hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" data-gjs-type="default" />' },
  { id: 'spacer', label: 'Spacer', icon: AlignVerticalSpaceAround, content: '<div style="height: 50px;" data-gjs-type="default"></div>' },
]

export function BlocksPanel() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    // Register blocks in GrapesJS
    BLOCKS.forEach(b => {
      if (!editor.BlockManager.get(b.id)) {
        editor.BlockManager.add(b.id, {
          label: b.label,
          content: b.content
        })
      }
    })
  }, [])

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, blockId: string) => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const block = editor.BlockManager.get(blockId)
    if (block) {
      e.dataTransfer.setData('text/plain', blockId)
    }
  }

  const handleClick = (blockId: string) => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const block = editor.BlockManager.get(blockId)
    if (block) {
      const selected = editor.getSelected()
      const content = block.get('content') as any
      if (selected) {
        selected.append(content)
      } else {
        editor.getWrapper()?.append(content)
      }
    }
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4" ref={containerRef}>
      <h3 className="text-sm font-semibold text-foreground">Basic Blocks</h3>
      <div className="grid grid-cols-2 gap-2">
        {BLOCKS.map(block => {
          const Icon = block.icon
          return (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onClick={() => handleClick(block.id)}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-muted rounded-lg border border-border cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all group"
            >
              <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-medium text-foreground">{block.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
