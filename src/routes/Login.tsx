import { useState, useRef, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { account } from '@/lib/appwrite'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Loader2, Volume2, VolumeX } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { user, isLoading, checkSession } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Set volume to 50% (0.5) and attempt to play audio unmuted
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5
      videoRef.current.muted = false
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true
          setIsMuted(true)
          videoRef.current.play().catch(() => {})
        }
      })
    }
  }, [])

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5
      const nextMuted = !videoRef.current.muted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
      if (!nextMuted) {
        videoRef.current.play().catch(() => {})
      }
    }
  }

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
        ref={videoRef}
        autoPlay
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

      {/* Sound Toggle Button */}
      <button
        type="button"
        onClick={toggleSound}
        className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-secondary text-[12px] font-medium transition-all shadow-lg"
        title={isMuted ? 'Ativar áudio do vídeo' : 'Silenciar áudio do vídeo'}
      >
        {isMuted ? (
          <VolumeX size={16} className="text-muted-foreground" />
        ) : (
          <Volume2 size={16} className="text-primary animate-pulse" />
        )}
        <span>{isMuted ? 'Ativar áudio' : 'Áudio ativo'}</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[400px] p-8 glass-card bg-background/95 border border-border rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="text-center mb-6">
          <img
            src="/assets/brand/logo.png"
            alt="Blue IA Logo"
            className="h-20 w-auto object-contain mx-auto mb-2 select-none filter drop-shadow-sm"
          />
          <p className="text-sm text-muted-foreground">Aceda ao seu estúdio</p>
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
