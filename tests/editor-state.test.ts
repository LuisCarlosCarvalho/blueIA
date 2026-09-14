import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isTextEditingTarget } from '../src/lib/keyboard-target'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

describe('editing focus', () => {
  it('ignores inherited contenteditable without invoking navigation', () => {
    expect(isTextEditingTarget({ isContentEditable: true, closest: () => null })).toBe(true)
  })
  it('recognizes form controls and explicit editable ancestors', () => {
    const closest = vi.fn().mockReturnValue({})
    expect(isTextEditingTarget({ isContentEditable: false, closest })).toBe(true)
    expect(closest).toHaveBeenCalledWith('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
  })
  it('keeps shortcuts outside editable areas', () => {
    expect(isTextEditingTarget({ isContentEditable: false, closest: () => null })).toBe(false)
  })
})

describe('local project migration and publication state', () => {
  let data: Map<string, string>
  beforeEach(() => {
    data = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    })
    vi.stubGlobal('window', { localStorage: globalThis.localStorage })
  })

  it('migrates existing projects without retaining a deployment credential', async () => {
    data.set('blueia-projects', JSON.stringify({ version: 0, state: { projects: [{
      id: 'p1', name: 'Preserved', status: 'draft', blockCount: 0, updatedAt: 'Just now',
      config: { name: 'Preserved', blocks: [] },
      settings: { siteName: 'Preserved', deployAccessKey: 'synthetic-test-value' },
    }] } }))
    const { useProjectsStore } = await import('../src/store/projectsStore')
    expect(useProjectsStore.getState().projects[0].settings).toEqual({ siteName: 'Preserved' })
    expect(useProjectsStore.getState().projects[0].config?.name).toBe('Preserved')
    expect(data.get('blueia-projects')).not.toContain('deployAccessKey')
  })

  it('never marks pending or invalid deployments as published', async () => {
    const { useProjectsStore } = await import('../src/store/projectsStore')
    const id = useProjectsStore.getState().addProject('Draft')
    useProjectsStore.getState().setDeployInfo(id, 'https://confirmed.example', 'dep-1', 'BUILDING')
    expect(useProjectsStore.getState().projects[0].status).toBe('draft')
    useProjectsStore.getState().setDeployInfo(id, 'javascript:invalid', 'dep-1', 'READY')
    expect(useProjectsStore.getState().projects[0].status).toBe('draft')
    useProjectsStore.getState().setDeployInfo(id, 'https://confirmed.example', 'dep-1', 'READY')
    expect(useProjectsStore.getState().projects[0].deployUrl).toBe('https://confirmed.example')
    expect(useProjectsStore.getState().projects[0].status).toBe('published')
  })

  it('restores the active project and studio mode across module reload', async () => {
    const first = await import('../src/store/editorStore')
    first.useEditorStore.getState().setActiveProject('existing-project')
    first.useEditorStore.getState().setStudioModel('bolt_tink_ai')
    vi.resetModules()
    const second = await import('../src/store/editorStore')
    expect(second.useEditorStore.getState().activeProjectId).toBe('existing-project')
    expect(second.useEditorStore.getState().studioModel).toBe('bolt_tink_ai')
  })
})
