import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { resumeApi } from '../services/api'
import { useResume } from '../context/ResumeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit3, FileText, Clock, Zap } from 'lucide-react'

function ResumeCard({ resume, onEdit, onDelete }) {
  const sections = resume.resume_sections || []
  const personal = sections.find(s => s.section_type === 'personal')?.data || {}
  const skillsSection = sections.find(s => s.section_type === 'skills')?.data || []
  const skillCount = Array.isArray(skillsSection) ? skillsSection.length : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl border flex flex-col gap-3"
      style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            {(personal.name || resume.title || 'R')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {resume.title || 'Untitled Resume'}
            </p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {personal.title || resume.resume_type}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(resume)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'hsl(var(--muted))' }}>
            <Edit3 size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
          <button onClick={() => onDelete(resume.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'hsl(var(--destructive) / 0.1)' }}>
            <Trash2 size={12} style={{ color: 'hsl(var(--destructive))' }} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
          style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
          {resume.resume_type || 'fresher'}
        </span>
        {resume.strength_score > 0 && (
          <span className="flex items-center gap-1 text-xs"
            style={{ color: resume.strength_score >= 70 ? '#10b981' : '#f59e0b' }}>
            <Zap size={10} /> {resume.strength_score}% strength
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
        <span className="flex items-center gap-1"><FileText size={10} /> {sections.length} sections</span>
        {skillCount > 0 && <span>{skillCount} skills</span>}
        <span className="flex items-center gap-1 ml-auto">
          <Clock size={10} /> {new Date(resume.updated_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  )
}

export default function SavedResumesPage() {
  const { loadResume, resetResume } = useResume()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeApi.list().then(r => r.data),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => resumeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      toast.success('Resume deleted')
    },
    onError: () => toast.error('Could not delete — check backend connection'),
  })

  const handleEdit = (resume) => {
    loadResume(resume)
    navigate('/builder')
    toast.success(`Loaded "${resume.title}"`)
  }

  const handleNew = () => {
    resetResume()
    navigate('/builder')
  }

  const resumes = data?.resumes || []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>Saved Resumes</h2>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved to cloud
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
          <Plus size={15} /> New Resume
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : resumes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <FileText size={48} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3 }} />
          <h3 className="mt-4 text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>No resumes yet</h3>
          <p className="text-sm mt-1 mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Build your first AI-powered resume!
          </p>
          <button onClick={handleNew}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            Create Your First Resume
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {resumes.map(resume => (
              <ResumeCard key={resume.id} resume={resume}
                onEdit={handleEdit}
                onDelete={(id) => {
                  if (window.confirm('Delete this resume?')) deleteMutation.mutate(id)
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
