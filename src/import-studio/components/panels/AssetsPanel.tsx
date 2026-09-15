import { useEffect, useState, useRef } from 'react'
import { editorAdapter } from '../../GrapesEditorAdapter'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'

export function AssetsPanel() {
  const [assets, setAssets] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadAssets = () => {
    const editor = editorAdapter.getEditor()
    if (!editor) return
    const am = editor.AssetManager
    setAssets(am.getAll().models)
  }

  useEffect(() => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    loadAssets()
    editor.on('asset:add asset:remove', loadAssets)

    return () => {
      editor.off('asset:add asset:remove', loadAssets)
    }
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const editor = editorAdapter.getEditor()
    if (!editor) return

    const am = editor.AssetManager
    
    // Read files as Data URLs (Base64) to add to GrapesJS
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          am.add({
            src: dataUrl,
            name: file.name,
            type: 'image'
          })
        }
      }
      reader.readAsDataURL(file)
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (asset: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const editor = editorAdapter.getEditor()
    if (editor) {
      editor.AssetManager.remove(asset.get('src'))
    }
  }

  const handleSelect = (asset: any) => {
    const editor = editorAdapter.getEditor()
    if (!editor) return

    const selected = editor.getSelected()
    if (selected && selected.is('image')) {
      selected.set('src', asset.get('src'))
    } else {
      // Append a new image component
      const target = selected || editor.getWrapper()
      target?.append({
        type: 'image',
        src: asset.get('src')
      })
    }
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Assets</h3>
        <button 
          onClick={handleUploadClick}
          className="bg-primary/10 text-primary hover:bg-primary hover:text-black transition-colors px-3 py-1 rounded text-xs font-medium flex items-center gap-1"
        >
          <Upload size={12} /> Upload
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden" 
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <ImageIcon size={32} className="opacity-20" />
            <p className="text-xs">No assets uploaded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map(asset => (
              <div 
                key={asset.cid || asset.get('src')}
                className="group relative border border-border rounded overflow-hidden aspect-square cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleSelect(asset)}
              >
                <img 
                  src={asset.get('src')} 
                  alt={asset.get('name') || 'Asset'} 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={(e) => handleDelete(asset, e)}
                  className="absolute top-1 right-1 w-6 h-6 bg-background/80 text-foreground hover:text-red-500 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-[9px] text-foreground p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {asset.get('name') || 'image'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
