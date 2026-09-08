import { useEditorStore } from '@/store/editorStore'
import { EditorLayout } from '@/editor/EditorLayout'
import { BoltTinkAiLayout } from '@/editor/BoltTinkAiLayout'

export function Editor() {
  const studioModel = useEditorStore((s) => s.studioModel)

  if (studioModel === 'bolt_tink_ai') {
    return <BoltTinkAiLayout />
  }

  return <EditorLayout />
}
