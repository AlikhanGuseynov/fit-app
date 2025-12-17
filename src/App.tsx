import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { router } from './app/router'
import { useAuth } from './hooks/useAuth'

const queryClient = new QueryClient()

function App() {
  useAuth()

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
