async function generateOutreach({
  name, company, city,
}) {
  const firstName = name.split(' ')[0];
  return {
    subject: 'Quick question about your leasing workflow',
    body: `Hi ${firstName},\n\nI noticed ${company} operates in ${city} — a market showing strong rental demand. EliseAI helps property managers automate their entire resident communication workflow, from first inquiry to signed lease.\n\nWould you be open to a 15-minute call this week?`,
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

module.exports = { generateOutreach };
