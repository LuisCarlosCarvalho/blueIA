import { useEffect, useState, useCallback } from 'react'
import { ImportTopBar } from './components/ImportTopBar'
import { ImportLeftSidebar } from './components/ImportLeftSidebar'
import { ImportRightSidebar } from './components/ImportRightSidebar'
import { ImportCanvas } from './components/ImportCanvas'
import { useImportStudioStore } from './ImportStudioStore'

export function ImportStudioLayout() {
  const activeProjectId = useImportStudioStore((s) => s.activeProjectId)
  const setActiveProject = useImportStudioStore((s) => s.setActiveProject)

  const [leftWidth, setLeftWidth] = useState(260)
  const [rightWidth, setRightWidth] = useState(260)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  useEffect(() => {
    if (!activeProjectId) {
      setActiveProject(crypto.randomUUID())
    }
  }, [activeProjectId, setActiveProject])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = Math.max(200, Math.min(e.clientX, 600))
      setLeftWidth(newWidth)
    } else if (isResizingRight) {
      const newWidth = Math.max(200, Math.min(window.innerWidth - e.clientX, 600))
      setRightWidth(newWidth)
    }
  }, [isResizingLeft, isResizingRight])

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false)
    setIsResizingRight(false)
  }, [])

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      // Prevent text selection while resizing
      document.body.style.userSelect = 'none'
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isResizingLeft, isResizingRight, handleMouseMove, handleMouseUp])

  return (
    <div className="h-full flex flex-col relative bg-background overflow-hidden">
      <ImportTopBar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div style={{ width: leftWidth, flexShrink: 0 }} className="flex flex-col h-full border-r border-border">
          <ImportLeftSidebar />
        </div>
        
        {/* Left Resizer */}
        <div 
          className="w-1 cursor-col-resize hover:bg-primary/50 transition-colors shrink-0 z-10"
          onMouseDown={() => setIsResizingLeft(true)}
        />

        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Pointer events none to iframe when resizing to avoid losing mouse events */}
            <div className={`w-full h-full ${isResizingLeft || isResizingRight ? 'pointer-events-none' : ''}`}>
              <ImportCanvas />
            </div>
          </div>
        </div>

        {/* Right Resizer */}
        <div 
          className="w-1 cursor-col-resize hover:bg-primary/50 transition-colors shrink-0 z-10 border-l border-border"
          onMouseDown={() => setIsResizingRight(true)}
        />

        <div style={{ width: rightWidth, flexShrink: 0 }} className="flex flex-col h-full">
          <ImportRightSidebar />
        </div>
      </div>
    </div>
  )
}
