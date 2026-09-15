import { useEffect, useRef, useState } from 'react'
import { editorAdapter } from '../GrapesEditorAdapter'
import { useImportStudioStore } from '../ImportStudioStore'
import { useAuthStore } from '@/store/authStore'

export function ImportCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewport = useImportStudioStore(s => s.viewport)
  const zoom = useImportStudioStore(s => s.zoom)

  const activeProjectId = useImportStudioStore(s => s.activeProjectId)
  const loadFromDB = useImportStudioStore(s => s.loadFromDB)
  const user = useAuthStore(s => s.user)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    if (containerRef.current) {
      editorAdapter.init()
      
      const checkEmpty = () => {
        const editor = editorAdapter.getEditor()
        if (editor) {
          setIsEmpty(editor.getComponents().length === 0)
        }
      }

      const editor = editorAdapter.getEditor()
      if (editor) {
        editor.on('component:add component:remove load', checkEmpty)
        setTimeout(checkEmpty, 500)
      }

      // Load from DB only after init is ready
      if (activeProjectId) {
        const userId = user?.$id || 'local_user'
        loadFromDB(userId, activeProjectId).then(() => checkEmpty())
      }
    }
    return () => {
      const editor = editorAdapter.getEditor()
      if (editor) {
        // cleanup listeners if needed
      }
    }
  }, [activeProjectId, loadFromDB, user])

  // In a real implementation, we'd use GrapesJS API to change the device viewport and zoom.
  // We can just add CSS classes or inline styles here to scale the container for a basic preview.
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '375px'
      case 'tablet': return '768px'
      case 'desktop': return '100%'
    }
  }

  return (
    <div className="flex-1 w-full h-full bg-secondary/10 overflow-auto flex items-center justify-center p-4 relative">
      <div 
        className="bg-white rounded-md shadow-sm transition-all duration-300 relative"
        style={{ 
          width: getViewportWidth(),
          height: viewport === 'desktop' ? '100%' : '800px',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center top'
        }}
      >
        <div id="gjs" ref={containerRef} className="w-full h-full [&>div]:!h-full" />
        
        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground/60 border-2 border-dashed border-border/50 bg-background/50 rounded-2xl p-8 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
              </div>
              <p className="text-sm font-medium">Arraste um bloco para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
