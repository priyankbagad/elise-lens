const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function upsertLead(leadData) {
  const email = leadData.lead.email;
  const userId = leadData.userId || null;

  if (email) {
    let query = supabase.from('leads').select('id').eq('email', email);
    if (userId) query = query.eq('user_id', userId);

    const { data: existing } = await query.single();

    if (existing) {
      const { data: updated, error } = await supabase
        .from('leads')
        .update({
          name: leadData.lead.name,
          company: leadData.lead.company,
          address: leadData.lead.address,
          city: leadData.lead.city,
          state: leadData.lead.state,
          score: leadData.scoring.score,
          tier: leadData.scoring.tier,
          tier_color: leadData.scoring.tierColor,
          enrichment: leadData.enrichment,
          outreach: leadData.outreach,
          scoring: leadData.scoring,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      return { ...updated, _isUpdate: true };
    }
  }

  return saveLead(leadData);
}

async function saveLead(leadData) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      name: leadData.lead.name,
      email: leadData.lead.email,
      company: leadData.lead.company,
      address: leadData.lead.address,
      city: leadData.lead.city,
      state: leadData.lead.state,
      score: leadData.scoring.score,
      tier: leadData.scoring.tier,
      tier_color: leadData.scoring.tierColor,
      enrichment: leadData.enrichment,
      outreach: leadData.outreach,
      scoring: leadData.scoring,
      pipeline_stage: 'new',
      user_id: leadData.userId || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
  return data;
}

async function getAllLeads(userId) {
  console.log('getAllLeads called with userId:', userId);

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  console.log('Supabase returned:', data?.length, 'leads');
  if (error) throw error;
  return data;
}

async function getLeadById(id) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function updatePipelineStage(id, stage) {
  const { data, error } = await supabase
    .from('leads')
    .update({ pipeline_stage: stage })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function cleanupDuplicates() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, email, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const seen = new Set();
  const toDelete = [];
  leads.forEach((lead) => {
    const key = lead.email || lead.id;
    if (seen.has(key)) {
      toDelete.push(lead.id);
    } else {
      seen.add(key);
    }
  });

  if (toDelete.length > 0) {
    const { error: delError } = await supabase
      .from('leads')
      .delete()
      .in('id', toDelete);
    if (delError) throw delError;
  }

  return toDelete.length;
}

module.exports = { upsertLead, saveLead, getAllLeads, getLeadById, updatePipelineStage, cleanupDuplicates };
