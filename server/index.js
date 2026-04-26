const express = require('express');
const cors = require('cors');
require('dotenv').config();
const enrichRoute = require('./routes/enrich');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
}));
app.use(express.json());
app.use('/api', enrichRoute);

app.get('/health', (req, res) =>
  res.json({ status: 'ok' }));

app.get('/test-census', async (req, res) => {
  const axios = require('axios');
  try {
    const url =
      `https://api.census.gov/data/2022/acs/acs5` +
      `?get=NAME,B25003_001E,B25003_003E,B25004_001E,B01003_001E,B19013_001E` +
      `&for=place:*&in=state:48` +
      `&key=${process.env.CENSUS_API_KEY}`;
    console.log('Testing Census URL:', url);
    const response = await axios.get(url, { timeout: 15000 });
    console.log('Census test response type:', typeof response.data);
    console.log('Census test first row:', JSON.stringify(response.data?.[0]));
    console.log('Census test second row:', JSON.stringify(response.data?.[1]));
    res.json({
      type: typeof response.data,
      isArray: Array.isArray(response.data),
      firstRow: response.data?.[0],
      secondRow: response.data?.[1],
      totalRows: response.data?.length,
    });
  } catch (err) {
    console.error('Census test error:', err.message);
    res.json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Elise Lens server running on port ${PORT}`));
