import { useState, useRef, useEffect, type DragEvent } from 'react'
import { Image as ImageIcon, Upload, Trash2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore } from '@/store/editorStore'

interface InlineImageProps {
  src?: string
  alt?: string
  className?: string
  aspectRatio?: string
  onChange: (newSrc: string, newAlt?: string) => void
  onRemove?: () => void
  fallbackLabel?: string
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

export function InlineImage({
  src,
  alt = '',
  className = '',
  aspectRatio = 'aspect-video',
  onChange,
  onRemove,
  fallbackLabel = 'Clique ou arraste uma imagem aqui',
}: InlineImageProps) {
  const previewMode = useEditorStore((s) => s.previewMode)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeBlobUrlRef = useRef<string | null>(null)

  // Limpeza de Object URLs ao desmontar componente
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(activeBlobUrlRef.current)
      }
    }
  }, [])

  function processFile(file: File) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Formato não suportado. Use PNG, JPG, WEBP ou SVG.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('O ficheiro excede o limite máximo de 5MB.')
      return
    }

    // Revogar blob anterior se existente
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
    }

    const blobUrl = URL.createObjectURL(file)
    activeBlobUrlRef.current = blobUrl
    onChange(blobUrl, alt || file.name)
    toast.success('Imagem temporária carregada na sessão de memória.', {
      description: 'Será necessária gravação em storage seguro para permanência.',
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Limpa valor para permitir selecionar o mesmo arquivo novamente se desejar
    if (e.target) e.target.value = ''
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  if (previewMode) {
    if (!src) return null
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-xl ${aspectRatio} ${className}`}
      />
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group/image overflow-hidden rounded-xl border border-dashed transition-all ${aspectRatio} ${
        isDragging
          ? 'border-primary bg-primary/20 scale-[1.01]'
          : src
          ? 'border-border/60 hover:border-primary/80'
          : 'border-border bg-secondary/50 flex flex-col items-center justify-center p-6 text-center'
      } ${className}`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {src ? (
        <>
          <img src={src} alt={alt} className="w-full h-full object-cover" />

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md"
              >
                <Upload size={13} />
                <span>Substituir</span>
              </button>

              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (activeBlobUrlRef.current) URL.revokeObjectURL(activeBlobUrlRef.current)
                    onRemove()
                    toast('Imagem removida')
                  }}
                  className="px-3 py-1.5 rounded-lg bg-destructive/90 text-white text-xs font-semibold hover:bg-destructive transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Trash2 size={13} />
                  <span>Remover</span>
                </button>
              )}
            </div>

            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <Info size={11} className="text-primary" />
              Ou arraste um ficheiro PNG/JPG/WEBP
            </span>
          </div>
        </>
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ImageIcon size={20} />
          </div>
          <span className="text-xs font-medium text-foreground">{fallbackLabel}</span>
          <span className="text-[11px] text-muted-foreground">PNG, JPG, WEBP até 5MB</span>
        </div>
      )}
    </div>
  )
}
