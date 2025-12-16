import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { useAuth } from './hooks/useAuth'

function App() {
  useAuth()

  return <RouterProvider router={router} />
}

export default App
