import React from 'react'

interface ElementorNode {
  id: string
  elType?: string
  widgetType?: string
  settings?: any
  elements?: ElementorNode[]
}

export function ElementorBlock({ props }: { props: any }) {
  const elements: ElementorNode[] = props?.elements || []

  return (
    <div className="w-full elementor-imported-content">
      {elements.map((el) => (
        <ElementorRenderer key={el.id} node={el} />
      ))}
    </div>
  )
}

function ElementorRenderer({ node }: { node: ElementorNode }) {
  const { elType, widgetType, settings = {}, elements = [] } = node

  // Extract inline styles based on Elementor settings if possible
  const style: React.CSSProperties = {}
  
  if (settings.background_color) {
    style.backgroundColor = settings.background_color
  }
  if (settings.text_color) {
    style.color = settings.text_color
  }
  if (settings.padding) {
    style.padding = `${settings.padding.top || 0}${settings.padding.unit || 'px'} ${settings.padding.right || 0}${settings.padding.unit || 'px'} ${settings.padding.bottom || 0}${settings.padding.unit || 'px'} ${settings.padding.left || 0}${settings.padding.unit || 'px'}`
  }
  if (settings.margin) {
    style.margin = `${settings.margin.top || 0}${settings.margin.unit || 'px'} ${settings.margin.right || 0}${settings.margin.unit || 'px'} ${settings.margin.bottom || 0}${settings.margin.unit || 'px'} ${settings.margin.left || 0}${settings.margin.unit || 'px'}`
  }

  // Handle Containers
  if (elType === 'container' || elType === 'section' || elType === 'column') {
    if (settings.flex_direction) {
      style.display = 'flex'
      style.flexDirection = settings.flex_direction === 'row' ? 'row' : 'column'
    }
    if (settings.flex_justify_content) {
      style.justifyContent = settings.flex_justify_content
    }
    if (settings.flex_align_items) {
      style.alignItems = settings.flex_align_items
    }
    if (settings.flex_gap) {
      style.gap = `${settings.flex_gap.size || 0}${settings.flex_gap.unit || 'px'}`
    }

    return (
      <div id={node.id} style={style} className={`elementor-${elType} relative w-full`}>
        {elements.map((child) => (
          <ElementorRenderer key={child.id} node={child} />
        ))}
      </div>
    )
  }

  // Handle Widgets
  if (elType === 'widget') {
    switch (widgetType) {
      case 'heading':
        return (
          <div style={{ textAlign: settings.align || 'left', ...style }} className="mb-4">
            <h2 
              className="font-bold tracking-tight" 
              style={{ 
                color: settings.title_color || style.color, 
                fontSize: settings.typography_font_size?.size ? `${settings.typography_font_size.size}${settings.typography_font_size.unit || 'px'}` : '2rem' 
              }}
              dangerouslySetInnerHTML={{ __html: settings.title || '' }} 
            />
          </div>
        )
      case 'text-editor':
        return (
          <div 
            style={{ textAlign: settings.align || 'left', ...style }} 
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-4 opacity-80"
            dangerouslySetInnerHTML={{ __html: settings.editor || '' }} 
          />
        )
      case 'image':
        if (!settings.image?.url) return null
        return (
          <div style={{ textAlign: settings.align || 'center', ...style }} className="mb-4">
            <img 
              src={settings.image.url} 
              alt={settings.image.alt || ''} 
              className="max-w-full h-auto rounded-lg mx-auto" 
              style={{ width: settings.width?.size ? `${settings.width.size}${settings.width.unit || '%'}` : 'auto' }}
            />
          </div>
        )
      case 'button':
        return (
          <div style={{ textAlign: settings.align || 'center', ...style }} className="mb-4">
            <a 
              href={settings.link?.url || '#'}
              className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {settings.text || 'Clique Aqui'}
            </a>
          </div>
        )
      case 'image-carousel':
        const slides = settings.carousel || []
        return (
          <div className="w-full flex gap-4 overflow-x-auto py-4 snap-x hide-scrollbar" style={style}>
            {slides.map((slide: any, idx: number) => (
              <img 
                key={idx} 
                src={slide.url} 
                alt="" 
                className="h-48 w-auto object-cover rounded-lg snap-center flex-shrink-0" 
              />
            ))}
          </div>
        )
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: settings.html || '' }} />
      case 'icon-list':
        const items = settings.icon_list || []
        return (
          <ul className="flex flex-col gap-2 mb-4" style={style}>
            {items.map((item: any) => (
              <li key={item._id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: item.text || '' }} />
              </li>
            ))}
          </ul>
        )
      case 'image-box':
        return (
          <div className="flex flex-col md:flex-row items-center gap-4 p-4 border border-border/50 rounded-xl bg-card" style={style}>
            {settings.image?.url && (
              <img src={settings.image.url} className="w-16 h-16 object-cover rounded-full" alt="" />
            )}
            <div>
              {settings.title_text && <h4 className="font-bold text-foreground" dangerouslySetInnerHTML={{ __html: settings.title_text }} />}
              {settings.description_text && <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: settings.description_text }} />}
            </div>
          </div>
        )
      case 'nested-accordion':
        const accItems = settings.items || []
        return (
          <div className="w-full space-y-2 mb-4" style={style}>
            {accItems.map((item: any, i: number) => (
              <details key={item._id || i} className="border border-border/50 rounded-lg p-4 bg-card group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between">
                  <span dangerouslySetInnerHTML={{ __html: item.item_title || '' }} />
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="pt-4 text-muted-foreground opacity-80 text-sm">
                   <p>O conteúdo interativo do accordion é renderizado nos elementos descendentes pelo Elementor, mas aqui está a pré-visualização.</p>
                </div>
              </details>
            ))}
          </div>
        )
      default:
        // Render children if available, else a placeholder
        if (elements.length > 0) {
          return (
            <div className={`widget-unknown-${widgetType}`}>
              {elements.map((child) => (
                <ElementorRenderer key={child.id} node={child} />
              ))}
            </div>
          )
        }
        return (
          <div className="p-3 my-2 border border-dashed border-muted bg-secondary/30 rounded text-xs text-muted-foreground text-center">
            Widget [{widgetType}] não suportado nativamente.
          </div>
        )
    }
  }

  return null
}
