import { createContext, useContext, useState, useCallback } from 'react'

const ResumeContext = createContext()

const defaultSections = {
  personal: { name: '', title: '', email: '', phone: '', location: '', links: '', summary: '' },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
}

export function ResumeProvider({ children }) {
  const [activeResumeId, setActiveResumeId] = useState(null)
  const [sections, setSections] = useState(defaultSections)
  const [generatedText, setGeneratedText] = useState('')
  const [resumeType, setResumeType] = useState('fresher')
  const [tone, setTone] = useState('professional')
  const [isGenerating, setIsGenerating] = useState(false)

  const updateSection = useCallback((sectionName, data) => {
    setSections(prev => ({ ...prev, [sectionName]: data }))
  }, [])

  const loadResume = useCallback((resume) => {
    setActiveResumeId(resume.id)
    setResumeType(resume.resume_type || 'fresher')
    setTone(resume.tone || 'professional')
    setGeneratedText(resume.generated_text || '')

    const newSections = { ...defaultSections }
    if (resume.resume_sections) {
      resume.resume_sections.forEach(({ section_type, data }) => {
        newSections[section_type] = data
      })
    }
    setSections(newSections)
  }, [])

  const resetResume = useCallback(() => {
    setActiveResumeId(null)
    setSections(defaultSections)
    setGeneratedText('')
    setResumeType('fresher')
    setTone('professional')
  }, [])

  const getCompletion = useCallback(() => {
    const { personal, education, experience, projects, skills, certifications } = sections
    const personalFields = Object.values(personal || {})
    const personalFilled = personalFields.filter(v => String(v || '').trim()).length
    const personalPct = Math.round((personalFilled / Math.max(personalFields.length, 1)) * 100)

    return {
      personal: personalPct,
      education: education?.length ? 100 : 0,
      experience: experience?.length ? 100 : 0,
      projects: projects?.length ? 100 : 0,
      skills: skills?.length ? 100 : 0,
      certifications: certifications?.length ? 100 : 0,
      overall: Math.round(
        (personalPct +
          (education?.length ? 100 : 0) +
          (experience?.length ? 100 : 0) +
          (projects?.length ? 100 : 0) +
          (skills?.length ? 100 : 0) +
          (certifications?.length ? 100 : 0)) / 6
      ),
    }
  }, [sections])

  return (
    <ResumeContext.Provider value={{
      activeResumeId, setActiveResumeId,
      sections, updateSection,
      generatedText, setGeneratedText,
      resumeType, setResumeType,
      tone, setTone,
      isGenerating, setIsGenerating,
      loadResume, resetResume, getCompletion,
    }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  return useContext(ResumeContext)
}
