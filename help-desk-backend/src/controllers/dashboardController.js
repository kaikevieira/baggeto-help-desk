import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  summary: async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;
      const data = await dashboardService.summary(userId, userRole);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
};
