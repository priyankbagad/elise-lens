const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateOutreach({
  name, company, city, state,
  renterPct, medianIncome, vacancyRate,
  population, unemploymentRate,
  cityDescription, news, score, tier,
}) {
  try {
    const newsText =
      news?.length > 0
        ? news.map(n => `- ${n.title} (${n.source})`).join('\n')
        : 'No recent news available';

    const marketLines = [
      renterPct        ? `Renter percentage: ${renterPct}%`                          : null,
      medianIncome     ? `Median income: $${medianIncome.toLocaleString()}`           : null,
      vacancyRate      ? `Vacancy rate: ${vacancyRate}%`                              : null,
      population       ? `Population: ${population.toLocaleString()}`                 : null,
      unemploymentRate ? `Unemployment: ${unemploymentRate}%`                         : null,
      cityDescription  ? `City context: ${cityDescription}`                           : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are an SDR at EliseAI — an AI platform that automates leasing, maintenance requests, and resident communications for multifamily property managers. EliseAI handles everything from tour scheduling to lease signing to maintenance tickets.

LEAD INFORMATION:
Name: ${name}
Company: ${company}
Location: ${city}, ${state}
Lead Score: ${score}/100 (${tier})
${marketLines ? `\nMARKET INTELLIGENCE:\n${marketLines}` : ''}
RECENT LOCAL NEWS:
${newsText}

Generate a JSON response with exactly these fields (no markdown, no backticks, pure JSON only):
{
  "subject": "compelling email subject line",
  "body": "3 paragraph personalized cold email",
  "insights": [
    "insight 1 about this market",
    "insight 2 about this lead",
    "insight 3 about timing/opportunity"
  ],
  "talkTrack": [
    "conversation starter 1",
    "conversation starter 2",
    "conversation starter 3"
  ],
  "bestTimeToCall": "e.g. Tuesday-Thursday 10am-12pm CST"
}

EMAIL RULES:
- Address by first name only
- Open with ONE specific data point from the market intelligence above
- Paragraph 2: connect that insight to a pain point EliseAI solves (high inquiry volume, manual leasing workflows, maintenance bottlenecks)
- Paragraph 3: low-friction CTA (15 min call, not a demo request)
- Tone: confident and consultative, NOT salesy
- NO buzzwords: no synergy, leverage, circle back, touch base, value-add
- Max 150 words total for the email body
- Make it feel like a human wrote it after researching their market`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Claude error:', err.message);
    return {
      subject: 'Quick question about your leasing workflow',
      body: `Hi ${name.split(' ')[0]},\n\nI noticed ${company} operates in ${city} — a market showing strong rental demand. EliseAI helps property managers automate their entire resident communication workflow, from first inquiry to signed lease.\n\nWould you be open to a 15-minute call this week?`,
      insights: [
        'Strong rental market signals high inquiry volume',
        'Property managers in this market need automation',
        'Good timing for outreach given market conditions',
      ],
      talkTrack: [
        `How are you currently handling inbound leasing inquiries at ${company}?`,
        'What does your current follow-up process look like after a tour?',
        'How much time does your team spend on maintenance coordination weekly?',
      ],
      bestTimeToCall: 'Tuesday-Thursday 10am-12pm local time',
    };
  }
}

module.exports = { generateOutreach };
