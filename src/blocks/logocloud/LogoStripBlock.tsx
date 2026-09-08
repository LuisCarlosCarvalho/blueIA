import type { BlockConfig } from '../types'

interface ClientLogo {
  id: string
  name: string
  svgPath: string
}

const defaultLogos: ClientLogo[] = [
  { id: 'logo-microsoft', name: 'Microsoft', svgPath: '/assets/templates/agency/img/logos/microsoft.svg' },
  { id: 'logo-google', name: 'Google', svgPath: '/assets/templates/agency/img/logos/google.svg' },
  { id: 'logo-facebook', name: 'Facebook', svgPath: '/assets/templates/agency/img/logos/facebook.svg' },
  { id: 'logo-ibm', name: 'IBM', svgPath: '/assets/templates/agency/img/logos/ibm.svg' },
]

export function LogoStripBlock({ block }: { block: BlockConfig }) {
  const logos = (block.props?.logos as ClientLogo[]) || defaultLogos

  return (
    <section className="py-12 px-6 sm:px-10 bg-background border-y border-border/40 text-foreground">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-around gap-8 md:gap-12">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer h-12"
            title={logo.name}
          >
            <img
              src={logo.svgPath}
              alt={logo.name}
              className="h-9 w-auto max-w-[140px] object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
