import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Sparkles,
  Layers,
  Palette,
  Type,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LayoutTemplate,
  Building2,
  Briefcase,
  Layers3,
  Check,
} from 'lucide-react'
import { SegmentSelect } from '@/components/SegmentSelect'
import { pageTemplates } from '@/lib/page-templates'
import { useConfigStore } from '@/store/configStore'
import { useProjectsStore } from '@/store/projectsStore'
import { useEditorStore } from '@/store/editorStore'
import type { SiteConfig, ThemeConfig } from '@/blocks/types'

interface PaletteOption {
  id: string
  name: string
  primary: string
  accentDim: string
  bg: string
  border: string
}

const paletteOptions: PaletteOption[] = [
  {
    id: 'bluebolt',
    name: 'Blue Bolt Pro',
    primary: '#3b82f6',
    accentDim: '#2563eb',
    bg: '#09090b',
    border: '#1e293b',
  },
  {
    id: 'emerald',
    name: 'Emerald Growth',
    primary: '#10b981',
    accentDim: '#059669',
    bg: '#09090b',
    border: '#132e27',
  },
  {
    id: 'indigo',
    name: 'Indigo Tech',
    primary: '#6366f1',
    accentDim: '#4f46e5',
    bg: '#09090b',
    border: '#242247',
  },
  {
    id: 'violet',
    name: 'Violet AI',
    primary: '#8b5cf6',
    accentDim: '#7c3aed',
    bg: '#09090b',
    border: '#291b45',
  },
  {
    id: 'slate',
    name: 'Slate Minimal',
    primary: '#94a3b8',
    accentDim: '#64748b',
    bg: '#09090b',
    border: '#27272a',
  },
]

