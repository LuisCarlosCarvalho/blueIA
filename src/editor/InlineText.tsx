import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent, type MouseEvent } from 'react'
import { Pencil } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'

interface InlineTextProps {
  value: string
  onChange: (newValue: string) => void
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'button'
  className?: string
  placeholder?: string
  multiline?: boolean
  maxLength?: number
  allowEmpty?: boolean
  ariaLabel?: string
}

export function InlineText({
  value,
  onChange,
  as: Component = 'span',
  className = '',
  placeholder = 'Escreva o texto...',
  multiline = false,
  maxLength = 2000,
  allowEmpty = false,
  ariaLabel,
}: InlineTextProps) {
  const previewMode = useEditorStore((s) => s.previewMode)
  const [isEditing, setIsEditing] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const isParagraph = Component === 'p' || Component === 'div' || multiline

  // Sincronizar valor externo quando não estiver em edição ativa
  useEffect(() => {
    if (!isEditing && elementRef.current) {
      const current = elementRef.current.textContent || ''
      const target = value || ''
      if (current !== target && !(current === placeholder && !value)) {
        elementRef.current.textContent = target || placeholder
      }
    }
  }, [value, isEditing, placeholder])

  // Ajustar foco e posicionar cursor no fim sem selecionar todo o texto em azul
  useEffect(() => {
    if (isEditing && elementRef.current) {
      const el = elementRef.current
      el.focus()

      const selection = window.getSelection()
      if (selection && selection.rangeCount === 0) {
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [isEditing])

  if (previewMode) {
    return <Component className={`max-w-full break-words ${className}`}>{value || placeholder}</Component>
  }

  function handleStartEditing(e?: MouseEvent) {
    if (e) e.stopPropagation()
    setIsSelected(false)
    setIsEditing(true)
  }

  function handleCommit() {
    if (!elementRef.current) {
      setIsEditing(false)
      setIsSelected(false)
      return
    }

    // Leitura estrita por textContent, nunca por innerHTML
    let text = elementRef.current.textContent || ''
    if (text === placeholder) text = ''
    text = text.trim().slice(0, maxLength)

    if (!text && !allowEmpty) {
      // Se não permite vazio, restaura o valor anterior sem quebrar o componente
      elementRef.current.textContent = value || placeholder
      setIsEditing(false)
      setIsSelected(false)
      return
    }

    if (text !== value) {
      onChange(text)
    } else {
      elementRef.current.textContent = value || placeholder
    }

    setIsEditing(false)
    setIsSelected(false)
  }

  function handleCancel() {
    if (elementRef.current) {
      elementRef.current.textContent = value || placeholder
    }
    setIsEditing(false)
    setIsSelected(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleCancel()
      return
    }

    if (e.key === 'Enter') {
      // Parágrafos: Shift + Enter permite quebra de linha; Enter confirma
      if (isParagraph && e.shiftKey) {
        return
      }

      // Em títulos, botões e spans (ou Enter normal em parágrafo), confirma imediatamente
      e.preventDefault()
      e.stopPropagation()
      handleCommit()
      return
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLElement>) {
    e.preventDefault()
    // Sanitização estrita: apenas texto puro, rejeita qualquer tag ou formatação HTML
    const text = e.clipboardData.getData('text/plain')
    if (!text) return

    // Normalizar quebras de linha para texto simples
    const cleanText = isParagraph ? text : text.replace(/[\r\n]+/g, ' ')

    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const range = selection.getRangeAt(0)
    range.deleteContents()
    const textNode = document.createTextNode(cleanText)
    range.insertNode(textNode)

    range.setStartAfter(textNode)
    range.setEndAfter(textNode)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const isBlock = Component === 'h1' || Component === 'h2' || Component === 'h3' || 
                  Component === 'h4' || Component === 'h5' || Component === 'h6' || 
                  Component === 'p' || Component === 'div'

  const accessibleLabel = ariaLabel || (typeof value === 'string' && value ? `Editar: ${value}` : `Editar ${Component}`)

  return (
    <span className={`relative group/text-wrapper max-w-full ${isBlock ? 'block w-full min-w-0' : 'inline-block align-middle'}`}>
      <Component
        ref={elementRef as React.RefObject<any>}
        role="textbox"
        aria-label={accessibleLabel}
        aria-multiline={isParagraph}
        tabIndex={0}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onPaste={handlePaste}
        onKeyDown={isEditing ? handleKeyDown : (e: any) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            handleStartEditing()
          }
        }}
        onClick={(e: MouseEvent) => {
          if (isEditing) {
            e.stopPropagation()
          } else if (isSelected) {
            e.stopPropagation()
            handleStartEditing(e)
          }
          // Quando não está em edição, deixa o clique propagar para o SelectableElement
          // para selecionar apenas o elemento com sua moldura justa
        }}
        onDoubleClick={(e: MouseEvent) => {
          e.stopPropagation()
          handleStartEditing(e)
        }}
        onBlur={isEditing ? handleCommit : () => setIsSelected(false)}
        title={isEditing ? (isParagraph ? 'Shift + Enter para nova linha, Enter para salvar' : 'Enter para confirmar, Esc para cancelar') : 'Clique para selecionar, duplo clique para editar o texto'}
        className={`transition-all duration-150 outline-none max-w-full break-words bg-transparent overflow-hidden ${
          isEditing
            ? 'ring-2 ring-primary ring-offset-1 rounded-xs bg-transparent cursor-text caret-primary shadow-xs'
            : 'hover:outline-dashed hover:outline-1 hover:outline-primary/40 focus-visible:ring-2 focus-visible:ring-primary rounded-xs cursor-pointer'
        } ${className}`}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}
      >
        {value || <span className="opacity-40 italic">{placeholder}</span>}
      </Component>

      {/* Alça discreta contextual de edição */}
      {!isEditing && isSelected && (
        <span
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-semibold shadow-md whitespace-nowrap animate-scale-in select-none cursor-pointer pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation()
            handleStartEditing()
          }}
        >
          <Pencil size={9} />
          <span>Editar</span>
        </span>
      )}
    </span>
  )
}
