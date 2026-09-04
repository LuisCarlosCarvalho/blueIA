import { toast } from 'sonner'
import type { BlockConfig } from '../types'
import { Send } from 'lucide-react'

interface ContactProps {
  title?: string
  subtitle?: string
}

export function ContactBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as ContactProps

  return (
    <section className="px-6 @md:px-10 py-16 @md:py-20">
      <div className="max-w-lg mx-auto">
        <div className="reveal-fade-up reveal-d1 text-center mb-8">
          <h2 className="text-2xl @md:text-3xl font-bold tracking-tight mb-2">
            {props.title || 'Get in Touch'}
          </h2>
          {props.subtitle && (
            <p className="text-muted-foreground text-sm">{props.subtitle}</p>
          )}
        </div>

        <div className="reveal-fade-up reveal-d2 space-y-4">
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] text-muted-foreground mb-1.5 font-medium">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11.5px] text-muted-foreground mb-1.5 font-medium">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11.5px] text-muted-foreground mb-1.5 font-medium">Message</label>
            <textarea
              rows={4}
              placeholder="How can we help?"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary placeholder:text-muted-foreground resize-y transition-colors"
            />
          </div>
          <button
            onClick={() => toast("Message sent! We'll be in touch soon.")}
            className="w-full py-3 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary-dim transition-all hover:accent-glow-lg flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Send Message
          </button>
        </div>
      </div>
    </section>
  )
}
