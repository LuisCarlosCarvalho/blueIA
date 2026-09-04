import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { businessSegments } from '@/lib/businessSegments'

interface SegmentSelectProps {
  value: string
  onChange: (val: string) => void
}

export function SegmentSelect({ value, onChange }: SegmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Handle outside click to close popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || 'Selecione o segmento do negócio'}
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown / Bottom Sheet */}
          <div className="fixed md:absolute inset-x-0 bottom-0 md:bottom-auto md:top-full md:mt-1 z-50 md:z-50 w-full md:w-full bg-card md:border md:border-border rounded-t-2xl md:rounded-lg shadow-2xl md:shadow-lg max-h-[85vh] md:max-h-64 flex flex-col md:block animate-fade-in-up md:animate-scale-in">

            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Selecione o segmento do negócio</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <ul
              ref={listRef}
              role="listbox"
              className="overflow-y-auto p-2 flex-1 md:flex-auto custom-scrollbar"
              style={{ overscrollBehavior: 'contain' }}
            >
              {businessSegments.map((seg) => {
                const isSelected = seg === value
                return (
                  <li
                    key={seg}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(seg)
                      setIsOpen(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onChange(seg)
                        setIsOpen(false)
                      }
                    }}
                    tabIndex={0}
                    className={`flex items-center justify-between px-3 py-2.5 md:py-2 text-sm rounded-md cursor-pointer outline-none transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-secondary focus:bg-secondary'
                    }`}
                  >
                    <span>{seg}</span>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
