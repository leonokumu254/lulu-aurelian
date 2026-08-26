export const DEFAULT_SUITES_PRICING = [
  { id: 'skyview', name: 'Skyview Hideaway', basePrice: 5500 },
  { id: 'cocoa', name: 'Cocoa Retreat', basePrice: 5000 },
  { id: 'neema', name: 'Neema Haven', basePrice: 4500 }
];

export const getSuitePrice = (suiteId) => {
  try {
    const saved = localStorage.getItem('lulu_pricing');
    if (saved) {
      const suites = JSON.parse(saved);
      const suite = suites.find(s => s.id === suiteId);
      if (suite && suite.basePrice && !isNaN(suite.basePrice)) {
        return parseInt(suite.basePrice, 10);
      }
    }
  } catch (e) {
    console.error('Error reading pricing from localStorage', e);
  }
  
  if (suiteId === 'skyview') return 5500;
  if (suiteId === 'cocoa') return 5000;
  if (suiteId === 'neema') return 4500;
  return 5000;
};
