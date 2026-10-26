import { getAnalyticsMetrics } from './controllers/analyticsController.js';

const req = {};
const res = {
  status: (code) => {
    return res;
  },
  json: (data) => {
    console.log('--- ANALYTICS OUTPUT ---');
    console.log(JSON.stringify(data, null, 2));
  }
};

await getAnalyticsMetrics(req, res, console.error);
process.exit(0);
