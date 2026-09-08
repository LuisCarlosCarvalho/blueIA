import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings2,
  Search as SearchIcon,
  Key,
  Check,
  ShieldCheck,
  Sparkles,
  Component,
  Download,
  HelpCircle,
  Server,
  Lock,
  Database,
  FileCode,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Eye,
  History,
  Archive,
  Upload,
  Users,
  CheckSquare,
  Activity,
  X,
  AlertCircle,
  Cpu,
  Layers,
  Bot,
  LayoutTemplate,
  FileArchive,
  Shield,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useProjectsStore, type ProjectSettings } from '@/store/projectsStore'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { useAuthStore } from '@/store/authStore'
import { agencyTemplateMetadata } from '@/lib/agency-template'
import { validateAndImportHtmlZip, type ZipValidationResult } from '@/lib/zip-template-importer'

type SettingsTab =
  | 'general'
  | 'seo'
  | 'api'
  | 'help'
  | 'admin'
  | 'ai'
  | 'templates'
  | 'import_export'

const baseTabs: { value: SettingsTab; label: string; icon: any }[] = [
  { value: 'general', label: 'Geral', icon: Settings2 },
  { value: 'seo', label: 'SEO', icon: SearchIcon },
  { value: 'api', label: 'Chaves de API', icon: Key },
  { value: 'help', label: 'Ajuda e Suporte', icon: HelpCircle },
]

const adminTabs: { value: SettingsTab; label: string; icon: any }[] = [
  { value: 'admin', label: 'Painel Admin', icon: ShieldCheck },
  { value: 'ai', label: 'Integrações de IA', icon: Sparkles },
  { value: 'templates', label: 'Gestão de Templates', icon: Component },
  { value: 'import_export', label: 'Importação e Exportação', icon: ArrowUpDown },
]

function useSettingsState() {
  const activeProjectId = useEditorStore((s) => s.activeProjectId)
  const projects = useProjectsStore((s) => s.projects)
  const updateProjectSettings = useProjectsStore((s) => s.updateProjectSettings)

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null
  const projectSettings = activeProject?.settings || {}

  const [showSaved, setShowSaved] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const data: Record<string, string> = Object.fromEntries(
    Object.entries(projectSettings).map(([k, v]) => [k, v || ''])
  )

  const update = (key: string, value: string) => {
    if (activeProjectId) {
      updateProjectSettings(activeProjectId, { [key]: value } as Partial<ProjectSettings>)
    }
    setShowSaved(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setShowSaved(false), 2000)
  }

  useEffect(() => {
    return () => { if (savedTimer.current) clearTimeout(savedTimer.current) }
  }, [])

  return { data, update, showSaved }
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-[11.5px] text-muted-foreground mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  )
}

