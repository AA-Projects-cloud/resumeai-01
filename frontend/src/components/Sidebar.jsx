import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Wand2, BarChart3, BookOpen, Sparkles
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/builder', icon: FileText, label: 'Resume Builder' },
  { to: '/generate', icon: Wand2, label: 'AI Generate' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/resumes', icon: BookOpen, label: 'Saved Resumes' },
]

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full border-r"
      style={{
        width: 'var(--sidebar-width)',
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          AI
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>ResumeAI</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Pro Builder</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: isActive ? 'hsl(var(--primary) / 0.15)' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderLeft: isActive ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer badge */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
          <Sparkles size={14} style={{ color: 'hsl(var(--primary))' }} />
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Powered by Grok AI
          </span>
        </div>
      </div>
    </aside>
  )
}
