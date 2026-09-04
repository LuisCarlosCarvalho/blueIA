import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-bold text-muted-foreground font-sans">404</div>
      <p className="text-muted-foreground text-sm">This page doesn't exist.</p>
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted border border-border text-muted-foreground text-sm hover:bg-muted transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
    </div>
  )
}
