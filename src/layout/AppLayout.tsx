import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Toaster } from 'sonner'
import { ShortcutsModal } from '@/editor/ShortcutsModal'

export function AppLayout() {
  const location = useLocation()
  const isEditor = location.pathname === '/editor'

  return (
    <div className={isEditor ? "h-screen w-screen flex flex-col overflow-hidden" : "min-h-screen w-full flex flex-col bg-background"}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      {/* TopNav só é exibida fora do editor.
          No editor, EditorTopBar (dentro de BoltTinkAiLayout/EditorLayout)
          substitui-a como barra superior unificada de 100% da largura. */}
      {!isEditor && <TopNav />}
      <main id="main-content" className={isEditor ? "flex-1 overflow-hidden" : "flex-1 w-full"} role="main">
        <div key={location.pathname} className={isEditor ? "h-full animate-fade-in-up" : "w-full animate-fade-in-up"}>
          <Outlet />
        </div>
      </main>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-bg-3)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-0)',
            fontSize: '13px',
          },
        }}
      />
      <ShortcutsModal />
    </div>
  )
}
