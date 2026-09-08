import { useState, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface PortfolioItem {
  id: string
  title: string
  category: string
  client?: string
  date?: string
  description?: string
  image?: string
}

interface PortfolioProps {
  title?: string
  subtitle?: string
  items?: PortfolioItem[]
}

const defaultPortfolio: PortfolioItem[] = [
  {
    id: 'proj-threads',
    title: 'Threads',
    category: 'Illustration',
    client: 'Threads',
    description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
    image: '/assets/templates/agency/img/portfolio/1.jpg',
  },
  {
    id: 'proj-explore',
    title: 'Explore',
    category: 'Graphic Design',
    client: 'Explore',
    description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
    image: '/assets/templates/agency/img/portfolio/2.jpg',
  },
  {
    id: 'proj-finish',
    title: 'Finish',
    category: 'Identity',
    client: 'Finish',
    description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
    image: '/assets/templates/agency/img/portfolio/3.jpg',
  },
  {
    id: 'proj-lines',
    title: 'Lines',
    category: 'Branding',
    client: 'Lines',
    description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
    image: '/assets/templates/agency/img/portfolio/4.jpg',
  },
  {
    id: 'proj-southwest',
    title: 'Southwest',
    category: 'Website Design',
    client: 'Southwest',
    description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
    image: '/assets/templates/agency/img/portfolio/5.jpg',
  },
  {
    id: 'proj-window',
    title: 'Window',
    category: 'Photography',
    client: 'Window',
    description: 'Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!',
    image: '/assets/templates/agency/img/portfolio/6.jpg',
  },
]

export function PortfolioGridBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const props = (block.props || {}) as unknown as PortfolioProps
  const items = props.items || defaultPortfolio
  const [activeModal, setActiveModal] = useState<PortfolioItem | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  // Escape key handler and focus management
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && activeModal) {
        closeModal()
      }
    }
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown)
      modalRef.current?.focus()
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal])

  function openModal(item: PortfolioItem, e: React.MouseEvent<HTMLButtonElement>) {
    triggerRef.current = e.currentTarget
    setActiveModal(item)
  }

  function closeModal() {
    setActiveModal(null)
    setTimeout(() => {
      triggerRef.current?.focus()
    }, 50)
  }

  return (
    <section id="portfolio" className="py-24 px-6 sm:px-10 bg-[#f8f9fa] text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900">
            <InlineText
              value={props.title || 'PORTFOLIO'}
              as="span"
              onChange={(val) => updateBlockProps(block.id, { title: val })}
            />
          </h2>
          <p className="text-base sm:text-lg text-slate-500 italic max-w-xl mx-auto font-serif">
            <InlineText
              value={props.subtitle || 'Lorem ipsum dolor sit amet consectetur.'}
              as="span"
              onChange={(val) => updateBlockProps(block.id, { subtitle: val })}
            />
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-lg flex flex-col"
            >
              {/* Image / Thumbnail with Plus Hover Overlay */}
              <button
                type="button"
                onClick={(e) => openModal(item, e)}
                aria-haspopup="dialog"
                aria-label={`Ver detalhes do projeto ${item.title}`}
                className="relative h-64 w-full overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ffc800] block"
              >
                <img
                  src={item.image || `/assets/templates/agency/img/portfolio/1.jpg`}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />

                {/* Golden Hover Overlay */}
                <div className="absolute inset-0 bg-[#ffc800]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                    <Plus size={44} strokeWidth={3} />
                  </div>
                </div>
              </button>

              {/* Card Meta */}
              <div className="p-6 text-center space-y-1 bg-white">
                <h4 className="text-xl font-bold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-500 italic font-serif">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Project Modal */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${activeModal.id}`}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-white text-slate-900 rounded-none p-8 sm:p-14 shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto focus:outline-none"
          >
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <img
                src="/assets/templates/agency/img/close-icon.svg"
                alt="Close modal"
                className="w-7 h-7"
              />
            </button>

            {/* Modal Content */}
            <div className="text-center space-y-2">
              <h2 id={`modal-title-${activeModal.id}`} className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
                {activeModal.title}
              </h2>
              <p className="text-base text-slate-500 italic font-serif">Lorem ipsum dolor sit amet consectetur.</p>
            </div>

            {/* Project Image */}
            <div className="w-full max-w-xl mx-auto overflow-hidden">
              <img
                src={activeModal.image || `/assets/templates/agency/img/portfolio/1.jpg`}
                alt={activeModal.title}
                className="w-full h-auto object-cover rounded-none"
              />
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto text-center">
              {activeModal.description}
            </p>

            {/* Meta list */}
            <ul className="text-sm text-slate-600 space-y-1 text-center font-sans">
              <li>
                <strong className="text-slate-800">Client:</strong> {activeModal.client || activeModal.title}
              </li>
              <li>
                <strong className="text-slate-800">Category:</strong> {activeModal.category}
              </li>
            </ul>

            {/* Close CTA Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-8 py-4 bg-[#ffc800] hover:bg-[#d9aa00] text-white font-extrabold text-sm uppercase tracking-wider rounded-sm transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <X size={18} strokeWidth={3} />
                CLOSE PROJECT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
