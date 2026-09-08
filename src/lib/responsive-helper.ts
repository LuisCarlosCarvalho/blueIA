import type { BlockConfig, SectionLayoutConfig } from '@/blocks/types'
import type { Viewport } from '@/store/editorStore'

export function resolveBlockLayout(block: BlockConfig, viewport: Viewport): SectionLayoutConfig {
  const base = block.layout || {
    paddingTop: 'md',
    paddingBottom: 'md',
    maxWidth: 'boxed',
    align: 'center',
    columns: 3,
    direction: 'row',
  }

  if (viewport === 'desktop') {
    return base
  }

  const tabletOverride = block.responsive?.tablet || {}
  const mobileOverride = block.responsive?.mobile || {}

  if (viewport === 'tablet') {
    return {
      ...base,
      ...tabletOverride,
      columns: (tabletOverride.columns ?? (base.columns ? Math.min(2, base.columns) : 2)) as 1 | 2 | 3 | 4,
    }
  }

  // Mobile: inherits tablet and desktop, with mobile defaults
  return {
    ...base,
    ...tabletOverride,
    ...mobileOverride,
    columns: mobileOverride.columns ?? 1,
    direction: mobileOverride.direction ?? 'col',
    paddingTop: mobileOverride.paddingTop ?? 'sm',
    paddingBottom: mobileOverride.paddingBottom ?? 'sm',
  }
}

export function isLayoutPropOverridden(
  block: BlockConfig,
  viewport: Viewport,
  prop: keyof SectionLayoutConfig
): boolean {
  if (viewport === 'desktop') return false
  if (viewport === 'tablet') {
    return block.responsive?.tablet?.[prop] !== undefined
  }
  if (viewport === 'mobile') {
    return block.responsive?.mobile?.[prop] !== undefined
  }
  return false
}
