import type { SiteConfig } from '@/blocks/types'
import type { ProjectSettings } from '@/store/projectsStore'

export const PUBLICATION_UNAVAILABLE = 'Publicação indisponível: integração segura em preparação. Pode exportar o HTML.'

export interface PublishSiteInput {
  config: SiteConfig
  projectName?: string
  settings?: ProjectSettings
}

export interface PublishSiteResult {
  liveUrl: string
  deploymentId: string
  readyState: 'READY'
}

/** Fail closed until session-based publishing is implemented. Never sends a deploy request. */
export async function publishSite(input: PublishSiteInput): Promise<PublishSiteResult> {
  void input
  throw new Error(PUBLICATION_UNAVAILABLE)
}
