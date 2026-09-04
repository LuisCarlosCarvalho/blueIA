import { toast } from 'sonner'
import type { BlockConfig } from '../types'
import { Mail } from 'lucide-react'

interface NewsletterProps {
  title?: string
  subtitle?: string
  buttonText?: string
  socialProof?: string
}

export function NewsletterBlock({ block }: { block: BlockConfig }) {
  const props = block.props as unknown as NewsletterProps

  return (
    <section className="px-6 @md:px-10 py-12 @md:py-16">
      <div className="max-w-xl mx-auto text-center">
        <div className="reveal-scale reveal-d1 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
          <Mail size={22} />
        </div>
        <h2 className="reveal-fade-up reveal-d2 text-xl @md:text-2xl font-bold tracking-tight mb-2">
          {props.title || 'Stay in the loop'}
        </h2>
        <p className="reveal-fade-up reveal-d3 text-muted-foreground text-sm mb-6">
          {props.subtitle || 'Get updates on new features and releases. No spam, ever.'}
        </p>

        <div className="reveal-fade-up reveal-d4 flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-secondary text-foreground text-[13px] outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
          />
          <button
            onClick={() => toast("You're subscribed!")}
            className="px-5 py-2.5 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary-dim transition-all shrink-0"
          >
            {props.buttonText || 'Subscribe'}
          </button>
        </div>

        {props.socialProof && (
          <p className="text-[11px] text-muted-foreground mt-3">{props.socialProof}</p>
        )}
        {!props.socialProof && (
          <p className="text-[11px] text-muted-foreground mt-3">Join 2,000+ developers and designers</p>
        )}
      </div>
    </section>
  )
}
