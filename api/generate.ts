import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateGeneration } from './lib/generation-auth.js'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

// Simple in-memory rate limiter per IP / session (30 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (record.count >= 30) {
    return false
  }
  record.count += 1
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let userId: string | null
  try {
    userId = await authenticateGeneration(req)
  } catch {
    return res.status(503).json({ error: 'Autenticação do serviço de IA indisponível.' })
  }
  if (!userId) return res.status(401).json({ error: 'Autenticação necessária para usar a IA.' })

  // Provider credentials remain exclusively on the server.
  if (!GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Assistência por IA temporariamente indisponível: GEMINI_API_KEY não configurada no servidor.',
      configured: false,
    })
  }

  if (!checkRateLimit(userId)) {
    return res.status(429).json({ error: 'Limite de pedidos excedido. Por favor, tente novamente num instante.' })
  }

  const { action = 'generate_page', prompt, text, mode, segment, niche } = req.body || {}
  if (!['generate_page', 'refine_text', 'suggest_sections'].includes(action) ||
    [mode, segment, niche].some((value) => value !== undefined && (typeof value !== 'string' || value.length > 200))) {
    return res.status(400).json({ error: 'Pedido de IA inválido.' })
  }

  // Limit input sizes
  if (prompt && typeof prompt === 'string' && prompt.length > 1500) {
    return res.status(400).json({ error: 'O prompt fornecido excede o limite máximo de 1500 caracteres.' })
  }
  if (text && typeof text === 'string' && text.length > 1000) {
    return res.status(400).json({ error: 'O texto fornecido excede o limite de 1000 caracteres.' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  try {
    let systemInstruction = ''
    let userMessage = ''

    if (action === 'refine_text') {
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Texto para refinamento é obrigatório.' })
      }
      systemInstruction = `Você é um copywriter profissional especialista em conversão e marketing digital.
Receberá um texto, um modo de refinamento ('improve' | 'summarize' | 'commercial' | 'niche'), segmento e nicho.
Retorne SEMPRE um JSON válido com:
{
  "refinedText": "texto refinado",
  "explanation": "breve explicação do que foi otimizado (1 frase)"
}`
      userMessage = `Texto atual: "${text}"
Modo: ${mode || 'improve'}
Segmento: ${segment || 'Geral'}
Nicho: ${niche || 'Geral'}`
    } else if (action === 'suggest_sections') {
      systemInstruction = `Você é um arquiteto de páginas web de alta conversão.
Sugira secções recomendadas para o segmento e nicho.
Retorne um JSON com:
{
  "suggestions": [
    { "type": "features", "title": "...", "description": "..." }
  ]
}`
      userMessage = `Segmento: ${segment || 'Geral'}, Nicho: ${niche || 'Geral'}`
    } else {
      // Default: generate_page
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'O prompt de criação é obrigatório.' })
      }
      systemInstruction = `Você é um arquiteto e designer especialista do Blue Bolt Studio, com as seguintes Skills ativas:
1. Owl-Listener/ai-design-skills: Aplique heurísticas de design de alta conversão, uso estratégico de espaços em branco, contraste, e Glassmorphism quando apropriado.
2. greensock/gsap-skills: Adicione a propriedade "gsapAnimation" a blocos para criar animações de entrada ou scroll (ex: { "type": "fade-up", "duration": 1, "delay": 0.2 }).
3. img2threejs/img2threejs: Pode utilizar o bloco "ThreeJsBlock" para renderizar cenas 3D interativas. A propriedade props deve conter o "modelUrl" ou "sceneType".
4. lottiefiles/motion-design-skill: Pode utilizar o bloco "LottieBlock" para exibir animações vetoriais via props.animationUrl.

Gere uma configuração JSON completa de site com schema { "name": string, "theme": object, "blocks": array }.
Retorne APENAS JSON válido, sem markdown nem explicações externas.`
      userMessage = `Gere uma configuração completa de landing page para: ${prompt}. Estilo: ${segment || 'Moderno'}.`
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      return res.status(502).json({ error: 'Erro na comunicação com o serviço de IA.' })
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      return res.status(502).json({ error: 'Resposta vazia da API de IA.' })
    }

    const parsed = JSON.parse(rawText)
    return res.status(200).json(parsed)
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ error: 'Tempo limite de geração excedido (25s).' })
    }
    return res.status(500).json({ error: 'Falha no processamento do pedido de IA.' })
  } finally {
    clearTimeout(timeout)
  }
}
