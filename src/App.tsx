import React from 'react'
import { ThemeProvider } from './theme/ThemeProvider'
import { ChatProvider } from './context/ChatContext'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChatProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Your app content will go here */}
          </div>
        </ChatProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
