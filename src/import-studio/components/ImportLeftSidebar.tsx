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
  const { leftTab, setLeftTab, compatibilityReport, isLeftPanelOpen, setLeftPanelOpen } = useImportStudioStore()
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
    
    editorAdapter.loadHTML(result.html, result.css)
    setIsApplied(true)
  }

  const reportToDisplay = result ? result.report : compatibilityReport

  const toggleTab = (tabId: string) => {
    if (leftTab === tabId && isLeftPanelOpen) {
      setLeftPanelOpen(false)
    } else {
      setLeftTab(tabId as ImportLeftTab)
    }
  }

  return (
    <div className="flex h-full bg-background overflow-hidden relative">
      {/* ── TRILHO (RAIL) ──────────────────────────────────────────────── */}
      <div className="w-[56px] flex-shrink-0 border-r border-border flex flex-col items-center py-2 bg-secondary/20 z-10">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = leftTab === tab.id && isLeftPanelOpen
          return (
            <button
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={`w-10 h-10 mb-2 rounded-xl flex items-center justify-center transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              title={tab.label}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>
      
      {/* ── PAINEL EXPANSÍVEL ──────────────────────────────────────────── */}
      <div 
        className={`flex flex-col bg-background transition-all overflow-hidden duration-300 ease-in-out border-r border-border`}
        style={{ width: isLeftPanelOpen ? 280 : 0, opacity: isLeftPanelOpen ? 1 : 0 }}
      >
        {/* Cabeçalho do Painel */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
          <span className="font-semibold text-sm text-foreground">
            {TABS.find(t => t.id === leftTab)?.label}
          </span>
          <button 
            onClick={() => setLeftPanelOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
          >
            <XCircle size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-0 h-full">
            {leftTab === 'blocks' && <BlocksPanel />}
            {leftTab === 'layers' && <LayersPanel />}
            {leftTab === 'styles' && <GlobalStylesPanel />}
            {leftTab === 'assets' && <AssetsPanel />}
            
            {leftTab === 'import' && (
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Import Elementor (JSON)</label>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleElementorUpload}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                  />
                </div>

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                {reportToDisplay.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="text-xs font-semibold">Relatório de Compatibilidade</div>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar bg-secondary/30 p-2 rounded-lg border border-border">
                      {reportToDisplay.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px]">
                          {item.status === 'converted' && <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />}
                          {item.status === 'unsupported' && <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />}
                          {item.status === 'blocked' && <XCircle size={12} className="text-destructive mt-0.5 shrink-0" />}
                          <div className="flex flex-col">
                            <span className="font-medium">{item.elType} {item.widgetType ? `(${item.widgetType})` : ''}</span>
                            {item.reason && <span className="text-muted-foreground">{item.reason}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {result && !isApplied && (
                      <button 
                        onClick={handleApply}
                        className="h-9 px-4 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-sm"
                      >
                        Abrir no Studio Elementor
                      </button>
                    )}
                    
                    {(!result || isApplied) && (
                      <div className="text-xs text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <CheckCircle size={14} />
                        <span>Renderizado no Canvas!</span>
                      </div>
                    )}
                  </div>
                )}

                {reportToDisplay.length === 0 && !error && (
                  <div className="mt-4 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border text-center">
                    Nenhum ficheiro importado ainda.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
