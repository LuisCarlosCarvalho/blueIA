import { create } from 'zustand'

export type Viewport = 'desktop' | 'tablet' | 'mobile'
export type LeftTab = 'ai' | 'navigator' | 'elements' | 'design'
export type InspectorTab = 'design' | 'layout' | 'advanced'

export interface AiProposal {
  type: 'text' | 'block' | 'structure'
  blockId?: string
  propKey?: string
  before: any
  after: any
  description: string
}

export type StudioModel = 'studio_bolt' | 'bolt_tink_ai'

interface EditorState {
  selectedBlockId: string | null
  selectedElementId: string | null
  viewport: Viewport
  zoom: number
  leftTab: LeftTab
  inspectorTab: InspectorTab
  jsonDrawerOpen: boolean
  historyOpen: boolean
  shortcutsModalOpen: boolean
  previewMode: boolean
  activeProjectId: string | null
  aiProposal: AiProposal | null
  studioModel: StudioModel
  // Generation state
  isGenerating: boolean
  generationPrompt: string | null
  generationError: string | null
  selectBlock: (id: string | null) => void
  selectElement: (id: string | null) => void
  setViewport: (vp: Viewport) => void
  setZoom: (z: number) => void
  setLeftTab: (tab: LeftTab) => void
  setInspectorTab: (tab: InspectorTab) => void
  setAiProposal: (p: AiProposal | null) => void
  clearAiProposal: () => void
  setStudioModel: (model: StudioModel) => void
  toggleJsonDrawer: () => void
  toggleHistory: () => void
  toggleShortcutsModal: () => void
  togglePreview: () => void
  setActiveProject: (id: string | null) => void
  setGenerating: (prompt: string | null) => void
  setGenerationError: (err: string | null) => void
  clearGeneration: () => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  selectedBlockId: null,
  selectedElementId: null,
  viewport: 'desktop',
  zoom: 100,
  leftTab: 'ai',
  inspectorTab: 'design',
  jsonDrawerOpen: false,
  historyOpen: false,
  shortcutsModalOpen: false,
  previewMode: false,
  activeProjectId: null,
  aiProposal: null,
  studioModel: 'studio_bolt',
  isGenerating: false,
  generationPrompt: null,
  generationError: null,
  selectBlock: (id) => set({ selectedBlockId: id, selectedElementId: null }),
  selectElement: (id) => set({ selectedElementId: id }),
  setViewport: (vp) => set({ viewport: vp }),
  setZoom: (z) => set({ zoom: Math.max(50, Math.min(150, z)) }),
  setLeftTab: (tab) => set({ leftTab: tab }),
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  setAiProposal: (p) => set({ aiProposal: p }),
  clearAiProposal: () => set({ aiProposal: null }),
  setStudioModel: (model) => set({ studioModel: model }),
  toggleJsonDrawer: () => set((s) => ({ jsonDrawerOpen: !s.jsonDrawerOpen })),
  toggleHistory: () => set((s) => ({ historyOpen: !s.historyOpen })),
  toggleShortcutsModal: () => set((s) => ({ shortcutsModalOpen: !s.shortcutsModalOpen })),
  togglePreview: () => set((s) => ({ previewMode: !s.previewMode, ...(!s.previewMode ? { selectedBlockId: null } : {}) })),
  setActiveProject: (id) => set({ activeProjectId: id }),
  setGenerating: (prompt) => set({ isGenerating: !!prompt, generationPrompt: prompt, generationError: null }),
  setGenerationError: (err) => set({ generationError: err }),
  clearGeneration: () => set({ isGenerating: false, generationPrompt: null }),
}))
