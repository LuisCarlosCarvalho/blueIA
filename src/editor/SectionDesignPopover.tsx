import { useState, useRef } from 'react'
import {
  Palette,
  Image as ImageIcon,
  Video,
  Sliders,
  X,
  Upload,
  Layers,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import { toast } from 'sonner'
import type { BlockConfig, SectionBackground, SectionLayoutConfig } from '@/blocks/types'
import { useConfigStore } from '@/store/configStore'

interface SectionDesignPopoverProps {
  block: BlockConfig
  isOpen: boolean
  onClose: () => void
}

const colorPresets = [
  '#09090b',
  '#0f172a',
  '#18181b',
  '#1e1b4b',
  '#14532d',
  '#1e293b',
  '#312e81',
  '#022c22',
  '#450a0a',
  '#262626',
]

export function SectionDesignPopover({ block, isOpen, onClose }: SectionDesignPopoverProps) {
  const updateBlock = useConfigStore((s) => s.updateBlock)
  const [tab, setTab] = useState<'background' | 'layout'>('background')
  const [bgType, setBgType] = useState<'color' | 'gradient' | 'image' | 'video'>(
    block.background?.type || 'color'
  )

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const currentBg: SectionBackground = block.background || {
    type: 'color',
    color: 'transparent',
  }

  const currentLayout: SectionLayoutConfig = block.layout || {
    paddingTop: 'md',
    paddingBottom: 'md',
    maxWidth: 'boxed',
    align: 'center',
  }

  function handleUpdateBg(updates: Partial<SectionBackground>) {
    const updatedBg = { ...currentBg, type: bgType, ...updates } as SectionBackground
    updateBlock(block.id, { background: updatedBg })
  }

  function handleUpdateLayout(updates: Partial<SectionLayoutConfig>) {
    const updatedLayout = { ...currentLayout, ...updates }
    updateBlock(block.id, { layout: updatedLayout })
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Ficheiro inválido. Selecione uma imagem.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem excede o limite máximo de 5MB.')
      return
    }
    const blobUrl = URL.createObjectURL(file)
    handleUpdateBg({ type: 'image', url: blobUrl, overlayOpacity: 0.5, isLocalBlob: true })
    toast.success('Fundo com imagem temporária aplicado.')
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Ficheiro inválido. Selecione um vídeo MP4 ou WEBM.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('O vídeo excede o limite máximo de 20MB.')
      return
    }
    const blobUrl = URL.createObjectURL(file)
    handleUpdateBg({ type: 'video', url: blobUrl, overlayOpacity: 0.6, isLocalBlob: true })
    toast.success('Fundo com vídeo temporário aplicado.')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground capitalize">
                Design da Secção ({block.type})
              </h3>
              <p className="text-[11px] text-muted-foreground">Personalize fundo, espaçamentos e dimensões</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-secondary/80 p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setTab('background')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'background'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palette size={13} />
            <span>Fundo da Secção</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('layout')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'layout'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sliders size={13} />
            <span>Espaçamento & Layout</span>
          </button>
        </div>

        {/* Tab 1: Fundo */}
        {tab === 'background' && (
          <div className="space-y-4">
            {/* Bg type selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'color', label: 'Cor Sólida', icon: Palette },
                { id: 'gradient', label: 'Gradiente', icon: Layers },
                { id: 'image', label: 'Imagem', icon: ImageIcon },
                { id: 'video', label: 'Vídeo', icon: Video },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setBgType(item.id as any)
                    handleUpdateBg({ type: item.id as any })
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] font-medium border flex flex-col items-center gap-1 transition-all ${
                    bgType === item.id
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Configuração de Cor Sólida */}
            {bgType === 'color' && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-foreground">Paleta de Fundo</label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdateBg({ type: 'color', color: c })}
                      className="w-7 h-7 rounded-full border border-border transition-transform hover:scale-110 shadow-xs"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => handleUpdateBg({ type: 'color', color: 'transparent' })}
                    className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Transparente
                  </button>
                </div>
              </div>
            )}

            {/* Configuração de Gradiente */}
            {bgType === 'gradient' && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Cor Inicial</label>
                    <input
                      type="color"
                      value={(currentBg as any).from || '#09090b'}
                      onChange={(e) => handleUpdateBg({ type: 'gradient', from: e.target.value })}
                      className="w-full h-8 rounded-lg border border-border bg-secondary cursor-pointer p-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Cor Final</label>
                    <input
                      type="color"
                      value={(currentBg as any).to || '#1e1b4b'}
                      onChange={(e) => handleUpdateBg({ type: 'gradient', to: e.target.value })}
                      className="w-full h-8 rounded-lg border border-border bg-secondary cursor-pointer p-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Configuração de Imagem de Fundo */}
            {bgType === 'image' && (
              <div className="space-y-3 pt-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Upload size={15} />
                  <span>Carregar Imagem de Fundo (Local)</span>
                </button>
                {(currentBg as any).url && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-muted-foreground">Opacidade da Película Escura</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={(currentBg as any).overlayOpacity ?? 0.5}
                      onChange={(e) =>
                        handleUpdateBg({ overlayOpacity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Configuração de Vídeo de Fundo */}
            {bgType === 'video' && (
              <div className="space-y-3 pt-2">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Upload size={15} />
                  <span>Carregar Vídeo de Fundo (MP4/WEBM Local)</span>
                </button>
                {(currentBg as any).url && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-muted-foreground">Opacidade da Película Escura</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={(currentBg as any).overlayOpacity ?? 0.6}
                      onChange={(e) =>
                        handleUpdateBg({ overlayOpacity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Layout & Espaçamento */}
        {tab === 'layout' && (
          <div className="space-y-4">
            {/* Modo de Layout: Estruturado vs Livre */}
            <div className="space-y-1.5 p-3 rounded-xl bg-secondary/60 border border-border">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Modo de Layout da Secção</span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                  {currentLayout.mode === 'free' ? 'Posicionamento Livre' : 'Grid / Flex'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateLayout({ mode: 'structured' })}
                  className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    currentLayout.mode !== 'free'
                      ? 'border-primary bg-primary/15 text-primary font-semibold shadow-xs'
                      : 'border-border bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🧱 Estruturado (Grid/Flex)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateLayout({ mode: 'free' })}
                  className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    currentLayout.mode === 'free'
                      ? 'border-primary bg-primary/15 text-primary font-semibold shadow-xs'
                      : 'border-border bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ✨ Posicionamento Livre
                </button>
              </div>
            </div>

            {/* Disposição de Imagem e Conteúdo (Hero/Split) */}
            {block.type === 'hero' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Disposição Imagem / Texto</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'row', label: 'Imagem Direita' },
                    { id: 'row-reverse', label: 'Imagem Esquerda' },
                    { id: 'col', label: 'Imagem Abaixo' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleUpdateLayout({ direction: d.id as any })}
                      className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        (currentLayout.direction || 'row') === d.id
                          ? 'border-primary bg-primary/15 text-primary font-semibold'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Padding Vertical */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Espaçamento Vertical (Padding)</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'none', label: 'Nenhum' },
                  { id: 'sm', label: 'Curto' },
                  { id: 'md', label: 'Médio' },
                  { id: 'lg', label: 'Amplo' },
                  { id: 'xl', label: 'Super' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      handleUpdateLayout({ paddingTop: p.id as any, paddingBottom: p.id as any })
                    }
                    className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      currentLayout.paddingTop === p.id
                        ? 'border-primary bg-primary/15 text-primary font-semibold'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Largura Máxima */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Largura do Bloco</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'narrow', label: 'Estreito (800px)' },
                  { id: 'boxed', label: 'Padrão (1200px)' },
                  { id: 'full', label: 'Total (100%)' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleUpdateLayout({ maxWidth: w.id as any })}
                    className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      currentLayout.maxWidth === w.id
                        ? 'border-primary bg-primary/15 text-primary font-semibold'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alinhamento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Alinhamento de Conteúdo</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', label: 'Esquerda', icon: AlignLeft },
                  { id: 'center', label: 'Centro', icon: AlignCenter },
                  { id: 'right', label: 'Direita', icon: AlignRight },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleUpdateLayout({ align: a.id as any })}
                    className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      currentLayout.align === a.id
                        ? 'border-primary bg-primary/15 text-primary font-semibold'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <a.icon size={14} />
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md"
          >
            Concluir Edição
          </button>
        </div>
      </div>
    </div>
  )
}
