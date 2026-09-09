/**
 * Blue Bolt Template Schema — blue-bolt-template/v1
 *
 * Schema canónico de validação para importação e exportação de templates.
 * Todos os objetos de entrada usam .strict() para rejeitar campos desconhecidos.
 * Props de blocos são validadas por schema específico por tipo.
 *
 * NÃO importar este ficheiro em componentes de UI — apenas em importadores/exportadores.
 */

import { z } from 'zod'

// ──────────────────────────────────────────────────────────
// SECÇÃO 1: PROTECÇÃO CONTRA PROTOTYPE POLLUTION
// ──────────────────────────────────────────────────────────

const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

export function rejectPrototypePollution(obj: unknown, path = ''): void {
  if (typeof obj !== 'object' || obj === null) return
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw new Error(
        `Chave proibida detectada (prototype pollution): "${path ? path + '.' : ''}${key}"`
      )
    }
    rejectPrototypePollution(
      (obj as Record<string, unknown>)[key],
      `${path ? path + '.' : ''}${key}`
    )
  }
}

// ──────────────────────────────────────────────────────────
// SECÇÃO 2: SCHEMAS DE URL E VALORES SEGUROS
// ──────────────────────────────────────────────────────────

/**
 * URL de asset: aceita referência interna, URL https:// ou path /assets/ local.
 * Bloqueia javascript:, data:, blob: persistente, file:, caminhos com ..
 */
export const AssetUrlSchema = z.string().max(2000).refine(
  (url) => {
    if (url === '') return true
    if (url.startsWith('asset://')) return true
    if (url.startsWith('https://')) return true
    if (url.startsWith('/assets/') && !url.includes('..')) return true
    return false
  },
  { message: 'URL de asset inválida. Use asset://<id>, https:// ou /assets/ (sem ..)' }
)

/**
 * URL de link: aceita âncoras, rotas relativas, https://, mailto:, tel:.
 * Bloqueia javascript:, data:, vbscript: e outros protocolos perigosos.
 */
export const LinkUrlSchema = z.string().max(2000).refine(
  (url) => {
    if (url === '' || url === '#') return true
    if (url.startsWith('#')) return true
    if (url.startsWith('/') && !url.includes('..')) return true
    if (url.startsWith('https://')) return true
    if (url.startsWith('mailto:')) return true
    if (url.startsWith('tel:')) return true
    return false
  },
  { message: 'URL de link inválida. Use https://, mailto:, tel:, / ou #' }
)

// Valor escalar seguro
const SafeScalarSchema = z.union([
  z.string().max(50000),
  z.number().finite(),
  z.boolean(),
  z.null(),
])

// Valor recursivo seguro — usado como fallback em props de tipos desconhecidos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SafeValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    SafeScalarSchema,
    z.array(SafeValueSchema).max(500),
    z
      .record(
        z.string().max(128),
        SafeValueSchema
      )
      .superRefine((obj, ctx) => {
        for (const key of Object.keys(obj)) {
          if (FORBIDDEN_KEYS.has(key)) {
            ctx.addIssue({ code: 'custom', message: `Chave proibida: "${key}"` })
          }
        }
      }),
  ])
)

// ──────────────────────────────────────────────────────────
// SECÇÃO 3: SCHEMAS DE PROPS POR TIPO DE BLOCO
// Derivados das interfaces TypeScript reais em src/blocks/*/Block.tsx
// ──────────────────────────────────────────────────────────

// Tipos auxiliares reutilizáveis
const FeatureItemSchema = z
  .object({
    icon: z.string().max(60).optional(),
    title: z.string().max(120),
    description: z.string().max(400).optional(),
  })
  .strict()

const ServiceItemSchema = z
  .object({
    icon: z.string().max(60).optional(),
    title: z.string().max(120).optional(),
    description: z.string().max(400).optional(),
  })
  .strict()

const PricingTierSchema = z
  .object({
    name: z.string().max(80),
    price: z.string().max(30),
    description: z.string().max(200).optional(),
    features: z.array(z.string().max(200)).max(20).optional(),
    ctaText: z.string().max(60).optional(),
    highlighted: z.boolean().optional(),
  })
  .strict()

