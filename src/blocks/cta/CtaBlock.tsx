import type { BlockConfig } from '../types'
import { ArrowRight } from 'lucide-react'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface CtaProps {
  headline: string
  subheadline?: string
  buttonText: string
}

function CtaSimple({ blockId, props }: { blockId: string; props: CtaProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20 text-center relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="reveal-fade-up reveal-d1 text-2xl @md:text-3xl font-bold tracking-tight mb-3">
          <InlineText
            value={props.headline}
            as="h2"
            multiline
            onChange={(val) => updateBlockProps(blockId, { headline: val })}
          />
        </h2>
        <p className="reveal-fade-up reveal-d2 text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          <InlineText
            value={props.subheadline || 'Entre em contacto para começar.'}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
          />
        </p>
        <div className="reveal-fade-up reveal-d3">
          <button
            type="button"
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md inline-flex items-center gap-2"
          >
            <InlineText
              value={props.buttonText}
              onChange={(val) => updateBlockProps(blockId, { buttonText: val })}
            />
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

function CtaSplit({ blockId, props }: { blockId: string; props: CtaProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)

  return (
    <section className="px-6 @md:px-10 py-12 @md:py-16">
      <div className="reveal-scale reveal-d1 flex flex-col @lg:flex-row items-center justify-between gap-6 p-8 rounded-xl bg-secondary border border-border relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl @md:text-2xl font-bold tracking-tight mb-1">
            <InlineText
              value={props.headline}
              as="h2"
              multiline
              onChange={(val) => updateBlockProps(blockId, { headline: val })}
            />
          </h2>
          <p className="text-muted-foreground text-sm">
            <InlineText
              value={props.subheadline || 'Acelere os seus resultados.'}
              as="p"
              multiline
              onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
            />
          </p>
        </div>
        <button
          type="button"
          className="relative z-10 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shrink-0 flex items-center gap-2 shadow-md"
        >
          <InlineText
            value={props.buttonText}
            onChange={(val) => updateBlockProps(blockId, { buttonText: val })}
          />
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  )
}

export function CtaBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as CtaProps

  switch (block.variant) {
    case 'split':
      return <CtaSplit blockId={block.id} props={props} />
    default:
      return <CtaSimple blockId={block.id} props={props} />
  }
}
