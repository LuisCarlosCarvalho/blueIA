import { useEffect, useState, useCallback } from 'react'
import { ImportStudioTopBar } from './components/ImportStudioTopBar'
import { ImportLeftSidebar } from './components/ImportLeftSidebar'
import { ImportRightSidebar } from './components/ImportRightSidebar'
import { ImportCanvas } from './components/ImportCanvas'
import { ContextToolbar } from './components/ContextToolbar'
import { useImportStudioStore } from './ImportStudioStore'

export function ImportStudioLayout() {
  const activeProjectId = useImportStudioStore((s) => s.activeProjectId)
  const setActiveProject = useImportStudioStore((s) => s.setActiveProject)
  const isLeftPanelOpen = useImportStudioStore((s) => s.isLeftPanelOpen)

  useEffect(() => {
    if (!activeProjectId) {
      setActiveProject(crypto.randomUUID())
    }
  }, [activeProjectId, setActiveProject])

  return (
    <div className="h-full flex flex-col relative bg-background overflow-hidden">
      <ImportStudioTopBar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Trilho + Painel Esquerdo (ImportLeftSidebar agora lida com o seu interior) */}
        <div className="flex flex-shrink-0 h-full border-r border-border bg-background z-20">
          <ImportLeftSidebar />
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <ImportCanvas />
            <ContextToolbar />
          </div>
        </div>

        {/* Right Inspector (Fixo a 300px) */}
        <div style={{ width: 300, flexShrink: 0 }} className="flex flex-col h-full border-l border-border bg-background z-20">
          <ImportRightSidebar />
        </div>
      </div>
    </div>
  )
}
