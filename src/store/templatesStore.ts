import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SiteConfig } from '@/blocks/types'

export interface CustomTemplate {
  id: string
  name: string
  category: string
  subtitle: string
  accent: string
  createdAt: string
  config: SiteConfig
}

interface TemplatesState {
  templates: CustomTemplate[]
  addTemplate: (template: Omit<CustomTemplate, 'id' | 'createdAt'>) => string
  deleteTemplate: (id: string) => void
  renameTemplate: (id: string, name: string) => void
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) => {
        const id = `tpl-${Date.now()}`
        set((state) => ({
          templates: [
            {
              ...template,
              id,
              createdAt: new Date().toISOString(),
            },
            ...state.templates,
          ],
        }))
        return id
      },
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      renameTemplate: (id, name) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, name } : t
          ),
        })),
    }),
    {
      name: 'blueia-templates',
      version: 1,
    }
  )
)
