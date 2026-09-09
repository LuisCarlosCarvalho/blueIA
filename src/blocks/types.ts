export type BlockType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'pricing'
  | 'cta'
  | 'footer'
  | 'testimonials'
  | 'stats'
  | 'faq'
  | 'team'
  | 'contact'
  | 'newsletter'
  | 'logocloud'
  | 'divider'
  | 'banner'
  | 'content'
  | 'image'
  | 'video'
  | 'gallery'
  | 'services-grid'
  | 'portfolio-grid'
  | 'timeline'
  | 'team-grid'
  | 'logo-strip'
  | 'contact-form'
  | 'project-modal'

export type BlockVariant = string

export type SectionBackground =
  | { type: 'color'; color: string; opacity?: number }
  | { type: 'gradient'; from: string; to: string; direction?: string }
  | { type: 'image'; url: string; poster?: string; overlayOpacity?: number; position?: string; isLocalBlob?: boolean }
  | { type: 'video'; url: string; poster?: string; overlayOpacity?: number; isLocalBlob?: boolean }

export interface FreeElementPosition {
  x: number
  y: number
  width?: number
  height?: number
  zIndex?: number
}

export type BreakpointKey = 'desktop' | 'tablet' | 'mobile'

export interface FreeLayoutMap {
  desktop?: Record<string, FreeElementPosition>
  tablet?: Record<string, FreeElementPosition>
  mobile?: Record<string, FreeElementPosition>
}

export interface SectionLayoutConfig {
  mode?: 'structured' | 'free'
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  maxWidth?: 'full' | 'boxed' | 'narrow'
  align?: 'left' | 'center' | 'right'
  columns?: 1 | 2 | 3 | 4
  direction?: 'row' | 'row-reverse' | 'col'
  order?: 'text-first' | 'image-first'
  ctaAlign?: 'left' | 'center' | 'right'
  ctaWidth?: 'auto' | 'fluid' | 'full'
  splitRatio?: '50-50' | '60-40' | '40-60' | '70-30'
  freeLayout?: FreeLayoutMap
}

export interface BlockResponsiveConfig {
  tablet?: Partial<SectionLayoutConfig> & { props?: Record<string, unknown> }
  mobile?: Partial<SectionLayoutConfig> & { props?: Record<string, unknown> }
}

export interface BlockConfig {
  id: string
  type: BlockType
  variant: BlockVariant
  hidden?: boolean
  background?: SectionBackground
  layout?: SectionLayoutConfig
  responsive?: BlockResponsiveConfig
  props: Record<string, unknown>
}

export interface ThemeConfig {
  // Backgrounds
  bg0: string
  bg1: string
  bg2: string
  bg3: string
  bg4: string
  bg5: string
  // Text
  text0: string
  text1: string
  text2: string
  text3: string
  // Accent
  accent: string
  accentDim: string
  // Borders
  borderDefault: string
  borderSubtle: string
  borderHover: string
  // Fonts
  fontSans: string
  fontDisplay: string
  fontMono: string
  // Radius
  radius: number
  radiusLg: number
  // Visual style & button style
  visualStyle?: 'glass' | 'clean' | 'contrast'
  buttonStyle?: 'default' | 'glass' | 'outline' | 'pill'
}

export interface PageConfig {
  id: string
  name: string
  path: string
  blocks: BlockConfig[]
}

export interface SiteConfig {
  name: string
  clientName?: string
  segment?: string
  niche?: string
  templateId?: string
  pages?: PageConfig[]
  blocks: BlockConfig[]
  theme?: Partial<ThemeConfig>
  /** Schema canónico do documento — identifica a versão do formato Blue Bolt */
  schemaVersion?: 'blue-bolt-template/v1'
  /** Tecnologia de origem do template, usada na Gestão de Templates */
  originTechnology?:
    | 'blue-bolt-json'
    | 'html-static'
    | 'bootstrap'
    | 'elementor-json'
    | 'react-controlled'
}
