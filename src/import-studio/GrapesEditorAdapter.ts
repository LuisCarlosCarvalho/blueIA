import grapesjs from 'grapesjs'
import type { Editor as GrapesEditor } from 'grapesjs'
import { useImportStudioStore } from './ImportStudioStore'

class GrapesEditorAdapter {
  private editor: GrapesEditor | null = null
  private containerId: string

  constructor(containerId: string) {
    this.containerId = containerId
  }

  public getEditor(): GrapesEditor | null {
    return this.editor
  }

  public init() {
    if (this.editor) return

    // Initialize GrapesJS without the default UI panels,
    // but keeping the visual canvas and core functionalities intact.
    this.editor = grapesjs.init({
      container: `#${this.containerId}`,
      height: '100%',
      width: '100%',
      // We don't use headless: true to ensure the canvas and frames render correctly.
      // Instead, we disable default panels and UI components.
      panels: { defaults: [] },
      blockManager: { appendTo: '' }, // We will manage blocks externally
      styleManager: { appendTo: '' }, // We will manage styles externally
      layerManager: { appendTo: '' }, // We will manage layers externally
      traitManager: { appendTo: '' }, // We will manage traits externally
      selectorManager: { appendTo: '' }, // We will manage selectors externally
      storageManager: false, // We will handle our own storage
      undoManager: { trackSelection: false }, // Let GrapesJS handle undo/redo of content
    })

    this.setupListeners()
  }

  private setupListeners() {
    if (!this.editor) return

    const store = useImportStudioStore.getState()

    // Sync selection
    this.editor.on('component:selected', (model) => {
      store.setSelectedElementId(model.getId())
    })
    
    this.editor.on('component:deselected', () => {
      store.setSelectedElementId(null)
    })

    // Listen to changes to mark as saving/saved in the future
    // this.editor.on('change:changesCount', () => { ... })
  }

  public destroy() {
    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
  }

  // --- Undo/Redo API ---
  
  public undo() {
    if (this.editor) this.editor.UndoManager.undo()
  }

  public redo() {
    if (this.editor) this.editor.UndoManager.redo()
  }

  public canUndo(): boolean {
    return this.editor ? this.editor.UndoManager.hasUndo() : false
  }

  public canRedo(): boolean {
    return this.editor ? this.editor.UndoManager.hasRedo() : false
  }

  public undoManagerClear() {
    if (this.editor) this.editor.UndoManager.clear()
  }

  // --- External Content Loading ---
  
  public loadHTML(html: string, css: string = '') {
    if (this.editor) {
      this.editor.setComponents(html)
      this.editor.setStyle(css)
    }
  }

  public getHTML(): string {
    return this.editor ? (this.editor.getHtml() || '') : ''
  }

  public getCSS(): string {
    return this.editor ? (this.editor.getCss() || '') : ''
  }
  public getProjectData(): any {
    return this.editor ? this.editor.getProjectData() : null
  }

  public loadProjectData(data: any) {
    if (this.editor && data) {
      this.editor.loadProjectData(data)
    }
  }
}

// Singleton pattern for the adapter for now, or could be instantiated per editor view
export const editorAdapter = new GrapesEditorAdapter('gjs')
