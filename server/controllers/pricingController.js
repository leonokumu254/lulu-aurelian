import { db } from '../config/db.js';

/**
 * GET /api/pricing
 * Public endpoint to fetch live pricing for all suites (Entire vs 1 Bedroom).
 */
export const getPricing = async (req, res, next) => {
  try {
    const pricing = await db.pricing.getAll();
    return res.status(200).json({
      success: true,
      pricing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/pricing
 * Staff-protected endpoint to update suite pricing in the database.
 */
export const updatePricing = async (req, res, next) => {
  try {
    const { pricing } = req.body;
    if (!Array.isArray(pricing) || pricing.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pricing array provided.'
      });
    }

    const updated = await db.pricing.updateAll(pricing);

    console.log('[PRICING ENGINE]: Updated suite rates live in DB:', JSON.stringify(updated));

    return res.status(200).json({
      success: true,
      message: 'Suite pricing updated successfully and published live.',
      pricing: updated
    });
  } catch (error) {
    next(error);
  }
};
