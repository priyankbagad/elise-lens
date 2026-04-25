const axios = require('axios');

async function getWikipedia(city, state) {
  try {
    const url =
      `https://en.wikipedia.org/api/rest_v1/page/summary/` +
      `${encodeURIComponent(city + ', ' + state)}`;

    const res = await axios.get(url, {
      timeout: 8000,
      headers: { 'User-Agent': 'EliseLens/1.0 (contact@eliselens.com)' },
    });

    return {
      cityDescription: res.data?.extract || null,
      thumbnail: res.data?.thumbnail?.source || null,
    };
  } catch (err) {
    console.error('Wikipedia error:', err.message);
    return { cityDescription: null };
  }
}

module.exports = { getWikipedia };
