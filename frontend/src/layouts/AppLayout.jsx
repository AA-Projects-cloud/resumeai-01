import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { setAuthToken } from '../services/api'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout({ children }) {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthToken(getToken)
  }, [getToken])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
