async function getDataUSA(city, state) {
  // Census now handles population + income reliably
  return { population: null, medianIncome: null };
}

module.exports = { getDataUSA };
