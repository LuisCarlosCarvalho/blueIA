import { useState } from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import type { BlockConfig } from '../types'
import { InlineText } from '@/editor/InlineText'
import { useConfigStore } from '@/store/configStore'

interface ContactProps {
  title?: string
  subtitle?: string
  buttonText?: string
  bgImage?: string
}

export function AgencyContactBlock({ block }: { block: BlockConfig }) {
  const updateBlockProps = useConfigStore((s) => s.updateBlockProps)
  const props = (block.props || {}) as unknown as ContactProps

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    phone?: string
    message?: string
  }>({})

  function validate() {
    const errs: typeof errors = {}
    if (!formData.name.trim()) errs.name = 'A name is required.'
    if (!formData.email.trim()) {
      errs.email = 'An email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Email is not valid.'
    }
    if (!formData.phone.trim()) errs.phone = 'A phone number is required.'
    if (!formData.message.trim()) errs.message = 'A message is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Por favor, preencha os campos obrigatórios.')
      return
    }

    toast.info('Validação local concluída. Envio ainda não configurado (serviço SB Forms externo desativado por segurança).')
  }

  return (
    <section
      id="contact"
      className="py-24 px-6 sm:px-10 bg-[#212529] text-white relative font-sans"
      style={{
        backgroundImage: `url(${props.bgImage || '/assets/templates/agency/img/map-image.png'})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            <InlineText
              value={props.title || 'CONTACT US'}
              as="span"
              onChange={(val) => updateBlockProps(block.id, { title: val })}
            />
          </h2>
          <p className="text-base sm:text-lg text-slate-400 italic max-w-xl mx-auto font-serif">
            <InlineText
              value={props.subtitle || 'Lorem ipsum dolor sit amet consectetur.'}
              as="span"
              onChange={(val) => updateBlockProps(block.id, { subtitle: val })}
            />
          </p>
        </div>

        {/* Disclaimer Card: Envio ainda não configurado */}
        <div className="p-4 rounded-lg border border-[#ffc800]/40 bg-[#212529]/90 backdrop-blur-sm text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-[#ffc800] shrink-0" />
            <span>
              <strong>Formulário Nativo Seguro:</strong> Validação local ativa. O serviço externo SB Forms foi substituído por segurança e conformidade Blue Bolt.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#ffc800]/20 text-[#ffc800] font-mono text-[11px] font-bold uppercase tracking-wide shrink-0">
            Envio ainda não configurado
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left Column: Inputs */}
            <div className="space-y-5 flex flex-col justify-between">
              <div>
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'error-name' : undefined}
                  className={`w-full p-4 rounded-md bg-white text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#ffc800] ${
                    errors.name ? 'border-2 border-red-500' : 'border border-slate-300'
                  }`}
                />
                {errors.name && (
                  <p id="error-name" className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: undefined })
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                  className={`w-full p-4 rounded-md bg-white text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#ffc800] ${
                    errors.email ? 'border-2 border-red-500' : 'border border-slate-300'
                  }`}
                />
                {errors.email && (
                  <p id="error-email" className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Your Phone *"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value })
                    if (errors.phone) setErrors({ ...errors, phone: undefined })
                  }}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'error-phone' : undefined}
                  className={`w-full p-4 rounded-md bg-white text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#ffc800] ${
                    errors.phone ? 'border-2 border-red-500' : 'border border-slate-300'
                  }`}
                />
                {errors.phone && (
                  <p id="error-phone" className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Textarea */}
            <div className="flex flex-col">
              <textarea
                placeholder="Your Message *"
                rows={7}
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value })
                  if (errors.message) setErrors({ ...errors, message: undefined })
                }}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'error-message' : undefined}
                className={`w-full h-full min-h-[160px] p-4 rounded-md bg-white text-slate-900 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#ffc800] ${
                  errors.message ? 'border-2 border-red-500' : 'border border-slate-300'
                }`}
              />
              {errors.message && (
                <p id="error-message" className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-6">
            <button
              type="submit"
              className="px-10 py-5 rounded-md bg-[#ffc800] hover:bg-[#d9aa00] text-white font-extrabold text-base uppercase tracking-wider transition-all shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {props.buttonText || 'SEND MESSAGE'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
