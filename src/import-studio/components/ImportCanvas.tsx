import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    if (containerRef.current) {
      editorAdapter.init()
      
      // Load from DB only after init is ready
      if (activeProjectId) {
        const userId = user?.$id || 'local_user'
        loadFromDB(userId, activeProjectId)
      }
    }
    return () => {
      // Keep alive for testing
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
    <div className="flex-1 w-full h-full bg-[#0a0a0a] overflow-auto flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ring-1 ring-white/10"
        style={{ 
          width: getViewportWidth(),
          height: viewport === 'desktop' ? '100%' : '800px',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center'
        }}
      >
        <div id="gjs" ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
