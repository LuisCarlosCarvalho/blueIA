import { useEffect, useState } from 'react'
import { editorAdapter } from '../../GrapesEditorAdapter'
import { Palette, Type } from 'lucide-react'

export function GlobalStylesPanel() {
  const [primaryColor, setPrimaryColor] = useState('#22d3ee')
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif')
  const [bodyBg, setBodyBg] = useState('#0b0e14')
  const [bodyColor, setBodyColor] = useState('#b7b7b7')

  useEffect(() => {
    // Ideally we load existing global styles from the editor here
  }, [])

  const applyStyles = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    // Apply global CSS rule to the body
    const cssComposer = editor.CssComposer
    const bodyRule = cssComposer.getRule('body') || cssComposer.setRule('body', {})
    
    bodyRule.setStyle({
      ...bodyRule.getStyle(),
      'background-color': bodyBg,
      'color': bodyColor,
      'font-family': fontFamily
    })

    // Create a :root rule for variables
    const rootRule = cssComposer.getRule(':root') || cssComposer.setRule(':root', {})
    rootRule.setStyle({
      ...rootRule.getStyle(),
      '--primary-color': primaryColor,
    })
  }

  // Trigger applyStyles whenever these change
  useEffect(() => {
    applyStyles()
  }, [primaryColor, fontFamily, bodyBg, bodyColor])

  return (
    <div className="flex flex-col h-full p-4 gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Palette size={16} /> Colors
        </h3>
        
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground font-medium">Primary</label>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase">{primaryColor}</span>
            <input 
              type="color" 
              value={primaryColor} 
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0" 
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border" />

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Type size={16} /> Body
        </h3>
        
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground font-medium">Background</label>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase">{bodyBg}</span>
            <input 
              type="color" 
              value={bodyBg} 
              onChange={(e) => setBodyBg(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0" 
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground font-medium">Text Color</label>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase">{bodyColor}</span>
            <input 
              type="color" 
              value={bodyColor} 
              onChange={(e) => setBodyColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-medium">Font Family</label>
          <select 
            value={fontFamily} 
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="Barlow, sans-serif">Barlow</option>
          </select>
        </div>
      </div>
    </div>
  )
}
