// Caminho: ERP-BACK-main/src/routes/caixaRoutes.ts

import { Router } from 'express';
import { getCaixa, createTransacao } from '../controllers/caixaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de caixa exigem autenticação
router.use(authMiddleware);

// Rota para buscar o histórico e o saldo
router.get('/', getCaixa);

// Rota para criar uma nova transação
router.post('/', createTransacao);

export default router;