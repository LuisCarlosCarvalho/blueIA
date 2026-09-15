import { ArrowLeft, Save, Monitor, Tablet, Smartphone, Undo2, Redo2, Trash2 } from 'lucide-react'
import { useImportStudioStore } from '../ImportStudioStore'
import { editorAdapter } from '../GrapesEditorAdapter'
import { useEditorStore } from '@/store/editorStore'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

export function ImportTopBar() {
  const { viewport, setViewport, saveState, saveToDB, deleteFromDB, activeProjectId } = useImportStudioStore()
  const setStudioModel = useEditorStore(s => s.setStudioModel)
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current)
    }
  }, [])

  const handleExit = () => {
    setStudioModel('studio_bolt')
    navigate('/')
  }

  const handleUndo = () => editorAdapter.undo()
  const handleRedo = () => editorAdapter.redo()

  const handleSave = async () => {
    if (!activeProjectId) return
    const userId = user?.$id || 'local_user'
    try {
      await saveToDB(userId, activeProjectId)
      toast.success('Project saved locally')
    } catch (e: any) {
      toast.error(e.message || 'Failed to save project')
    }
  }

  const handleDelete = async () => {
    if (!activeProjectId) return
    
    if (confirmDelete) {
      const userId = user?.$id || 'local_user'
      try {
        await deleteFromDB(userId, activeProjectId)
        toast.success('Project deleted from local storage')
        setConfirmDelete(false)
        navigate('/') // Go back to dashboard when deleted
      } catch (e: any) {
        toast.error('Failed to delete project')
      }
    } else {
      setConfirmDelete(true)
      deleteTimer.current = setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={handleExit}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title="Exit Import Studio"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-foreground leading-none">Imported Project</span>
          <span className="text-[10px] text-muted-foreground mt-1 tracking-wide uppercase font-medium">Import Studio</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleUndo} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground"><Undo2 size={15} /></button>
        <button onClick={handleRedo} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground"><Redo2 size={15} /></button>
        
        <div className="w-px h-4 bg-border mx-2" />

        <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
          <button onClick={() => setViewport('desktop')} className={`w-8 h-7 rounded flex items-center justify-center transition-colors ${viewport === 'desktop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Monitor size={14} /></button>
          <button onClick={() => setViewport('tablet')} className={`w-8 h-7 rounded flex items-center justify-center transition-colors ${viewport === 'tablet' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Tablet size={14} /></button>
          <button onClick={() => setViewport('mobile')} className={`w-8 h-7 rounded flex items-center justify-center transition-colors ${viewport === 'mobile' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Smartphone size={14} /></button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mr-2">
          {saveState === 'saved' && <><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Saved (Local)</>}
          {saveState === 'saving' && <><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> Saving...</>}
          {saveState === 'error' && <><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Save Error</>}
        </div>
        
        {activeProjectId && (
          <button 
            onClick={handleDelete}
            className={`h-8 px-3 flex items-center justify-center gap-2 rounded-lg border transition-all text-[12px] font-semibold ${
              confirmDelete 
                ? 'bg-destructive text-destructive-foreground border-destructive' 
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <Trash2 size={14} /> {confirmDelete ? 'Confirm' : 'Delete'}
          </button>
        )}
        
        <button 
          onClick={handleSave}
          disabled={!activeProjectId || saveState === 'saving'}
          className={`h-8 px-4 flex items-center justify-center gap-2 rounded-lg text-[12px] font-semibold transition-all ${
            !activeProjectId || saveState === 'saving'
              ? 'bg-primary/50 text-black/50 cursor-not-allowed'
              : 'bg-primary text-black hover:bg-primary-dim'
          }`}
        >
          <Save size={14} /> Save
        </button>
      </div>
    </header>
  )
}
