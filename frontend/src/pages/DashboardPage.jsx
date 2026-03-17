import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Wand2, Download, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react'
import { useResume } from '../context/ResumeContext'
import { useQuery } from '@tanstack/react-query'
import { resumeApi } from '../services/api'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border flex items-center gap-4"
      style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{value}</p>
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</p>
      </div>
    </motion.div>
  )
}

const steps = [
  { icon: FileText, title: 'Add Your Details', desc: 'Fill in personal info, experience, projects, and skills', path: '/builder', color: '#3b82f6' },
  { icon: Wand2, title: 'Generate with AI', desc: 'Let Grok AI craft a perfectly worded resume', path: '/generate', color: '#8b5cf6' },
  { icon: Download, title: 'Export & Apply', desc: 'Download as PDF, DOCX, or TXT and apply', path: '/generate', color: '#10b981' },
]

export default function DashboardPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { getCompletion } = useResume()
  const completion = getCompletion()

  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.list().then(r => r.data),
    retry: false,
  })

  const totalResumes = resumesData?.resumes?.length ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(217 91% 15%), hsl(270 60% 15%))' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 60%)' }} />
        <h2 className="text-2xl font-bold text-white mb-1">
          Welcome back, {user?.firstName || 'Builder'}! 👋
        </h2>
        <p className="text-blue-200 text-sm mb-5">
          Your AI-powered resume builder is ready. Let's craft something impressive.
        </p>
        <button
          onClick={() => navigate('/builder')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          Start Building <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Saved Resumes" value={totalResumes} icon={FileText} color="#3b82f6" />
        <StatCard label="Profile Complete" value={`${completion.overall}%`} icon={TrendingUp} color="#8b5cf6" />
        <StatCard label="Skills Added" value={completion.skills > 0 ? '✓' : '0'} icon={CheckCircle} color="#10b981" />
        <StatCard label="AI Generates" value="∞" icon={Wand2} color="#f59e0b" />
      </div>

      {/* Steps guide */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(({ icon: Icon, title, desc, path, color }, i) => (
            <motion.button
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(path)}
              className="p-5 rounded-2xl border text-left w-full transition-colors"
              style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + '22' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + '22', color }}>
                  Step {i + 1}
                </span>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'hsl(var(--foreground))' }}>{title}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Profile completion */}
      <div className="p-6 rounded-2xl border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Profile Completion</h3>
        <div className="space-y-3">
          {Object.entries(completion).filter(([k]) => k !== 'overall').map(([key, pct]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'hsl(var(--muted-foreground))' }} className="capitalize">{key}</span>
                <span style={{ color: 'hsl(var(--foreground))' }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'hsl(var(--muted))' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
