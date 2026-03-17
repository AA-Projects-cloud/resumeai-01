const supabase = require('../config/supabase');

// List all resumes for the authenticated user
async function listResumes(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        id, title, resume_type, tone, strength_score, created_at, updated_at,
        resume_sections ( section_type, data )
      `)
      .eq('clerk_user_id', req.userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ resumes: data });
  } catch (err) {
    next(err);
  }
}

// Get a single resume
async function getResume(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        id, title, resume_type, tone, generated_text, strength_score, created_at, updated_at,
        resume_sections ( id, section_type, data )
      `)
      .eq('id', id)
      .eq('clerk_user_id', req.userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Resume not found' });

    res.json({ resume: data });
  } catch (err) {
    next(err);
  }
}

// Create a new resume with all its section data
async function createResume(req, res, next) {
  try {
    const { title, resume_type, tone, sections } = req.body;

    // Ensure profile exists
    await supabase.from('profiles').upsert(
      { clerk_user_id: req.userId },
      { onConflict: 'clerk_user_id', ignoreDuplicates: true }
    );

    // Create the resume record
    const { data: resume, error: resumeErr } = await supabase
      .from('resumes')
      .insert({
        clerk_user_id: req.userId,
        title: title || 'My Resume',
        resume_type: resume_type || 'fresher',
        tone: tone || 'professional',
      })
      .select()
      .single();

    if (resumeErr) throw resumeErr;

    // Insert sections if provided
    if (sections && Object.keys(sections).length > 0) {
      const sectionRows = Object.entries(sections).map(([section_type, data]) => ({
        resume_id: resume.id,
        section_type,
        data,
      }));

      const { error: sectionsErr } = await supabase
        .from('resume_sections')
        .insert(sectionRows);

      if (sectionsErr) throw sectionsErr;
    }

    res.status(201).json({ resume, message: 'Resume created successfully' });
  } catch (err) {
    next(err);
  }
}

// Update resume and its sections
async function updateResume(req, res, next) {
  try {
    const { id } = req.params;
    const { title, resume_type, tone, generated_text, strength_score, sections } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', id)
      .eq('clerk_user_id', req.userId)
      .single();

    if (!existing) return res.status(404).json({ error: 'Resume not found or access denied' });

    // Update resume record
    const updatePayload = { updated_at: new Date().toISOString() };
    if (title !== undefined) updatePayload.title = title;
    if (resume_type !== undefined) updatePayload.resume_type = resume_type;
    if (tone !== undefined) updatePayload.tone = tone;
    if (generated_text !== undefined) updatePayload.generated_text = generated_text;
    if (strength_score !== undefined) updatePayload.strength_score = strength_score;

    const { data: resume, error: resumeErr } = await supabase
      .from('resumes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (resumeErr) throw resumeErr;

    // Upsert sections
    if (sections && Object.keys(sections).length > 0) {
      for (const [section_type, data] of Object.entries(sections)) {
        const { error: sErr } = await supabase
          .from('resume_sections')
          .upsert(
            { resume_id: id, section_type, data, updated_at: new Date().toISOString() },
            { onConflict: 'resume_id,section_type' }
          );
        if (sErr) throw sErr;
      }
    }

    res.json({ resume, message: 'Resume updated successfully' });
  } catch (err) {
    next(err);
  }
}

// Delete a resume
async function deleteResume(req, res, next) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('clerk_user_id', req.userId);

    if (error) throw error;
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listResumes, getResume, createResume, updateResume, deleteResume };