export function ProjectCreationWizard() {
  const navigate = useNavigate()
  const setConfig = useConfigStore((s) => s.setConfig)
  const addProject = useProjectsStore((s) => s.addProject)
  const updateProjectConfig = useProjectsStore((s) => s.updateProjectConfig)
  const setActiveProject = useEditorStore((s) => s.setActiveProject)

  // Step state (1: Dados de Negócio, 2: Estrutura Visual)
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 Form fields
  const [nomeProjeto, setNomeProjeto] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [segmento, setSegmento] = useState('')
  const [ramo, setRamo] = useState('')

  // Validation errors
  const [errors, setErrors] = useState<{
    nomeProjeto?: string
    nomeCliente?: string
    segmento?: string
    ramo?: string
  }>({})

  // Step 2 Visual Setup fields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('institucional')
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('bluebolt')
  const [visualStyle, setVisualStyle] = useState<'glass' | 'clean' | 'contrast'>('glass')
  const [headingWeight, setHeadingWeight] = useState<'600' | '700' | '800'>('700')

  function validateStep1(): boolean {
    const newErrors: typeof errors = {}
    if (!nomeProjeto.trim()) {
      newErrors.nomeProjeto = 'O nome do projeto é obrigatório (mínimo 3 caracteres).'
    } else if (nomeProjeto.trim().length < 3) {
      newErrors.nomeProjeto = 'O nome do projeto deve ter pelo menos 3 caracteres.'
    }

    if (!nomeCliente.trim()) {
      newErrors.nomeCliente = 'O nome do cliente ou empresa é obrigatório.'
    }

    if (!segmento.trim()) {
      newErrors.segmento = 'Selecione o segmento de mercado do negócio.'
    }

    if (!ramo.trim()) {
      newErrors.ramo = 'Indique o ramo ou nicho específico de atuação.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleAdvanceToStep2(e: React.FormEvent) {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
    }
  }

  const selectedTemplate = pageTemplates.find((t) => t.id === selectedTemplateId) || pageTemplates[0]
  const selectedPalette = paletteOptions.find((p) => p.id === selectedPaletteId) || paletteOptions[0]

  // Dynamic preview of blocks
  const generatedBlocksPreview = selectedTemplate.generateBlocks({
    projectName: nomeProjeto.trim() || 'Meu Projeto',
    clientName: nomeCliente.trim() || 'Minha Empresa',
    segment: segmento.trim() || 'Serviços',
    niche: ramo.trim() || 'Geral',
  })

  function handleCreateAndOpenEditor() {
    if (!validateStep1()) {
      setStep(1)
      toast.error('Dados de negócio incompletos.')
      return
    }

    const themeConfig: Partial<ThemeConfig> = {
      accent: selectedPalette.primary,
      accentDim: selectedPalette.accentDim,
      fontSans: 'Inter',
      fontDisplay: 'Inter',
      radius: visualStyle === 'glass' ? 12 : 8,
      radiusLg: visualStyle === 'glass' ? 16 : 12,
      visualStyle,
    }

    const initialSiteConfig: SiteConfig = {
      name: nomeProjeto.trim(),
      clientName: nomeCliente.trim(),
      segment: segmento.trim(),
      niche: ramo.trim(),
      templateId: selectedTemplateId,
      pages: [
        {
          id: 'page-home',
          name: 'Página Principal',
          path: '/',
          blocks: generatedBlocksPreview,
        },
      ],
      blocks: generatedBlocksPreview,
      theme: themeConfig,
    }

    // 1. Criar projeto no store
    const projectId = addProject(nomeProjeto.trim())
    updateProjectConfig(projectId, initialSiteConfig)

    // 2. Atualizar configStore com a configuração gerada
    setConfig(initialSiteConfig)
    setActiveProject(projectId)

    toast.success('Página estruturada com sucesso! A abrir no editor...')
    navigate('/editor')
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 my-8">
      {/* Wizard Card */}
      <div className="glass-card bg-card/70 border border-border/80 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
        {/* Wizard Header with Steps Progress */}
        <div className="border-b border-border/60 bg-background/40 px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  Blue IA Studio
                </span>
                <span className="text-muted-foreground text-xs">Criação Guiada</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {step === 1 ? '1. Identificação do Projeto & Negócio' : '2. Estrutura Visual & Identidade'}
              </h2>
            </div>

            {/* Step badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  step === 1
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 size={14} />
                <span>1. Negócio</span>
                {step === 2 && <CheckCircle2 size={13} className="text-primary-foreground" />}
              </button>

              <div className="w-4 h-px bg-border" />

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  step === 2
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Palette size={14} />
                <span>2. Visual & Secções</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wizard Step 1: Dados do Negócio */}
        {step === 1 && (
          <form onSubmit={handleAdvanceToStep2} className="p-6 md:p-8 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Preencha as informações essenciais da empresa para que a estrutura inicial e as secções da página sejam adaptadas ao seu nicho com máxima precisão.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome do Projeto */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Briefcase size={14} className="text-primary" />
                  Nome do Projeto <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nomeProjeto}
                  onChange={(e) => {
                    setNomeProjeto(e.target.value)
                    if (errors.nomeProjeto) setErrors((prev) => ({ ...prev, nomeProjeto: undefined }))
                  }}
                  className={`w-full px-3.5 py-2.5 bg-secondary/80 border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                    errors.nomeProjeto
                      ? 'border-destructive focus:ring-1 focus:ring-destructive'
                      : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                  placeholder="Ex: Landing Page de Lançamento 2026"
                />
                {errors.nomeProjeto && (
                  <p className="text-[11px] text-destructive mt-1 font-medium">{errors.nomeProjeto}</p>
                )}
              </div>

              {/* Nome do Cliente */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary" />
                  Nome do Cliente / Conta <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => {
                    setNomeCliente(e.target.value)
                    if (errors.nomeCliente) setErrors((prev) => ({ ...prev, nomeCliente: undefined }))
                  }}
                  className={`w-full px-3.5 py-2.5 bg-secondary/80 border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                    errors.nomeCliente
                      ? 'border-destructive focus:ring-1 focus:ring-destructive'
                      : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                  placeholder="Ex: Clínica Alpha / Dr. Silva"
                />
                {errors.nomeCliente && (
                  <p className="text-[11px] text-destructive mt-1 font-medium">{errors.nomeCliente}</p>
                )}
              </div>

              {/* Segmento */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <LayoutTemplate size={14} className="text-primary" />
                  Segmento do Negócio <span className="text-destructive">*</span>
                </label>
                <SegmentSelect
                  value={segmento}
                  onChange={(val) => {
                    setSegmento(val)
                    if (errors.segmento) setErrors((prev) => ({ ...prev, segmento: undefined }))
                  }}
                />
                {errors.segmento && (
                  <p className="text-[11px] text-destructive mt-1 font-medium">{errors.segmento}</p>
                )}
              </div>

              {/* Nicho Específico */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Briefcase size={14} className="text-primary" />
                  Ramo de Atividade / Nicho Específico <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={ramo}
                  onChange={(e) => {
                    setRamo(e.target.value)
                    if (errors.ramo) setErrors((prev) => ({ ...prev, ramo: undefined }))
                  }}
                  className={`w-full px-3.5 py-2.5 bg-secondary/80 border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                    errors.ramo
                      ? 'border-destructive focus:ring-1 focus:ring-destructive'
                      : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                  placeholder="Ex: Ortodontia Invisível e Harmonização Facial"
                />
                {errors.ramo && (
                  <p className="text-[11px] text-destructive mt-1 font-medium">{errors.ramo}</p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md hover:shadow-primary/25"
              >
                <span>Continuar para Estrutura Visual</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Wizard Step 2: Estrutura Visual & Estilo */}
        {step === 2 && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            {/* 1. Escolha de Template Base */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Layers size={15} className="text-primary" />
                  1. Escolha a Estrutura Base de Secções
                </label>
                <span className="text-xs text-muted-foreground">{pageTemplates.length} modelos disponíveis</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pageTemplates.map((template) => {
                  const isSelected = template.id === selectedTemplateId
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`text-left p-4 rounded-xl border transition-all relative ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary'
                          : 'border-border bg-secondary/40 hover:bg-secondary hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
                          {template.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary">
                              {template.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check size={16} className="text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Escolha de Paleta de Cores */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Palette size={15} className="text-primary" />
                2. Paleta de Cores e Identidade
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {paletteOptions.map((palette) => {
                  const isSelected = palette.id === selectedPaletteId
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setSelectedPaletteId(palette.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary'
                          : 'border-border bg-secondary/40 hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: palette.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: palette.accentDim }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-foreground truncate">{palette.name}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Estilo Visual & Tipografia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Estilo Visual */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  3. Estilo de Acabamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'glass', label: 'Glassmorphism' },
                    { id: 'clean', label: 'Clean Modern' },
                    { id: 'contrast', label: 'High Contrast' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setVisualStyle(style.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        visualStyle === style.id
                          ? 'border-primary bg-primary/15 text-foreground font-semibold'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipografia */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Type size={14} className="text-primary" />
                  4. Peso dos Títulos (Inter)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { weight: '600', label: 'Semi-Bold' },
                    { weight: '700', label: 'Bold' },
                    { weight: '800', label: 'Extra-Bold' },
                  ].map((item) => (
                    <button
                      key={item.weight}
                      type="button"
                      onClick={() => setHeadingWeight(item.weight as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        headingWeight === item.weight
                          ? 'border-primary bg-primary/15 text-foreground font-semibold'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Resumo das Secções que serão geradas */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers3 size={14} className="text-primary" />
                  Estrutura Inicial Gerada ({generatedBlocksPreview.length} Secções)
                </span>
                <span className="text-[11px] text-muted-foreground">Ordem no Canvas</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {generatedBlocksPreview.map((b, idx) => (
                  <span
                    key={b.id || idx}
                    className="px-2.5 py-1 rounded-md bg-background/80 border border-border text-[11px] font-medium text-foreground flex items-center gap-1.5"
                  >
                    <span className="text-primary font-mono text-[10px]">{idx + 1}.</span>
                    <span className="capitalize">{b.type}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-foreground font-medium text-xs transition-all flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Voltar aos Dados</span>
              </button>

              <button
                type="button"
                onClick={handleCreateAndOpenEditor}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Sparkles size={16} />
                <span>Criar e Abrir no Editor</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
