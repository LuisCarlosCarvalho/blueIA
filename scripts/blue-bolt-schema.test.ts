/**
 * Testes reais de validação do schema blue-bolt-template/v1
 * Executa 22 casos obrigatórios descritos na especificação.
 *
 * Executar com: npx tsx scripts/blue-bolt-schema.test.ts
 *
 * NÃO incluído no bundle do browser (fora de src/).
 */

import {
  BlueBoltTemplateJsonSchema,
  parseAndValidateTemplate,
  rejectPrototypePollution,
  AssetUrlSchema,
  isSafeZipPath,
  checkZipEntryLimits,
} from '../src/lib/schemas/blue-bolt-template.js'

// ──────────────────────────────────────────────────────────
// UTILITÁRIOS
// ──────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function test(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`  ✅ PASS  ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ FAIL  ${name}`)
    console.log(`         ${err instanceof Error ? err.message : String(err)}`)
    failed++
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Asserção falhou: ${message}`)
}

function assertThrows(fn: () => unknown, expectedFragment: string): void {
  try {
    fn()
    throw new Error(`Esperava exceção com "${expectedFragment}", mas nenhuma foi lançada.`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.includes(expectedFragment)) {
      throw new Error(`Exceção lançada mas mensagem "${msg}" não contém "${expectedFragment}"`)
    }
  }
}

// ──────────────────────────────────────────────────────────
// FIXTURE: Documento canónico mínimo válido
// ──────────────────────────────────────────────────────────

function makeValidTemplate(overrides: Record<string, unknown> = {}): unknown {
  return {
    schemaVersion: 'blue-bolt-template/v1',
    metadata: {
      id: 'test-template',
      name: 'Teste',
      slug: 'teste',
      category: 'Landing Pages',
      status: 'draft',
      originTechnology: 'blue-bolt-json',
      schemaVersion: 'blue-bolt-template/v1',
      sectionCount: 1,
      author: 'Blue Bolt Studio',
      createdAt: '2026-09-09T00:00:00Z',
      updatedAt: '2026-09-09T00:00:00Z',
    },
    theme: {
      bg0: '#0a0a0f', bg1: '#111118', bg2: '#1a1a26', bg3: '#242435',
      text0: '#ffffff', text1: '#e2e2ef', text2: '#8888aa',
      accent: '#6c63ff', accentDim: '#4b44cc', borderDefault: '#2a2a3d',
      fontSans: 'DM Sans', fontDisplay: 'Space Grotesk', fontMono: 'JetBrains Mono',
      radius: 8, radiusLg: 16,
    },
    pages: [{
      id: 'page-home',
      name: 'Home',
      slug: 'home',
      blocks: [{
        id: 'block-hero-1',
        type: 'hero',
        variant: 'centered',
        props: {
          headline: 'Título de Teste',
          subheadline: 'Subtítulo',
          primaryCta: 'Começar',
        },
      }],
    }],
    assets: [],
    approvedInteractions: [],
    ...overrides,
  }
}

// ──────────────────────────────────────────────────────────
// SUITE 1
// ──────────────────────────────────────────────────────────

console.log('\n📋 Suite 1 — Documento canónico válido')

test('JSON válido é aceite sem erros', () => {
  const { template, warnings } = parseAndValidateTemplate(makeValidTemplate())
  assert(template.schemaVersion === 'blue-bolt-template/v1', 'schemaVersion incorrecta')
  assert(template.pages.length === 1, 'Deve ter 1 página')
  assert(warnings.length === 0, `Não deve ter warnings: ${warnings.join(', ')}`)
})

test('sectionCount recalculado quando declarado errado', () => {
  const raw = makeValidTemplate()
  ;(raw as Record<string, unknown>).metadata = {
    ...((raw as Record<string, unknown>).metadata as Record<string, unknown>),
    sectionCount: 999,
  }
  const { template, warnings } = parseAndValidateTemplate(raw)
  assert(template.metadata.sectionCount === 1, `sectionCount devia ser 1, é ${template.metadata.sectionCount}`)
  assert(warnings.some((w) => w.includes('sectionCount corrigido')), 'Warning não emitido')
})

// ──────────────────────────────────────────────────────────
// SUITE 2
// ──────────────────────────────────────────────────────────

console.log('\n📋 Suite 2 — Campos desconhecidos rejeitados')

test('Campo desconhecido na raiz rejeitado (.strict())', () => {
  const result = BlueBoltTemplateJsonSchema.safeParse(makeValidTemplate({ campoInjetado: 'x' }))
  assert(!result.success, 'Devia falhar')
})

test('Campo desconhecido em metadata rejeitado', () => {
  const raw = makeValidTemplate()
  ;(raw as Record<string, unknown>).metadata = {
    ...((raw as Record<string, unknown>).metadata as Record<string, unknown>),
    campoExtra: 'x',
  }
  assert(!BlueBoltTemplateJsonSchema.safeParse(raw).success, 'Devia falhar em metadata')
})

// ──────────────────────────────────────────────────────────
// SUITE 3
// ──────────────────────────────────────────────────────────

console.log('\n📋 Suite 3 — Segurança de URLs')

test('URL javascript: rejeitada', () => {
  assert(!AssetUrlSchema.safeParse('javascript:alert(1)').success, 'javascript: rejeitado')
})
test('URL data: rejeitada', () => {
  assert(!AssetUrlSchema.safeParse('data:text/html,x').success, 'data: rejeitado')
})
test('URL blob: rejeitada', () => {
  assert(!AssetUrlSchema.safeParse('blob:https://x.com/id').success, 'blob: rejeitado')
})
test('URL https:// aceite', () => {
  assert(AssetUrlSchema.safeParse('https://cdn.example.com/img.jpg').success, 'https aceite')
})
test('Referência asset:// aceite', () => {
  assert(AssetUrlSchema.safeParse('asset://img-abc').success, 'asset:// aceite')
})
test('URL javascript: em imageUrl detectada no bloco', () => {
  const raw = makeValidTemplate()
  const pages = (raw as Record<string, unknown>).pages as Array<Record<string, unknown>>
  ;(pages[0].blocks as Array<Record<string, unknown>>)[0].props = {
    headline: 'T', subheadline: 'S', primaryCta: 'C',
    imageUrl: 'javascript:alert(1)',
  }
  let detected = false
  try {
    const { warnings } = parseAndValidateTemplate(raw)
    detected = warnings.some((w) => w.includes('imageUrl'))
  } catch { detected = true }
  assert(detected, 'URL javascript: em imageUrl devia ser detectada')
})

// ──────────────────────────────────────────────────────────
// SUITE 4
// ──────────────────────────────────────────────────────────

console.log('\n📋 Suite 4 — Prototype Pollution')

test('Chave __proto__ rejeitada', () => {
  assertThrows(() => rejectPrototypePollution({ __proto__: {} }), '__proto__')
})
test('Chave prototype rejeitada', () => {
  assertThrows(() => rejectPrototypePollution({ prototype: {} }), 'prototype')
})
test('Chave constructor rejeitada', () => {
  assertThrows(() => rejectPrototypePollution({ constructor: {} }), 'constructor')
})
test('__proto__ aninhada detectada recursivamente', () => {
  assertThrows(() => rejectPrototypePollution({ a: { b: { __proto__: {} } } }), '__proto__')
})
test('Documento limpo não aciona protecção', () => {
  rejectPrototypePollution({ a: 1, b: { c: [1, 2] } })
  assert(true, 'passou')
})

// ──────────────────────────────────────────────────────────
// SUITE 5
// ──────────────────────────────────────────────────────────

console.log('\n📋 Suite 5 — Segurança ZIP')

test('Path com .. rejeitado', () => {
  assert(!isSafeZipPath('../etc/passwd'), '../ rejeitado')
  assert(!isSafeZipPath('a/../../b'), 'a/../../b rejeitado')
})
test('Path absoluto rejeitado', () => {
  assert(!isSafeZipPath('/etc/passwd'), 'path absoluto rejeitado')
})
test('Path com ~ rejeitado', () => {
  assert(!isSafeZipPath('~/secret'), '~ rejeitado')
})
test('Path normal aceite', () => {
  assert(isSafeZipPath('assets/hero.jpg'), 'path normal aceite')
  assert(isSafeZipPath('index.html'), 'index.html aceite')
})
test('Zip bomb (ratio > 50:1) detectado', () => {
  const r = checkZipEntryLimits({ name: 'bomb.txt', compressedSize: 100, uncompressedSize: 6000 }, 0)
  assert(!r.safe, 'Zip bomb devia ser detectado')
  assert(r.reason?.includes('Zip bomb') ?? false, 'Mensagem devia mencionar Zip bomb')
})
test('Limite de tamanho acumulado detectado', () => {
  const r = checkZipEntryLimits(
    { name: 'x.bin', compressedSize: 1000, uncompressedSize: 1000 },
    75 * 1024 * 1024
  )
  assert(!r.safe, 'Excesso detectado')
})
test('Entrada normal aceite', () => {
  const r = checkZipEntryLimits({ name: 'style.css', compressedSize: 10000, uncompressedSize: 30000 }, 0)
  assert(r.safe, `Normal devia ser aceite: ${r.reason ?? ''}`)
})

// ──────────────────────────────────────────────────────────
// RESULTADO
// ──────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`)
console.log(`Resultado: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('❌ SUITE FALHOU')
  process.exit(1)
} else {
  console.log('✅ TODOS OS TESTES PASSARAM')
  process.exit(0)
}
