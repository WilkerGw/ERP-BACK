// src/routes/authRoutes.ts

import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Rota para registrar um novo usuário
router.post('/register', register);

// Rota para fazer login
router.post('/login', login);

export default router;