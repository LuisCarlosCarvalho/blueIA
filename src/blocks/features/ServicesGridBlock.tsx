import { ShoppingCart, Laptop, Lock } from 'lucide-react'
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface ServiceItem {
  id: string
  icon: 'ecommerce' | 'responsive' | 'security'
  title: string
  description: string
}

interface ServicesProps {
  title?: string
  subtitle?: string
  items?: ServiceItem[]
}

const defaultServices: ServiceItem[] = [
  {
    id: 'srv-1',
    icon: 'ecommerce',
    title: 'E-Commerce',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.',
  },
  {
    id: 'srv-2',
    icon: 'responsive',
    title: 'Responsive Design',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.',
  },
  {
    id: 'srv-3',
    icon: 'security',
    title: 'Web Security',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minima maxime quam architecto quo inventore harum ex magni, dicta impedit.',
  },
]

export function ServicesGridBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const props = (block.props || {}) as unknown as ServicesProps
  const items = props.items || defaultServices

  function renderIcon(type: ServiceItem['icon']) {
    switch (type) {
      case 'ecommerce':
        return <ShoppingCart size={40} strokeWidth={2} className="text-white" />
      case 'responsive':
        return <Laptop size={40} strokeWidth={2} className="text-white" />
      case 'security':
        return <Lock size={40} strokeWidth={2} className="text-white" />
      default:
        return <ShoppingCart size={40} strokeWidth={2} className="text-white" />
    }
  }

  return (
    <section id="services" className="py-24 px-6 sm:px-10 bg-white text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900">
            <InlineText
              value={props.title || 'SERVICES'}
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

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 text-center">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center space-y-4">
              {/* Golden circular badge */}
              <div className="w-28 h-28 rounded-full bg-[#ffc800] flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-300">
                {renderIcon(item.icon)}
              </div>
              <h4 className="text-2xl font-bold text-slate-900">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
