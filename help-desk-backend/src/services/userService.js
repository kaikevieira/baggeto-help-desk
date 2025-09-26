import { userRepo } from '../repositories/userRepo.js';

export const userService = {
  list: (q) => userRepo.list(q)
};
