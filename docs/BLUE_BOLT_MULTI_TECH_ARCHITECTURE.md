# Arquitetura Blue Bolt Multi-Technology — Especificação Canónica

> **Documento:** Especificação Técnica de Compatibilidade Multi-Tecnologia
> **Versão do Documento:** 3.0.0 (Revisão pós-auditoria de código)
> **Schema Canónico:** `blue-bolt-template/v1`
> **Data:** Setembro de 2026
> **Estado:** Especificação Corrigida — Aguarda Implementação da Fase 1

---

## Sumário de Correções desta Versão

| Secção | Problema na v2 | Correção na v3 |
|---|---|---|
| Schema de blocos | `props: z.record(z.unknown())` como validação final | Schemas de props específicos por tipo de bloco + fallback seguro |
| `.strict()` | Aplicado apenas ao schema raiz | Aplicado a todos os objetos de entrada sem extensões previstas |
| `sectionCount` | Aceite como dado confiável vindo do JSON | Calculado a partir de `pages[].blocks.length`; campo externo tratado como informativo |
| Prototype pollution | Não contemplado | Rejeição recursiva de `__proto__`, `prototype`, `constructor` |
| Atributos HTML | Contradição: `data-*` e `data-bb-*` misturados | Apenas `data-bb-*` permitido; todos os restantes `data-*` bloqueados |
| URLs de assets | `src` livre nas imagens | Apenas `asset://<id>` interno ou `https:` explicitamente aprovado |
| Limites ZIP | Ausentes da especificação | Tabela completa com 8 limites + lógica anti-zip-bomb |
| Versões de dependências | `^` usados (não são versões exatas) | Versões sem `^` na tabela de avaliação |
| Sandbox Fase 5 | Apenas `iframe sandbox="allow-scripts"` | CSP, bloqueio de formulários/popups/navegação, `postMessage` com nonce |

---

## 1. Princípio Central e Filosofia da Plataforma

O **Blue Bolt Page Studio** baseia-se no princípio de **Documento Canónico Único**.

Qualquer projeto importado ou criado no Blue Bolt é convertido, validado e armazenado
exclusivamente sob a estrutura do **BlueBolt Template JSON**.

HTML, CSS, Bootstrap, Elementor JSON, React/TSX e JavaScript são **formatos de entrada,
adaptadores de layout ou destinos de exportação** — nunca fonte de verdade sem validação.

```
+--------------------------------------------------------------------+
|                    ENTRADAS (Formatos de Importação)               |
|  HTML/CSS/ZIP   Bootstrap HTML   Elementor JSON   React TSX       |
+------------------------------------+-------------------------------+
                                     | Sanitização · Parser AST
                                     | Validação Zod estrita
                                     v
+--------------------------------------------------------------------+
|                    DOCUMENTO CANÓNICO                              |
|              BlueBolt Template JSON — blue-bolt-template/v1        |
|  metadados · páginas · blocos tipados · theme tokens               |
|  assets referenciados · interações aprovadas · licença/atribuição  |
+------------------+-----------------------------+------------------+
                   | Edição                      | Exportação
                   v                             v
+----------------------------+  +---------------------------------+
|  Studio Bolt (Editor)      |  |  HTML/CSS Estático              |
|  Bolt Tink IA (Assistente) |  |  Bootstrap Bundle (isolado)     |
+----------------------------+  |  React + Vite + TypeScript      |
                                |  BlueBolt JSON v1               |
                                +---------------------------------+
```

---

## 2. Schema Canónico `blue-bolt-template/v1`

### 2.1 Princípios de Validação

1. **`.strict()` em todos os objetos de entrada** — qualquer chave desconhecida num objeto de entrada
   gera erro de validação explícito, nunca entra silenciosamente no estado.
2. **`.passthrough()` apenas no estado interno do editor** — para manter compatibilidade com
   propriedades de UI transitórias (ex.: `isEditing`, `_preview`).
3. **`sectionCount` é calculado** — nunca aceite como verdade do JSON importado.
   Após parse: `metadata.sectionCount = pages.flatMap(p => p.blocks).length`.
4. **Props por tipo de bloco** — cada `type` de bloco tem um schema de props específico.
   Campos desconhecidos em `props` geram `conversionWarning`, não são descartados silenciosamente.
5. **Prototype pollution bloqueada** — rejeição recursiva de `__proto__`, `prototype`, `constructor`.

### 2.2 Utilitários de Segurança Base

```typescript
// src/lib/schemas/blue-bolt-template.ts
import { z } from 'zod'

// ────────────────────────────────────────────────────────
// UTILITÁRIO: Bloquear prototype pollution em qualquer nível
// ────────────────────────────────────────────────────────
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

function rejectPrototypePollution(obj: unknown, path = ''): void {
  if (typeof obj !== 'object' || obj === null) return
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw new Error(`Chave proibida detectada (prototype pollution): "${path}.${key}"`)
    }
    rejectPrototypePollution((obj as Record<string, unknown>)[key], `${path}.${key}`)
  }
}

// ────────────────────────────────────────────────────────
// UTILITÁRIO: Valores escalares seguros para props abertas
// ────────────────────────────────────────────────────────
// Usado apenas como fallback — preferir schemas específicos.
type SafeScalar = string | number | boolean | null
type SafeValue = SafeScalar | SafeValue[] | { [k: string]: SafeValue }
const SafeScalarSchema: z.ZodType<SafeScalar> = z.union([
  z.string().max(50000),
  z.number().finite(),
  z.boolean(),
  z.null(),
])
// Lazy para suportar recursão
const SafeValueSchema: z.ZodType<SafeValue> = z.lazy(() =>
  z.union([
    SafeScalarSchema,
    z.array(SafeValueSchema).max(500),
    z.record(z.string().max(128).regex(/^[a-zA-Z_][a-zA-Z0-9_-]*$/), SafeValueSchema).superRefine((obj, ctx) => {
      for (const key of Object.keys(obj)) {
        if (FORBIDDEN_KEYS.has(key)) {
          ctx.addIssue({ code: 'custom', message: `Chave proibida: "${key}"` })
        }
      }
    }),
  ])
)
```

### 2.3 Schemas de Props por Tipo de Bloco

Os schemas abaixo foram derivados das **interfaces TypeScript reais** encontradas no código-fonte
(`src/blocks/*/Block.tsx`). Cada campo mapeado 1:1 com as interfaces existentes.

