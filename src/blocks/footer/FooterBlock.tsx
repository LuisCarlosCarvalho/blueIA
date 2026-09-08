import { Twitter, Facebook, Linkedin } from 'lucide-react'
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface FooterProps {
  logo?: string
  copyright?: string
  links?: string[]
}

function FooterAgency({ blockId, props }: { blockId: string; props: FooterProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const links = props.links || ['Privacy Policy', 'Terms of Use']

  function handleUpdateLink(index: number, newText: string) {
    const updated = [...links]
    updated[index] = newText
    updateBlockProps(blockId, { links: updated })
  }

  return (
    <footer className="py-8 px-6 sm:px-12 bg-white text-slate-700 font-sans border-t border-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Copyright */}
        <div className="text-sm text-slate-600 font-medium">
          <InlineText
            value={props.copyright || 'Copyright © Your Website 2023'}
            onChange={(val) => updateBlockProps(blockId, { copyright: val })}
          />
        </div>

        {/* Center: Social Icons */}
        <div className="flex items-center gap-3">
          <a
            href="#twitter"
            aria-label="Twitter"
            className="w-10 h-10 rounded-full bg-[#212529] text-white hover:bg-[#ffc800] hover:text-white flex items-center justify-center transition-colors shadow-xs"
          >
            <Twitter size={16} />
          </a>
          <a
            href="#facebook"
            aria-label="Facebook"
            className="w-10 h-10 rounded-full bg-[#212529] text-white hover:bg-[#ffc800] hover:text-white flex items-center justify-center transition-colors shadow-xs"
          >
            <Facebook size={16} />
          </a>
          <a
            href="#linkedin"
            aria-label="LinkedIn"
            className="w-10 h-10 rounded-full bg-[#212529] text-white hover:bg-[#ffc800] hover:text-white flex items-center justify-center transition-colors shadow-xs"
          >
            <Linkedin size={16} />
          </a>
        </div>

        {/* Right: Policy Links */}
        <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
          {links.map((link, i) => (
            <span key={i} className="hover:text-slate-900 hover:underline cursor-pointer">
              <InlineText
                value={link}
                onChange={(val) => handleUpdateLink(i, val)}
              />
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

function FooterSimple({ blockId, props }: { blockId: string; props: FooterProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const links = props.links || ['Termos de Serviço', 'Privacidade', 'Segurança', 'Contacto']

  function handleUpdateLink(index: number, newText: string) {
    const updated = [...links]
    updated[index] = newText
    updateBlockProps(blockId, { links: updated })
  }

  return (
    <footer className="px-6 @md:px-10 py-8 border-t border-border/60 bg-background/40">
      <div className="flex flex-col @lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
            ⚡
          </div>
          <span className="text-sm font-semibold text-foreground">
            <InlineText
              value={props.logo || 'Blue IA'}
              onChange={(val) => updateBlockProps(blockId, { logo: val })}
            />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {links.map((link, i) => (
            <span
              key={i}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <InlineText
                value={link}
                onChange={(val) => handleUpdateLink(i, val)}
              />
            </span>
          ))}
        </div>

        <span className="text-[11px] text-muted-foreground">
          <InlineText
            value={props.copyright || `© ${new Date().getFullYear()} Todos os direitos reservados.`}
            onChange={(val) => updateBlockProps(blockId, { copyright: val })}
          />
        </span>
      </div>
    </footer>
  )
}

function FooterMinimal({ blockId, props }: { blockId: string; props: FooterProps }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)

  return (
    <footer className="px-6 @md:px-10 py-6 border-t border-border/40 text-center">
      <span className="text-[11px] text-muted-foreground">
        <InlineText
          value={props.copyright || `© ${new Date().getFullYear()} ${props.logo || 'Blue IA'}.`}
          onChange={(val) => updateBlockProps(blockId, { copyright: val })}
        />
      </span>
    </footer>
  )
}

export function FooterBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as FooterProps
  const isAgency = block.id.includes('agency') || block.variant === 'multi-column'

  if (isAgency) {
    return <FooterAgency blockId={block.id} props={props} />
  }

  switch (block.variant) {
    case 'minimal':
      return <FooterMinimal blockId={block.id} props={props} />
    default:
      return <FooterSimple blockId={block.id} props={props} />
  }
}
