const axios = require('axios');

async function getNews(city, state) {
  try {
    const query = encodeURIComponent(
      `${city} real estate property management rental market`
    );
    const url =
      `https://newsapi.org/v2/everything` +
      `?q=${query}` +
      `&sortBy=publishedAt` +
      `&pageSize=3` +
      `&language=en` +
      `&apiKey=${process.env.NEWS_API_KEY}`;

    const res = await axios.get(url, { timeout: 8000 });

    const articles =
      res.data?.articles?.slice(0, 3).map(a => ({
        title: a.title,
        source: a.source?.name,
        url: a.url,
        publishedAt: a.publishedAt?.split('T')[0],
      })) || [];

    return { news: articles };
  } catch (err) {
    console.error('NewsAPI error:', err.message);
    return { news: [] };
  }
}

module.exports = { getNews };
