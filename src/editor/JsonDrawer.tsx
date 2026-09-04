import { useState } from 'react'
import { toast } from 'sonner'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function syntaxHighlight(json: string): string {
  const escaped = escapeHtml(json)
  return escaped.replace(
    /(&quot;(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\&])*?&quot;(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-status-yellow' // number
      if (/^&quot;/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-sky-300' // key
          match = match.replace(/:$/, '')
          return `<span class="${cls}">${match}</span>:`
        } else {
          cls = 'text-emerald-300' // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-status-blue'
      } else if (/null/.test(match)) {
        cls = 'text-muted-foreground'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export function JsonDrawer() {
  const config = useConfigStore((s) => s.config)
  const setConfig = useConfigStore((s) => s.setConfig)
  const { jsonDrawerOpen, toggleJsonDrawer } = useEditorStore()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const jsonStr = JSON.stringify(config, null, 2)
  const highlighted = syntaxHighlight(jsonStr)

  function startEditing() {
    setEditValue(jsonStr)
    setError(null)
    setEditing(true)
  }

  function applyEdit() {
    try {
      const parsed = JSON.parse(editValue)
      if (!parsed.name || (!Array.isArray(parsed.blocks) && !Array.isArray(parsed.pages))) {
        setError('Invalid config: must have "name" and "blocks" or "pages" array')
        return
      }
      setConfig(parsed)
      setEditing(false)
      setError(null)
      toast('Config updated from JSON')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function cancelEdit() {
    setEditing(false)
    setError(null)
  }

  return (
    <div
      className={`bg-background flex flex-col overflow-hidden transition-all duration-250 ease-in-out ${jsonDrawerOpen ? 'border-t border-border' : ''}`}
      style={{ height: jsonDrawerOpen ? '220px' : '0px' }}
    >
      {/* Header */}
      <div
        className="h-8 min-h-8 bg-background border-b border-border flex items-center px-3 text-[11px] text-muted-foreground gap-2 cursor-pointer select-none hover:bg-secondary transition-colors"
        onClick={toggleJsonDrawer}
      >
        <span className="font-mono">{'{ }'}</span>
        <span>Site Config</span>

        <div className="ml-auto flex items-center gap-2">
          {!editing && (
            <button
              onClick={(e) => { e.stopPropagation(); startEditing() }}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              Edit
            </button>
          )}
          {editing && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); applyEdit() }}
                className="text-[10px] text-primary hover:text-primary-dim transition-colors font-medium"
              >
                Apply
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); cancelEdit() }}
                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          <div className="flex items-center gap-1 text-[10px] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Live
          </div>
        </div>
      </div>

      {/* JSON body */}
      <div className="flex-1 overflow-auto px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
        {editing ? (
          <div className="h-full flex flex-col">
            <textarea
              value={editValue}
              onChange={(e) => { setEditValue(e.target.value); setError(null) }}
              className="flex-1 w-full bg-transparent text-muted-foreground outline-none resize-none font-mono text-[11.5px] leading-relaxed"
              spellCheck={false}
            />
            {error && (
              <div className="text-destructive text-[10px] mt-1 py-1">
                {error}
              </div>
            )}
          </div>
        ) : (
          <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
        )}
      </div>
    </div>
  )
}
