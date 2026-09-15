import { useState, useEffect } from 'react'
import { useImportStudioStore } from '../ImportStudioStore'
import type { ImportInspectorTab } from '../ImportStudioStore'
import { Palette, Settings2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { editorAdapter } from '../GrapesEditorAdapter'

const TABS = [
  { id: 'styles', icon: Palette, label: 'Styles' },
  { id: 'properties', icon: Settings2, label: 'Properties' },
] as const

export function ImportRightSidebar() {
  const { inspectorTab, setInspectorTab } = useImportStudioStore()
  
  const [component, setComponent] = useState<any>(null)
  const [styles, setStyles] = useState<Record<string, string>>({})
  const [traits, setTraits] = useState<any[]>([])
  const [content, setContent] = useState('')

  // Accordion state
  const [openSections, setOpenSections] = useState<string[]>(['layout', 'size', 'spacing', 'typography', 'background', 'borders'])

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    const updateSelection = () => {
      const selected = editor.getSelected()
      setComponent(selected || null)
      
      if (selected) {
        setStyles((selected.getStyle() as Record<string, string>) || {})
        setTraits(selected.get('traits')?.models || [])
        
        if (selected.get('type') === 'text' || selected.get('type') === 'textnode') {
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
    const editor = editorAdapter.getEditor()
    editor?.UndoManager.start()
    component.addStyle({ [prop]: value })
    editor?.UndoManager.stop()
    setStyles(prev => ({ ...prev, [prop]: value }))
  }

  const updateTrait = (trait: any, value: string) => {
    if (!component) return
    const editor = editorAdapter.getEditor()
    editor?.UndoManager.start()
    trait.set('value', value)
    editor?.UndoManager.stop()
  }

  const updateContent = (val: string) => {
    if (!component) return
    const editor = editorAdapter.getEditor()
    editor?.UndoManager.start()
    setContent(val)
    component.set('content', val)
    editor?.UndoManager.stop()
  }

  const handleDelete = () => {
    if (component) {
      component.remove()
    }
  }

  const AccordionSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => {
    const isOpen = openSections.includes(id)
    return (
      <div className="border-b border-border last:border-0">
        <button 
          onClick={() => toggleSection(id)}
          className="w-full h-10 px-4 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-secondary/50 transition-colors"
        >
          <span>{title}</span>
          {isOpen ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        </button>
        {isOpen && (
          <div className="p-4 pt-2 flex flex-col gap-4 animate-scale-in">
            {children}
          </div>
        )}
      </div>
    )
  }

  const PropertyInput = ({ label, prop, placeholder, type = 'text' }: { label: string, prop: string, placeholder?: string, type?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <input 
        type={type} 
        value={styles[prop] || ''} 
        placeholder={placeholder}
        onChange={(e) => updateStyle(prop, e.target.value)}
        className="w-full bg-secondary/30 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* TABS */}
      <div className="h-14 border-b border-border flex items-center px-4 gap-2 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = inspectorTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setInspectorTab(tab.id as ImportInspectorTab)}
              className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                isActive ? 'bg-primary text-primary-foreground font-semibold' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              title={tab.label}
            >
              <Icon size={14} className={isActive ? '' : 'text-muted-foreground'} />
              <span className="text-[11px] ml-1.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!component ? (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <span className="text-xs text-muted-foreground border border-dashed border-border p-4 rounded-xl">Selecione um elemento no canvas para editar propriedades.</span>
          </div>
        ) : (
          <div className="flex flex-col pb-10">
            {/* Header Elemento */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/10 shrink-0 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{component.get('type')?.[0]?.toUpperCase() || 'E'}</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {component.getName() || component.get('type') || component.get('tagName') || 'Element'}
                </div>
              </div>
              <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors" title="Apagar Elemento">
                <Trash2 size={14} />
              </button>
            </div>

            {inspectorTab === 'styles' && (
              <div className="flex flex-col">
                <AccordionSection id="layout" title="Layout">
                  <div className="grid grid-cols-2 gap-2">
                    <PropertyInput label="Display" prop="display" placeholder="block, flex" />
                    <PropertyInput label="Direction" prop="flex-direction" placeholder="row, col" />
                    <PropertyInput label="Justify" prop="justify-content" placeholder="center, space-between" />
                    <PropertyInput label="Align" prop="align-items" placeholder="center, start" />
                  </div>
                </AccordionSection>

                <AccordionSection id="size" title="Tamanho">
                  <div className="grid grid-cols-2 gap-2">
                    <PropertyInput label="Width" prop="width" placeholder="auto, 100%" />
                    <PropertyInput label="Height" prop="height" placeholder="auto, 100vh" />
                    <PropertyInput label="Min W" prop="min-width" />
                    <PropertyInput label="Min H" prop="min-height" />
                  </div>
                </AccordionSection>

                <AccordionSection id="spacing" title="Espaçamento (Margem & Padding)">
                  <div className="flex flex-col gap-3">
                    <PropertyInput label="Margem" prop="margin" placeholder="ex: 10px 20px" />
                    <PropertyInput label="Padding" prop="padding" placeholder="ex: 1rem" />
                  </div>
                </AccordionSection>

                <AccordionSection id="typography" title="Tipografia">
                  <div className="flex flex-col gap-3">
                    <PropertyInput label="Cor do Texto" prop="color" type="color" />
                    <div className="grid grid-cols-2 gap-2">
                      <PropertyInput label="Tamanho" prop="font-size" placeholder="16px, 1rem" />
                      <PropertyInput label="Peso" prop="font-weight" placeholder="400, bold" />
                    </div>
                    <PropertyInput label="Alinhamento" prop="text-align" placeholder="left, center, right" />
                  </div>
                </AccordionSection>

                <AccordionSection id="background" title="Fundo">
                  <PropertyInput label="Cor de Fundo" prop="background-color" type="color" />
                </AccordionSection>

                <AccordionSection id="borders" title="Bordas & Efeitos">
                  <div className="grid grid-cols-2 gap-2">
                    <PropertyInput label="Raio (Radius)" prop="border-radius" placeholder="8px" />
                    <PropertyInput label="Borda" prop="border" placeholder="1px solid #ccc" />
                  </div>
                  <div className="mt-1">
                    <PropertyInput label="Opacidade" prop="opacity" placeholder="0 - 1" />
                  </div>
                </AccordionSection>
              </div>
            )}

            {inspectorTab === 'properties' && (
              <div className="flex flex-col p-4 gap-4">
                {(component.get('type') === 'text' || component.get('type') === 'textnode') && (
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-medium text-muted-foreground">Conteúdo Textual</label>
                     <textarea 
                       value={content}
                       onChange={(e) => updateContent(e.target.value)}
                       className="w-full bg-secondary/30 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary min-h-[100px] resize-y custom-scrollbar"
                     />
                   </div>
                )}
                
                {traits.map(trait => (
                  <div key={trait.getId()} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">{trait.get('name') || trait.getId()}</label>
                    {trait.get('type') === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={trait.get('value')}
                          onChange={(e) => updateTrait(trait, e.target.checked ? 'true' : 'false')}
                          className="accent-primary"
                        />
                        <span className="text-xs text-foreground">Ativo</span>
                      </label>
                    ) : (
                      <input 
                        type="text" 
                        value={trait.get('value') || ''} 
                        onChange={(e) => updateTrait(trait, e.target.value)}
                        className="w-full bg-secondary/30 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    )}
                  </div>
                ))}

                {traits.length === 0 && component.get('type') !== 'text' && component.get('type') !== 'textnode' && (
                  <span className="text-xs text-muted-foreground italic">Nenhuma propriedade configurável para este elemento.</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
