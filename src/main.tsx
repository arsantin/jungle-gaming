import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.tsx'

async function prepareApp() {
  // Enable MSW in development or whenever VITE_ENABLE_MSW is true (or by default if no external backend is configured)
  const isMockEnabled =
    import.meta.env.DEV ||
    import.meta.env.MODE === 'development' ||
    import.meta.env.VITE_ENABLE_MSW !== 'false'

  if (isMockEnabled) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
})
