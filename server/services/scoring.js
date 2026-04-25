function scoreLead({
  renterPct, population, medianIncome,
  vacancyRate, unemploymentRate, company, news,
}) {
  let score = 0;
  const breakdown = [];

  // Renter percentage (25pts)
  if (renterPct >= 60) {
    score += 25;
    breakdown.push({ factor: 'Renter Market', points: 25, note: `${renterPct}% renters — very high demand` });
  } else if (renterPct >= 45) {
    score += 15;
    breakdown.push({ factor: 'Renter Market', points: 15, note: `${renterPct}% renters — moderate demand` });
  } else if (renterPct) {
    score += 5;
    breakdown.push({ factor: 'Renter Market', points: 5, note: `${renterPct}% renters — lower demand` });
  }

  // Population / market size (25pts)
  if (population >= 1000000) {
    score += 25;
    breakdown.push({ factor: 'Market Size', points: 25, note: `Pop. ${population.toLocaleString()} — major market` });
  } else if (population >= 500000) {
    score += 20;
    breakdown.push({ factor: 'Market Size', points: 20, note: `Pop. ${population.toLocaleString()} — large market` });
  } else if (population >= 100000) {
    score += 12;
    breakdown.push({ factor: 'Market Size', points: 12, note: `Pop. ${population.toLocaleString()} — mid market` });
  } else if (population) {
    score += 5;
    breakdown.push({ factor: 'Market Size', points: 5, note: `Pop. ${population.toLocaleString()} — small market` });
  }

  // Median income sweet spot (15pts)
  if (medianIncome >= 35000 && medianIncome <= 80000) {
    score += 15;
    breakdown.push({ factor: 'Income Range', points: 15, note: `$${medianIncome.toLocaleString()} — workforce housing sweet spot` });
  } else if (medianIncome > 80000) {
    score += 8;
    breakdown.push({ factor: 'Income Range', points: 8, note: `$${medianIncome.toLocaleString()} — above sweet spot` });
  }

  // Vacancy rate (20pts) — lower = hotter market
  if (vacancyRate !== null && vacancyRate <= 3) {
    score += 20;
    breakdown.push({ factor: 'Vacancy Rate', points: 20, note: `${vacancyRate}% vacancy — extremely tight market` });
  } else if (vacancyRate <= 5) {
    score += 15;
    breakdown.push({ factor: 'Vacancy Rate', points: 15, note: `${vacancyRate}% vacancy — tight market` });
  } else if (vacancyRate <= 7) {
    score += 8;
    breakdown.push({ factor: 'Vacancy Rate', points: 8, note: `${vacancyRate}% vacancy — average market` });
  }

  // Unemployment (5pts) — lower = healthier economy
  if (unemploymentRate !== null && unemploymentRate < 4) {
    score += 5;
    breakdown.push({ factor: 'Employment', points: 5, note: `${unemploymentRate}% unemployment — healthy economy` });
  }

  // Company name ICP signal (10pts)
  const icpKeywords = [
    'properties', 'realty', 'management', 'mgmt', 'equity',
    'capital', 'residential', 'housing', 'apartments', 'ventures',
    'real estate',
  ];
  const companyLower = company?.toLowerCase() || '';
  if (icpKeywords.some(k => companyLower.includes(k))) {
    score += 10;
    breakdown.push({ factor: 'Company ICP', points: 10, note: 'Company name signals property management' });
  }

  score = Math.min(score, 100);

  let tier, tierColor;
  if (score >= 75) {
    tier = 'Hot'; tierColor = '#ef4444';
  } else if (score >= 50) {
    tier = 'Warm'; tierColor = '#f59e0b';
  } else {
    tier = 'Cool'; tierColor = '#3b82f6';
  }

  return { score, tier, tierColor, breakdown };
}

module.exports = { scoreLead };
