import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResume } from '../context/ResumeContext'
import { resumeApi } from '../services/api'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2, User, GraduationCap, Briefcase, Code, Wrench, Award } from 'lucide-react'

const tabs = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'certifications', label: 'Certifications', icon: Award },
]

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:ring-2"
        style={{
          background: 'hsl(var(--input))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          '--tw-ring-color': 'hsl(var(--ring))',
        }}
      />
    </label>
  )
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
      <textarea
        {...props}
        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 resize-none"
        style={{
          background: 'hsl(var(--input))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }}
      />
    </label>
  )
}

function PersonalForm({ data, onChange }) {
  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'John Doe', half: true },
    { key: 'title', label: 'Job Title', placeholder: 'Frontend Developer', half: true },
    { key: 'email', label: 'Email', placeholder: 'john@example.com', half: true },
    { key: 'phone', label: 'Phone', placeholder: '+1 555 123 4567', half: true },
    { key: 'location', label: 'Location', placeholder: 'New York, USA', half: true },
    { key: 'links', label: 'LinkedIn / GitHub / Portfolio', placeholder: 'https://...', half: true },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <Input key={f.key} label={f.label} placeholder={f.placeholder}
            value={data[f.key] || ''} onChange={e => onChange({ ...data, [f.key]: e.target.value })} />
        ))}
      </div>
      <Textarea label="Professional Summary" rows={4}
        placeholder="2-3 impactful sentences about your profile and goals..."
        value={data.summary || ''} onChange={e => onChange({ ...data, summary: e.target.value })} />
    </div>
  )
}

function ListForm({ items, setItems, fields, addLabel }) {
  const [form, setForm] = useState({})
  const add = () => {
    if (!Object.values(form).some(v => v?.trim())) return toast.error('Fill at least one field.')
    setItems([...items, { ...form, id: Date.now() }])
    setForm({})
    toast.success('Added!')
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => f.type === 'textarea'
          ? <div key={f.key} className="col-span-2">
              <Textarea label={f.label} placeholder={f.placeholder} rows={3}
                value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          : <Input key={f.key} label={f.label} placeholder={f.placeholder}
              value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
        )}
      </div>
      <button onClick={add}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: 'hsl(var(--primary))' }}>
        <Plus size={14} /> {addLabel}
      </button>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={item.id || i} className="flex items-start justify-between p-3 rounded-lg border"
              style={{ background: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}>
              <div className="text-sm">
                <p className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                  {item[fields[0].key] || 'Entry'}
                </p>
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {item[fields[1]?.key] || ''}
                </p>
              </div>
              <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                <Trash2 size={14} style={{ color: 'hsl(var(--destructive))' }} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SkillsForm({ skills, setSkills }) {
  const [input, setInput] = useState(skills.join(', '))
  return (
    <div className="space-y-4">
      <Textarea
        label="Skills (comma separated)"
        placeholder="JavaScript, React, Node.js, Python, SQL, Docker..."
        rows={4}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button
        onClick={() => {
          const parsed = input.split(',').map(s => s.trim()).filter(Boolean)
          setSkills(parsed)
          toast.success(`${parsed.length} skills saved!`)
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: 'hsl(var(--primary))' }}>
        <Save size={14} /> Save Skills
      </button>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResumeBuilderPage() {
  const { sections, updateSection, activeResumeId } = useResume()
  const [activeTab, setActiveTab] = useState('personal')
  const [saving, setSaving] = useState(false)

  const personal = sections.personal
  const setPersonal = data => updateSection('personal', data)
  const education = sections.education || []
  const setEducation = d => updateSection('education', d)
  const experience = sections.experience || []
  const setExperience = d => updateSection('experience', d)
  const projects = sections.projects || []
  const setProjects = d => updateSection('projects', d)
  const skills = sections.skills || []
  const setSkills = d => updateSection('skills', d)
  const certs = sections.certifications || []
  const setCerts = d => updateSection('certifications', d)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        title: personal.name ? `${personal.name}'s Resume` : 'My Resume',
        sections,
      }
      if (activeResumeId) {
        await resumeApi.update(activeResumeId, payload)
      } else {
        await resumeApi.create(payload)
      }
      toast.success('Resume saved to cloud!')
    } catch (e) {
      toast.error('Could not save – check your API keys in .env')
    } finally {
      setSaving(false)
    }
  }

  const eduFields = [
    { key: 'degree', label: 'Degree', placeholder: 'B.Tech in Computer Science' },
    { key: 'institute', label: 'Institution', placeholder: 'MIT / BITS Pilani' },
    { key: 'year', label: 'Year', placeholder: '2025' },
    { key: 'score', label: 'CGPA / Score', placeholder: '8.5 CGPA' },
    { key: 'highlights', label: 'Highlights', placeholder: 'Scholarships, clubs, courses...', type: 'textarea' },
  ]
  const expFields = [
    { key: 'company', label: 'Company', placeholder: 'Google Inc.' },
    { key: 'role', label: 'Role', placeholder: 'Software Engineer Intern' },
    { key: 'duration', label: 'Duration', placeholder: 'Jun 2024 – Aug 2024' },
    { key: 'location', label: 'Location', placeholder: 'Remote / NYC' },
    { key: 'description', label: 'Key Contributions', placeholder: 'Built X, improved Y by Z%...', type: 'textarea' },
  ]
  const projFields = [
    { key: 'title', label: 'Project Title', placeholder: 'AI Resume Builder' },
    { key: 'tech', label: 'Tech Stack', placeholder: 'React, Node.js, Supabase' },
    { key: 'description', label: 'Description', placeholder: 'Problem solved, approach, impact...', type: 'textarea' },
    { key: 'links', label: 'Links', placeholder: 'github.com/... | live-demo.com' },
  ]
  const certFields = [
    { key: 'name', label: 'Certificate Name', placeholder: 'AWS Solutions Architect' },
    { key: 'org', label: 'Issued By', placeholder: 'Amazon Web Services' },
    { key: 'year', label: 'Year', placeholder: '2024' },
    { key: 'link', label: 'Credential URL', placeholder: 'https://...' },
  ]

  const panelProps = {
    personal: <PersonalForm data={personal} onChange={setPersonal} />,
    education: <ListForm items={education} setItems={setEducation} fields={eduFields} addLabel="Add Education" />,
    experience: <ListForm items={experience} setItems={setExperience} fields={expFields} addLabel="Add Experience" />,
    projects: <ListForm items={projects} setItems={setProjects} fields={projFields} addLabel="Add Project" />,
    skills: <SkillsForm skills={skills} setSkills={setSkills} />,
    certifications: <ListForm items={certs} setItems={setCerts} fields={certFields} addLabel="Add Certificate" />,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>Resume Builder</h2>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Fill in your details — saved to Supabase</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', opacity: saving ? 0.7 : 1 }}
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save to Cloud'}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center transition-all"
            style={{
              background: activeTab === id ? 'hsl(var(--card))' : 'transparent',
              color: activeTab === id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              boxShadow: activeTab === id ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <Icon size={13} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="p-6 rounded-2xl border"
          style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        >
          {panelProps[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
