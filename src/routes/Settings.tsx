import { useState, useEffect, useRef } from 'react'
import {
  Settings2, Search as SearchIcon, Key, Check, ShieldAlert, Download, Component
} from 'lucide-react'
import { useProjectsStore, type ProjectSettings } from '@/store/projectsStore'
import { useEditorStore } from '@/store/editorStore'
import { useAuthStore } from '@/store/authStore'

type SettingsTab = 'general' | 'seo' | 'api' | 'help' | 'admin'

const tabDefs: { value: SettingsTab; label: string; icon: typeof Settings2 }[] = [
  { value: 'general', label: 'Geral', icon: Settings2 },
  { value: 'seo', label: 'SEO', icon: SearchIcon },
  { value: 'api', label: 'Chaves de API', icon: Key },
  { value: 'help', label: 'Ajuda e Suporte', icon: ShieldAlert as any },
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

function ControlledInput({ settingsKey, placeholder, settings, disabled }: { settingsKey: string; placeholder?: string; settings: ReturnType<typeof useSettingsState>; disabled?: boolean }) {
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

function ControlledTextarea({ settingsKey, rows = 3, settings }: { settingsKey: string; rows?: number; settings: ReturnType<typeof useSettingsState> }) {
  return (
    <textarea
      value={settings.data[settingsKey] || ''}
      rows={rows}
      onChange={(e) => settings.update(settingsKey, e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary resize-y transition-colors"
    />
  )
}

function GeneralPanel({ settings }: { settings: ReturnType<typeof useSettingsState> }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">Geral</h2>
      <FieldGroup label="Nome do Site"><ControlledInput settingsKey="siteName" settings={settings} /></FieldGroup>
      <FieldGroup label="Descrição do Site"><ControlledTextarea settingsKey="siteDescription" settings={settings} /></FieldGroup>
      <FieldGroup label="Favicon URL"><ControlledInput settingsKey="faviconUrl" placeholder="https://exemplo.com/favicon.ico" settings={settings} /></FieldGroup>
      <FieldGroup label="Idioma">
        <select
          value={settings.data.language || 'Português'}
          onChange={(e) => settings.update('language', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary cursor-pointer"
        >
          <option>Português</option><option>English</option><option>German</option><option>Spanish</option><option>French</option>
        </select>
      </FieldGroup>
    </div>
  )
}

function SeoPanel({ settings }: { settings: ReturnType<typeof useSettingsState> }) {
  const title = settings.data.seoTitle || 'O Meu Site - Construído com Blue IA'
  const description = settings.data.seoDescription || 'Um site incrível construído com base em JSON.'
  const domain = settings.data.customDomain || 'omeusite.com'

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">SEO</h2>
      <FieldGroup label="Título da Página"><ControlledInput settingsKey="seoTitle" settings={settings} /></FieldGroup>
      <FieldGroup label="Descrição Meta"><ControlledTextarea settingsKey="seoDescription" settings={settings} /></FieldGroup>
      <FieldGroup label="URL da Imagem OG"><ControlledInput settingsKey="ogImageUrl" placeholder="https://exemplo.com/og.png" settings={settings} /></FieldGroup>

      {/* Live Google preview */}
      <div className="mt-6 p-4 rounded-xl bg-secondary border border-border">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Pré-visualização do Google</div>
        <div className="text-[#8ab4f8] text-sm hover:underline cursor-pointer">{title}</div>
        <div className="text-[#bdc1c6] text-[11px] mt-0.5">https://{domain}</div>
        <div className="text-[#9aa0a6] text-[11.5px] mt-1 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  )
}

function ApiPanel({ settings }: { settings: ReturnType<typeof useSettingsState> }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">Chaves de API</h2>

      <FieldGroup label="Chave de Acesso para Deploy">
        <ControlledInput
          settingsKey="deployAccessKey"
          placeholder="Deve corresponder a OPENPAGE_DEPLOY_KEY no servidor"
          settings={settings}
          disabled={true}
        />
        <p className="text-[11px] text-muted-foreground/90 mt-1.5 font-medium">
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
        <p className="text-[11px] text-muted-foreground/90 mt-1.5 font-medium">
          As chaves de integração são configuradas e protegidas exclusivamente no servidor.
        </p>
      </FieldGroup>
    </div>
  )
}

function HelpPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-1 text-foreground">Ajuda e Suporte</h2>
      <div className="p-6 rounded-xl border border-border bg-background cursor-not-allowed transition-colors opacity-70">
        <div className="flex items-center gap-2 mb-2 text-foreground">
          <ShieldAlert size={18} />
          <span className="text-[14px] font-medium">Centro de Suporte</span>
        </div>
        <p className="text-[13px] text-muted-foreground mt-2">Em preparação</p>
      </div>
    </div>
  )
}

function AdminPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-1 text-foreground">Administração</h2>
        <p className="text-sm text-muted-foreground mb-6">Configurações globais e estado da plataforma.</p>

        <FieldGroup label="Integração de Inteligência Artificial">
          <div className="p-4 rounded-xl border border-border bg-secondary flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-foreground">Estado da API do Gemini</div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">O sistema utiliza uma API Key gerida no backend para evitar exposição.</div>
              </div>
              <div className="px-2 py-1 rounded-full bg-status-yellow/10 text-status-yellow text-[10px] font-bold tracking-wider">
                AGUARDANDO SERVIDOR
              </div>
            </div>

            <div className="pt-2 border-t border-border mt-1">
              <button disabled className="px-4 py-2 rounded-lg bg-primary/50 text-black/50 text-[12px] font-semibold cursor-not-allowed w-auto" title="Disponível após configuração segura no servidor">
                Testar ligação da API
              </button>
            </div>
          </div>
        </FieldGroup>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Gestão de Plataforma</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-border bg-background hover:bg-secondary cursor-not-allowed transition-colors opacity-70">
            <div className="flex items-center gap-2 mb-2 text-foreground">
              <Component size={16} />
              <span className="text-[13px] font-medium">Gestão de Templates</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground">Em preparação</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background hover:bg-secondary cursor-not-allowed transition-colors opacity-70">
            <div className="flex items-center gap-2 mb-2 text-foreground">
              <Download size={16} />
              <span className="text-[13px] font-medium">Importação / Exportação</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground">Em preparação</p>
          </div>
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

  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') {
      setActiveTab('general')
    }
  }, [isAdmin, activeTab])

  const availableTabs = [...tabDefs]
  if (isAdmin) {
    availableTabs.push({ value: 'admin', label: 'Painel Admin', icon: ShieldAlert as any })
  }

  const panels: Record<SettingsTab, React.ReactNode> = {
    general: <GeneralPanel settings={settings} />,
    seo: <SeoPanel settings={settings} />,
    api: <ApiPanel settings={settings} />,
    help: <HelpPanel />,
    admin: isAdmin ? <AdminPanel /> : null,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="shrink-0 px-4 py-6 md:px-8 border-b border-border bg-background">
        <h1 className="text-xl font-bold text-foreground">Definições e Administração</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações globais, integrações e ferramentas internas do Blue IA Studio.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="md:w-52 bg-background border-b md:border-b-0 md:border-r border-border p-2 shrink-0 flex md:flex-col gap-1 overflow-x-auto">
          {availableTabs.map(({ value, label, icon: Icon }, i) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`shrink-0 md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] transition-all text-left animate-fade-in-up ${
                activeTab === value
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl relative">
          {settings.showSaved && (
            <div className="absolute top-3 right-6 flex items-center gap-1.5 text-green text-[11px] animate-fade-in">
              <Check size={12} />
              Guardado
            </div>
          )}
          <div key={activeTab} className="animate-fade-in-up">
            {panels[activeTab]}
          </div>
        </div>
      </div>
    </div>
  )
}
