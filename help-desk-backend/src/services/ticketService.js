import { ticketRepo } from '../repositories/ticketRepo.js';
import { commentRepo } from '../repositories/commentRepo.js';

export const ticketService = {
  create: (data) => ticketRepo.create(data),
  get: (id) => ticketRepo.findById(id),
  update: (id, data) => ticketRepo.update(id, data),
  remove: (id) => ticketRepo.remove(id),
  list: (params) => ticketRepo.list(params),
  comment: (ticketId, authorId, body) =>
    commentRepo.add({ ticketId, authorId, body }),
  comments: (ticketId) => commentRepo.listByTicket(ticketId)
};