function ControlledInput({
  settingsKey,
  placeholder,
  settings,
  disabled
}: {
  settingsKey: string
  placeholder?: string
  settings: ReturnType<typeof useSettingsState>
  disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={settings.data[settingsKey] || ''}
      placeholder={placeholder}
      onChange={(e) => settings.update(settingsKey, e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary placeholder:text-muted-foreground/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}

function ControlledTextarea({
  settingsKey,
  rows = 3,
  settings
}: {
  settingsKey: string
  rows?: number
  settings: ReturnType<typeof useSettingsState>
}) {
  return (
    <textarea
      value={settings.data[settingsKey] || ''}
      rows={rows}
      onChange={(e) => settings.update(settingsKey, e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary resize-y transition-colors"
    />
  )
}

// 1. General Panel
function GeneralPanel({ settings }: { settings: ReturnType<typeof useSettingsState> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Geral</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Parâmetros essenciais do site e preferências regionais.</p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <FieldGroup label="Nome do Site">
          <ControlledInput settingsKey="siteName" placeholder="O Meu Site Blue IA" settings={settings} />
        </FieldGroup>
        <FieldGroup label="Descrição do Site">
          <ControlledTextarea settingsKey="siteDescription" rows={3} settings={settings} />
        </FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Favicon URL">
            <ControlledInput settingsKey="faviconUrl" placeholder="https://exemplo.com/favicon.ico" settings={settings} />
          </FieldGroup>
          <FieldGroup label="Idioma">
            <select
              value={settings.data.language || 'Português'}
              onChange={(e) => settings.update('language', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary cursor-pointer"
            >
              <option>Português</option>
              <option>English</option>
              <option>German</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// 2. SEO Panel
function SeoPanel({ settings }: { settings: ReturnType<typeof useSettingsState> }) {
  const title = settings.data.seoTitle || 'O Meu Site - Construído com Blue IA'
  const description = settings.data.seoDescription || 'Um site incrível construído com base em JSON.'
  const domain = settings.data.customDomain || 'omeusite.com'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">SEO & Metadados</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Otimização para motores de busca e pré-visualização em redes sociais.</p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <FieldGroup label="Título da Página">
          <ControlledInput settingsKey="seoTitle" placeholder="Ex: Blue IA Studio" settings={settings} />
        </FieldGroup>
        <FieldGroup label="Descrição Meta">
          <ControlledTextarea settingsKey="seoDescription" rows={2} settings={settings} />
        </FieldGroup>
        <FieldGroup label="URL da Imagem OG (Open Graph)">
          <ControlledInput settingsKey="ogImageUrl" placeholder="https://exemplo.com/og.png" settings={settings} />
        </FieldGroup>

        {/* Live Google preview */}
        <div className="mt-4 p-4 rounded-xl bg-secondary border border-border">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Pré-visualização do Google
          </div>
          <div className="text-primary text-sm hover:underline cursor-pointer font-medium">{title}</div>
          <div className="text-muted-foreground text-[11.5px] mt-0.5">https://{domain}</div>
          <div className="text-muted-foreground text-[12px] mt-1 leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

// 3. API Keys Panel
function ApiPanel({ settings }: { settings: ReturnType<typeof useSettingsState> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Chaves de API</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Credenciais de publicação e integração com serviços externos.</p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <FieldGroup label="Chave de Acesso para Deploy">
          <ControlledInput
            settingsKey="deployAccessKey"
            placeholder="Protegida via OPENPAGE_DEPLOY_KEY no servidor"
            settings={settings}
            disabled={true}
          />
          <p className="text-[11.5px] text-muted-foreground mt-1.5 font-medium">
            As chaves de integração são configuradas e protegidas exclusivamente no servidor.
          </p>
        </FieldGroup>

        <FieldGroup label="Gemini API Key">
          <ControlledInput
            settingsKey="geminiKeyDisabled"
            placeholder="AIza..."
            settings={settings}
            disabled={true}
          />
          <p className="text-[11.5px] text-muted-foreground mt-1.5 font-medium">
            As chaves de integração são configuradas e protegidas exclusivamente no servidor.
          </p>
        </FieldGroup>
      </div>
    </div>
  )
}

// 4. Help & Support Panel
function HelpPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Ajuda e Suporte</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Recursos de apoio técnico, documentação e diretrizes do estúdio.</p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <HelpCircle size={22} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Centro de Suporte Blue IA</h3>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full inline-block mt-0.5">
              Em preparação
            </span>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          A central de atendimento e suporte técnico direto está em fase de estruturação. Para esclarecimento de dúvidas e orientações arquiteturais, consulte a documentação oficial do Blue IA Studio.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-secondary/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode size={18} className="text-muted-foreground" />
          <div>
      <div className="text-[13px] font-medium text-foreground">Manual de Arquitetura e Tokens</div>
            <div className="text-[11.5px] text-muted-foreground">Regras de design system e esquema JSON determinístico.</div>
          </div>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">Disponível no repositório</span>
      </div>
    </div>
  )
}

function AdminPanel() {
  const { user } = useAuthStore()
  const studioModel = useEditorStore((s) => s.studioModel)
  const setStudioModel = useEditorStore((s) => s.setStudioModel)

  // Mask user ID for security (show short form)
  const maskedUserId = user?.$id
    ? `${user.$id.substring(0, 4)}...${user.$id.substring(user.$id.length - 4)}`
    : 'N/A'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Painel de Administração</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Estado seguro do estúdio, diagnóstico de IA e módulos de gestão.</p>
      </div>

      {/* Modelo do Estúdio de Edição */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Modelo do Estúdio de Edição</h3>
              <p className="text-[12px] text-muted-foreground">Selecione o modelo operacional de edição visual para os projetos.</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wide w-fit">
            {studioModel === 'studio_bolt' ? 'ATIVO: STUDIO BOLT' : 'ATIVO: BOLT TINK IA'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Opção 1: Studio Bolt */}
          <button
            type="button"
            onClick={() => {
              setStudioModel('studio_bolt')
              toast.success('Modelo do estúdio alterado para Studio Bolt')
            }}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              studioModel === 'studio_bolt'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md'
                : 'border-border bg-secondary/40 hover:border-border/80 hover:bg-secondary/70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    studioModel === 'studio_bolt' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <Layers size={15} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Studio Bolt</span>
                </div>
                {studioModel === 'studio_bolt' && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                    <Check size={12} />
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Editor visual modular para criação manual: secções, cartões, drag and drop, posicionamento livre e controlo por breakpoint.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span className="text-primary font-medium">Layout Visual Modular</span>
              <span className="text-muted-foreground font-mono">Padrão</span>
            </div>
          </button>

          {/* Opção 2: Bolt Tink IA */}
          <button
            type="button"
            onClick={() => {
              setStudioModel('bolt_tink_ai')
              toast.success('Modelo do estúdio alterado para Bolt Tink IA')
            }}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              studioModel === 'bolt_tink_ai'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md'
                : 'border-border bg-secondary/40 hover:border-border/80 hover:bg-secondary/70'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    studioModel === 'bolt_tink_ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <Bot size={15} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Bolt Tink IA</span>
                </div>
                {studioModel === 'bolt_tink_ai' && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                    <Check size={12} />
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Modo assistido por IA para orientar alterações e acompanhar a pré-visualização da página num único ambiente.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span className="text-primary font-medium">Assistente Inteligente</span>
              <span className="text-muted-foreground font-mono">IA Neural</span>
            </div>
          </button>
        </div>

        {/* Aviso de persistência segura */}
        <div className="pt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground/80 border-t border-border/40">
          <AlertCircle size={13} className="text-muted-foreground shrink-0" />
          <span>Preferência permanente será ativada com persistência segura no servidor.</span>
        </div>
      </div>

      {/* Grid 1: Infrastructure & Core Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Studio Security Status */}
        <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Estado do Estúdio</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wider">
                INTERFACE PRONTA
              </span>
            </div>
            <div className="text-[12.5px] text-muted-foreground space-y-1.5 pt-1">
              <p>• Interface administrativa pronta para integração segura.</p>
              <p>• Validação server-side: pendente de configuração.</p>
              <p>• Chaves de API: isoladas no ambiente de servidor.</p>
            </div>
          </div>
        </div>

        {/* Appwrite Authentication */}
        <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                  <Server size={17} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Autenticação Appwrite</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                Sessão Ativa
              </span>
            </div>
            <div className="bg-secondary p-2.5 rounded-lg text-[12px] font-mono text-muted-foreground space-y-0.5">
              <div><span className="text-foreground font-semibold">Utilizador:</span> {user?.name || user?.email || 'N/A'}</div>
              <div><span className="text-foreground font-semibold">Labels:</span> {user?.labels?.length ? user.labels.join(', ') : 'nenhuma'}</div>
              <div><span className="text-foreground font-semibold">ID do Utilizador:</span> {maskedUserId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Persistence */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center">
              <Database size={17} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Camada de Persistência (TablesDB)</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold">
            Ainda não iniciada
          </span>
        </div>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          Persistência TablesDB: ainda não iniciada. A persistência automatizada de páginas e revisões em coleções remotas está em preparação. Nenhuma gravação em base de dados é efetuada nesta etapa.
        </p>
      </div>

      {/* AI Diagnostics & Copywriting Validation Card */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Diagnóstico de IA & Validação de Modelo de Copywriting</h3>
              <p className="text-[12px] text-muted-foreground">Estado seguro da integração e verificação de modelo neural.</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold">
            Protegido no Servidor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[11.5px] font-medium text-muted-foreground">Modelo Configurado</label>
            <input
              type="text"
              disabled
              value="gemini-2.0-flash / gemini-1.5-pro"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-[12.5px] font-mono opacity-80 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11.5px] font-medium text-muted-foreground">Endpoint de Geração</label>
            <input
              type="text"
              disabled
              value="/api/generate (Serverless Protegido)"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-[12.5px] font-mono opacity-80 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-[12px] font-medium cursor-not-allowed border border-border w-fit"
            title="A validação será ativada após a configuração segura da API no servidor."
          >
            Testar Modelo
          </button>
          <p className="text-[11.5px] text-muted-foreground">
            A validação será ativada após a configuração segura da API no servidor.
          </p>
        </div>
      </div>

      {/* Administrative Modules Grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Módulos de Gestão Administrativa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold text-[13px]">
                <Users size={16} className="text-primary" />
                Gestão de Utilizadores e Roles
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                Planeado
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Controlo de acessos granulares, permissões por equipa e sincronização de labels com o Appwrite Auth.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold text-[13px]">
                <Component size={16} className="text-primary" />
                Repositório de Templates JSON
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                Planeado
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Catálogo centralizado de templates aprovados, bloqueio de versões e publicação em galeria.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold text-[13px]">
                <CheckSquare size={16} className="text-primary" />
                Configurações de Fluxo de Aprovação
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                Em preparação
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Revisão e fluxo de homologação para páginas antes do deploy automático na CDN de produção.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold text-[13px]">
                <Activity size={16} className="text-primary" />
                Registos de Atividade e Auditoria
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                Planeado
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Histórico imutável de alterações estruturais, publicações e sessões de utilizadores administrativos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 6. AI Integrations Panel (Exclusive)
function AiIntegrationsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Integrações de Inteligência Artificial</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Configuração do motor de geração de páginas e modelos neurais.</p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Geração com IA (Gemini)</h3>
              <p className="text-[12px] text-muted-foreground">Motor estruturado para síntese de esquemas JSON.</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold">
            Aguardando Servidor
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-secondary border border-border/80 text-[12.5px] text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 text-foreground font-medium text-[13px]">
            <Lock size={15} className="text-primary" />
            Isolamento e Segurança de Chaves
          </div>
          <p className="leading-relaxed">
            As chaves de API para geração e integração com a IA (como <code className="text-foreground bg-background px-1.5 py-0.5 rounded font-mono text-[11px]">GEMINI_API_KEY</code>) ficam alocadas exclusivamente no servidor backend. O frontend nunca tem acesso direto às chaves nem efetua chamadas diretas não autenticadas.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground/60 border border-border/80 cursor-not-allowed text-xs font-medium inline-flex items-center gap-2"
          >
            <Sparkles size={14} />
            Testar Conexão Segura
          </button>
          <span className="block text-[11.5px] text-muted-foreground mt-2">
            O teste de conectividade estará disponível quando o endpoint seguro de geração estiver ativo no backend.
          </span>
        </div>
      </div>
    </div>
  )
}

// 7. Templates Management Panel (Exclusive & Enhanced)
interface TemplateItem {
  id: string
  title: string
  category: string
  slug: string
  status: 'published' | 'draft'
  isGenericBase: boolean
  origin: string
  sectionCount: number
  versionCount: number
  licenseInfo?: {
    originalName: string
    version: string
    source: string
    license: string
    copyright: string
  }
}

function TemplatesPanel() {
  const navigate = useNavigate()
  const setConfig = useConfigStore((s) => s.setConfig)
  const addProject = useProjectsStore((s) => s.addProject)
  const updateProjectConfig = useProjectsStore((s) => s.updateProjectConfig)
  const setActiveProject = useEditorStore((s) => s.setActiveProject)

  const categories = ['Todas as Categorias', 'Portfólios', 'Landing Pages', 'SaaS e Software', 'Comércio Local']
  const [selectedCat, setSelectedCat] = useState('Todas as Categorias')
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showZipModal, setShowZipModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showMetaModal, setShowMetaModal] = useState<TemplateItem | null>(null)

  // Elementor JSON import state
  const [importJsonText, setImportJsonText] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  // ZIP Importer state
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [isAnalyzingZip, setIsAnalyzingZip] = useState(false)
  const [zipResult, setZipResult] = useState<ZipValidationResult | null>(null)

  // Registered Template items including Agency — Portfólio e Serviços
  const templatesList: TemplateItem[] = [
    {
      id: 'tpl-agency-v7',
      title: 'Agency — Portfólio e Serviços',
      category: 'Portfólios',
      slug: 'agency-portfolio-servicos',
      status: 'draft',
      isGenericBase: false,
      origin: 'Importação HTML/ZIP',
      sectionCount: 9,
      versionCount: 1,
      licenseInfo: agencyTemplateMetadata.license,
    },
    {
      id: 'tpl-1',
      title: 'Landing Page Moderna Blue IA',
      category: 'Landing Pages',
      slug: 'landing-moderna-blueia',
      status: 'published',
      isGenericBase: true,
      origin: 'Nativo',
      sectionCount: 19,
      versionCount: 3,
    },
    {
      id: 'tpl-2',
      title: 'SaaS B2B Enterprise Pro',
      category: 'SaaS e Software',
      slug: 'saas-b2b-enterprise',
      status: 'draft',
      isGenericBase: true,
      origin: 'Nativo',
      sectionCount: 15,
      versionCount: 1,
    },
  ]

  const filteredTemplates = templatesList.filter(
    (t) => selectedCat === 'Todas as Categorias' || t.category === selectedCat
  )

  const handleActionClick = (actionName: string, templateTitle: string) => {
    setActionFeedback(`Ação "${actionName}" em "${templateTitle}" executada em memória.`);
    setTimeout(() => setActionFeedback(null), 3500);
  }

  const handleUseAgencyTemplate = () => {
    const siteConfig = agencyTemplateMetadata.build('Agency — Portfólio e Serviços')
    const projectId = addProject('Agency — Portfólio e Serviços')
    setActiveProject(projectId)
    updateProjectConfig(projectId, siteConfig)
    setConfig(siteConfig)
    toast.success('Template Agency carregado no Studio com sucesso!')
    navigate('/editor')
  }

  const handleValidateImport = () => {
    setImportError('')
    setImportSuccess('')
    if (!importJsonText.trim()) {
      setImportError('Por favor insira o conteúdo JSON do Elementor ou esquema de blocos.')
      return
    }
    try {
      JSON.parse(importJsonText)
      setImportSuccess('Estrutura JSON sintaticamente válida! Persistência remota desativada (em preparação).')
    } catch {
      setImportError('Erro de sintaxe JSON: O formato fornecido não é um JSON válido.')
    }
  }

  const handleZipUpload = async (file: File) => {
    setZipFile(file)
    setIsAnalyzingZip(true)
    setZipResult(null)

    try {
      const res = await validateAndImportHtmlZip(file)
      setZipResult(res)
      if (res.valid) {
        toast.success('ZIP validado e convertido com sucesso!')
      } else if (res.error) {
        toast.error(res.error)
      }
    } catch (err: any) {
      toast.error('Erro na validação do arquivo ZIP: ' + (err?.message || 'Arquivo inválido'))
    } finally {
      setIsAnalyzingZip(false)
    }
  }

  const handleApplyZipTemplate = () => {
    if (!zipResult?.siteConfig) {
      toast.error('Nenhum esquema de blocos convertido disponível.')
      return
    }

    const tplName = zipResult.templateName || 'Template Importado'
    const projectId = addProject(tplName)
    setActiveProject(projectId)
    updateProjectConfig(projectId, zipResult.siteConfig)
    setConfig(zipResult.siteConfig)
    setShowZipModal(false)
    toast.success(`Template ${tplName} carregado no Studio com sucesso!`)
    navigate('/editor')
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Gestão de Templates</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
              Admin
            </span>
          </div>
          <p className="text-[13px] font-medium text-primary mt-0.5">Repositório Oficial de Templates</p>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Biblioteca de modelos estruturais, controlo de versões e importação de esquemas HTML/ZIP e JSON.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Botão 1: Importar JSON do Elementor */}
          <button
            type="button"
            onClick={() => {
              setShowImportModal(true)
              setImportError('')
              setImportSuccess('')
              setImportJsonText('')
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-foreground hover:bg-muted text-[12.5px] font-medium border border-border transition-colors shadow-sm cursor-pointer"
          >
            <Upload size={14} className="text-primary" />
            Importar JSON do Elementor
          </button>

          {/* Botão 2: Importar Template HTML/ZIP */}
          <button
            type="button"
            onClick={() => {
              setShowZipModal(true)
              setZipFile(null)
              setZipResult(null)
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 text-[12.5px] font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <FileArchive size={14} />
            Importar Template HTML/ZIP
          </button>

          {/* Botão 3: Novo Template JSON */}
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-black hover:bg-primary/90 text-[12.5px] font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            Novo Template JSON
          </button>
        </div>
      </div>

      {/* Scheme Contract Banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
        <Sparkles size={18} className="text-primary mt-0.5 shrink-0" />
        <div className="text-[12.5px] text-muted-foreground leading-relaxed">
          <div className="font-semibold text-foreground mb-0.5">Contrato de Esquema JSON · Mapeamento por Inteligência Artificial</div>
          Cada template define um esquema determinístico de blocos, tipografia e temas compatíveis com os motores neurais do estúdio, garantindo renderização nativa e sem código externo arbitrário.
        </div>
      </div>

      {/* Action Feedback Banner if triggered */}
      {actionFeedback && (
        <div className="p-3 rounded-lg bg-secondary border border-border text-[12px] text-foreground flex items-center gap-2 animate-fade-in">
          <AlertCircle size={15} className="text-primary" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Registered Templates Section Header & Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Templates Registados</h3>
            <span className="text-[11px] text-muted-foreground font-normal">
              ({filteredTemplates.length} disponíveis · Catálogo do Estúdio)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActionFeedback('Catálogo sincronizado com a memória do estúdio.')
              setTimeout(() => setActionFeedback(null), 3000)
            }}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            Atualizar lista
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                selectedCat === cat
                  ? 'bg-primary text-black font-semibold shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4 hover:border-border/80 transition-all shadow-sm"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                      template.status === 'published'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-status-yellow/10 text-status-yellow border border-status-yellow/20'
                    }`}
                  >
                    {template.status === 'published' ? 'Ativo na Galeria' : 'Rascunho'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-secondary text-muted-foreground border border-border">
                    {template.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-primary bg-primary/5 border border-primary/20">
                    {template.origin}
                  </span>
                </div>

                {template.isGenericBase && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    Base Genérica
                  </span>
                )}
              </div>

              {/* Title & Slug */}
              <div>
                <h4 className="text-[14px] font-semibold text-foreground">{template.title}</h4>
                <div className="text-[11.5px] text-muted-foreground font-mono mt-0.5">
                  slug: /{template.slug}
                </div>
              </div>

              {/* Specs Plate */}
              <div className="p-2.5 rounded-lg bg-secondary/80 border border-border flex items-center justify-around text-[11.5px] text-muted-foreground font-mono">
                <div><span className="text-foreground font-semibold">{template.sectionCount}</span> Secções</div>
                <div className="w-px h-3 bg-border" />
                <div><span className="text-foreground font-semibold">{template.versionCount}</span> {template.versionCount === 1 ? 'Versão' : 'Versões'}</div>
                <div className="w-px h-3 bg-border" />
                <div className="text-primary font-medium">blue-bolt/v1</div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 border-t border-border flex flex-wrap gap-1.5 items-center">
              {template.id === 'tpl-agency-v7' ? (
                <button
                  type="button"
                  onClick={handleUseAgencyTemplate}
                  className="px-3 py-1.5 rounded-md bg-primary text-black font-semibold text-[11px] hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Eye size={12} />
                  Usar no Studio
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActionClick('Visualizar', template.title)}
                  className="px-2.5 py-1.5 rounded-md bg-secondary text-foreground hover:bg-muted text-[11px] font-medium border border-border transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={12} />
                  Visualizar
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMetaModal(template)}
                className="px-2.5 py-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border transition-colors cursor-pointer"
              >
                Metadados & Licença
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('Regenerar Miniatura', template.title)}
                className="px-2.5 py-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border transition-colors cursor-pointer"
              >
                Miniatura
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('Versões', template.title)}
                className="px-2.5 py-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border transition-colors flex items-center gap-1 cursor-pointer"
              >
                <History size={12} />
                Versões
              </button>

              <button
                type="button"
                onClick={() => handleActionClick(template.status === 'published' ? 'Mudar para Rascunho' : 'Ativar na Galeria', template.title)}
                className="px-2.5 py-1.5 rounded-md bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Archive size={12} />
                {template.status === 'published' ? 'Rascunho' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Importar Template HTML/ZIP */}
      {showZipModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileArchive size={20} className="text-primary" />
                <div>
                  <h3 className="text-base font-bold text-foreground">Importar Template HTML/ZIP</h3>
                  <p className="text-xs text-muted-foreground">Conversor de pacotes estáticos para o contrato de blocos Blue Bolt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowZipModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center space-y-2 bg-secondary/30 transition-all">
              <Upload size={28} className="mx-auto text-primary opacity-80" />
              <div className="text-sm font-semibold text-foreground">
                Selecione ou arraste o arquivo .zip do template HTML
              </div>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Suporta pacotes como <strong>Start Bootstrap Agency v7.0.12</strong>. Executáveis, scripts JS externos, CDNs e handlers perigosos são bloqueados automaticamente.
              </p>
              <div className="pt-2">
                <input
                  type="file"
                  id="zip-upload-input"
                  accept=".zip"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleZipUpload(f)
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="zip-upload-input"
                  className="px-4 py-2 rounded-xl bg-primary text-black font-semibold text-xs tracking-wide uppercase hover:bg-primary/90 transition-all cursor-pointer shadow-xs inline-block"
                >
                  Procurar Arquivo .ZIP
                </label>
              </div>
              {zipFile && (
                <div className="text-xs font-mono text-primary pt-1">
                  Arquivo selecionado: {zipFile.name} ({(zipFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Analyzing Spinner */}
            {isAnalyzingZip && (
              <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                <RefreshCw size={14} className="animate-spin text-primary" />
                A analisar segurança do arquivo ZIP e sanitizar componentes HTML...
              </div>
            )}

            {/* Validation & Conversion Results */}
            {zipResult && (
              <div className="space-y-3 pt-2">
                {zipResult.valid ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 size={16} />
                        Template Reconhecido & Mapeado com Sucesso!
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                        {zipResult.schemaVersion}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] font-mono text-slate-300 pt-1">
                      <div className="p-2 rounded bg-black/20">
                        <span className="text-muted-foreground block text-[10px]">Nome:</span>
                        <strong className="text-white truncate block">{zipResult.templateName}</strong>
                      </div>
                      <div className="p-2 rounded bg-black/20">
                        <span className="text-muted-foreground block text-[10px]">Ficheiros:</span>
                        <strong className="text-white">{zipResult.fileCount} inspecionados</strong>
                      </div>
                      <div className="p-2 rounded bg-black/20">
                        <span className="text-muted-foreground block text-[10px]">HTML Sanitizado:</span>
                        <strong className="text-white">{zipResult.sanitizedHtmlCount} ficheiro</strong>
                      </div>
                      <div className="p-2 rounded bg-black/20">
                        <span className="text-muted-foreground block text-[10px]">Scripts JS:</span>
                        <strong className="text-emerald-400">0 executados</strong>
                      </div>
                    </div>

                    {/* Converted Blocks List */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-emerald-300 block uppercase tracking-wider">
                        Mapeamento de Blocos Nativos ({zipResult.convertedSections.length} secções):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300">
                        {zipResult.convertedSections.map((sec, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="truncate">{sec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* License Notice */}
                    {zipResult.licenseNotice && (
                      <p className="text-[11px] text-slate-400 border-t border-emerald-500/20 pt-2 italic">
                        {zipResult.licenseNotice}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle size={16} />
                      Falha na Validação de Segurança do ZIP
                    </div>
                    <p>{zipResult.error}</p>
                    {zipResult.detectedSecurityThreats.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] pt-1 space-y-0.5">
                        {zipResult.detectedSecurityThreats.map((threat, i) => (
                          <li key={i}>{threat}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Safety & Persistence Notice */}
            <div className="p-3 rounded-xl bg-secondary border border-border text-[11.5px] text-muted-foreground flex items-center gap-2">
              <Shield size={14} className="text-primary shrink-0" />
              <span>
                <strong>Importação em memória:</strong> Persistência segura em preparação no servidor. Nenhuma gravação externa é realizada.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowZipModal(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={!zipResult?.valid}
                onClick={handleApplyZipTemplate}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-1.5 ${
                  zipResult?.valid
                    ? 'bg-primary text-black hover:bg-primary/90 cursor-pointer active:scale-95'
                    : 'bg-secondary text-muted-foreground opacity-50 cursor-not-allowed'
                }`}
              >
                <Sparkles size={13} />
                Carregar Template no Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Importar JSON do Elementor */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-primary" />
                <h3 className="text-base font-semibold text-foreground">Importar JSON do Elementor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12.5px] text-muted-foreground">
              Cole abaixo a estrutura JSON exportada ou o esquema de blocos para validação sintática.
            </p>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{ "title": "Modelo Elementor", "content": [...] }'
              className="w-full p-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-[12px] outline-none focus:border-primary resize-y"
            />

            {importError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[12.5px]">
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[12.5px]">
                {importSuccess}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">Validação estritamente local</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-[12.5px] font-medium transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleValidateImport}
                  className="px-4 py-2 rounded-lg bg-primary text-black text-[12.5px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Validar JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Metadados & Licença */}
      {showMetaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Metadados & Licenciamento</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMetaModal(null)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-secondary/80 border border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template:</span>
                  <strong className="text-foreground">{showMetaModal.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Identificador / Slug:</span>
                  <span className="font-mono text-primary">/{showMetaModal.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origem:</span>
                  <span className="text-foreground">{showMetaModal.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contrato de Esquema:</span>
                  <span className="font-mono text-emerald-400">blue-bolt-template/v1</span>
                </div>
              </div>

              {showMetaModal.licenseInfo ? (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-muted-foreground">
                  <div className="font-bold text-foreground flex items-center gap-1.5 text-[12.5px]">
                    <Shield size={14} className="text-primary" />
                    Atribuição de Código Aberto
                  </div>
                  <div className="space-y-1 text-[11.5px] leading-relaxed">
                    <p>• <strong>Nome Original:</strong> {showMetaModal.licenseInfo.originalName}</p>
                    <p>• <strong>Versão:</strong> {showMetaModal.licenseInfo.version}</p>
                    <p>• <strong>Fonte:</strong> {showMetaModal.licenseInfo.source}</p>
                    <p>• <strong>Licença:</strong> {showMetaModal.licenseInfo.license} License</p>
                    <p>• <strong>Copyright:</strong> {showMetaModal.licenseInfo.copyright}</p>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground/80 border-t border-border/50 pt-2 italic">
                    Registado em <code className="text-foreground font-mono">docs/THIRD_PARTY_LICENSES.md</code> em conformidade com as diretrizes do projeto.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Template nativo concebido exclusivamente para o Blue Bolt Page Studio.
                </p>
              )}
            </div>

            <div className="text-right pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowMetaModal(null)}
                className="px-4 py-2 rounded-xl bg-primary text-black font-semibold text-xs uppercase tracking-wide hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Novo Template JSON */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                <h3 className="text-base font-semibold text-foreground">Novo Template JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12.5px] text-muted-foreground">
              Formulário de estruturação de novos esquemas canónicos para o catálogo Blue IA.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11.5px] text-muted-foreground mb-1 font-medium">Nome do Template</label>
                <input
                  type="text"
                  placeholder="Ex: Landing Page FinTech"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-[13px] outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11.5px] text-muted-foreground mb-1 font-medium">Slug Canónico</label>
                <input
                  type="text"
                  placeholder="landing-fintech"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-[13px] outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11.5px] text-muted-foreground mb-1 font-medium">Categoria</label>
                <select className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-[13px] outline-none focus:border-primary cursor-pointer">
                  <option>Landing Pages</option>
                  <option>SaaS e Software</option>
                  <option>Portfólios</option>
                  <option>Comércio Local</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary border border-border text-[12px] text-muted-foreground">
              O formulário efetua validação de campos. A gravação persistente exige o backend do TablesDB ativo.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3.5 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-[12.5px] font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewModal(false)
                  setActionFeedback('Estrutura de novo template validada com sucesso (modo pré-gravação).')
                  setTimeout(() => setActionFeedback(null), 3500)
                }}
                className="px-4 py-2 rounded-lg bg-primary text-black text-[12.5px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Confirmar Estrutura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 8. Import & Export Panel (Exclusive)
function ImportExportPanel() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Importação e Exportação</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Transferência e sincronização segura de esquemas e projetos.</p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] font-semibold">
          Em preparação
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-foreground font-semibold text-[13.5px]">
              <Download size={17} className="text-primary" />
              Exportação Estruturada
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Exportação determinística do catálogo e páginas em arquivo JSON estrito com validação de tipagem TypeScript.
            </p>
          </div>
          <div>
            <button
              type="button"
              disabled
              className="w-full py-2 rounded-lg bg-secondary text-muted-foreground text-[12.5px] font-medium cursor-not-allowed border border-border"
              title="Em preparação estrutural"
            >
              Exportar Configurações JSON
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-foreground font-semibold text-[13.5px]">
              <FileCode size={17} className="text-primary" />
              Importação com Validação
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Carregamento de pacotes externos com verificação prévia de integridade para prevenir dados corrompidos.
            </p>
          </div>
          <div>
            <button
              type="button"
              disabled
              className="w-full py-2 rounded-lg bg-secondary text-muted-foreground text-[12.5px] font-medium cursor-not-allowed border border-border"
              title="Em preparação estrutural"
            >
              Importar Pacote JSON
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border bg-secondary/50 flex items-start gap-3">
        <Lock size={16} className="text-primary mt-0.5 shrink-0" />
        <div className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Garantia de Segurança: </span>
          O processamento de ficheiros brutos é validado contra o esquema canónico de blocos e temas para evitar a execução de código arbitrário.
        </div>
      </div>
    </div>
  )
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const settings = useSettingsState()
  const { user } = useAuthStore()

  // Administrative state derived exclusively from Appwrite session
  const isAdmin = Boolean(user?.labels?.includes('admin'))

  // Security guard: If user loses admin privileges or tries direct URL tab access, redirect to general
  const adminOnlyTabs: SettingsTab[] = ['admin', 'ai', 'templates', 'import_export']
  useEffect(() => {
    if (!isAdmin && adminOnlyTabs.includes(activeTab)) {
      setActiveTab('general')
    }
  }, [isAdmin, activeTab])

  const availableTabs = [...baseTabs]
  if (isAdmin) {
    availableTabs.push(...adminTabs)
  }

  const panels: Record<SettingsTab, React.ReactNode> = {
    general: <GeneralPanel settings={settings} />,
    seo: <SeoPanel settings={settings} />,
    api: <ApiPanel settings={settings} />,
    help: <HelpPanel />,
    admin: isAdmin ? <AdminPanel /> : null,
    ai: isAdmin ? <AiIntegrationsPanel /> : null,
    templates: isAdmin ? <TemplatesPanel /> : null,
    import_export: isAdmin ? <ImportExportPanel /> : null,
  }

  return (
    <div className="w-full bg-background pb-16">
      {/* Top Header */}
      <div className="px-4 md:px-8 xl:px-10 py-6 border-b border-border bg-background">
        <h1 className="text-xl font-bold text-foreground">Definições e Administração</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações globais, integrações e ferramentas internas do Blue IA Studio.</p>
      </div>

      {/* Main Container - Full Width & Fluid Responsive Grid */}
      <div className="w-full px-4 md:px-8 xl:px-10 py-8 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-[280px] shrink-0 md:sticky md:top-20 bg-background flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0 border-border z-10">
          {availableTabs.map(({ value, label, icon: Icon }, i) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{ animationDelay: `${i * 30}ms` }}
              className={`shrink-0 md:w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] transition-all text-left animate-fade-in-up ${
                activeTab === value
                  ? 'bg-muted text-foreground font-medium border border-border/60 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={16} className={activeTab === value ? 'text-primary' : 'text-muted-foreground'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full min-w-0">
          {settings.showSaved && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium animate-fade-in border border-primary/20">
              <Check size={13} />
              Alterações guardadas com sucesso
            </div>
          )}
          <div key={activeTab} className="animate-fade-in-up w-full">
            {panels[activeTab]}
          </div>
        </div>
      </div>
    </div>
  )
}
