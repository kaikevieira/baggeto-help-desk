import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userService } from '../services/userService.js';

const roleEnum = z.enum(['USER', 'ADMIN']);

export const userSchemas = {
  list: z.object({
    query: z.object({
      q: z.string().optional(),
    }),
  }),

  create: z.object({
    body: z.object({
      username: z.string().min(3, 'Usuário deve ter ao menos 3 caracteres'),
      password: z.string().min(4, 'Senha deve ter ao menos 4 caracteres'),
      role: roleEnum.optional().default('USER'),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string().min(1),
    }),
    body: z.object({
      username: z.string().min(3).optional(),
      password: z.string().min(4).optional(), // opcional no edit
      role: roleEnum.optional(),
    }),
  }),
};

export const userController = {
  list: async (req, res, next) => {
    try {
      const users = await userService.list(req.query.q);
      res.json(users);
    } catch (e) {
      next(e);
    }
  },

  create: async (req, res, next) => {
    try {
      const exists = await userService.findByUsername(req.body.username);
      if (exists) {
        return res.status(409).json({ message: 'Usuário já existe' });
      }
      const passwordHash = await bcrypt.hash(req.body.password, 10);
      const user = await userService.create({
        username: req.body.username,
        passwordHash,
        role: req.body.role ?? 'USER',
      });
      res.status(201).json(user); // sem hash
    } catch (e) {
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      // se mudou username, garante unicidade
      if (req.body.username) {
        const other = await userService.findByUsername(req.body.username);
        if (other && other.id !== id) {
          return res.status(409).json({ message: 'Nome de usuário já em uso' });
        }
      }

      const data = {};
      if (req.body.username !== undefined) data.username = req.body.username;
      if (req.body.role !== undefined) data.role = req.body.role;
      if (req.body.password) {
        data.passwordHash = await bcrypt.hash(req.body.password, 10);
      }

      const user = await userService.update(id, data);
      res.json(user);
    } catch (e) {
      next(e);
    }
  },
};
