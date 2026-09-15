import { create } from 'zustand'
import { ImportStudioRepository, type ImportStudioProjectData } from './persistence/ImportStudioRepository'
import { editorAdapter } from './GrapesEditorAdapter'

export type ImportViewport = 'desktop' | 'tablet' | 'mobile'
export type ImportLeftTab = 'blocks' | 'layers' | 'styles' | 'assets' | 'import'
export type ImportInspectorTab = 'styles' | 'properties'

interface ImportStudioState {
  activeProjectId: string | null
  viewport: ImportViewport
  zoom: number
  leftTab: ImportLeftTab
  inspectorTab: ImportInspectorTab
  selectedElementId: string | null
  saveState: 'saved' | 'saving' | 'error'
  isLeftPanelOpen: boolean
  
  // Persisted data
  originalSource: any
  sourceType: 'elementor' | 'html-css' | null
  compatibilityReport: any[]

  setActiveProject: (id: string | null) => void
  setViewport: (vp: ImportViewport) => void
  setZoom: (z: number) => void
  setLeftTab: (tab: ImportLeftTab) => void
  setLeftPanelOpen: (isOpen: boolean) => void
  setInspectorTab: (tab: ImportInspectorTab) => void
  setSelectedElementId: (id: string | null) => void
  setSaveState: (state: 'saved' | 'saving' | 'error') => void

  setOriginalData: (source: any, type: 'elementor' | 'html-css', report: any[]) => void

  loadFromDB: (userId: string, projectId: string) => Promise<boolean>
  saveToDB: (userId: string, projectId: string) => Promise<void>
  deleteFromDB: (userId: string, projectId: string) => Promise<void>
  clearProjectState: () => void
}

export const useImportStudioStore = create<ImportStudioState>()((set, get) => ({
  activeProjectId: null, // this will be set when a project is loaded
  viewport: 'desktop',
  zoom: 100,
  leftTab: 'blocks',
  inspectorTab: 'styles',
  selectedElementId: null,
  saveState: 'saved',
  isLeftPanelOpen: false,

  originalSource: null,
  sourceType: null,
  compatibilityReport: [],

  setActiveProject: (id) => set({ activeProjectId: id }),
  setViewport: (vp) => set({ viewport: vp }),
  setZoom: (z) => set({ zoom: Math.max(50, Math.min(150, z)) }),
  setLeftTab: (tab) => set({ leftTab: tab, isLeftPanelOpen: true }),
  setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }),
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setSaveState: (state) => set({ saveState: state }),

  setOriginalData: (source, type, report) => set({ 
    originalSource: source, 
    sourceType: type, 
    compatibilityReport: report 
  }),

  clearProjectState: () => {
    set({
      activeProjectId: null,
      originalSource: null,
      sourceType: null,
      compatibilityReport: [],
      saveState: 'saved'
    })
    editorAdapter.loadHTML('', '')
    editorAdapter.undoManagerClear() // We will implement this
  },

  loadFromDB: async (userId, projectId) => {
    try {
      const data = await ImportStudioRepository.loadProject(`${userId}:${projectId}`)
      if (!data) return false

      set({
        activeProjectId: projectId,
        originalSource: data.originalSource,
        sourceType: data.sourceType,
        compatibilityReport: data.compatibilityReport,
        saveState: 'saved'
      })

      // Must be called only after adapter is ready! 
      // Layout should ensure this.
      const pData = data.projectData?.data || null
      if (pData) {
        editorAdapter.loadProjectData(pData)
      } else {
        const html = data.projectData?.html || ''
        const css = data.projectData?.css || ''
        editorAdapter.loadHTML(html, css)
      }
      
      return true
    } catch (e) {
      console.error('Failed to load project from IndexedDB', e)
      return false
    }
  },

  saveToDB: async (userId, projectId) => {
    set({ saveState: 'saving' })
    try {
      const state = get()
      
      const html = editorAdapter.getHTML()
      const css = editorAdapter.getCSS()
      const data = editorAdapter.getProjectData()

      const projectData: ImportStudioProjectData = {
        id: `${userId}:${projectId}`,
        userId,
        originalSource: state.originalSource,
        sourceType: state.sourceType || 'elementor',
        schemaVersion: 1,
        compatibilityReport: state.compatibilityReport,
        projectData: { html, css, data },
        createdAt: Date.now(), // ideally keep original if exists, but simplifed here
        updatedAt: Date.now()
      }

      await ImportStudioRepository.saveProject(projectData)
      set({ saveState: 'saved' })
    } catch (e: any) {
      console.error('Save failed:', e)
      set({ saveState: 'error' })
      throw e // rethrow to show toast in UI
    }
  },

  deleteFromDB: async (userId, projectId) => {
    try {
      await ImportStudioRepository.deleteProject(`${userId}:${projectId}`)
      get().clearProjectState()
    } catch (e) {
      console.error('Delete failed:', e)
      throw e
    }
  }
}))
