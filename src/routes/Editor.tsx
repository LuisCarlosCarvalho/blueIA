import { useEditorStore } from '@/store/editorStore'
import { EditorLayout } from '@/editor/EditorLayout'
import { BoltTinkAiLayout } from '@/editor/BoltTinkAiLayout'
import { ImportStudioLayout } from '@/import-studio/ImportStudioLayout'
import { useEditorSession } from '@/editor/useEditorSession'

export function Editor() {
  useEditorSession()
  const studioModel = useEditorStore((s) => s.studioModel)

  if (studioModel === 'bolt_tink_ai') {
    return <BoltTinkAiLayout />
  }

  if (studioModel === 'import_studio') {
    return <ImportStudioLayout />
  }

  return <EditorLayout />
}
