import type { BlockConfig } from '../types'
import { ArrowRight, Sparkles } from 'lucide-react'
import { InlineText } from '@/editor/InlineText'
import { InlineImage } from '@/editor/InlineImage'
import { SelectableElement } from '@/editor/SelectableElement'
import { FreeLayoutContainer, type FreeElementDef } from '@/editor/FreeLayoutContainer'
import { useConfigStore } from '@/store/configStore'

interface HeroProps {
  badge?: string
  headline: string
  subheadline: string
  primaryCta: string
  secondaryCta?: string
  imageUrl?: string
  imageAlt?: string
  bgImage?: string
  backgroundImage?: string
}

function HeroCentered({ block, props }: { block: BlockConfig; props: HeroProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const blockId = block.id
  const align = block.layout?.align || 'center'
  const ctaWidth = block.layout?.ctaWidth || 'auto'
  const bgImg = props.backgroundImage || props.bgImage
  const isAgencyMasthead = !!bgImg || blockId.includes('agency')

  const alignClasses =
    align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center'

  const justifyClasses =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  if (isAgencyMasthead) {
    return (
      <section
        className={`px-6 sm:px-12 py-32 sm:py-48 flex flex-col relative text-white ${alignClasses} justify-center font-sans`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImg || '/assets/templates/agency/img/header-bg.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtitle / Masthead Subheading */}
        {props.badge && (
          <SelectableElement id={`${blockId}.badge`} name="Subtítulo" blockId={blockId} className="mb-6">
            <div className="font-serif italic text-2xl sm:text-4xl text-slate-100 tracking-normal drop-shadow-md">
              <InlineText
                value={props.badge}
                onChange={(val) => updateBlockProps(blockId, { badge: val })}
              />
            </div>
          </SelectableElement>
        )}

        {/* Headline */}
        <div className={`mb-10 max-w-4xl ${align === 'center' ? 'mx-auto' : ''}`}>
          <SelectableElement id={`${blockId}.headline`} name="Título" blockId={blockId} className="w-fit max-w-full">
            <h1 className="text-4xl sm:text-7xl font-extrabold uppercase tracking-wide text-white leading-tight drop-shadow-lg">
              <InlineText
                value={props.headline}
                as="h1"
                multiline
                onChange={(val) => updateBlockProps(blockId, { headline: val })}
              />
            </h1>
          </SelectableElement>
        </div>

        {/* Optional Subheadline */}
        {props.subheadline && (
          <div className={`mb-10 max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
            <SelectableElement id={`${blockId}.subheadline`} name="Descrição" blockId={blockId} className="w-fit max-w-full">
              <p className="text-slate-200 text-base sm:text-lg leading-relaxed drop-shadow-sm font-serif italic">
                <InlineText
                  value={props.subheadline}
                  as="p"
                  multiline
                  onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
                />
              </p>
            </SelectableElement>
          </div>
        )}

        {/* CTA Button */}
        <div className={`flex flex-wrap items-center gap-4 ${justifyClasses}`}>
          <SelectableElement id={`${blockId}.primaryCta`} name="Botão principal" blockId={blockId}>
            <a
              href="#services"
              className="px-10 py-5 rounded-md bg-[#ffc800] hover:bg-[#d9aa00] text-white text-base sm:text-lg font-extrabold uppercase tracking-wider transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center cursor-pointer"
            >
              <InlineText
                value={props.primaryCta}
                onChange={(val) => updateBlockProps(blockId, { primaryCta: val })}
              />
            </a>
          </SelectableElement>
        </div>
      </section>
    )
  }

  return (
    <section className={`px-6 @md:px-10 py-20 @md:py-28 flex flex-col ${alignClasses}`}>
      {/* Badge */}
      <SelectableElement id={`${blockId}.badge`} name="Destaque" blockId={blockId} className="mb-6">
        <div className="reveal-fade-up reveal-d1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
          <Sparkles size={12} />
          <InlineText
            value={props.badge || 'Destaque'}
            onChange={(val) => updateBlockProps(blockId, { badge: val })}
          />
        </div>
      </SelectableElement>

      {/* Headline */}
      <div className={`mb-4 max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
        <SelectableElement id={`${blockId}.headline`} name="Título" blockId={blockId} className="w-fit max-w-full">
          <h1 className="reveal-fade-up reveal-d2 text-4xl @md:text-5xl font-bold tracking-tight leading-[1.1]">
            <InlineText
              value={props.headline}
              as="h1"
              multiline
              onChange={(val) => updateBlockProps(blockId, { headline: val })}
            />
          </h1>
        </SelectableElement>
      </div>

      {/* Subheadline */}
      <div className={`mb-8 max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}>
        <SelectableElement id={`${blockId}.subheadline`} name="Subtítulo" blockId={blockId} className="w-fit max-w-full">
          <p className="reveal-fade-up reveal-d3 text-muted-foreground text-base @md:text-lg leading-relaxed">
            <InlineText
              value={props.subheadline}
              as="p"
              multiline
              onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
            />
          </p>
        </SelectableElement>
      </div>

      {/* CTAs */}
      <div className={`reveal-fade-up reveal-d4 flex flex-wrap items-center gap-3 ${justifyClasses} ${ctaWidth === 'full' ? 'w-full' : ''}`}>
        <SelectableElement id={`${blockId}.primaryCta`} name="Botão principal" blockId={blockId}>
          <button
            type="button"
            className={`px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 ${ctaWidth === 'full' ? 'w-full @sm:w-auto flex-1' : ''}`}
          >
            <InlineText
              value={props.primaryCta}
              onChange={(val) => updateBlockProps(blockId, { primaryCta: val })}
            />
            <ArrowRight size={16} />
          </button>
        </SelectableElement>

        {props.secondaryCta !== undefined && (
          <SelectableElement id={`${blockId}.secondaryCta`} name="Botão secundário" blockId={blockId}>
            <button
              type="button"
              className={`px-6 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border hover:bg-secondary/80 transition-all ${ctaWidth === 'full' ? 'w-full @sm:w-auto flex-1' : ''}`}
            >
              <InlineText
                value={props.secondaryCta}
                onChange={(val) => updateBlockProps(blockId, { secondaryCta: val })}
              />
            </button>
          </SelectableElement>
        )}
      </div>
    </section>
  )
}

function HeroSplit({ block, props }: { block: BlockConfig; props: HeroProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const blockId = block.id
  const direction = block.layout?.direction || 'row'

  const flexClass =
    direction === 'row-reverse'
      ? 'flex-col @2xl:flex-row-reverse'
      : direction === 'col'
      ? 'flex-col'
      : 'flex-col @2xl:flex-row'

  return (
    <section className={`px-6 @md:px-10 py-16 @md:py-24 flex items-center gap-10 ${flexClass}`}>
      {/* Text side */}
      <div className="flex-1 w-full space-y-4 flex flex-col items-start">
        <SelectableElement id={`${blockId}.badge`} name="Destaque" blockId={blockId}>
          <div className="reveal-fade-up reveal-d1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
            <Sparkles size={12} />
            <InlineText
              value={props.badge || 'Destaque'}
              onChange={(val) => updateBlockProps(blockId, { badge: val })}
            />
          </div>
        </SelectableElement>

        <SelectableElement id={`${blockId}.headline`} name="Título" blockId={blockId} className="w-fit max-w-full">
          <h1 className="reveal-fade-up reveal-d2 text-3xl @md:text-5xl font-bold tracking-tight leading-[1.1]">
            <InlineText
              value={props.headline}
              as="h1"
              multiline
              onChange={(val) => updateBlockProps(blockId, { headline: val })}
            />
          </h1>
        </SelectableElement>

        <SelectableElement id={`${blockId}.subheadline`} name="Subtítulo" blockId={blockId} className="w-fit max-w-lg">
          <p className="reveal-fade-up reveal-d3 text-muted-foreground text-base leading-relaxed">
            <InlineText
              value={props.subheadline}
              as="p"
              multiline
              onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
            />
          </p>
        </SelectableElement>

        <div className="reveal-fade-up reveal-d4 flex flex-wrap items-center gap-3 pt-2">
          <SelectableElement id={`${blockId}.primaryCta`} name="Botão principal" blockId={blockId}>
            <button
              type="button"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <InlineText
                value={props.primaryCta}
                onChange={(val) => updateBlockProps(blockId, { primaryCta: val })}
              />
              <ArrowRight size={16} />
            </button>
          </SelectableElement>

          {props.secondaryCta !== undefined && (
            <SelectableElement id={`${blockId}.secondaryCta`} name="Botão secundário" blockId={blockId}>
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border hover:bg-secondary/80 transition-all"
              >
                <InlineText
                  value={props.secondaryCta}
                  onChange={(val) => updateBlockProps(blockId, { secondaryCta: val })}
                />
              </button>
            </SelectableElement>
          )}
        </div>
      </div>

      {/* Visual side with InlineImage */}
      <div className="reveal-fade-up reveal-d3 flex-1 w-full">
        <SelectableElement id={`${blockId}.image`} name="Imagem" blockId={blockId} className="w-full block">
          <InlineImage
            src={props.imageUrl}
            alt={props.imageAlt || 'Hero visual preview'}
            aspectRatio="aspect-[4/3]"
            onChange={(newSrc, newAlt) =>
              updateBlockProps(blockId, { imageUrl: newSrc, imageAlt: newAlt })
            }
            onRemove={() => updateBlockProps(blockId, { imageUrl: undefined })}
            fallbackLabel="Arraste ou clique para adicionar imagem"
          />
        </SelectableElement>
      </div>
    </section>
  )
}

function HeroGradient({ block, props }: { block: BlockConfig; props: HeroProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const blockId = block.id

  return (
    <section className="px-6 @md:px-10 py-20 @md:py-32 text-center relative overflow-hidden flex flex-col items-center">
      <div className="relative z-10 flex flex-col items-center">
        <SelectableElement id={`${blockId}.badge`} name="Destaque" blockId={blockId} className="mb-6">
          <div className="reveal-fade-up reveal-d1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
            <Sparkles size={12} />
            <InlineText
              value={props.badge || 'Destaque'}
              onChange={(val) => updateBlockProps(blockId, { badge: val })}
            />
          </div>
        </SelectableElement>

        <div className="mb-4 max-w-3xl mx-auto">
          <SelectableElement id={`${blockId}.headline`} name="Título" blockId={blockId} className="w-fit max-w-full">
            <h1 className="reveal-fade-up reveal-d2 text-4xl @md:text-5xl font-bold tracking-tight leading-[1.1]">
              <InlineText
                value={props.headline}
                as="h1"
                multiline
                onChange={(val) => updateBlockProps(blockId, { headline: val })}
              />
            </h1>
          </SelectableElement>
        </div>

        <div className="mb-8 max-w-xl mx-auto">
          <SelectableElement id={`${blockId}.subheadline`} name="Subtítulo" blockId={blockId} className="w-fit max-w-full">
            <p className="reveal-fade-up reveal-d3 text-muted-foreground text-base @md:text-lg leading-relaxed">
              <InlineText
                value={props.subheadline}
                as="p"
                multiline
                onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
              />
            </p>
          </SelectableElement>
        </div>

        <div className="reveal-fade-up reveal-d4 flex flex-wrap items-center justify-center gap-3">
          <SelectableElement id={`${blockId}.primaryCta`} name="Botão principal" blockId={blockId}>
            <button
              type="button"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md"
            >
              <InlineText
                value={props.primaryCta}
                onChange={(val) => updateBlockProps(blockId, { primaryCta: val })}
              />
              <ArrowRight size={16} />
            </button>
          </SelectableElement>

          {props.secondaryCta !== undefined && (
            <SelectableElement id={`${blockId}.secondaryCta`} name="Botão secundário" blockId={blockId}>
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border hover:bg-secondary/80 transition-all shadow-sm"
              >
                <InlineText
                  value={props.secondaryCta}
                  onChange={(val) => updateBlockProps(blockId, { secondaryCta: val })}
                />
              </button>
            </SelectableElement>
          )}
        </div>
      </div>
    </section>
  )
}

function HeroFreeLayout({ block, props }: { block: BlockConfig; props: HeroProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const blockId = block.id

  const elements: FreeElementDef[] = [
    {
      id: 'badge',
      name: 'Destaque',
      resizable: 'none',
      defaultPosition: {
        desktop: { x: 40, y: 30, width: 140, height: 32 },
        tablet: { x: 30, y: 25 },
        mobile: { x: 20, y: 20, width: 130 },
      },
      content: (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium w-full h-full">
          <Sparkles size={12} />
          <InlineText
            value={props.badge || 'Destaque'}
            onChange={(val) => updateBlockProps(blockId, { badge: val })}
          />
        </div>
      ),
    },
    {
      id: 'headline',
      name: 'Título',
      resizable: 'horizontal',
      defaultPosition: {
        desktop: { x: 40, y: 80, width: 520, height: 110 },
        tablet: { x: 30, y: 70, width: 440 },
        mobile: { x: 20, y: 65, width: 300, height: 95 },
      },
      content: (
        <h1 className="text-3xl @md:text-4xl font-bold tracking-tight leading-[1.1] w-full">
          <InlineText
            value={props.headline}
            as="h1"
            multiline
            onChange={(val) => updateBlockProps(blockId, { headline: val })}
          />
        </h1>
      ),
    },
    {
      id: 'subheadline',
      name: 'Subtítulo',
      resizable: 'horizontal',
      defaultPosition: {
        desktop: { x: 40, y: 210, width: 480, height: 80 },
        tablet: { x: 30, y: 190, width: 400 },
        mobile: { x: 20, y: 175, width: 300, height: 70 },
      },
      content: (
        <p className="text-muted-foreground text-sm leading-relaxed w-full">
          <InlineText
            value={props.subheadline}
            as="p"
            multiline
            onChange={(val) => updateBlockProps(blockId, { subheadline: val })}
          />
        </p>
      ),
    },
    {
      id: 'cta',
      name: 'Botões',
      resizable: 'horizontal',
      defaultPosition: {
        desktop: { x: 40, y: 310, width: 340, height: 50 },
        tablet: { x: 30, y: 280, width: 320 },
        mobile: { x: 20, y: 260, width: 280 },
      },
      content: (
        <div className="flex flex-wrap items-center gap-3 w-full">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md"
          >
            <InlineText
              value={props.primaryCta}
              onChange={(val) => updateBlockProps(blockId, { primaryCta: val })}
            />
            <ArrowRight size={14} />
          </button>
          {props.secondaryCta !== undefined && (
            <button
              type="button"
              className="px-4 py-2.5 rounded-lg bg-secondary text-foreground text-xs font-medium border border-border hover:bg-secondary/80 transition-all"
            >
              <InlineText
                value={props.secondaryCta}
                onChange={(val) => updateBlockProps(blockId, { secondaryCta: val })}
              />
            </button>
          )}
        </div>
      ),
    },
    {
      id: 'image',
      name: 'Imagem',
      resizable: 'all',
      preserveRatio: true,
      defaultPosition: {
        desktop: { x: 600, y: 40, width: 440, height: 320 },
        tablet: { x: 480, y: 40, width: 240, height: 200 },
        mobile: { x: 20, y: 330, width: 300, height: 180 },
      },
      content: (
        <div className="w-full h-full overflow-hidden rounded-xl">
          <InlineImage
            src={props.imageUrl}
            alt={props.imageAlt || 'Hero visual preview'}
            aspectRatio="aspect-auto h-full w-full"
            onChange={(newSrc, newAlt) =>
              updateBlockProps(blockId, { imageUrl: newSrc, imageAlt: newAlt })
            }
            onRemove={() => updateBlockProps(blockId, { imageUrl: undefined })}
            fallbackLabel="Adicionar imagem"
          />
        </div>
      ),
    },
  ]

  return <FreeLayoutContainer blockId={blockId} elements={elements} minHeight={460} />
}

export function HeroBlock({ block }: { block: BlockConfig }) {
  const props = (block.props || {}) as unknown as HeroProps

  if (block.layout?.mode === 'free') {
    return <HeroFreeLayout block={block} props={props} />
  }

  switch (block.variant) {
    case 'split':
      return <HeroSplit block={block} props={props} />
    case 'gradient':
      return <HeroGradient block={block} props={props} />
    default:
      return <HeroCentered block={block} props={props} />
  }
}
