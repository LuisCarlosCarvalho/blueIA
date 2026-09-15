// Basic Elementor Importer
import { editorAdapter } from '../GrapesEditorAdapter'
import { rejectPrototypePollution } from '@/lib/schemas/blue-bolt-template'

export interface ElementorReportItem {
  id: string
  elType: string
  widgetType?: string
  status: 'converted' | 'unsupported' | 'blocked'
  reason?: string
}

export interface ElementorImportResult {
  originalJson: any
  report: ElementorReportItem[]
  html: string
  css: string
}

function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return ''
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function isValidUrl(url: string): boolean {
  if (typeof url !== 'string' || !url) return false
  try {
    const parsed = new URL(url, 'http://localhost')
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export class ElementorImporter {
  static async parse(file: File): Promise<ElementorImportResult> {
    const text = await file.text()
    let data: any
    
    try {
      data = JSON.parse(text)
      rejectPrototypePollution(data)
    } catch (e: any) {
      throw new Error(`Invalid JSON or security error: ${e.message}`)
    }

    const report: ElementorReportItem[] = []
    let html = ''
    let css = ''

    // Extremely simplified Elementor structure traversing for phase 1 mock testing
    // Real Elementor JSON has `content` array with elements
    const elements = data.content || data.data || []
    
    const processElement = (el: any) => {
      if (!el || typeof el !== 'object') return

      const type = el.elType
      const widget = el.widgetType

      if (type === 'section' || type === 'container') {
        report.push({ id: el.id, elType: type, status: 'converted' })
        html += `<div id="${escapeHtml(el.id)}" style="padding: 20px; border: 1px dashed #ccc; margin-bottom: 10px;">`
        if (el.elements) el.elements.forEach(processElement)
        html += `</div>`
      } else if (type === 'column') {
        report.push({ id: el.id, elType: type, status: 'converted' })
        html += `<div id="${escapeHtml(el.id)}" style="display: flex; flex-direction: column;">`
        if (el.elements) el.elements.forEach(processElement)
        html += `</div>`
      } else if (type === 'widget') {
        if (widget === 'heading') {
          report.push({ id: el.id, elType: type, widgetType: widget, status: 'converted' })
          const text = el.settings?.title ? escapeHtml(el.settings.title) : 'Heading'
          html += `<h2 id="${escapeHtml(el.id)}" style="color: #333;">${text}</h2>`
        } else if (widget === 'text-editor') {
          report.push({ id: el.id, elType: type, widgetType: widget, status: 'converted' })
          // In real scenarios text-editor has HTML, we should use DOMPurify. Here we escape for mock safety.
          const text = el.settings?.editor ? escapeHtml(el.settings.editor) : 'Text content'
          html += `<div id="${escapeHtml(el.id)}" style="color: #666;">${text}</div>`
        } else if (widget === 'image') {
          report.push({ id: el.id, elType: type, widgetType: widget, status: 'converted' })
          let url = el.settings?.image?.url || 'https://via.placeholder.com/150'
          if (!isValidUrl(url)) url = 'https://via.placeholder.com/150'
          html += `<img id="${escapeHtml(el.id)}" src="${escapeHtml(url)}" alt="image" style="max-width: 100%;" />`
        } else if (widget === 'button') {
          report.push({ id: el.id, elType: type, widgetType: widget, status: 'converted' })
          const text = el.settings?.text ? escapeHtml(el.settings.text) : 'Click me'
          html += `<button id="${escapeHtml(el.id)}" style="padding: 10px 20px; background: blue; color: white; border: none; border-radius: 4px;">${text}</button>`
        } else if (widget === 'custom_html') {
          // Security block example: Do NOT render anything for blocked widgets
          report.push({ id: el.id, elType: type, widgetType: widget, status: 'blocked', reason: 'Custom HTML is blocked for security' })
        } else {
          // Unsupported widgets: Do NOT render placeholders.
          report.push({ id: el.id, elType: type, widgetType: widget, status: 'unsupported' })
        }
      }
    }

    if (Array.isArray(elements)) {
      elements.forEach(processElement)
    }

    return {
      originalJson: data,
      report,
      html,
      css
    }
  }

  static applyToCanvas(html: string, css: string) {
    editorAdapter.loadHTML(html, css)
  }
}
