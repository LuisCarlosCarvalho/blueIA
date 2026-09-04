import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { account } from '@/lib/appwrite'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { user, isLoading, checkSession } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (!isLoading && user) {
    return <Navigate to="/" replace />
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await account.createEmailPasswordSession(email, password)
      await checkSession()
      navigate('/')
    } catch (err: any) {
      setError('Credenciais inválidas. Por favor verifique o seu e-mail e palavra-passe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-start px-6 md:pl-16 lg:pl-32">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/poster.jpg"
        className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
      >
        <source src="/assets/login/blueiavd.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 w-full h-full object-cover hidden motion-reduce:block bg-[url('/assets/poster.jpg')] bg-cover bg-center" />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-background/85" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[400px] p-8 glass-card bg-background/95 border border-border rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Blue IA</h1>
          <p className="text-sm text-muted-foreground mt-1">Aceda ao seu estúdio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-foreground">E-mail profissional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none transition-colors"
              placeholder="nome@empresa.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-foreground">Palavra-passe</label>
              <button
                type="button"
                disabled
                className="text-[12px] text-muted-foreground/50 cursor-not-allowed"
                title="Funcionalidade em desenvolvimento"
              >
                Esqueceu-se da palavra-passe?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[13px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary text-black font-medium py-2.5 rounded-lg hover:bg-primary-dim transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Entrar no estúdio'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-muted-foreground">
            Acesso restrito à equipa Blue IA
          </p>
        </div>
      </div>
    </div>
  )
}
