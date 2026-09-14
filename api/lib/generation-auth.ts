import type { VercelRequest } from '@vercel/node'

export async function authenticateGeneration(req: VercelRequest): Promise<string | null> {
  const authorization = req.headers.authorization
  if (typeof authorization !== 'string' || !/^Bearer \S{1,4096}$/.test(authorization)) return null
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT
  const project = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID
  if (!endpoint || !project || new URL(endpoint).protocol !== 'https:') {
    throw new Error('Authentication unavailable')
  }
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/account`, {
    headers: { 'X-Appwrite-Project': project, 'X-Appwrite-JWT': authorization.slice(7) },
    signal: AbortSignal.timeout(5000),
  })
  if (response.status === 401 || response.status === 403) return null
  if (!response.ok) throw new Error('Authentication unavailable')
  const user = await response.json() as { $id?: unknown }
  return typeof user.$id === 'string' && user.$id.length > 0 ? user.$id : null
}