```typescript
// ────────────────────────────────────────────────────────
// SCHEMAS DE PROPS POR TIPO DE BLOCO
// Derivados das interfaces reais em src/blocks/*/Block.tsx
// ────────────────────────────────────────────────────────

// Tipos auxiliares reutilizáveis
const AssetUrlSchema = z.string().refine(
  (url) => {
    if (url.startsWith('asset://')) return true          // referência interna
    if (url.startsWith('https://')) return true          // URL externa aprovada
    if (url === '' || url.startsWith('/assets/')) return true // assets locais do Studio
    return false
  },
  { message: 'URL de asset inválida. Use asset://<id>, https:// ou /assets/' }
)

const LinkUrlSchema = z.string().refine(
  (url) => {
    if (url === '' || url === '#') return true
    if (url.startsWith('#')) return true                 // âncora
    if (url.startsWith('/')) return true                 // rota relativa
    if (url.startsWith('https://')) return true
    if (url.startsWith('mailto:')) return true
    if (url.startsWith('tel:')) return true
    return false
  },
  { message: 'URL de link inválida. Use https://, mailto:, tel:, / ou #' }
)

// Props: navbar
const NavbarPropsSchema = z.object({
  logo: z.string().max(100).optional(),
  logoImage: AssetUrlSchema.optional(),
  links: z.array(z.string().max(60)).max(10),
  ctaText: z.string().max(60).optional(),
}).strict()

// Props: hero
const HeroPropsSchema = z.object({
  badge: z.string().max(120).optional(),
  headline: z.string().max(200),
  subheadline: z.string().max(400),
  primaryCta: z.string().max(80),
  secondaryCta: z.string().max(80).optional(),
  imageUrl: AssetUrlSchema.optional(),
  imageAlt: z.string().max(200).optional(),
  bgImage: AssetUrlSchema.optional(),
  backgroundImage: AssetUrlSchema.optional(),
}).strict()

// Props: features
const FeatureItemSchema = z.object({
  icon: z.string().max(60).optional(),
  title: z.string().max(120),
  description: z.string().max(400).optional(),
}).strict()
const FeaturesPropsSchema = z.object({
  label: z.string().max(80).optional(),
  title: z.string().max(200),
  subtitle: z.string().max(400).optional(),
  items: z.array(FeatureItemSchema).max(20),
}).strict()

// Props: services-grid
const ServiceItemSchema = z.object({
  icon: z.string().max(60).optional(),
  title: z.string().max(120).optional(),
  description: z.string().max(400).optional(),
}).strict()
const ServicesGridPropsSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  items: z.array(ServiceItemSchema).max(20).optional(),
}).strict()

// Props: pricing
const PricingTierSchema = z.object({
  name: z.string().max(80),
  price: z.string().max(30),
  description: z.string().max(200).optional(),
  features: z.array(z.string().max(200)).max(20).optional(),
  ctaText: z.string().max(60).optional(),
  highlighted: z.boolean().optional(),
}).strict()
const PricingPropsSchema = z.object({
  label: z.string().max(80).optional(),
  title: z.string().max(200),
  subtitle: z.string().max(400).optional(),
  tiers: z.array(PricingTierSchema).max(5).optional(),
  plans: z.array(PricingTierSchema).max(5).optional(), // alias retrocompatível
}).strict()

// Props: cta
const CtaPropsSchema = z.object({
  headline: z.string().max(200),
  subheadline: z.string().max(400).optional(),
  buttonText: z.string().max(80),
}).strict()

// Props: footer
const FooterPropsSchema = z.object({
  logo: z.string().max(100).optional(),
  copyright: z.string().max(200).optional(),
  links: z.array(z.string().max(60)).max(20).optional(),
}).strict()

// Props: testimonials
const TestimonialItemSchema = z.object({
  name: z.string().max(100),
  role: z.string().max(100).optional(),
  quote: z.string().max(600),
  rating: z.number().int().min(1).max(5).optional(),
  avatar: AssetUrlSchema.optional(),
}).strict()
const TestimonialsPropsSchema = z.object({
  label: z.string().max(80).optional(),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  items: z.array(TestimonialItemSchema).max(20).optional(),
  testimonials: z.array(TestimonialItemSchema).max(20).optional(), // alias
}).strict()

// Props: stats
const StatItemSchema = z.object({
  value: z.string().max(30),
  label: z.string().max(100),
}).strict()
const StatsPropsSchema = z.object({
  title: z.string().max(200).optional(),
  items: z.array(StatItemSchema).max(20).optional(),
  stats: z.array(StatItemSchema).max(20).optional(), // alias
}).strict()

// Props: faq
const FaqItemSchema = z.object({
  question: z.string().max(300),
  answer: z.string().max(1000),
}).strict()
const FaqPropsSchema = z.object({
  label: z.string().max(80).optional(),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  items: z.array(FaqItemSchema).max(50).optional(),
}).strict()

// Props: team / team-grid
const TeamMemberSchema = z.object({
  name: z.string().max(100),
  role: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: AssetUrlSchema.optional(),
  socials: z.record(z.string().max(20), LinkUrlSchema).optional(),
}).strict()
const TeamPropsSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  members: z.array(TeamMemberSchema).max(20).optional(),
  bottomText: z.string().max(300).optional(), // team-grid usa este campo
}).strict()

// Props: contact / contact-form (AgencyContactBlock)
const ContactPropsSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  buttonText: z.string().max(80).optional(),
  bgImage: AssetUrlSchema.optional(),
}).strict()

// Props: newsletter
const NewsletterPropsSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  buttonText: z.string().max(80).optional(),
  socialProof: z.string().max(200).optional(),
}).strict()

// Props: logocloud / logo-strip
const LogoCloudPropsSchema = z.object({
  title: z.string().max(200).optional(),
  logos: z.array(AssetUrlSchema).max(20).optional(),
}).strict()

// Props: gallery / portfolio-grid
const GalleryImageSchema = z.object({
  url: AssetUrlSchema,
  alt: z.string().max(200).optional(),
  caption: z.string().max(300).optional(),
}).strict()
const PortfolioItemSchema = z.object({
  title: z.string().max(150).optional(),
  subtitle: z.string().max(200).optional(),
  category: z.string().max(60).optional(),
  image: AssetUrlSchema.optional(),
  url: LinkUrlSchema.optional(),
}).strict()
const GalleryPropsSchema = z.object({
  title: z.string().max(200).optional(),
  images: z.array(GalleryImageSchema).max(50).optional(),
}).strict()
const PortfolioGridPropsSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  items: z.array(PortfolioItemSchema).max(30).optional(),
}).strict()

// Props: timeline
const TimelineEventSchema = z.object({
  year: z.string().max(20).optional(),
  title: z.string().max(200),
  description: z.string().max(600).optional(),
}).strict()
const TimelinePropsSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(400).optional(),
  events: z.array(TimelineEventSchema).max(30).optional(),
  finalCall: z.string().max(300).optional(),
}).strict()

// Props: banner
const BannerPropsSchema = z.object({
  text: z.string().max(300).optional(),
  linkText: z.string().max(80).optional(),
  linkUrl: LinkUrlSchema.optional(),
}).strict()

// Props: content
const ContentPropsSchema = z.object({
  body: z.string().max(50000).optional(),
}).strict()

// Props: image
const ImagePropsSchema = z.object({
  src: AssetUrlSchema.optional(),
  alt: z.string().max(200).optional(),
  caption: z.string().max(300).optional(),
}).strict()

// Props: video
const VideoPropsSchema = z.object({
  url: AssetUrlSchema.optional(),
  poster: AssetUrlSchema.optional(),
  caption: z.string().max(300).optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
}).strict()

// Props: divider
const DividerPropsSchema = z.object({
  height: z.number().int().min(1).max(500).optional(),
  width: z.string().max(20).optional(),
}).strict()

// Props: project-modal (alias de portfolio-grid com modal)
const ProjectModalPropsSchema = PortfolioGridPropsSchema

// ────────────────────────────────────────────────────────
// MAPA: type → schema de props
// ────────────────────────────────────────────────────────
export const BLOCK_PROPS_SCHEMAS: Record<string, z.ZodTypeAny> = {
  navbar:           NavbarPropsSchema,
  hero:             HeroPropsSchema,
  features:         FeaturesPropsSchema,
  'services-grid':  ServicesGridPropsSchema,
  pricing:          PricingPropsSchema,
  cta:              CtaPropsSchema,
  footer:           FooterPropsSchema,
  testimonials:     TestimonialsPropsSchema,
  stats:            StatsPropsSchema,
  faq:              FaqPropsSchema,
  team:             TeamPropsSchema,
  'team-grid':      TeamPropsSchema,
  contact:          ContactPropsSchema,
  'contact-form':   ContactPropsSchema,
  newsletter:       NewsletterPropsSchema,
  logocloud:        LogoCloudPropsSchema,
  'logo-strip':     LogoCloudPropsSchema,
  gallery:          GalleryPropsSchema,
  'portfolio-grid': PortfolioGridPropsSchema,
  timeline:         TimelinePropsSchema,
  banner:           BannerPropsSchema,
  content:          ContentPropsSchema,
  image:            ImagePropsSchema,
  video:            VideoPropsSchema,
  divider:          DividerPropsSchema,
  'project-modal':  ProjectModalPropsSchema,
}

// Fallback para tipos de bloco não mapeados (não deve ocorrer em produção)
export function parseBlockProps(type: string, rawProps: unknown): {
  data: Record<string, unknown>
  warnings: string[]
} {
  const schema = BLOCK_PROPS_SCHEMAS[type]
  const warnings: string[] = []

  if (!schema) {
    // Tipo desconhecido: usar SafeValueSchema como fallback rígido
    warnings.push(`Tipo de bloco desconhecido: "${type}". Props validadas com schema genérico.`)
    const result = z.record(z.string().max(128), SafeValueSchema).safeParse(rawProps)
    if (!result.success) throw new Error(`Props inválidas para tipo desconhecido "${type}": ${result.error.message}`)
    return { data: result.data, warnings }
  }

  const result = schema.safeParse(rawProps)
  if (!result.success) {
    // Props inválidas no tipo conhecido: listar campos rejeitados e tentar parse parcial
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    warnings.push(...issues.map(i => `Campo rejeitado em bloco "${type}": ${i}`))
    // Parse leniente para recuperação parcial
    const lenient = schema.partial ? (schema as z.AnyZodObject).partial().safeParse(rawProps) : { success: false }
    if (lenient.success) return { data: (lenient as z.SafeParseSuccess<Record<string, unknown>>).data, warnings }
    throw new Error(`Props inválidas para bloco "${type}": ${issues.join('; ')}`)
  }

  return { data: result.data, warnings }
}
```

