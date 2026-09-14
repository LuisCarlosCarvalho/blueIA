import { BlockConfig } from '../blocks/types'

interface ElementorNode {
  id?: string
  elType?: string
  widgetType?: string
  settings?: any
  elements?: ElementorNode[]
}

/**
 * Converte recursivamente um array de nós Elementor para uma lista de blocos nativos Blue Bolt.
 * Utiliza heurísticas para agrupar headings, textos e botões num único bloco "hero" ou "cta",
 * e mapeia outros widgets (imagens, listas) para blocos nativos equivalentes.
 */
export function parseElementorToBlueBolt(nodes: ElementorNode[]): BlockConfig[] {
  const blocks: BlockConfig[] = []
  
  if (!Array.isArray(nodes)) return blocks

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    
    // Se for um container/section, pode ser um bloco de layout ou agrupamento
    if (node.elType === 'container' || node.elType === 'section' || node.elType === 'column') {
      // Tenta mapear os filhos do container como um único bloco composto (ex: Hero)
      const mappedBlock = attemptMapToCompositeBlock(node)
      
      if (mappedBlock) {
        blocks.push(mappedBlock)
      } else if (node.elements && node.elements.length > 0) {
        // Se não conseguiu mapear para um bloco composto, percorre os filhos recursivamente
        const childBlocks = parseElementorToBlueBolt(node.elements)
        blocks.push(...childBlocks)
      }
    } 
    // Se for um widget solto
    else if (node.elType === 'widget') {
      const widgetBlock = mapWidgetToBlock(node)
      if (widgetBlock) {
        blocks.push(widgetBlock)
      }
    }
  }

  return blocks
}

/**
 * Tenta agrupar um container de widgets num bloco composto (Hero, CTA, Features).
 */
function attemptMapToCompositeBlock(container: ElementorNode): BlockConfig | null {
  if (!container.elements || container.elements.length === 0) return null

  // Recolher todos os widgets descendentes diretos ou em colunas simples
  const widgets = extractWidgetsFlat(container)
  
  if (widgets.length === 0) return null

  // Heurística 1: Hero (Heading + Text + Button + Image opcional)
  const headings = widgets.filter(w => w.widgetType === 'heading')
  const texts = widgets.filter(w => w.widgetType === 'text-editor')
  const buttons = widgets.filter(w => w.widgetType === 'button')
  const images = widgets.filter(w => w.widgetType === 'image')

  if (headings.length > 0) {
    const title = headings[0].settings?.title || ''
    const subtitle = texts.length > 0 ? texts[0].settings?.editor : ''
    
    // Se for o primeiro bloco (muito grande, com botão) -> Hero
    if (buttons.length > 0) {
      return {
        id: container.id || crypto.randomUUID(),
        type: 'hero',
        variant: 'default',
        props: {
          headline: stripHtml(title),
          subheadline: stripHtml(subtitle),
          primaryCta: stripHtml(buttons[0].settings?.text || 'Saber mais'),
          imageUrl: images.length > 0 ? images[0].settings?.image?.url : undefined
        }
      }
    }
    
    // Se tiver apenas heading e texto, podemos mapear para 'content' ou 'cta' simplificado
    return {
      id: container.id || crypto.randomUUID(),
      type: 'content',
      variant: 'default',
      props: {
        body: `<h2>${title}</h2><br/>${subtitle}`
      }
    }
  }
  
  // Heurística 2: Features (Icon-list ou colunas repetidas de imagens/texto)
  const iconLists = widgets.filter(w => w.widgetType === 'icon-list')
  if (iconLists.length > 0) {
    const items = iconLists[0].settings?.icon_list || []
    return {
      id: container.id || crypto.randomUUID(),
      type: 'features',
      variant: 'default',
      props: {
        title: 'Funcionalidades',
        items: items.map((i: any) => ({
          title: stripHtml(i.text || 'Item'),
          description: ''
        }))
      }
    }
  }

  // Se a heurística não encaixar num bloco composto perfeitamente, retorna null 
  // para que o ciclo principal divida o container nos seus blocos primitivos.
  return null
}

/**
 * Mapeia um widget individual do Elementor para um bloco Blue Bolt.
 */
function mapWidgetToBlock(widget: ElementorNode): BlockConfig | null {
  const { widgetType, settings = {}, id } = widget
  const uid = id || crypto.randomUUID()

  switch (widgetType) {
    case 'heading':
      return {
        id: uid,
        type: 'content',
        variant: 'default',
        props: {
          body: `<h2>${settings.title || ''}</h2>`
        }
      }
    case 'text-editor':
      return {
        id: uid,
        type: 'content',
        variant: 'default',
        props: {
          body: settings.editor || ''
        }
      }
    case 'image':
      if (!settings.image?.url) return null
      return {
        id: uid,
        type: 'image',
        variant: 'default',
        props: {
          src: settings.image.url,
          alt: settings.image.alt || ''
        }
      }
    case 'button':
      return {
        id: uid,
        type: 'cta',
        variant: 'default',
        props: {
          headline: 'Ação',
          buttonText: stripHtml(settings.text || 'Clique aqui')
        }
      }
    case 'image-carousel':
    case 'gallery':
      const slides = settings.carousel || settings.gallery || []
      return {
        id: uid,
        type: 'gallery',
        variant: 'default',
        props: {
          images: slides.map((s: any) => ({ url: s.url }))
        }
      }
    case 'html':
      return {
        id: uid,
        type: 'content',
        variant: 'default',
        props: {
          body: settings.html || ''
        }
      }
    default:
      return null
  }
}

/**
 * Extrai todos os widgets de uma árvore, achatando colunas aninhadas (até certa profundidade).
 */
function extractWidgetsFlat(node: ElementorNode): ElementorNode[] {
  const widgets: ElementorNode[] = []
  
  if (node.elType === 'widget') {
    widgets.push(node)
  }
  
  if (node.elements && node.elements.length > 0) {
    for (const child of node.elements) {
      widgets.push(...extractWidgetsFlat(child))
    }
  }
  
  return widgets
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '')
}
