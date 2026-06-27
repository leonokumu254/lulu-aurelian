export const getSuitePrice = (suiteId) => {
  try {
    const saved = localStorage.getItem('lulu_pricing');
    if (saved) {
      const suites = JSON.parse(saved);
      const suite = suites.find(s => s.id === suiteId);
      if (suite && suite.basePrice) {
        return parseInt(suite.basePrice, 10);
      }
    }
  } catch (e) {
    console.error('Error reading pricing from localStorage', e);
  }
  return suiteId === 'skyview' ? 5500 : 5000;
};
