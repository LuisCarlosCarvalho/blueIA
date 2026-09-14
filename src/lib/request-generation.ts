import { account } from '@/lib/appwrite'

export async function requestGeneration(body: Record<string, unknown>, signal?: AbortSignal): Promise<Record<string, unknown>> {
  // Short-lived Appwrite session proof; never stored or logged. No provider API key.
  let jwt: string
  try {
    jwt = (await account.createJWT()).jwt
  } catch {
    throw new Error('Autenticação necessária. Inicie sessão novamente para usar a IA.')
  }
  signal?.throwIfAborted()
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify(body),
    signal,
  })
  if (!(response.headers.get('content-type') || '').includes('application/json')) {
    throw new Error('Serviço de IA indisponível neste ambiente.')
  }
  const data: unknown = await response.json()
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'Autenticação necessária. Inicie sessão novamente para usar a IA.',
      403: 'Não tem permissão para usar a IA.',
      429: 'Limite de pedidos atingido. Tente novamente mais tarde.',
      503: 'Serviço de IA indisponível: configuração ou autenticação do servidor em preparação.',
      504: 'Tempo limite de geração excedido. Tente novamente.',
    }
    throw new Error(messages[response.status] || 'Não foi possível concluir o pedido de IA.')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('A IA devolveu uma resposta inválida.')
  }
  return data as Record<string, unknown>
}
