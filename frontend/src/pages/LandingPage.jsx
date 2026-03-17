import { motion } from 'framer-motion'
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Sparkles, Zap, Shield, Download, BarChart3, FileText } from 'lucide-react'

const features = [
  { icon: Sparkles, title: 'Grok AI Generation', desc: 'Real AI writes your resume with ATS-optimized content' },
  { icon: Zap, title: 'Instant Preview', desc: 'Live formatted resume as you type' },
  { icon: Shield, title: 'Secure Auth', desc: 'Clerk authentication keeps your data safe' },
  { icon: Download, title: 'Multi-Format Export', desc: 'Download as PDF, DOCX, or TXT instantly' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track resume strength and skills coverage' },
  { icon: FileText, title: 'Multiple Resume Types', desc: 'Fresher, Developer, Internship, Experienced' },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) navigate('/dashboard')
  }, [isSignedIn, navigate])

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            AI
          </div>
          <span className="font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>ResumeAI</span>
        </div>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted))' }}>
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              Get Started Free
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary) / 0.3)' }}>
            <Sparkles size={12} />
            Powered by Grok AI — Built for 2025
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            <span style={{ color: 'hsl(var(--foreground))' }}>Build Your </span>
            <span className="text-gradient">Dream Resume</span>
            <span style={{ color: 'hsl(var(--foreground))' }}> with AI</span>
          </h1>

          <p className="text-lg mb-10 max-w-2xl" style={{ color: 'hsl(var(--muted-foreground))' }}>
            From fresher to senior engineer — generate ATS-optimized resumes in seconds.
            Real AI, real results. Cloud-synced and always accessible.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <SignUpButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-semibold text-white text-base shadow-lg glow"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                Start for Free →
              </motion.button>
            </SignUpButton>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-semibold text-base border"
                style={{ color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
              >
                Sign In
              </motion.button>
            </SignInButton>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-12" style={{ color: 'hsl(var(--foreground))' }}>
          Everything you need to land your dream job
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border"
              style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'hsl(var(--primary) / 0.15)' }}>
                <Icon size={18} style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm" style={{ color: 'hsl(var(--foreground))' }}>{title}</h3>
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t text-xs" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
        © 2025 ResumeAI — Built with React, Node.js, Supabase & Grok AI
      </footer>
    </div>
  )
}
