import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ErrorBoundary } from './layout/ErrorBoundary'
import { AppLayout } from './layout/AppLayout'
import { Dashboard } from './routes/Dashboard'
import { Editor } from './routes/Editor'
import { Components } from './routes/Components'
import { Deploy } from './routes/Deploy'
import { Settings } from './routes/Settings'
import { NotFound } from './routes/NotFound'
import { Login } from './routes/Login'
import { useKeyboardShortcuts } from './lib/useKeyboardShortcuts'
import { useAuthStore } from './store/authStore'
import { Loader2 } from 'lucide-react'

function PrivateRoute() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function AppRoutes() {
  useKeyboardShortcuts()
  const { checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<Navigate to="/" replace />} />
          <Route path="editor" element={<Editor />} />
          <Route path="components" element={<Components />} />
          <Route path="deploy" element={<Deploy />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
