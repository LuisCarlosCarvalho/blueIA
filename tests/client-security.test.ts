import { afterEach, describe, expect, it, vi } from 'vitest'
import { publicSettings, removeLegacyAiCredential } from '../src/lib/local-settings'
import { publishSite } from '../src/lib/publish-site'

afterEach(() => vi.unstubAllGlobals())

describe('browser secrets and publishing', () => {
  it('keeps public settings and drops legacy credentials and unknown fields', () => {
    expect(publicSettings({ siteName: 'Draft', deployAccessKey: 'synthetic', geminiKey: 'synthetic', apiKey: 'synthetic' }))
      .toEqual({ siteName: 'Draft' })
  })

  it('deletes the old AI credential without reading its value', () => {
    const storage = { removeItem: vi.fn(), getItem: vi.fn() }
    vi.stubGlobal('localStorage', storage)
    removeLegacyAiCredential()
    expect(storage.removeItem).toHaveBeenCalledWith('blueia-gemini-key')
    expect(storage.getItem).not.toHaveBeenCalled()
  })

  it('cannot send a deployment request while publication is unavailable', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(publishSite({ config: { name: 'Draft', blocks: [] } })).rejects.toThrow('Publicação indisponível')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
