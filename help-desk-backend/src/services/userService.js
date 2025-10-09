import { userRepo } from '../repositories/userRepo.js';

export const userService = {
  list: (q) => userRepo.list(q),

  findByUsername: (username) => userRepo.findByUsername(username),

  create: (data) => userRepo.create(data),

  update: (id, data) => userRepo.update(id, data),

  updateTheme: (id, theme) => userRepo.updateTheme(id, theme),
};
