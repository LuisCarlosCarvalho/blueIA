import { useState } from 'react'
import type { BlockConfig } from '../types'
import { Menu, X } from 'lucide-react'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface NavbarProps {
  logo?: string
  logoImage?: string
  links: string[]
  ctaText?: string
}

export function NavbarBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const props = (block.props || {}) as unknown as NavbarProps
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const {
    logo = 'AGENCY',
    logoImage = '/assets/templates/agency/img/navbar-logo.svg',
    links = ['SERVICES', 'PORTFOLIO', 'ABOUT', 'TEAM', 'CONTACT'],
  } = props

  function handleUpdateLink(index: number, newText: string) {
    const updated = [...links]
    updated[index] = newText
    updateBlockProps(block.id, { links: updated })
  }

  const isAgency = block.id.includes('agency') || logoImage?.includes('agency')

  if (isAgency) {
    return (
      <nav className="sticky top-0 z-40 px-6 sm:px-12 py-5 flex items-center justify-between bg-[#212529] text-white shadow-md font-sans">
        {/* Logo */}
        <div className="flex items-center">
          {logoImage ? (
            <img
              src={logoImage}
              alt="Start Bootstrap"
              className="h-8 w-auto max-w-[180px] object-contain cursor-pointer"
            />
          ) : (
            <span className="font-extrabold text-xl text-[#ffc800] tracking-wider uppercase">
              <InlineText
                value={logo}
                onChange={(val) => updateBlockProps(block.id, { logo: val })}
              />
            </span>
          )}
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-wider text-slate-200">
          {links.map((link, i) => {
            const anchor = `#${link.toLowerCase().trim()}`
            return (
              <a
                key={i}
                href={anchor}
                className="hover:text-[#ffc800] transition-colors cursor-pointer uppercase"
              >
                <InlineText
                  value={link}
                  onChange={(val) => handleUpdateLink(i, val)}
                />
              </a>
            )
          })}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden px-3 py-2 rounded bg-[#ffc800] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-[#d9aa00] transition-colors"
        >
          <span>MENU</span>
          {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
        </button>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#212529] border-t border-slate-800 p-6 flex flex-col gap-4 shadow-xl">
            {links.map((link, i) => (
              <a
                key={i}
                href={`#${link.toLowerCase().trim()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-[#ffc800] transition-colors py-2 border-b border-slate-800"
              >
                {link}
              </a>
            ))}
          </div>
        )}
      </nav>
    )
  }

  // Standard Blue Bolt Navbar
  return (
    <nav className="px-6 @md:px-10 py-4 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
          ⚡
        </div>
        <span className="font-bold text-[15px] text-foreground tracking-tight">
          <InlineText
            value={logo}
            onChange={(val) => updateBlockProps(block.id, { logo: val })}
          />
        </span>
      </div>

      {/* Desktop nav links */}
      <div className="hidden @2xl:flex items-center gap-6">
        {links.map((link, i) => (
          <span
            key={i}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <InlineText
              value={link}
              onChange={(val) => handleUpdateLink(i, val)}
            />
          </span>
        ))}
      </div>

      {/* CTA + mobile menu */}
      <div className="flex items-center gap-3">
        {props.ctaText && (
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <InlineText
              value={props.ctaText}
              onChange={(val) => updateBlockProps(block.id, { ctaText: val })}
            />
          </button>
        )}
        <button
          type="button"
          className="@2xl:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Menu size={16} />
        </button>
      </div>
    </nav>
  )
}
