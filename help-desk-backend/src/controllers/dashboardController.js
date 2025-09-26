import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  summary: async (_req, res, next) => {
    try {
      const data = await dashboardService.summary();
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
};
