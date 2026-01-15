import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { router } from './routes'
import { queryClient } from './lib/queryClient'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--b1))',
            color: 'hsl(var(--bc))',
            border: '1px solid hsl(var(--b3))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--su))',
              secondary: 'hsl(var(--suc))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--er))',
              secondary: 'hsl(var(--erc))',
            },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)
