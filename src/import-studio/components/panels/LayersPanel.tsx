import { useEffect, useState } from 'react'
import { editorAdapter } from '../../GrapesEditorAdapter'
import { ChevronRight, ChevronDown, Layers, Box, Type, Image as ImageIcon, Link } from 'lucide-react'

// Simple recursive component to render GrapesJS components tree
function LayerItem({ component, level = 0 }: { component: any, level?: number }) {
  const [expanded, setExpanded] = useState(level < 2)
  const [isSelected, setIsSelected] = useState(false)
  const [name, setName] = useState('')
  
  useEffect(() => {
    setName(component.getName() || component.get('type') || component.get('tagName') || 'Element')
    
    const editor = editorAdapter.getEditor()
    if (!editor) return
    
    // Check if currently selected
    const checkSelected = () => {
      const selected = editor.getSelected()
      setIsSelected(selected === component)
    }
    
    checkSelected()
    editor.on('component:selected component:deselected', checkSelected)
    
    return () => {
      editor.off('component:selected component:deselected', checkSelected)
    }
  }, [component])
  
  const components = component.components().models || []
  const hasChildren = components.length > 0

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const editor = editorAdapter.getEditor()
    if (editor) {
      editor.select(component)
    }
  }

  const getIcon = () => {
    const type = component.get('type')
    if (type === 'text') return <Type size={12} />
    if (type === 'image') return <ImageIcon size={12} />
    if (type === 'link') return <Link size={12} />
    if (type === 'wrapper') return <Layers size={12} />
    return <Box size={12} />
  }

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer text-xs rounded-sm transition-colors ${isSelected ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div 
          className="w-4 h-4 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {hasChildren ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-4" />}
        </div>
        {getIcon()}
        <span className="truncate">{name}</span>
      </div>
      
      {expanded && hasChildren && (
        <div className="flex flex-col w-full">
          {components.map((child: any) => (
            <LayerItem key={child.getId()} component={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function LayersPanel() {
  const [wrapper, setWrapper] = useState<any>(null)

  useEffect(() => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    
    const updateWrapper = () => {
      setWrapper(editor.getWrapper())
    }
    
    updateWrapper()
    editor.on('load', updateWrapper)
    // Update when components are added/removed
    editor.on('component:add component:remove', updateWrapper)
    
    return () => {
      editor.off('load', updateWrapper)
      editor.off('component:add component:remove', updateWrapper)
    }
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Pages & Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {wrapper ? (
          <LayerItem component={wrapper} />
        ) : (
          <div className="text-xs text-muted-foreground text-center p-4">Loading layers...</div>
        )}
      </div>
    </div>
  )
}
