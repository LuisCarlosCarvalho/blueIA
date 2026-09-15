import { useState, useEffect } from 'react'
import { useImportStudioStore } from '../ImportStudioStore'
import type { ImportInspectorTab } from '../ImportStudioStore'
import { Palette, Settings2, Trash2 } from 'lucide-react'
import { editorAdapter } from '../GrapesEditorAdapter'

const TABS = [
  { id: 'styles', icon: Palette, label: 'Styles' },
  { id: 'properties', icon: Settings2, label: 'Properties' },
] as const

export function ImportRightSidebar() {
  const { inspectorTab, setInspectorTab } = useImportStudioStore()
  
  const [component, setComponent] = useState<any>(null)
  
  // Style states
  const [styles, setStyles] = useState<Record<string, string>>({})
  
  // Property states
  const [traits, setTraits] = useState<any[]>([])
  const [content, setContent] = useState('')

  useEffect(() => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    const updateSelection = () => {
      const selected = editor.getSelected()
      setComponent(selected || null)
      
      if (selected) {
        setStyles((selected.getStyle() as Record<string, string>) || {})
        setTraits(selected.get('traits')?.models || [])
        
        // Handle inner content for text components
        if (selected.get('type') === 'text' || selected.get('type') === 'textnode') {
           // GrapesJS stores content differently sometimes, but typically:
           setContent(selected.components().length > 0 ? '' : (selected.get('content') || ''))
        }
      }
    }

    updateSelection()
    editor.on('component:selected component:deselected component:update', updateSelection)
    
    return () => {
      editor.off('component:selected component:deselected component:update', updateSelection)
    }
  }, [])

  const updateStyle = (prop: string, value: string) => {
    if (!component) return
    component.addStyle({ [prop]: value })
    setStyles({ ...styles, [prop]: value })
  }

  const updateTrait = (trait: any, value: string) => {
    if (!component) return
    trait.set('value', value)
  }

  const updateContent = (val: string) => {
    if (!component) return
    setContent(val)
    component.set('content', val)
  }

  const handleDelete = () => {
    if (component) {
      component.remove()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="h-12 border-b border-border flex items-center px-2 gap-1 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = inspectorTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setInspectorTab(tab.id as ImportInspectorTab)}
              className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title={tab.label}
            >
              <Icon size={16} />
              <span className="text-xs ml-1 font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!component ? (
          <div className="h-full flex items-center justify-center text-center">
            <span className="text-sm text-muted-foreground">Select an element on the canvas to edit its properties.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {component.get('type') || component.get('tagName') || 'Element'}
              </div>
              <button onClick={handleDelete} className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete component">
                <Trash2 size={14} />
              </button>
            </div>

            {inspectorTab === 'styles' && (
              <div className="flex flex-col gap-4">
                {/* Basic CSS inputs */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Color</label>
                  <input 
                    type="color" 
                    value={styles['color'] || '#000000'} 
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-full h-8 rounded border border-border" 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Background</label>
                  <input 
                    type="color" 
                    value={styles['background-color'] || '#ffffff'} 
                    onChange={(e) => updateStyle('background-color', e.target.value)}
                    className="w-full h-8 rounded border border-border" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Padding</label>
                  <input 
                    type="text" 
                    value={styles['padding'] || ''} 
                    placeholder="e.g. 10px 20px"
                    onChange={(e) => updateStyle('padding', e.target.value)}
                    className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Margin</label>
                  <input 
                    type="text" 
                    value={styles['margin'] || ''} 
                    placeholder="e.g. 10px auto"
                    onChange={(e) => updateStyle('margin', e.target.value)}
                    className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Border Radius</label>
                  <input 
                    type="text" 
                    value={styles['border-radius'] || ''} 
                    placeholder="e.g. 8px"
                    onChange={(e) => updateStyle('border-radius', e.target.value)}
                    className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {inspectorTab === 'properties' && (
              <div className="flex flex-col gap-4">
                {component.get('type') === 'text' && (
                   <div className="flex flex-col gap-2">
                     <label className="text-xs font-medium text-muted-foreground">Content</label>
                     <textarea 
                       value={content}
                       onChange={(e) => updateContent(e.target.value)}
                       className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary min-h-[80px]"
                     />
                   </div>
                )}
                
                {traits.map(trait => (
                  <div key={trait.getId()} className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-muted-foreground">{trait.get('name') || trait.getId()}</label>
                    {trait.get('type') === 'checkbox' ? (
                      <input 
                        type="checkbox" 
                        checked={trait.get('value')}
                        onChange={(e) => updateTrait(trait, e.target.checked ? 'true' : 'false')}
                      />
                    ) : (
                      <input 
                        type="text" 
                        value={trait.get('value') || ''} 
                        onChange={(e) => updateTrait(trait, e.target.value)}
                        className="w-full bg-muted border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
