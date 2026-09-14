import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateGeneration } from '../api/lib/generation-auth'

const req = (authorization?: string) => ({ headers: { authorization } }) as VercelRequest

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules() })

describe('AI authentication boundary', () => {
  beforeEach(() => {
    vi.stubEnv('APPWRITE_ENDPOINT', 'https://appwrite.example/v1')
    vi.stubEnv('APPWRITE_PROJECT_ID', 'test-project')
  })

  it('rejects anonymous requests without contacting providers', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await authenticateGeneration(req())).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('verifies the session against Appwrite, not a browser-supplied user id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ $id: 'verified-user' })))
    vi.stubGlobal('fetch', fetchMock)
    expect(await authenticateGeneration(req('Bearer synthetic-session'))).toBe('verified-user')
    expect(fetchMock.mock.calls[0][0]).toBe('https://appwrite.example/v1/account')
    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      'X-Appwrite-Project': 'test-project', 'X-Appwrite-JWT': 'synthetic-session',
    })
  })

  it('rejects expired sessions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))
    expect(await authenticateGeneration(req('Bearer expired-session'))).toBeNull()
  })

  it('fails closed if authentication configuration is missing', async () => {
    vi.stubEnv('APPWRITE_ENDPOINT', '')
    vi.stubEnv('VITE_APPWRITE_ENDPOINT', '')
    await expect(authenticateGeneration(req('Bearer synthetic-session'))).rejects.toThrow()
  })

  it('returns 401 from the handler before calling Gemini', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'synthetic-test-value')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { default: handler } = await import('../api/generate')
    const response = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() }
    response.status.mockReturnValue(response)
    await handler({ ...req(), method: 'POST', body: { prompt: 'test' } } as VercelRequest, response as unknown as VercelResponse)
    expect(response.status).toHaveBeenCalledWith(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns 503 when Gemini is not configured after authenticating', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ $id: 'verified-user' })))
    vi.stubGlobal('fetch', fetchMock)
    const { default: handler } = await import('../api/generate')
    const response = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() }
    response.status.mockReturnValue(response)
    await handler({ ...req('Bearer synthetic-session'), method: 'POST', body: { prompt: 'test' } } as VercelRequest, response as unknown as VercelResponse)
    expect(response.status).toHaveBeenCalledWith(503)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