const TestimonialItemSchema = z
  .object({
    name: z.string().max(100),
    role: z.string().max(100).optional(),
    quote: z.string().max(600),
    rating: z.number().int().min(1).max(5).optional(),
    avatar: AssetUrlSchema.optional(),
  })
  .strict()

const StatItemSchema = z
  .object({
    value: z.string().max(30),
    label: z.string().max(100),
  })
  .strict()

const FaqItemSchema = z
  .object({
    question: z.string().max(300),
    answer: z.string().max(1000),
  })
  .strict()

const TeamMemberSchema = z
  .object({
    name: z.string().max(100),
    role: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: AssetUrlSchema.optional(),
    socials: z.record(z.string().max(20), LinkUrlSchema).optional(),
  })
  .strict()

const GalleryImageSchema = z
  .object({
    url: AssetUrlSchema,
    alt: z.string().max(200).optional(),
    caption: z.string().max(300).optional(),
  })
  .strict()

const PortfolioItemSchema = z
  .object({
    title: z.string().max(150).optional(),
    subtitle: z.string().max(200).optional(),
    category: z.string().max(60).optional(),
    image: AssetUrlSchema.optional(),
    url: LinkUrlSchema.optional(),
  })
  .strict()

const TimelineEventSchema = z
  .object({
    year: z.string().max(20).optional(),
    title: z.string().max(200),
    description: z.string().max(600).optional(),
  })
  .strict()

// Props schemas por tipo — alinhados com interfaces reais
const NavbarPropsSchema = z
  .object({
    logo: z.string().max(100).optional(),
    logoImage: AssetUrlSchema.optional(),
    links: z.array(z.string().max(60)).max(10),
    ctaText: z.string().max(60).optional(),
  })
  .strict()

const HeroPropsSchema = z
  .object({
    badge: z.string().max(120).optional(),
    headline: z.string().max(200),
    subheadline: z.string().max(400),
    primaryCta: z.string().max(80),
    secondaryCta: z.string().max(80).optional(),
    imageUrl: AssetUrlSchema.optional(),
    imageAlt: z.string().max(200).optional(),
    bgImage: AssetUrlSchema.optional(),
    backgroundImage: AssetUrlSchema.optional(),
  })
  .strict()

const FeaturesPropsSchema = z
  .object({
    label: z.string().max(80).optional(),
    title: z.string().max(200),
    subtitle: z.string().max(400).optional(),
    items: z.array(FeatureItemSchema).max(20),
  })
  .strict()

const ServicesGridPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    items: z.array(ServiceItemSchema).max(20).optional(),
  })
  .strict()

const PricingPropsSchema = z
  .object({
    label: z.string().max(80).optional(),
    title: z.string().max(200),
    subtitle: z.string().max(400).optional(),
    tiers: z.array(PricingTierSchema).max(5).optional(),
    plans: z.array(PricingTierSchema).max(5).optional(),
  })
  .strict()

const CtaPropsSchema = z
  .object({
    headline: z.string().max(200),
    subheadline: z.string().max(400).optional(),
    buttonText: z.string().max(80),
  })
  .strict()

const FooterPropsSchema = z
  .object({
    logo: z.string().max(100).optional(),
    copyright: z.string().max(200).optional(),
    links: z.array(z.string().max(60)).max(20).optional(),
  })
  .strict()

const TestimonialsPropsSchema = z
  .object({
    label: z.string().max(80).optional(),
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    items: z.array(TestimonialItemSchema).max(20).optional(),
    testimonials: z.array(TestimonialItemSchema).max(20).optional(),
  })
  .strict()

const StatsPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    items: z.array(StatItemSchema).max(20).optional(),
    stats: z.array(StatItemSchema).max(20).optional(),
  })
  .strict()

const FaqPropsSchema = z
  .object({
    label: z.string().max(80).optional(),
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    items: z.array(FaqItemSchema).max(50).optional(),
  })
  .strict()

const TeamPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    members: z.array(TeamMemberSchema).max(20).optional(),
    bottomText: z.string().max(300).optional(),
  })
  .strict()

const ContactPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    buttonText: z.string().max(80).optional(),
    bgImage: AssetUrlSchema.optional(),
  })
  .strict()

const NewsletterPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    buttonText: z.string().max(80).optional(),
    socialProof: z.string().max(200).optional(),
  })
  .strict()

const LogoCloudPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    logos: z.array(AssetUrlSchema).max(20).optional(),
  })
  .strict()

const GalleryPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    images: z.array(GalleryImageSchema).max(50).optional(),
  })
  .strict()

const PortfolioGridPropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    items: z.array(PortfolioItemSchema).max(30).optional(),
  })
  .strict()

const TimelinePropsSchema = z
  .object({
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    events: z.array(TimelineEventSchema).max(30).optional(),
    finalCall: z.string().max(300).optional(),
  })
  .strict()

const BannerPropsSchema = z
  .object({
    text: z.string().max(300).optional(),
    linkText: z.string().max(80).optional(),
    linkUrl: LinkUrlSchema.optional(),
  })
  .strict()

const ContentPropsSchema = z
  .object({
    body: z.string().max(50000).optional(),
  })
  .strict()

const ImagePropsSchema = z
  .object({
    src: AssetUrlSchema.optional(),
    alt: z.string().max(200).optional(),
    caption: z.string().max(300).optional(),
  })
  .strict()

const VideoPropsSchema = z
  .object({
    url: AssetUrlSchema.optional(),
    poster: AssetUrlSchema.optional(),
    caption: z.string().max(300).optional(),
    autoplay: z.boolean().optional(),
    loop: z.boolean().optional(),
    muted: z.boolean().optional(),
  })
  .strict()

const DividerPropsSchema = z
  .object({
    height: z.number().int().min(1).max(500).optional(),
    width: z.string().max(20).optional(),
  })
  .strict()

// ──────────────────────────────────────────────────────────
// SECÇÃO 4: MAPA type → schema de props
// ──────────────────────────────────────────────────────────

export const BLOCK_PROPS_SCHEMAS: Record<string, z.ZodTypeAny> = {
  navbar: NavbarPropsSchema,
  hero: HeroPropsSchema,
  features: FeaturesPropsSchema,
  'services-grid': ServicesGridPropsSchema,
  pricing: PricingPropsSchema,
  cta: CtaPropsSchema,
  footer: FooterPropsSchema,
  testimonials: TestimonialsPropsSchema,
  stats: StatsPropsSchema,
  faq: FaqPropsSchema,
  team: TeamPropsSchema,
  'team-grid': TeamPropsSchema,
  contact: ContactPropsSchema,
  'contact-form': ContactPropsSchema,
  newsletter: NewsletterPropsSchema,
  logocloud: LogoCloudPropsSchema,
  'logo-strip': LogoCloudPropsSchema,
  gallery: GalleryPropsSchema,
  'portfolio-grid': PortfolioGridPropsSchema,
  timeline: TimelinePropsSchema,
  banner: BannerPropsSchema,
  content: ContentPropsSchema,
  image: ImagePropsSchema,
  video: VideoPropsSchema,
  divider: DividerPropsSchema,
  'project-modal': PortfolioGridPropsSchema,
}

/**
 * Valida as props de um bloco usando o schema específico por tipo.
 * Campos inválidos são listados em warnings; nunca descartados silenciosamente.
 */
export function parseBlockProps(
  type: string,
  rawProps: unknown
): { data: Record<string, unknown>; warnings: string[] } {
  const schema = BLOCK_PROPS_SCHEMAS[type]
  const warnings: string[] = []

  if (!schema) {
    warnings.push(`Tipo de bloco desconhecido: "${type}". Props validadas com schema genérico.`)
    const result = z.record(z.string().max(128), SafeValueSchema).safeParse(rawProps)
    if (!result.success) {
      throw new Error(
        `Props inválidas para tipo desconhecido "${type}": ${result.error.message}`
      )
    }
    return { data: result.data, warnings }
  }

  const result = schema.safeParse(rawProps)
  if (!result.success) {
    const issues = result.error.issues.map(
      (i: z.ZodIssue) => `${i.path.join('.')}: ${i.message}`
    )
    warnings.push(...issues.map((i: string) => `Campo rejeitado em bloco "${type}": ${i}`))
    // Recuperação parcial com schema sem strict
    const lenient = (schema as z.ZodObject<z.ZodRawShape>).partial?.()?.safeParse(rawProps)
    if (lenient?.success) {
      return { data: lenient.data as Record<string, unknown>, warnings }
    }
    throw new Error(`Props inválidas para bloco "${type}": ${issues.join('; ')}`)
  }

  return { data: result.data as Record<string, unknown>, warnings }
}

