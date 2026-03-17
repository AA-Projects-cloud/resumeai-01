import { useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/builder': 'Resume Builder',
  '/generate': 'AI Generate',
  '/analytics': 'Analytics',
  '/resumes': 'Saved Resumes',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className="flex items-center justify-between px-6 border-b shrink-0"
      style={{
        height: 'var(--topbar-height)',
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      <div>
        <h1 className="font-semibold text-base" style={{ color: 'hsl(var(--foreground))' }}>
          {pageTitles[pathname] || 'ResumeAI'}
        </h1>
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          AI-Powered Resume Builder Platform
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>

        {/* Clerk user button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9',
            },
          }}
        />
      </div>
    </header>
  )
}
