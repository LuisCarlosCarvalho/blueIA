import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SiteConfig } from '../src/blocks/types'

vi.mock('../src/lib/generate-site', () => ({ generateSiteConfig: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const document: SiteConfig = { name: 'Existing project', blocks: [{ id: 'hero', type: 'hero', variant: 'centered', props: { headline: 'Original' } }] }
const cleanups: Array<() => void> = []

beforeEach(() => {
  vi.resetModules()
  const data = new Map<string, string>()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  }
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage })
})
afterEach(() => { cleanups.splice(0).forEach((cleanup) => cleanup()); vi.unstubAllGlobals(); vi.clearAllMocks() })

async function session() {
  const { useProjectsStore: projects } = await import('../src/store/projectsStore')
  const { useConfigStore: config } = await import('../src/store/configStore')
  const { useEditorStore: editor } = await import('../src/store/editorStore')
  const lifecycle = await import('../src/editor/useEditorSession')
  const id = projects.getState().addProject('Existing project')
  projects.getState().updateProjectConfig(id, document)
  editor.getState().setActiveProject(id)
  return { projects, config, editor, id, ...lifecycle }
}

describe('shared Studio and Tink lifecycle', () => {
  it('restores the selected project, syncs edits in both modes and recovers the saved draft', async () => {
    const s = await session()
    cleanups.push(s.restoreEditorProject())
    expect(s.config.getState().config.name).toBe('Existing project')
    for (const mode of ['studio_bolt', 'bolt_tink_ai'] as const) {
      s.editor.getState().setStudioModel(mode)
      s.config.getState().updateBlockProps('hero', { headline: mode })
      expect(s.projects.getState().projects[0].config?.blocks[0].props.headline).toBe(mode)
    }
    cleanups.pop()?.()
    s.config.getState().setConfig({ name: 'Stale memory', blocks: [] })
    cleanups.push(s.restoreEditorProject())
    expect(s.config.getState().config.blocks[0].props.headline).toBe('bolt_tink_ai')
    expect(s.projects.getState().projects).toHaveLength(1)
  })

  it('finishes a pending Dashboard generation in Tink and survives a mode switch', async () => {
    const s = await session()
    cleanups.push(s.restoreEditorProject())
    s.editor.getState().setStudioModel('bolt_tink_ai')
    s.editor.getState().setGenerating('A real request')
    const { generateSiteConfig } = await import('../src/lib/generate-site')
    let finish!: (value: { config: SiteConfig; source: 'ai' }) => void
    vi.mocked(generateSiteConfig).mockReturnValue(new Promise((resolve) => { finish = resolve }))
    cleanups.push(s.runEditorGeneration('A real request'))
    s.editor.getState().setStudioModel('studio_bolt')
    finish({ config: { ...document, name: 'Generated' }, source: 'ai' })
    await vi.waitFor(() => expect(s.editor.getState().isGenerating).toBe(false))
    expect(s.projects.getState().projects[0].config?.name).toBe('Generated')
    expect(s.config.getState().config.name).toBe('Generated')
    expect(generateSiteConfig).toHaveBeenCalledTimes(1)
  })

  it('reports generation failure without replacing the current draft', async () => {
    const s = await session()
    cleanups.push(s.restoreEditorProject())
    s.editor.getState().setGenerating('Request')
    const { generateSiteConfig } = await import('../src/lib/generate-site')
    vi.mocked(generateSiteConfig).mockRejectedValue(new Error('Authentication required'))
    cleanups.push(s.runEditorGeneration('Request'))
    await vi.waitFor(() => expect(s.editor.getState().isGenerating).toBe(false))
    expect(s.editor.getState().generationError).toBe('Authentication required')
    expect(s.config.getState().config.name).toBe('Existing project')
  })
})