// ──────────────────────────────────────────────────────────
// SECÇÃO 5: SCHEMAS ESTRUTURAIS DO DOCUMENTO CANÓNICO
// ──────────────────────────────────────────────────────────

export const LicenseMetadataSchema = z
  .object({
    originalName: z.string().max(200),
    version: z.string().max(30),
    source: z.string().url(),
    license: z.enum([
      'MIT',
      'Apache-2.0',
      'BSD-3-Clause',
      'GPL-3.0',
      'CC-BY-4.0',
      'Proprietary',
      'Public Domain',
    ]),
    copyright: z.string().max(300),
    attributionNotice: z.string().max(500).optional(),
  })
  .strict()

export const TemplateMetadataSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
    category: z.enum([
      'Portfólios',
      'Landing Pages',
      'SaaS e Software',
      'Comércio Local',
      'Blog & Notícias',
      'E-commerce',
    ]),
    status: z.enum(['draft', 'published', 'archived']),
    originTechnology: z.enum([
      'blue-bolt-json',
      'html-static',
      'bootstrap',
      'elementor-json',
      'react-controlled',
    ]),
    schemaVersion: z.literal('blue-bolt-template/v1'),
    // sectionCount é INFORMATIVO na importação — recalculado após parse
    sectionCount: z.number().int().nonnegative(),
    versionCount: z.number().int().positive().default(1),
    author: z.string().max(200).default('Blue Bolt Studio'),
    license: LicenseMetadataSchema.optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()

export const ThemeTokensSchema = z
  .object({
    bg0: z.string().max(30),
    bg1: z.string().max(30),
    bg2: z.string().max(30),
    bg3: z.string().max(30),
    bg4: z.string().max(30).optional(),
    bg5: z.string().max(30).optional(),
    text0: z.string().max(30),
    text1: z.string().max(30),
    text2: z.string().max(30),
    text3: z.string().max(30).optional(),
    accent: z.string().max(30),
    accentDim: z.string().max(30),
    borderDefault: z.string().max(30),
    borderSubtle: z.string().max(30).optional(),
    borderHover: z.string().max(30).optional(),
    fontSans: z.string().max(100),
    fontDisplay: z.string().max(100),
    fontMono: z.string().max(100),
    radius: z.number().nonnegative().max(100),
    radiusLg: z.number().nonnegative().max(200),
    visualStyle: z.enum(['glass', 'clean', 'contrast']).optional(),
    buttonStyle: z.enum(['default', 'glass', 'outline', 'pill']).optional(),
  })
  .strict()

export const FreeElementPositionSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.union([z.number().finite().nonnegative(), z.string().max(20)]).optional(),
    height: z.union([z.number().finite().nonnegative(), z.string().max(20)]).optional(),
    rotation: z.number().finite().min(-360).max(360).optional(),
    zIndex: z.number().int().min(-1000).max(1000).optional(),
  })
  .strict()

export const FreeLayoutMapSchema = z
  .object({
    desktop: z.record(z.string().max(128), FreeElementPositionSchema).optional(),
    tablet: z.record(z.string().max(128), FreeElementPositionSchema).optional(),
    mobile: z.record(z.string().max(128), FreeElementPositionSchema).optional(),
  })
  .strict()

export const SectionLayoutConfigSchema = z
  .object({
    mode: z.enum(['structured', 'free']).optional(),
    paddingTop: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
    paddingBottom: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
    maxWidth: z.enum(['full', 'boxed', 'narrow']).optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
    direction: z.enum(['row', 'row-reverse', 'col']).optional(),
    order: z.enum(['text-first', 'image-first']).optional(),
    ctaAlign: z.enum(['left', 'center', 'right']).optional(),
    ctaWidth: z.enum(['auto', 'fluid', 'full']).optional(),
    splitRatio: z.enum(['50-50', '60-40', '40-60', '70-30']).optional(),
    freeLayout: FreeLayoutMapSchema.optional(),
  })
  .strict()

const SectionBackgroundSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('color'),
      color: z.string().max(30),
      opacity: z.number().min(0).max(1).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('gradient'),
      from: z.string().max(30),
      to: z.string().max(30),
      direction: z.string().max(30).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('image'),
      url: AssetUrlSchema,
      poster: AssetUrlSchema.optional(),
      overlayOpacity: z.number().min(0).max(1).optional(),
      position: z.string().max(30).optional(),
      isLocalBlob: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('video'),
      url: AssetUrlSchema,
      poster: AssetUrlSchema.optional(),
      overlayOpacity: z.number().min(0).max(1).optional(),
      isLocalBlob: z.boolean().optional(),
    })
    .strict(),
])

const BlockTypeEnum = z.enum([
  'navbar',
  'hero',
  'features',
  'pricing',
  'cta',
  'footer',
  'testimonials',
  'stats',
  'faq',
  'team',
  'contact',
  'newsletter',
  'logocloud',
  'divider',
  'banner',
  'content',
  'image',
  'video',
  'gallery',
  'services-grid',
  'portfolio-grid',
  'timeline',
  'team-grid',
  'logo-strip',
  'contact-form',
  'project-modal',
])

/**
 * Schema de bloco canónico.
 * Na importação, chamar parseBlockProps() para validar props por tipo.
 * No estado interno do editor, props usa z.record(z.string(), SafeValueSchema).
 */
export const BlockConfigSchema = z
  .object({
    id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
    type: BlockTypeEnum,
    variant: z.string().max(60).default('default'),
    hidden: z.boolean().optional(),
    background: SectionBackgroundSchema.optional(),
    layout: SectionLayoutConfigSchema.optional(),
    responsive: z
      .object({
        tablet: SectionLayoutConfigSchema.extend({
          props: z.record(z.string(), SafeValueSchema).optional(),
        }).optional(),
        mobile: SectionLayoutConfigSchema.extend({
          props: z.record(z.string(), SafeValueSchema).optional(),
        }).optional(),
      })
      .strict()
      .optional(),
    props: z.record(z.string().max(128), SafeValueSchema),
    customCssScoped: z.string().max(10240).optional(),
  })
  .strict()

export const PageConfigSchema = z
  .object({
    id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(100),
    path: z.string().max(200).optional(),
    seoTitle: z.string().max(120).optional(),
    seoDescription: z.string().max(320).optional(),
    blocks: z.array(BlockConfigSchema).max(50),
  })
  .strict()

export const AssetEntrySchema = z
  .object({
    id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
    originalPath: z.string().max(500),
    localPath: z.string().max(500).refine(
      (p) => !p.includes('..') && !p.startsWith('/') && !p.startsWith('\\'),
      'Path de asset não pode conter ".." ou ser absoluto'
    ),
    mimeType: z.string().regex(/^(image|video|font|application)\/([\w.+\-]+)$/),
    sizeBytes: z.number().int().nonnegative().max(5 * 1024 * 1024),
    hash: z.string().min(8).max(128),
  })
  .strict()

export const ApprovedInteractionEnum = z.enum([
  'mobile-menu',
  'modal-dialog',
  'accordion-toggle',
  'tab-switch',
  'smooth-scroll',
  'form-local-validation',
])

// ──────────────────────────────────────────────────────────
// SECÇÃO 6: DOCUMENTO RAIZ
// ──────────────────────────────────────────────────────────

export const BlueBoltTemplateJsonSchema = z
  .object({
    schemaVersion: z.literal('blue-bolt-template/v1'),
    metadata: TemplateMetadataSchema,
    theme: ThemeTokensSchema,
    pages: z.array(PageConfigSchema).min(1).max(20),
    assets: z.array(AssetEntrySchema).max(200).default([]),
    approvedInteractions: z.array(ApprovedInteractionEnum).default([]),
  })
  .strict()

export type LicenseMetadata = z.infer<typeof LicenseMetadataSchema>
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>
export type ThemeTokens = z.infer<typeof ThemeTokensSchema>
export type BlockConfigCanonical = z.infer<typeof BlockConfigSchema>
export type PageConfigCanonical = z.infer<typeof PageConfigSchema>
export type BlueBoltTemplateJson = z.infer<typeof BlueBoltTemplateJsonSchema>

// ──────────────────────────────────────────────────────────
// SECÇÃO 7: FUNÇÃO DE IMPORTAÇÃO SEGURA
// ──────────────────────────────────────────────────────────

