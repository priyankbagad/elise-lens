const express = require('express');
const router = express.Router();
const { getDataUSA } = require('../services/datausa');
const { getWikipedia } = require('../services/wikipedia');
const { getFRED } = require('../services/fred');
const { getCensus } = require('../services/census');
const { getNews } = require('../services/newsapi');
const { scoreLead } = require('../services/scoring');
const { generateOutreach } = require('../services/claude');
const {
  upsertLead,
  getAllLeads,
  getLeadById,
  updatePipelineStage,
  cleanupDuplicates,
} = require('../services/database');

/* ── POST /api/enrich ──────────────────────────────────────────────────────── */

router.post('/enrich', async (req, res) => {
  const { name, email, company, address, city, state } = req.body;
  const userId = req.headers['x-user-id'] || null;

  if (!name || !city || !state) {
    return res.status(400).json({ error: 'name, city and state are required' });
  }

  try {
    console.log(`Enriching lead: ${name} @ ${company} in ${city}, ${state}`);

    const [datausa, wikipedia, fred, census, newsData] = await Promise.all([
      getDataUSA(city, state),
      getWikipedia(city, state),
      getFRED(state),
      getCensus(city, state),
      getNews(city, state),
    ]);

    const enriched = {
      ...datausa,
      ...wikipedia,
      ...fred,
      ...census,
      population: census.population ?? datausa.population,
      medianIncome: census.medianIncome ?? datausa.medianIncome,
      ...newsData,
    };

    const { score, tier, tierColor, breakdown } = scoreLead({
      renterPct: enriched.renterPct,
      population: enriched.population,
      medianIncome: enriched.medianIncome,
      vacancyRate: enriched.vacancyRate,
      unemploymentRate: enriched.unemploymentRate,
      company,
      news: enriched.news,
    });

    const outreach = await generateOutreach({
      name, company, city, state,
      renterPct: enriched.renterPct,
      medianIncome: enriched.medianIncome,
      vacancyRate: enriched.vacancyRate,
      population: enriched.population,
      unemploymentRate: enriched.unemploymentRate,
      cityDescription: enriched.cityDescription,
      news: enriched.news,
      score,
      tier,
    });

    const savedLead = await upsertLead({
      lead: { name, email, company, address, city, state },
      enrichment: enriched,
      scoring: { score, tier, tierColor, breakdown },
      outreach: {
        subject: outreach.subject,
        body: outreach.body,
        insights: outreach.insights,
        talkTrack: outreach.talkTrack,
        bestTimeToCall: outreach.bestTimeToCall,
      },
      userId,
    });

    const { _isUpdate, ...leadRecord } = savedLead;

    return res.json({
      lead: { ...leadRecord },
      isUpdate: !!_isUpdate,
      enrichment: {
        population: enriched.population,
        medianIncome: enriched.medianIncome,
        renterPct: enriched.renterPct,
        vacancyRate: enriched.vacancyRate,
        unemploymentRate: enriched.unemploymentRate,
        cityDescription: enriched.cityDescription,
        news: enriched.news,
      },
      scoring: { score, tier, tierColor, breakdown },
      outreach: {
        subject: outreach.subject,
        body: outreach.body,
        insights: outreach.insights,
        talkTrack: outreach.talkTrack,
        bestTimeToCall: outreach.bestTimeToCall,
      },
    });
  } catch (err) {
    console.error('Enrich route error:', err);
    return res.status(500).json({ error: 'Enrichment failed', details: err.message });
  }
});

/* ── DELETE /api/leads/cleanup ─────────────────────────────────────────────── */
/* Must be defined before /leads/:id to avoid "cleanup" being caught as an id  */

router.delete('/leads/cleanup', async (req, res) => {
  try {
    const deleted = await cleanupDuplicates();
    res.json({ deleted, message: `Cleaned up ${deleted} duplicates` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/leads ────────────────────────────────────────────────────────── */

router.get('/leads', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || null;
    const leads = await getAllLeads(userId);
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/leads/:id ────────────────────────────────────────────────────── */

router.get('/leads/:id', async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/leads/:id/stage ────────────────────────────────────────────── */

router.patch('/leads/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    const lead = await updatePipelineStage(req.params.id, stage);
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
