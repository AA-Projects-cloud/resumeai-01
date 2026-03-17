import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { ResumeProvider } from './context/ResumeContext'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import GeneratorPage from './pages/GeneratorPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SavedResumesPage from './pages/SavedResumesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
})

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!isSignedIn) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ResumeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/builder" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ResumeBuilderPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/generate" element={
                <ProtectedRoute>
                  <AppLayout>
                    <GeneratorPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/resumes" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SavedResumesPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(222 47% 9%)',
                color: 'hsl(213 31% 91%)',
                border: '1px solid hsl(215 20% 18%)',
              },
            }}
          />
        </ResumeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
