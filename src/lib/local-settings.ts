import type { ProjectSettings } from '@/store/projectsStore'

const PUBLIC_SETTINGS = [
  'siteName', 'siteDescription', 'faviconUrl', 'language', 'seoTitle',
  'seoDescription', 'ogImageUrl', 'customDomain', 'gaId', 'posthogKey',
] as const

/** Allowlist: old provider/deploy credentials are never hydrated or persisted. */
export function publicSettings(value: unknown): ProjectSettings {
  if (!value || typeof value !== 'object') return {}
  const source = value as Record<string, unknown>
  return Object.fromEntries(PUBLIC_SETTINGS.flatMap((key) =>
    typeof source[key] === 'string' ? [[key, source[key]]] : [],
  ))
}

export function removeLegacyAiCredential() {
  try { localStorage.removeItem('blueia-gemini-key') } catch { /* No storage available. */ }
}
