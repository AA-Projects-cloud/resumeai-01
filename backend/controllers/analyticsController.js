const supabase = require('../config/supabase');

async function getAnalytics(req, res, next) {
  try {
    const userId = req.userId;

    // Fetch all resumes with sections
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select(`
        id, title, resume_type, strength_score, created_at,
        resume_sections ( section_type, data )
      `)
      .eq('clerk_user_id', userId);

    if (error) throw error;

    if (!resumes || resumes.length === 0) {
      return res.json({
        totalResumes: 0,
        averageStrength: 0,
        completionBySection: {},
        skillsDistribution: [],
        timelineData: [],
        resumeTypes: {},
      });
    }

    // Calculate average strength score
    const avgStrength = Math.round(
      resumes.reduce((acc, r) => acc + (r.strength_score || 0), 0) / resumes.length
    );

    // Gather all skills across resumes
    const skillCount = {};
    const sectionFilled = { personal: 0, education: 0, experience: 0, projects: 0, skills: 0, certifications: 0 };

    resumes.forEach(resume => {
      (resume.resume_sections || []).forEach(section => {
        const { section_type, data } = section;

        if (section_type === 'skills' && Array.isArray(data)) {
          data.forEach(skill => {
            const key = skill.trim().toLowerCase();
            skillCount[key] = (skillCount[key] || 0) + 1;
          });
        }

        if (sectionFilled[section_type] !== undefined) {
          const hasData = Array.isArray(data)
            ? data.length > 0
            : data && Object.values(data).some(v => v && String(v).trim());
          if (hasData) sectionFilled[section_type]++;
        }
      });
    });

    // Skills distribution (top 10)
    const skillsDistribution = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Timeline: resumes created per month
    const timelineMap = {};
    resumes.forEach(r => {
      const month = r.created_at.substring(0, 7); // YYYY-MM
      timelineMap[month] = (timelineMap[month] || 0) + 1;
    });
    const timelineData = Object.entries(timelineMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    // Resume types distribution
    const resumeTypes = {};
    resumes.forEach(r => {
      resumeTypes[r.resume_type] = (resumeTypes[r.resume_type] || 0) + 1;
    });

    // Completion % per section
    const completionBySection = {};
    Object.entries(sectionFilled).forEach(([k, v]) => {
      completionBySection[k] = resumes.length > 0 ? Math.round((v / resumes.length) * 100) : 0;
    });

    res.json({
      totalResumes: resumes.length,
      averageStrength: avgStrength,
      completionBySection,
      skillsDistribution,
      timelineData,
      resumeTypes,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