### 2.4 Schema do Documento Raiz

```typescript
// ────────────────────────────────────────────────────────
// SCHEMAS ESTRUTURAIS — todos com .strict() na importação
// ────────────────────────────────────────────────────────

export const LicenseMetadataSchema = z.object({
  originalName: z.string().max(200),
  version: z.string().max(30),
  source: z.string().url(),
  license: z.enum(['MIT','Apache-2.0','BSD-3-Clause','GPL-3.0','CC-BY-4.0','Proprietary','Public Domain']),
  copyright: z.string().max(300),
  attributionNotice: z.string().max(500).optional(),
}).strict()

export const TemplateMetadataSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  category: z.enum(['Portfólios','Landing Pages','SaaS e Software','Comércio Local','Blog & Notícias','E-commerce']),
  status: z.enum(['draft','published','archived']),
  originTechnology: z.enum(['blue-bolt-json','html-static','bootstrap','elementor-json','react-controlled']),
  schemaVersion: z.literal('blue-bolt-template/v1'),
  // sectionCount é INFORMATIVO na importação — recalculado após parse
  sectionCount: z.number().int().nonnegative(),
  versionCount: z.number().int().positive().default(1),
  author: z.string().max(200).default('Blue Bolt Studio'),
  license: LicenseMetadataSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const ThemeTokensSchema = z.object({
  bg0: z.string().max(30), bg1: z.string().max(30),
  bg2: z.string().max(30), bg3: z.string().max(30),
  bg4: z.string().max(30).optional(), bg5: z.string().max(30).optional(),
  text0: z.string().max(30), text1: z.string().max(30),
  text2: z.string().max(30), text3: z.string().max(30).optional(),
  accent: z.string().max(30), accentDim: z.string().max(30),
  borderDefault: z.string().max(30),
  borderSubtle: z.string().max(30).optional(),
  borderHover: z.string().max(30).optional(),
  fontSans: z.string().max(100), fontDisplay: z.string().max(100),
  fontMono: z.string().max(100),
  radius: z.number().nonnegative().max(100),
  radiusLg: z.number().nonnegative().max(200),
  visualStyle: z.enum(['glass','clean','contrast']).optional(),
  buttonStyle: z.enum(['default','glass','outline','pill']).optional(),
}).strict()

export const FreeElementPositionSchema = z.object({
  x: z.number().finite(), y: z.number().finite(),
  width: z.union([z.number().finite().nonnegative(), z.string().max(20)]).optional(),
  height: z.union([z.number().finite().nonnegative(), z.string().max(20)]).optional(),
  rotation: z.number().finite().min(-360).max(360).optional(),
  zIndex: z.number().int().min(-1000).max(1000).optional(),
}).strict()

export const FreeLayoutMapSchema = z.object({
  desktop: z.record(z.string().max(128), FreeElementPositionSchema).optional(),
  tablet:  z.record(z.string().max(128), FreeElementPositionSchema).optional(),
  mobile:  z.record(z.string().max(128), FreeElementPositionSchema).optional(),
}).strict()

export const SectionLayoutConfigSchema = z.object({
  mode: z.enum(['structured','free']).optional(),
  paddingTop: z.enum(['none','sm','md','lg','xl']).optional(),
  paddingBottom: z.enum(['none','sm','md','lg','xl']).optional(),
  maxWidth: z.enum(['full','boxed','narrow']).optional(),
  align: z.enum(['left','center','right']).optional(),
  columns: z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4)]).optional(),
  direction: z.enum(['row','row-reverse','col']).optional(),
  order: z.enum(['text-first','image-first']).optional(),
  ctaAlign: z.enum(['left','center','right']).optional(),
  ctaWidth: z.enum(['auto','fluid','full']).optional(),
  splitRatio: z.enum(['50-50','60-40','40-60','70-30']).optional(),
  freeLayout: FreeLayoutMapSchema.optional(),
}).strict()

const SectionBackgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('color'), color: z.string().max(30), opacity: z.number().min(0).max(1).optional() }).strict(),
  z.object({ type: z.literal('gradient'), from: z.string().max(30), to: z.string().max(30), direction: z.string().max(30).optional() }).strict(),
  z.object({ type: z.literal('image'), url: AssetUrlSchema, poster: AssetUrlSchema.optional(), overlayOpacity: z.number().min(0).max(1).optional(), position: z.string().max(30).optional(), isLocalBlob: z.boolean().optional() }).strict(),
  z.object({ type: z.literal('video'), url: AssetUrlSchema, poster: AssetUrlSchema.optional(), overlayOpacity: z.number().min(0).max(1).optional(), isLocalBlob: z.boolean().optional() }).strict(),
])

// O BlockConfigSchema usa .passthrough() em props para compatibilidade com editor.
// Na importação externa, usar parseBlockProps() para validação estrita por tipo.
export const BlockConfigSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  type: z.enum([
    'navbar','hero','features','pricing','cta','footer','testimonials',
    'stats','faq','team','contact','newsletter','logocloud','divider',
    'banner','content','image','video','gallery','services-grid',
    'portfolio-grid','timeline','team-grid','logo-strip','contact-form','project-modal',
  ]),
  variant: z.string().max(60).default('default'),
  hidden: z.boolean().optional(),
  background: SectionBackgroundSchema.optional(),
  layout: SectionLayoutConfigSchema.optional(),
  responsive: z.object({
    tablet: SectionLayoutConfigSchema.extend({ props: z.record(z.string(), SafeValueSchema).optional() }).optional(),
    mobile: SectionLayoutConfigSchema.extend({ props: z.record(z.string(), SafeValueSchema).optional() }).optional(),
  }).strict().optional(),
  props: z.record(z.string().max(128), SafeValueSchema), // fallback — usar parseBlockProps() na importação
  // CSS scoped por bloco: máx. 10 KB — nunca injectado no Studio, apenas na exportação
  customCssScoped: z.string().max(10240).optional(),
}).strict()

export const AssetSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  originalPath: z.string().max(500),
  localPath: z.string().max(500).refine(
    (p) => !p.includes('..') && !p.startsWith('/') && !p.startsWith('\\'),
    'Path de asset não pode conter ".." ou ser absoluto'
  ),
  mimeType: z.string().regex(/^(image|video|font|application)\/([\w.+\-]+)$/),
  sizeBytes: z.number().int().nonnegative().max(5 * 1024 * 1024), // máx. 5 MB por asset
  hash: z.string().min(8).max(128),
}).strict()

export const ApprovedInteractionEnum = z.enum([
  'mobile-menu','modal-dialog','accordion-toggle',
  'tab-switch','smooth-scroll','form-local-validation',
])

// ────────────────────────────────────────────────────────
// DOCUMENTO RAIZ — importação usa .strict()
// ────────────────────────────────────────────────────────
export const BlueBoltTemplateJsonSchema = z.object({
  schemaVersion: z.literal('blue-bolt-template/v1'),
  metadata: TemplateMetadataSchema,
  theme: ThemeTokensSchema,
  pages: z.array(z.object({
    id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(100),
    path: z.string().max(200).optional(),
    seoTitle: z.string().max(120).optional(),
    seoDescription: z.string().max(320).optional(),
    blocks: z.array(BlockConfigSchema).max(50), // máx. 50 blocos por página
  }).strict()).min(1).max(20),
  assets: z.array(AssetSchema).max(200).default([]),
  approvedInteractions: z.array(ApprovedInteractionEnum).default([]),
}).strict()

export type BlueBoltTemplateJson = z.infer<typeof BlueBoltTemplateJsonSchema>

// ────────────────────────────────────────────────────────
// FUNÇÃO DE IMPORTAÇÃO SEGURA
// ────────────────────────────────────────────────────────
export function parseAndValidateTemplate(raw: unknown): {
  template: BlueBoltTemplateJson
  warnings: string[]
} {
  // 1. Rejeitar prototype pollution antes de qualquer parse
  rejectPrototypePollution(raw)

  // 2. Parse estrutural
  const result = BlueBoltTemplateJsonSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(`Schema inválido: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  }

  const template = result.data
  const allWarnings: string[] = []

  // 3. Recalcular sectionCount (não confiar no valor importado)
  const realCount = template.pages.reduce((acc, p) => acc + p.blocks.length, 0)
  if (template.metadata.sectionCount !== realCount) {
    allWarnings.push(`sectionCount corrigido: declarado ${template.metadata.sectionCount}, real ${realCount}.`)
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
```

---

## 3. Segurança de HTML e Assets

### 3.1 Atributos Permitidos — Política Corrigida

A versão anterior tinha contradição entre `data-*` e `data-bb-*`. Regra definitiva:

```
PERMITIDO:
  class, id, role, aria-*, data-bb-* (prefixo exclusivo Blue Bolt)

BLOQUEADO SEMPRE:
  on*          (onclick, onload, onerror, etc.)
  style        (CSS inline — extrair para customCssScoped)
  srcdoc       (execução de HTML em iframe)
  formaction   (redirecionamento de formulário)
  xlink:href   (SVG XSS)
  data-*       (todos os restantes, exceto data-bb-*)
  href com: javascript:, data:, vbscript:
  src  com: javascript:, data:, blob: (persistente), file:

PERMITIDO POR TAG:
  <a>       href (apenas https://, mailto:, tel:, /, #), title, rel="noopener noreferrer"
  <img>     src (AssetUrlSchema), alt, width, height, loading="lazy"
  <input>   type, name, placeholder, required, min, max, pattern, maxlength
  <form>    method (apenas "post" ou "get"), novalidate
            NUNCA action externo — remover ou substituir por "#"
```

```typescript
// Validação de atributo durante sanitização de HTML
function isAttributeAllowed(tag: string, attr: string, value: string): boolean {
  // Bloquear sempre
  if (/^on/i.test(attr)) return false
  if (['style','srcdoc','formaction','xlink:href'].includes(attr.toLowerCase())) return false
  // Bloquear data-* exceto data-bb-
  if (/^data-/i.test(attr) && !attr.startsWith('data-bb-')) return false
  // Bloquear protocolos perigosos em qualquer atributo de URL
  const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i
  if (['href','src','action','poster','background'].includes(attr.toLowerCase())) {
    if (DANGEROUS_PROTOCOLS.test(value.trim())) return false
    if (value.includes('..')) return false // path traversal em URLs
  }
  // blob: apenas em contextos transientes (não persistente no documento)
  if (attr === 'src' && value.startsWith('blob:')) return false
  return true
}
```

### 3.2 URLs de Assets — Política de Referências

Todo asset referenciado num template importado deve seguir uma das seguintes formas:

| Forma | Contexto | Validação |
|---|---|---|
| `asset://<id>` | Referência interna a asset registado no documento | `id` deve existir em `template.assets[]` |
| `https://example.com/image.jpg` | URL externa explicitamente aprovada | Protocolo `https:` obrigatório |
| `/assets/templates/agency/img/...` | Asset estático local do Studio | Apenas paths sob `/assets/` |

**Bloqueado sempre:**
- `javascript:*` — execução de código
- `data:*` — blobs inline (potencialmente maliciosos)
- `blob:*` persistente — referência a blob transiente
- `file:*` — acesso ao sistema de ficheiros local
- Qualquer path com `..` — path traversal

---

## 4. Limites do Importador ZIP

Todos os limites são verificados **antes de extrair qualquer entrada** do arquivo.

### 4.1 Tabela de Limites

| Limite | Valor | Verificação | Acção se Excedido |
|---|---|---|---|
| Tamanho máximo do arquivo ZIP | 25 MB | Antes de ler o buffer | Rejeitar imediatamente |
| Número máximo de entradas no ZIP | 150 ficheiros | Durante leitura do diretório central | Rejeitar ao ultrapassar |
| Tamanho total descomprimido | 75 MB | Somar `uncompressedSize` antes de extrair | Rejeitar antes de extrair |
| Taxa de compressão máxima (anti-zip-bomb) | 50:1 | `uncompressedSize / compressedSize` por entrada | Rejeitar entrada + todo o ZIP |
| Tamanho máximo de um ficheiro HTML | 500 KB | Após extração individual | Ignorar ficheiro com aviso |
| Tamanho máximo de um ficheiro CSS | 200 KB | Após extração individual | Ignorar ficheiro com aviso |
| Tamanho máximo de uma imagem | 5 MB | Após extração individual | Ignorar com aviso |
| Número máximo de blocos gerados por template | 50 | Após mapeamento de secções | Truncar com aviso |

### 4.2 Lógica Anti-Zip-Bomb

```typescript
// Verificação na fase de leitura do diretório central (antes de qualquer extração)
const MAX_ZIP_SIZE = 25 * 1024 * 1024          // 25 MB
const MAX_FILE_COUNT = 150
const MAX_UNCOMPRESSED_TOTAL = 75 * 1024 * 1024 // 75 MB
const MAX_COMPRESSION_RATIO = 50               // 50:1
const MAX_HTML_SIZE = 500 * 1024               // 500 KB
const MAX_CSS_SIZE = 200 * 1024                // 200 KB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024         // 5 MB por imagem
const MAX_BLOCKS_PER_TEMPLATE = 50

function checkZipEntryLimits(
  entry: { name: string; compressedSize: number; uncompressedSize: number },
  runningTotalUncompressed: number
): { safe: boolean; reason?: string } {
  // Anti-zip-bomb por entrada
  if (entry.compressedSize > 0) {
    const ratio = entry.uncompressedSize / entry.compressedSize
    if (ratio > MAX_COMPRESSION_RATIO) {
      return { safe: false, reason: `Zip bomb detectado: "${entry.name}" tem taxa de compressão ${ratio.toFixed(0)}:1` }
    }
  }
  // Limite de tamanho total descomprimido acumulado
  if (runningTotalUncompressed + entry.uncompressedSize > MAX_UNCOMPRESSED_TOTAL) {
    return { safe: false, reason: `Tamanho total descomprimido excederia ${MAX_UNCOMPRESSED_TOTAL / 1024 / 1024} MB` }
  }
  return { safe: true }
}
```

### 4.3 Ordem de Verificações (Pipeline de Importação)

```
1. Verificar extensão do ficheiro enviado → deve ser .zip
2. Verificar tamanho do arquivo (MAX_ZIP_SIZE = 25 MB) → rejeitar antes de ler
3. Verificar assinatura PK\x03\x04 → rejeitar se inválida
4. Ler diretório central do ZIP (sem extrair conteúdo):
   a. Verificar MAX_FILE_COUNT → rejeitar ao ultrapassar
   b. Verificar cada entrada para zip-bomb (ratio > 50:1) → rejeitar todo o ZIP
   c. Verificar MAX_UNCOMPRESSED_TOTAL → rejeitar todo o ZIP
   d. Verificar isSafePath() em cada nome → rejeitar ao detetar zip-slip
   e. Verificar extensões proibidas → bloquear e registar em blockedFiles[]
5. Apenas após todas as verificações passarem → extrair entradas permitidas
6. Por entrada extraída:
   a. HTML > MAX_HTML_SIZE → ignorar com aviso
   b. CSS > MAX_CSS_SIZE → ignorar com aviso
   c. Imagem > MAX_IMAGE_SIZE → ignorar com aviso
7. Sanitizar HTML de cada ficheiro extraído
8. Mapear para blocos Blue Bolt (máx. MAX_BLOCKS_PER_TEMPLATE)
9. Validar resultado com parseAndValidateTemplate()
10. Retornar ZipValidationResult com warnings[]
```

---

## 5. Mapa de Importadores e Exportadores

### 5.1 Adaptadores de Importação

| Adaptador | Entrada | Suportado | Descartado | Estratégia | Perda | Risco |
|---|---|---|---|---|---|---|
| **`blue-bolt-json`** | JSON `v1` | 1:1 total | Campos fora do schema (`.strict()` rejeita + aviso) | `parseAndValidateTemplate()` | **Nenhuma** | Muito Baixo |
| **`html-static`** | ZIP (.html,.css,imagens) | Headings, parágrafos, botões, imagens, secções semânticas | `<script>`, `<iframe>`, `on*`, `javascript:` | Pipeline do §4.3 + mapeamento heurístico | Baixo–Médio | Baixo |
| **`bootstrap`** | HTML com classes Bootstrap v5 | `container/row/col-*`, `navbar`, `card`, `modal`, `btn`, `accordion`, `form-control` | `bootstrap.bundle.js`, jQuery, `data-bs-*` → removido | Reconhecimento de classes → props Blue Bolt | Baixo | Muito Baixo |
| **`elementor-json`** | JSON exportado Elementor WP | Sections, columns, headings, buttons, images, forms | Shortcodes de plugins, Motion Effects | Mapeamento determinístico de widgets | Médio | Baixo |
| **`react-controlled`** *(Fase 4)* | TSX do Registry | Props declarativos, composição de blocos | `useEffect` com fetch externo, imports não aprovados | AST estática — sem execução | Baixo | Muito Baixo |

### 5.2 Exportadores

| Exportador | Saída | Deps no Bundle | Status |
|---|---|---|---|
| `blue-bolt-json` | Arquivo `.json` validado | Nenhuma | ✅ Fase 1 |
| `html-static` | `index.html` + CSS embutido | Nenhuma (template string) | ✅ Implementado (`export-html.ts`) |
| `bootstrap` | HTML + `bootstrap.min.css` isolado | Bootstrap v5 local (apenas no site exportado) | Fase 3 |
| `react-vite` | Projeto Vite + React 19 + TypeScript | React 19, Vite, Tailwind (no bundle exportado) | Fase 4 |

---

## 6. Estratégia por Tecnologia

### 6.1 HTML e CSS Estático

- ZIP validado pelo pipeline completo do §4.3.
- CSS extraído para `customCssScoped` por bloco — **nunca como folha global no Studio**.
- Regras de atributos da §3.1 aplicadas na sanitização.
- Tags semânticas guiam o mapeamento: `<header>` → `navbar`, `<nav>` → `navbar`, `<section>` → bloco por conteúdo heurístico, `<footer>` → `footer`.

### 6.2 Bootstrap — Adaptador de Layout

> **Regra inegociável:** `bootstrap.min.css` e `bootstrap.bundle.js` nunca são carregados no Studio.

| Classe Bootstrap | Bloco | Props |
|---|---|---|
| `container` + `row` + `col-md-4` | `features` / `services-grid` | `layout.columns: 3` |
| `navbar navbar-expand-lg` | `navbar` | `variant: 'default'`, interação `mobile-menu` |
| `card` (× N) | `features` / `services-grid` | items[] mapeados |
| `modal fade` | `project-modal` | `approvedInteractions: ['modal-dialog']` |
| `btn btn-primary` | prop `primaryCta` | token `accent` do tema |
| `accordion` | `faq` | `approvedInteractions: ['accordion-toggle']` |
| `form-control` | `contact-form` | `approvedInteractions: ['form-local-validation']` |

Atributos `data-bs-*` (ex.: `data-bs-toggle`, `data-bs-target`) são **removidos** — as
interações são reimplementadas com os mecanismos React nativos aprovados.

### 6.3 React e TypeScript — Modo Controlado

1. Componentes externos nunca executados via `eval()`, `new Function()` ou `import()` dinâmico.
2. Todo componente renderizado no Studio pertence ao `src/blocks/registry.tsx`.
3. Props validadas por `parseBlockProps()` antes de entrar no estado.
4. Imports arbitrários bloqueados em nível de análise AST (Fase 4).

### 6.4 JavaScript — Três Níveis

```
Nível 0 — Estático       Sem JavaScript. HTML+CSS puro.
Nível 1 — Aprovado       React nativo: mobile-menu, modal-dialog, accordion-toggle,
                          tab-switch, smooth-scroll, form-local-validation
Nível 2 — Sandbox        Fase 5 — ver §8
```

### 6.5 Node.js — Backend Isolado

| Serviço | Ficheiro | Responsabilidade |
|---|---|---|
| Geração IA | `api/generate.ts` | REST para Gemini com chave server-side |
| Deploy | `api/deploy.ts` | Publicação de sites |
| Importação ZIP | Futuro `api/import.ts` | Validação + sanitização + conversão |
| Exportação | Futuro `api/export.ts` | Compilação Bootstrap/React |

**Proibição absoluta:** Scripts `.js`, `.ts`, `.sh`, `.py`, `.php` de ZIPs de utilizadores
**nunca** são executados no servidor.

---

## 7. Regras de Segurança e Sandbox

### 7.1 Lista de Proibições

| Proibição | Justificação |
|---|---|
| `eval()` / `new Function()` | Execução arbitrária — vetor primário de XSS |
| `innerHTML` sem sanitização | Injeção de HTML não controlado |
| CDNs externas não auditadas | Bootstrap, Font Awesome, jQuery por CDN dinâmico |
| `import()` de URLs externas | Módulos não auditados |
| `<iframe>` sem `sandbox` completo | Acesso ao DOM pai e cookies |
| `setTimeout(string, ms)` | Execução de string como código |
| Prototype pollution | `__proto__`, `prototype`, `constructor` rejeitados recursivamente |
| Scripts de ZIPs | Código não auditado no servidor |
| Bootstrap global no Studio | Corrompe design system Tailwind |
| `jsdom` | Runtime DOM completo com risco de execução |
| Express.js | Conflito com rotas serverless Vercel |

### 7.2 Proteção Anti-Zip Slip (Estendida)

```typescript
function isSafePath(filename: string): boolean {
  const normalized = filename.replace(/\\/g, '/')
  return (
    !normalized.includes('..') &&
    !normalized.startsWith('/') &&
    !normalized.startsWith('~') &&
    !/[<>:"|?*\x00-\x1f]/.test(normalized) && // chars proibidos no Windows/Linux
    normalized.length <= 255 &&
    normalized.split('/').every(segment => segment.length <= 255)
  )
}
```

---

## 8. Sandbox JavaScript — Fase 5 (Especificação Completa)

O sandbox da Fase 5 usa `<iframe>` com configuração defensiva em profundidade.

### 8.1 Atributo `sandbox`

```html
<iframe
  sandbox="allow-scripts"
  <!-- NUNCA adicionar: allow-same-origin, allow-top-navigation,
       allow-forms, allow-downloads, allow-popups,
       allow-popups-to-escape-sandbox, allow-modals -->
  csp="..."
  title="Blue Bolt Sandbox"
></iframe>
```

### 8.2 Content Security Policy do iframe

```
Content-Security-Policy:
  default-src 'none';
  script-src 'nonce-{NONCE}';   /* apenas scripts com nonce gerado server-side */
  style-src 'unsafe-inline';    /* CSS inline permitido no sandbox */
  img-src https: data:;         /* imagens externas e data URIs de imagem */
  connect-src 'none';           /* sem fetch/XHR — sem rede */
  frame-src 'none';
  object-src 'none';
  form-action 'none';           /* bloquear envio de formulários */
  navigate-to 'none';           /* bloquear navegação superior */
  base-uri 'none';
```

### 8.3 Protocolo `postMessage` com Nonce

```typescript
// Mensagem enviada do iframe para o Studio
interface SandboxMessage {
  type: 'sandbox-ready' | 'sandbox-event' | 'sandbox-error'
  nonce: string          // nonce gerado server-side, validado a cada mensagem
  origin: string         // deve ser 'null' para sandbox sem allow-same-origin
  payload: SafeValue     // validado com SafeValueSchema antes de usar
}

// Validação no receptor (Studio)
function onSandboxMessage(event: MessageEvent): void {
  // Rejeitar mensagens de origens não nulas (allow-same-origin não está ativo)
  if (event.origin !== 'null') return
  const msg = SandboxMessageSchema.safeParse(event.data)
  if (!msg.success) return // Rejeitar silenciosamente mensagens inválidas
  if (msg.data.nonce !== currentSandboxNonce) return // Nonce inválido
  handleSandboxEvent(msg.data)
}
```

### 8.4 Restrições Adicionais

- **Sem cookies:** `sandbox="allow-scripts"` sem `allow-same-origin` isola completamente o storage.
- **Sem localStorage / sessionStorage:** Inacessíveis sem `allow-same-origin`.
- **Sem acesso ao DOM pai:** `window.parent`, `window.top`, `window.opener` retornam `null`.
- **Sem formulários externos:** `form-action 'none'` na CSP.
- **Sem downloads:** Sem `allow-downloads` no sandbox.
- **Logs de auditoria:** Toda ativação e mensagem do sandbox é registada com timestamp, utilizador e conteúdo sanitizado.
- **Autorização de administrador:** A ativação do Nível 2 exige label `admin` na sessão Appwrite.

---

## 9. Auditoria de Dependências

### 9.1 Inventário Atual — Confirmado em 2026-09-09

```
npm ls zod jszip

openpage@1.0.0
├── jszip@3.10.1           ✅ instalado
├── zod@4.5.4              ✅ instalado
└── (zod@3.22.4 via @vercel/node — transitiva, não usar diretamente)
```

**As dependências essenciais para a Fase 1 já estão instaladas. Zero instalações necessárias.**

### 9.2 Tabela de Avaliação — Dependências Futuras

> Nenhuma das linhas abaixo está instalada. Versões sem `^` (a serem verificadas antes da instalação).

| Pacote | Versão a Avaliar | Licença | Onde | Bundle | Alternativa | Risco | Instalado? | Recomendação |
|---|---|---|---|---|---|---|---|---|
| `parse5` | `7.2.1` (linha 8 atual) | MIT | Parser AST HTML — Importador Fase 2 | ~35 KB lazy chunk | `DOMParser` nativo com sandbox | **Muito Baixo** | ❌ Não | **Avaliar na Fase 2** |
| `sanitize-html` | `2.14.0` | MIT | Sanitização HTML com lista branca — Fase 2 (servidor) | ~45 KB (módulo de importação) | `DOMPurify` para ambiente browser | **Baixo** | ❌ Não | **Comparar com DOMPurify antes da Fase 2** |
| `DOMPurify` | `3.2.6` (linha 3 atual) | Mozilla Public License 2.0 | Sanitização HTML — Fase 2 (browser) | ~23 KB (mais leve que sanitize-html) | `sanitize-html` para Node.js | **Baixo** | ❌ Não | **Comparar com sanitize-html; preferir para contexto browser** |
| `postcss` | `8.5.3` | MIT | Parse e escopo de seletores CSS — Fase 3 | ~80 KB | Parser regex de CSS local | **Baixo** | ❌ Não (usado internamente pelo Tailwind, não exposto) | **Adiar para Fase 3** |
| `@babel/parser` | `7.26.9` | MIT | AST estática de TSX — Fase 4 | ~150 KB (tools admin) | TypeScript Compiler API | **Muito Baixo** | ❌ Não | **Adiar para Fase 4** |
| `@babel/traverse` | `7.26.9` | MIT | Traversal da AST TSX — Fase 4 | ~30 KB adicional | Manual TypeScript AST | **Muito Baixo** | ❌ Não | **Adiar para Fase 4** |
| `@babel/generator` | `7.26.9` | MIT | Geração de código TSX — Fase 4 | ~20 KB adicional | Template strings | **Muito Baixo** | ❌ Não | **Adiar para Fase 4** |
| `@google/genai` | `0.1.1` | Apache-2.0 | SDK Gemini server-side | 0 KB no cliente | **`fetch()` REST nativo** — já implementado | **Baixo** | ❌ Não | **NÃO INSTALAR** |

### 9.3 Nota sobre `sanitize-html` vs `DOMPurify`

| Critério | `sanitize-html` | `DOMPurify` |
|---|---|---|
| Ambiente | Node.js (server) + browser | Browser-first (usa DOM nativo) |
| Bundle | ~45 KB | ~23 KB |
| Licença | MIT | MPL-2.0 |
| Configuração de lista branca | Muito flexível (objetos de config) | Flexível via hooks |
| Uso no importador | Se processado no servidor (`api/import.ts`) | Se processado no browser (cliente) |
| **Decisão** | Usar se o importador ZIP for server-side | Usar se o importador for client-side |

A decisão entre os dois depende da localização final do importador (Fase 2). Ambos são seguros
e bem mantidos — a escolha é arquitetural, não de segurança.

### 9.4 Pacotes Explicitamente Proibidos

| Pacote | Motivo |
|---|---|
| `bootstrap` global | Corrompe design system Tailwind do Studio |
| `jquery` | Obsoleto; manipulações de DOM não controladas |
| `jsdom` | Runtime DOM completo com risco de execução de scripts |
| `express` | Conflito com rotas serverless Vercel já configuradas |
| `vm2` / `isolated-vm` | Runtimes de execução de código arbitrário |
| Font Awesome via CDN | CDN externo; usar `lucide-react` (já instalado) |

---

## 10. Gestão de Templates

### 10.1 Campos do Template no Catálogo

```typescript
interface TemplateCatalogEntry {
  id: string
  name: string
  thumbnail?: string
  originTechnology: 'blue-bolt-json' | 'html-static' | 'bootstrap'
                  | 'elementor-json' | 'react-controlled'
  schemaVersion: 'blue-bolt-template/v1'
  license: LicenseMetadata | null
  studioCompatibility: 'full' | 'partial' | 'limited'
  tinkAiCompatibility: 'full' | 'partial' | 'limited'
  importStatus: 'success' | 'partial' | 'failed'
  conversionWarnings: string[]      // avisos de campos convertidos ou perdidos
  unsupportedFeatures: string[]     // recursos do template original não suportados
}
```

### 10.2 Wireframe do Cartão de Template

```
+--------------------------------------------------------------------+
|  Agency — Portfólio e Serviços                                     |
|  ──────────────────────────────────────────────────────────────    |
|  Origem          │ Importação HTML/ZIP (Start Bootstrap v7.0.12)   |
|  Tecnologia      │ Bootstrap v5 / HTML5 Sanitizado                 |
|  Schema          │ blue-bolt-template/v1                           |
|  Status          │ Publicado                                       |
|  Compat. Studio  │ Total                                           |
|  Compat. Tink IA │ Total                                           |
|  Licença         │ MIT — Start Bootstrap LLC (2013–2023)           |
|  Interações      │ Modais, Menu Mobile, Form Local                 |
|  Avisos          │ 2 estilos inline convertidos para tokens         |
|  Recursos N/A    │ jQuery ScrollSpy → Scroll nativo React           |
+--------------------------------------------------------------------+
```

---

## 11. Limitações Conhecidas

| Limitação | Impacto | Mitigação Planeada |
|---|---|---|
| Bundle JS de 838 KB (aviso Vite) | Performance de carregamento inicial | Code splitting com `React.lazy()` + `Suspense` nos importadores |
| Importador ZIP usa `DataView` manual — não extrai conteúdo comprimido | Limitado a leitura de metadados do diretório central | Integrar `jszip` (já instalado) na Fase 2 |
| `SiteConfig` não tem `schemaVersion` obrigatório | Validação incompleta em runtime | Adicionar campo opcional com retrocompatibilidade (Fase 1) |
| `customCssScoped` não é validado por seletor | CSS com seletores globais pode vazar na exportação | Implementar prefixação de seletores (postcss) na Fase 3 |
| Nenhum sandbox para JS Nível 2 | JavaScript personalizado desativado | Fase 5 |
| Exportador React inexistente | Sem exportação para React | Fase 4 |
| Importador Bootstrap inexistente | Templates Bootstrap sem importação automática | Fase 3 |
| Sem `api/import.ts` | ZIPs processados no browser — sem acesso a `parse5` server-side | Criar rota serverless na Fase 2 |

---

## 12. Plano de Implementação por Fases

### Fase 1 — Schema e Contrato *(aprovação pendente)*

| Tarefa | Ficheiro | Status |
|---|---|---|
| Criar schemas Zod completos desta especificação | `src/lib/schemas/blue-bolt-template.ts` [NOVO] | 🔲 |
| Adicionar `schemaVersion?: 'blue-bolt-template/v1'` ao `SiteConfig` | `src/blocks/types.ts` | 🔲 |
| Integrar `parseAndValidateTemplate()` na importação JSON | `src/store/configStore.ts` | 🔲 |
| Adicionar `originTechnology` e `license` ao modelo de templates internos | `src/lib/templates.ts` | 🔲 |
| Verificação: `npx tsc --noEmit` + `npm run build` | — | 🔲 |

**Dependências necessárias:** Nenhuma. `zod@4.5.4` e `jszip@3.10.1` já instalados.

### Fase 2 — Importador HTML/ZIP Completo
*Pré-requisito: Aprovação de `parse5` ou `DOMParser` + `sanitize-html` ou `DOMPurify`*

- Pipeline completo do §4.3
- Integrar `jszip` para extração real de conteúdo
- Sanitização HTML conforme §3.1
- Rota `POST /api/import.ts` (serverless Vercel)
- UI de preview com `conversionWarnings[]`

### Fase 3 — Adaptador Bootstrap
*Pré-requisito: Fase 2 concluída; aprovação de `postcss` se necessário*

- Reconhecimento de classes Bootstrap v5
- Mapeamento da tabela do §6.2
- CSS scoped sem Bootstrap global no Studio
- Exportador com `bootstrap.min.css` isolado no bundle

### Fase 4 — React Controlled
*Pré-requisito: Fase 3 concluída; aprovação de `@babel/*`*

- Registry de componentes React homologados
- Parser AST estático de TSX
- Exportador Vite + React 19 + TypeScript

### Fase 5 — JavaScript Sandbox (Nível 2)
*Pré-requisito: Aprovação formal de segurança*

- `<SandboxFrame>` conforme §8
- CSP, nonce, `postMessage` validado
- Logs de auditoria
- UI de autorização de administrador

---

## 13. Próximos Passos Imediatos

> **Esta fase:** não instalar dependências, não alterar `.env.local`, Appwrite,
> schema de BD, Vercel. Não fazer commit ou push até aprovação explícita.

1. **Aguardar aprovação desta especificação** pelo utilizador.
2. Após aprovação: criar `src/lib/schemas/blue-bolt-template.ts` com os schemas do §2.
3. Atualizar `src/blocks/types.ts` (campo `schemaVersion` em `SiteConfig`).
4. Integrar validação no `configStore.ts`.
5. Atualizar `src/lib/templates.ts` com `originTechnology`.
6. Executar verificação: `npx tsc --noEmit` + `npm run build`.

---

*Blue Bolt Page Studio — Arquitetura Multi-Technology v3.0.0*
*Especificação corrigida e revisada. Setembro de 2026.*
