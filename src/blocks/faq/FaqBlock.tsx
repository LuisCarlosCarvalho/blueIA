import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { BlockConfig } from '../types'

interface FaqItem {
  question: string
  answer: string
}

interface FaqProps {
  title?: string
  subtitle?: string
  items?: FaqItem[]
}

const defaultFaqs: FaqItem[] = [
  { question: 'What is Blue IA?', answer: 'Blue IA is a visual website builder that uses structured JSON config as the source of truth. Both humans and AI agents can edit the same config to build beautiful websites.' },
  { question: 'How does the JSON config work?', answer: 'Every website is represented as a JSON document with blocks, styles, and content. The visual editor reads and writes this JSON, and agents can make surgical edits via the API.' },
  { question: 'Can I use my own components?', answer: 'Yes! Blue IA supports custom components. You can build your own blocks following our component schema and register them in the block registry.' },
  { question: 'Is it free to use?', answer: 'Blue IA offers a free tier for personal projects with up to 5 blocks. Pro and Team plans unlock unlimited blocks, custom domains, and priority support.' },
]

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[13.5px] font-medium text-foreground group-hover:text-primary transition-colors">
          {item.question}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-[12.5px] text-muted-foreground leading-relaxed pr-8">
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export function FaqBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as FaqProps
  const items = props.items || defaultFaqs
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      <div className="reveal-fade-up reveal-d1 text-center mb-10">
        <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
          {props.title || 'Frequently Asked Questions'}
        </h2>
        {props.subtitle && (
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">{props.subtitle}</p>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {items.map((item, i) => (
          <div key={i} className={`reveal-fade-up reveal-d${Math.min(i + 2, 8)}`}>
            <AccordionItem
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
