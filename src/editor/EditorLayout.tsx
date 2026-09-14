import { useNavigate } from 'react-router-dom'
import { FolderOpen, Layers, Briefcase, UtensilsCrossed, Building2, BookOpen } from 'lucide-react'
import { EditorTopBar } from './EditorTopBar'
import { LeftSidebar } from './LeftSidebar'
import { Canvas } from './Canvas'
import { RightSidebar } from './RightSidebar'
import { JsonDrawer } from './JsonDrawer'
import { VersionHistory } from './VersionHistory'
import { GenerationOverlay } from './GenerationOverlay'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { useProjectsStore } from '@/store/projectsStore'
import { templateMeta, buildTemplate } from '@/lib/templates'
import { hexToRgb } from '@/lib/theme-presets'

const templateIcons: Record<string, typeof Briefcase> = {
  Briefcase, UtensilsCrossed, Building2, BookOpen,
}

function EditorEmptyState() {
  const navigate = useNavigate()
  const addProject = useProjectsStore((s) => s.addProject)
  const setConfig = useConfigStore((s) => s.setConfig)
  const setActiveProject = useEditorStore((s) => s.setActiveProject)

  function startFromTemplate(tplId: string, tplName: string) {
    const id = addProject(tplName)
    setActiveProject(id)
    setConfig(buildTemplate(tplId, tplName))
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-6 max-w-md">
        <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mb-4">
          <FolderOpen size={20} className="text-muted-foreground" />
        </div>
        <h2 className="text-[16px] font-sans font-semibold text-muted-foreground mb-1">No project selected</h2>
        <p className="text-muted-foreground text-[13px] mb-6">Open a project from the Dashboard, or start from a template.</p>

        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-xl bg-primary text-black text-[13px] font-semibold hover:bg-primary-dim active:scale-[0.97] transition-all mb-6"
        >
          Go to Dashboard
        </button>

        <div className="grid grid-cols-2 gap-2 w-full">
          {templateMeta.map((tpl) => {
            const rgb = hexToRgb(tpl.accent)
            const Icon = templateIcons[tpl.icon] || Layers
            return (
              <button
                key={tpl.id}
                onClick={() => startFromTemplate(tpl.id, tpl.name)}
                className="group relative bg-background border border-border rounded-lg p-3 text-left transition-all hover:border-border card-lift hover:card-lift-hover active:scale-[0.97]"
              >
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: `rgba(${rgb}, 0.06)` }}
                />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all opacity-70 group-hover:opacity-100 group-hover:scale-110"
                      style={{ background: `rgba(${rgb}, 0.12)`, color: tpl.accent }}
                    >
                      <Icon size={12} />
                    </div>
                    <div className="text-[11.5px] font-semibold text-foreground">{tpl.name}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-snug mb-1.5">{tpl.description}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Layers size={9} />
                    {tpl.blockCount} blocks
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function EditorLayout() {
  const previewMode = useEditorStore((s) => s.previewMode)
  const activeProjectId = useEditorStore((s) => s.activeProjectId)
  const config = useConfigStore((s) => s.config)

  if (!activeProjectId && (!config.blocks || config.blocks.length === 0)) {
    return <EditorEmptyState />
  }

  return (
    <div className="h-full flex flex-col relative">
      <EditorTopBar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        {!previewMode && <LeftSidebar />}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Canvas />
            <JsonDrawer />
            <GenerationOverlay />
          </div>
        </div>
        {!previewMode && <RightSidebar />}
      </div>
      <VersionHistory />
    </div>
  )
}
