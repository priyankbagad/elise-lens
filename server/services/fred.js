const axios = require('axios');


async function getFRED(state) {
  try {
    const seriesId = state.toUpperCase() + 'UR';
    const url =
      `https://api.stlouisfed.org/fred/series/observations` +
      `?series_id=${seriesId}` +
      `&api_key=f169e7d6fa7e6138c37d4e3e24b8d4a3` +
      `&sort_order=desc&limit=1&file_type=json`;

    const res = await axios.get(url, { timeout: 8000 });
    const obs = res.data?.observations?.[0];
    return {
      unemploymentRate: obs?.value ? parseFloat(obs.value) : null,
    };
  } catch (err) {
    console.error('FRED error:', err.message);
    return { unemploymentRate: null };
  }
}

module.exports = { getFRED };