/**
 * Valida e parseia um documento BlueBolt Template JSON v1.
 * Rejeita prototype pollution, valida schema estrutural,
 * recalcula sectionCount e valida props por tipo de bloco.
 *
 * @throws Error se o schema for inválido ou contiver ameaças de segurança.
 * @returns { template, warnings } — warnings listam conversões e campos ignorados.
 */
export function parseAndValidateTemplate(raw: unknown): {
  template: BlueBoltTemplateJson
  warnings: string[]
} {
  // 1. Rejeitar prototype pollution antes de qualquer parse Zod
  rejectPrototypePollution(raw)

  // 2. Parse estrutural estrito
  const result = BlueBoltTemplateJsonSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new Error(`Schema inválido (blue-bolt-template/v1): ${issues}`)
  }

  const template = result.data
  const allWarnings: string[] = []

  // 3. Recalcular sectionCount — não confiar no valor importado
  const realCount = template.pages.reduce((acc, p) => acc + p.blocks.length, 0)
  if (template.metadata.sectionCount !== realCount) {
    allWarnings.push(
      `sectionCount corrigido: declarado ${template.metadata.sectionCount}, real ${realCount}.`
    )
    ;(template.metadata as { sectionCount: number }).sectionCount = realCount
  }

  // 4. Validar props de cada bloco com schema específico por tipo
  for (const page of template.pages) {
    for (const block of page.blocks) {
      const { data, warnings } = parseBlockProps(block.type, block.props)
      block.props = data
      allWarnings.push(...warnings)
    }
  }

  return { template, warnings: allWarnings }
}

// ──────────────────────────────────────────────────────────
// SECÇÃO 8: CONSTANTES DE LIMITES DO IMPORTADOR ZIP
// ──────────────────────────────────────────────────────────

export const ZIP_LIMITS = {
  /** Tamanho máximo do arquivo ZIP (bytes) */
  MAX_ZIP_SIZE: 25 * 1024 * 1024,
  /** Número máximo de entradas no arquivo */
  MAX_FILE_COUNT: 150,
  /** Tamanho total descomprimido máximo (bytes) */
  MAX_UNCOMPRESSED_TOTAL: 75 * 1024 * 1024,
  /** Taxa de compressão máxima — anti-zip-bomb */
  MAX_COMPRESSION_RATIO: 50,
  /** Tamanho máximo de um ficheiro HTML */
  MAX_HTML_SIZE: 500 * 1024,
  /** Tamanho máximo de um ficheiro CSS */
  MAX_CSS_SIZE: 200 * 1024,
  /** Tamanho máximo de uma imagem */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  /** Número máximo de blocos gerados por template */
  MAX_BLOCKS_PER_TEMPLATE: 50,
} as const

/**
 * Verifica se uma entrada ZIP é segura antes de extrair.
 * Detecta zip-bombs por taxa de compressão e limite de tamanho acumulado.
 */
export function checkZipEntryLimits(
  entry: { name: string; compressedSize: number; uncompressedSize: number },
  runningTotalUncompressed: number
): { safe: boolean; reason?: string } {
  if (entry.compressedSize > 0) {
    const ratio = entry.uncompressedSize / entry.compressedSize
    if (ratio > ZIP_LIMITS.MAX_COMPRESSION_RATIO) {
      return {
        safe: false,
        reason: `Zip bomb detectado: "${entry.name}" tem taxa ${ratio.toFixed(0)}:1 (máx. ${ZIP_LIMITS.MAX_COMPRESSION_RATIO}:1)`,
      }
    }
  }
  if (runningTotalUncompressed + entry.uncompressedSize > ZIP_LIMITS.MAX_UNCOMPRESSED_TOTAL) {
    return {
      safe: false,
      reason: `Tamanho descomprimido acumulado excederia ${ZIP_LIMITS.MAX_UNCOMPRESSED_TOTAL / 1024 / 1024} MB`,
    }
  }
  return { safe: true }
}

/**
 * Valida se um path de ficheiro dentro de um ZIP é seguro contra Zip Slip.
 */
export function isSafeZipPath(filename: string): boolean {
  const normalized = filename.replace(/\\/g, '/')
  return (
    !normalized.includes('..') &&
    !normalized.startsWith('/') &&
    !normalized.startsWith('~') &&
    !/[<>:"|?*\x00-\x1f]/.test(normalized) &&
    normalized.length <= 255 &&
    normalized.split('/').every((segment) => segment.length <= 255)
  )
}
