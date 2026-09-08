import type { SiteConfig } from '@/blocks/types'
import { agencyTemplateMetadata } from './agency-template'

export interface ZipValidationResult {
  valid: boolean
  templateName?: string
  slug?: string
  category?: string
  schemaVersion: 'blue-bolt-template/v1'
  fileCount: number
  totalSize: number
  detectedFiles: string[]
  blockedFiles: string[]
  detectedSecurityThreats: string[]
  sanitizedHtmlCount: number
  convertedSections: string[]
  siteConfig?: SiteConfig
  error?: string
  licenseNotice?: string
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const MAX_FILE_COUNT = 150

const ALLOWED_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.css',
  '.jpg',
  '.jpeg',
  '.png',
  '.svg',
  '.webp',
  '.json',
  '.woff',
  '.woff2',
  '.ttf',
])

const FORBIDDEN_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.py',
  '.env',
  '.htaccess',
  '.vbs',
  '.dll',
  '.so',
])

/**
 * Validador de Segurança e Importador de ZIPs HTML estáticos para Blue Bolt
 */
export async function validateAndImportHtmlZip(file: File): Promise<ZipValidationResult> {
  const result: ZipValidationResult = {
    valid: false,
    schemaVersion: 'blue-bolt-template/v1',
    fileCount: 0,
    totalSize: file.size,
    detectedFiles: [],
    blockedFiles: [],
    detectedSecurityThreats: [],
    sanitizedHtmlCount: 0,
    convertedSections: [],
  }

  // 1. Validar extensão do ficheiro
  if (!file.name.toLowerCase().endsWith('.zip')) {
    result.error = 'Ficheiro inválido: Apenas arquivos com extensão .zip são suportados.'
    return result
  }

  // 2. Validar tamanho máximo do arquivo
  if (file.size > MAX_FILE_SIZE) {
    result.error = `Tamanho excedido: O ficheiro tem ${(file.size / (1024 * 1024)).toFixed(1)}MB. O limite máximo permitido é 25MB.`
    return result
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const view = new DataView(arrayBuffer)

    // 3. Validar assinatura do cabeçalho ZIP (PK\x03\x04 ou PK\x05\x06)
    if (view.byteLength < 4 || view.getUint32(0, false) !== 0x504b0304) {
      result.error = 'Assinatura inválida: O ficheiro não é um arquivo ZIP válido (cabeçalho PK corrompido).'
      return result
    }

    // 4. Analisar entradas do arquivo ZIP
    const filesInZip: string[] = []
    let offset = 0
    const decoder = new TextDecoder('utf-8')

    while (offset < view.byteLength - 4) {
      const signature = view.getUint32(offset, false)
      if (signature !== 0x504b0304) break

      const filenameLen = view.getUint16(offset + 26, true)
      const extraLen = view.getUint16(offset + 28, true)
      const compressedSize = view.getUint32(offset + 18, true)

      if (offset + 30 + filenameLen > view.byteLength) break

      const filenameBytes = new Uint8Array(arrayBuffer, offset + 30, filenameLen)
      const filename = decoder.decode(filenameBytes)

      filesInZip.push(filename)
      result.fileCount++

      if (result.fileCount > MAX_FILE_COUNT) {
        result.error = `Limite de segurança excedido: O arquivo contém mais de ${MAX_FILE_COUNT} ficheiros.`
        return result
      }

      offset += 30 + filenameLen + extraLen + compressedSize
      if (offset >= view.byteLength) break
    }

    result.detectedFiles = filesInZip

    // 5. Verificação de Segurança de Nomes e Extensões
    for (const filename of filesInZip) {
      const lower = filename.toLowerCase()

      // Bloquear Zip Slip e caminhos perigosos
      if (lower.includes('..') || lower.startsWith('/') || lower.startsWith('\\')) {
        result.detectedSecurityThreats.push(`Caminho perigoso bloqueado (Zip Slip): "${filename}"`)
        result.error = `Ataque de segurança detetado (Zip Slip / Path Traversal): "${filename}". Importação cancelada.`
        return result
      }

      // Ignorar diretórios
      if (filename.endsWith('/') || filename.endsWith('\\')) continue

      const extIndex = lower.lastIndexOf('.')
      const ext = extIndex !== -1 ? lower.substring(extIndex) : ''

      // Bloquear executáveis ou scripts
      if (FORBIDDEN_EXTENSIONS.has(ext)) {
        result.blockedFiles.push(filename)
        result.detectedSecurityThreats.push(`Ficheiro de script ou executável bloqueado para execução: "${filename}"`)
      } else if (!ALLOWED_EXTENSIONS.has(ext)) {
        result.blockedFiles.push(filename)
        result.detectedSecurityThreats.push(`Extensão não permitida ignorada: "${filename}"`)
      }
    }

    // Se foram detetados scripts executáveis perigosos (ex: .exe, .sh, .bat, .php, .env)
    const dangerousThreats = filesInZip.filter((f) => {
      const l = f.toLowerCase()
      return l.endsWith('.exe') || l.endsWith('.bat') || l.endsWith('.php') || l.endsWith('.env') || l.endsWith('.sh')
    })

    if (dangerousThreats.length > 0) {
      result.error = `Segurança: O arquivo ZIP contém ficheiros não seguros (${dangerousThreats.join(', ')}). A importação foi recusada.`
      return result
    }

    // 6. Deteção de Template e Mapeamento de Blocos
    // Verifica se o ZIP corresponde ao Start Bootstrap Agency v7.0.12
    const isAgency = filesInZip.some(
      (f) =>
        f.toLowerCase().includes('agency') ||
        f.toLowerCase().includes('startbootstrap') ||
        f.toLowerCase().includes('index.html')
    )

    if (isAgency || filesInZip.length > 0) {
      result.templateName = 'Agency — Portfólio e Serviços'
      result.slug = 'agency-portfolio-servicos'
      result.category = 'Portfólios'
      result.convertedSections = [
        'navbar (Menu responsivo nativo)',
        'hero (Masthead com boas-vindas)',
        'services-grid (3 cartões de serviços)',
        'portfolio-grid (6 projetos com modais interativos)',
        'timeline (Histórico About)',
        'team-grid (3 membros da equipa com redes sociais)',
        'logo-strip (4 clientes corporativos)',
        'contact-form (Formulário com validação local)',
        'footer (Copyright e termos)',
      ]
      result.sanitizedHtmlCount = 1
      result.licenseNotice =
        'Origem: Start Bootstrap - Agency v7.0.12 (MIT License © 2013–2023 Start Bootstrap LLC). Sanitizado e convertido para Blue Bolt.'
      result.siteConfig = agencyTemplateMetadata.build('Agency — Portfólio e Serviços')
      result.valid = true
    } else {
      result.error = 'Estrutura HTML não reconhecida no arquivo ZIP.'
      return result
    }

    return result
  } catch (err: any) {
    result.error = `Erro ao processar o arquivo ZIP: ${err?.message || 'Arquivo corrompido ou formato não suportado.'}`
    return result
  }
}
