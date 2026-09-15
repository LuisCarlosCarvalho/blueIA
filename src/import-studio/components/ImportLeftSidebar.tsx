import { useState } from 'react'
import { useImportStudioStore } from '../ImportStudioStore'
import type { ImportLeftTab } from '../ImportStudioStore'
import { LayoutGrid, Layers, Palette, Image as ImageIcon, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { editorAdapter } from '../GrapesEditorAdapter'
import { ElementorImporter } from '../importers/ElementorImporter'
import type { ElementorImportResult } from '../importers/ElementorImporter'
import { BlocksPanel } from './panels/BlocksPanel'
import { LayersPanel } from './panels/LayersPanel'
import { GlobalStylesPanel } from './panels/GlobalStylesPanel'
import { AssetsPanel } from './panels/AssetsPanel'

const TABS = [
  { id: 'blocks', icon: LayoutGrid, label: 'Blocos' },
  { id: 'layers', icon: Layers, label: 'Camadas' },
  { id: 'styles', icon: Palette, label: 'Estilos Globais' },
  { id: 'assets', icon: ImageIcon, label: 'Assets' },
  { id: 'import', icon: Download, label: 'Importação' },
] as const

export function ImportLeftSidebar() {
  const { leftTab, setLeftTab, compatibilityReport } = useImportStudioStore()
  const [result, setResult] = useState<ElementorImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isApplied, setIsApplied] = useState(false)

  const handleElementorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setResult(null)
    setIsApplied(false)

    try {
      const res = await ElementorImporter.parse(file)
      setResult(res)
    } catch (err: any) {
      setError(err.message || 'Erro a processar ficheiro')
    }
    
    e.target.value = ''
  }

  const handleApply = () => {
    if (!result) return
    
    useImportStudioStore.getState().setOriginalData(
      result.originalJson, 
      'elementor', 
      result.report
    )
    
    // We import into GrapesJS
    // ImportCanvas relies on editorAdapter which is a singleton
    editorAdapter.loadHTML(result.html, result.css)
    setIsApplied(true)
  }

  const reportToDisplay = result ? result.report : compatibilityReport

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="h-12 border-b border-border flex items-center px-2 gap-1 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = leftTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setLeftTab(tab.id as ImportLeftTab)}
              className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title={tab.label}
            >
              <Icon size={16} />
            </button>
          )
        })}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {leftTab === 'blocks' && <BlocksPanel />}
        {leftTab === 'layers' && <LayersPanel />}
        {leftTab === 'styles' && <GlobalStylesPanel />}
        {leftTab === 'assets' && <AssetsPanel />}
        
        {leftTab === 'import' && (
          <div className="flex flex-col gap-4 p-4">
            <h3 className="text-sm font-semibold text-foreground">Import Project</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Import Elementor (JSON)</label>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleElementorUpload}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            {reportToDisplay.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <div className="text-xs font-semibold">Compatibility Report</div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto bg-muted p-2 rounded-lg border border-border">
                  {reportToDisplay.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      {item.status === 'converted' && <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />}
                      {item.status === 'unsupported' && <AlertTriangle size={12} className="text-yellow-500 mt-0.5 shrink-0" />}
                      {item.status === 'blocked' && <XCircle size={12} className="text-red-500 mt-0.5 shrink-0" />}
                      <div className="flex flex-col">
                        <span className="font-medium">{item.elType} {item.widgetType ? `(${item.widgetType})` : ''}</span>
                        {item.reason && <span className="text-muted-foreground">{item.reason}</span>}
                        {item.status === 'converted' && <span className="text-muted-foreground">Convertido com sucesso</span>}
                        {item.status === 'unsupported' && <span className="text-muted-foreground">Preservado no arquivo original. Não suportado.</span>}
                      </div>
                    </div>
                  ))}
                </div>
                
                {result && !isApplied && (
                  <button 
                    onClick={handleApply}
                    className="h-8 px-4 flex items-center justify-center gap-2 rounded-lg bg-primary text-black hover:bg-primary-dim text-[12px] font-semibold transition-all mt-2"
                  >
                    Open in Import Studio
                  </button>
                )}
                
                {(!result || isApplied) && (
                  <div className="text-xs text-green-500 font-medium text-center">
                    Renderizado no Canvas!
                  </div>
                )}
              </div>
            )}

            {reportToDisplay.length === 0 && !error && (
              <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded-lg border border-border">
                Nenhum ficheiro importado ainda.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
