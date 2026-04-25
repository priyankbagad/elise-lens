const axios = require('axios');

async function getCensus(city, state) {
  try {
    const stateFIPS = {
      AL: '01', AK: '02', AZ: '04', AR: '05',
      CA: '06', CO: '08', CT: '09', DE: '10',
      FL: '12', GA: '13', HI: '15', ID: '16',
      IL: '17', IN: '18', IA: '19', KS: '20',
      KY: '21', LA: '22', ME: '23', MD: '24',
      MA: '25', MI: '26', MN: '27', MS: '28',
      MO: '29', MT: '30', NE: '31', NV: '32',
      NH: '33', NJ: '34', NM: '35', NY: '36',
      NC: '37', ND: '38', OH: '39', OK: '40',
      OR: '41', PA: '42', RI: '44', SC: '45',
      SD: '46', TN: '47', TX: '48', UT: '49',
      VT: '50', VA: '51', WA: '53', WV: '54',
      WI: '55', WY: '56', DC: '11',
    };

    const fips = stateFIPS[state.toUpperCase()];
    if (!fips) return { renterPct: null, vacancyRate: null, population: null, medianIncome: null };

    // Single request: NAME + housing tenure + vacancy + population + income
    const housingUrl =
      `https://api.census.gov/data/2022/acs/acs5` +
      `?get=NAME,B25003_001E,B25003_003E,B25004_001E,B01003_001E,B19013_001E` +
      `&for=place:*&in=state:${fips}` +
      `&key=${process.env.CENSUS_API_KEY}`;

    const res = await axios.get(housingUrl, { timeout: 10000 });

    console.log('Census raw response type:', typeof res.data);
    console.log('Census raw response:', JSON.stringify(res.data)?.slice(0, 300));

    if (!res.data || !Array.isArray(res.data)) {
      console.error('Census: unexpected response format');
      return { renterPct: null, vacancyRate: null, population: null, medianIncome: null };
    }

    const rows = res.data.slice(1); // drop header row

    if (!Array.isArray(rows) || rows.length === 0) {
      return { renterPct: null, vacancyRate: null, population: null, medianIncome: null };
    }

    const cityLower = city.toLowerCase();
    const match =
      rows.find(row => (row[0] || '').toLowerCase().includes(cityLower)) ||
      rows[0];

    if (!match) return { renterPct: null, vacancyRate: null, population: null, medianIncome: null };

    const totalHousing  = parseInt(match[1]) || 0;
    const renterOccupied = parseInt(match[2]) || 0;
    const vacantUnits   = parseInt(match[3]) || 0;
    const population    = parseInt(match[4]) || null;
    const medianIncome  = parseInt(match[5]) || null;

    const renterPct =
      totalHousing > 0
        ? Math.round((renterOccupied / totalHousing) * 100)
        : null;

    const vacancyRate =
      totalHousing + vacantUnits > 0
        ? parseFloat(((vacantUnits / (totalHousing + vacantUnits)) * 100).toFixed(1))
        : null;

    console.log('Census match:', match[0], { renterPct, vacancyRate, population, medianIncome });

    return { renterPct, vacancyRate, population, medianIncome };
  } catch (err) {
    console.error('Census error:', err.message);
    return { renterPct: null, vacancyRate: null, population: null, medianIncome: null };
  }
}

module.exports = { getCensus };
