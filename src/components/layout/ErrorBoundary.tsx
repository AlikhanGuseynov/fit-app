import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[FitFlow] Unhandled error', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/50 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Что-то пошло не так</h1>
          <p className="max-w-lg text-muted-foreground">
            Мы уже работаем над проблемой. Попробуйте обновить страницу или вернуться на главную.
          </p>
          <Button onClick={this.handleReset}>Обновить</Button>
        </div>
      )
    }

    return this.props.children
  }
}
