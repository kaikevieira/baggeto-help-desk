import { userService } from '../services/userService.js';

export const userController = {
  list: async (req, res, next) => {
    try {
      const users = await userService.list(req.query.q);
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
};
