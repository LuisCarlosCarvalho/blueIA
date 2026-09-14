import { useEffect } from 'react'
import { toast } from 'sonner'
import { useConfigStore } from '@/store/configStore'
import { useEditorStore } from '@/store/editorStore'
import { useProjectsStore } from '@/store/projectsStore'
import { generateSiteConfig } from '@/lib/generate-site'

export function restoreEditorProject() {
    const editor = useEditorStore.getState()
    const projects = useProjectsStore.getState()
    const current = useConfigStore.getState().config
    const project = projects.projects.find((p) => p.id === editor.activeProjectId) ?? projects.projects[0]
    const id = project?.id ?? projects.addProject(current.name || 'Meu Projeto')
    editor.setActiveProject(id)
    if (project?.config && !editor.isGenerating) {
      useConfigStore.getState().setConfig(project.config)
    } else {
      projects.updateProjectConfig(id, current)
    }

    return useConfigStore.subscribe((state, previous) => {
      if (state.config === previous.config) return
      const activeId = useEditorStore.getState().activeProjectId
      if (activeId) useProjectsStore.getState().updateProjectConfig(activeId, state.config)
    })
}

export function runEditorGeneration(prompt: string) {
    const controller = new AbortController()
    const projectId = useEditorStore.getState().activeProjectId
    const fail = (message: string) => {
      useEditorStore.getState().setGenerationError(message)
      useEditorStore.getState().clearGeneration()
      toast.error(message)
    }
    const timeout = setTimeout(() => {
      controller.abort()
      fail('Tempo limite de geração excedido. Tente novamente.')
    }, 30000)

    generateSiteConfig(prompt, controller.signal).then(({ config }) => {
      if (controller.signal.aborted) return
      if (projectId) {
        useProjectsStore.getState().updateProjectConfig(projectId, config)
        useProjectsStore.getState().renameProject(projectId, config.name)
      }
      if (useEditorStore.getState().activeProjectId === projectId) {
        useConfigStore.getState().setConfig(config)
      }
      useEditorStore.getState().clearGeneration()
      toast.success('Página gerada com IA.')
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        fail(error instanceof Error ? error.message : 'Não foi possível gerar a página.')
      }
    }).finally(() => clearTimeout(timeout))

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
}

/** Shared route lifecycle stays mounted while switching between studio layouts. */
export function useEditorSession() {
  const isGenerating = useEditorStore((s) => s.isGenerating)
  const prompt = useEditorStore((s) => s.generationPrompt)
  useEffect(restoreEditorProject, [])
  useEffect(() => {
    if (isGenerating && prompt) return runEditorGeneration(prompt)
  }, [isGenerating, prompt])
}
