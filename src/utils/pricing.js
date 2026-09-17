export const DEFAULT_SUITES_PRICING = [
  { id: 'skyview', name: 'Skyview Hideaway', entirePrice: 5500, oneBedroomPrice: 4000, basePrice: 5500 },
  { id: 'cocoa', name: 'Cocoa Retreat', entirePrice: 5000, oneBedroomPrice: 4000, basePrice: 5000 },
  { id: 'neema', name: 'Neema Haven', entirePrice: 5000, oneBedroomPrice: 4000, basePrice: 5000 }
];

/**
 * Get rate per night for a given suite and booking type.
 * @param {string} suiteId - 'skyview', 'cocoa', or 'neema'
 * @param {string} bookingType - 'entire' (default) or 'one_bedroom'
 * @returns {number} Nightly rate in KES
 */
export const getSuitePrice = (suiteId, bookingType = 'entire') => {
  const isOneBed = bookingType === 'one_bedroom';
  try {
    const saved = localStorage.getItem('lulu_pricing');
    if (saved) {
      const suites = JSON.parse(saved);
      const suite = suites.find(s => s.id === suiteId);
      if (suite) {
        if (isOneBed) {
          const val = suite.oneBedroomPrice ?? suite.one_bedroom_price;
          if (val && !isNaN(val)) return parseInt(val, 10);
        } else {
          const val = suite.entirePrice ?? suite.entire_price ?? suite.basePrice;
          if (val && !isNaN(val)) return parseInt(val, 10);
        }
      }
    }
  } catch (e) {
    console.error('Error reading pricing from cache', e);
  }
  
  // High-reliability defaults
  if (isOneBed) return 4000;
  if (suiteId === 'skyview') return 5500;
  if (suiteId === 'cocoa') return 5000;
  if (suiteId === 'neema') return 5000;
  return 5000;
};

/**
 * Fetch live dynamic pricing from backend database and update local cache.
 */
export const fetchLivePricing = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/pricing`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.pricing)) {
        const normalized = data.pricing.map(p => ({
          id: p.id,
          name: p.name,
          entirePrice: parseFloat(p.entirePrice || p.entire_price || 5000),
          oneBedroomPrice: parseFloat(p.oneBedroomPrice || p.one_bedroom_price || 4000),
          basePrice: parseFloat(p.entirePrice || p.entire_price || 5000)
        }));
        localStorage.setItem('lulu_pricing', JSON.stringify(normalized));
        window.dispatchEvent(new Event('pricingUpdated'));
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[PRICING]: Live sync failed, falling back to cache/defaults:', err.message);
  }
  return null;
};

// Initial background sync on load in browser environment
if (typeof window !== 'undefined') {
  fetchLivePricing().catch(() => {});
}
