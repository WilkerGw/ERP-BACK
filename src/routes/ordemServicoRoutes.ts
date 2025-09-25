// Caminho: ERP-BACK-main/src/routes/ordemServicoRoutes.ts

import { Router } from 'express';
import {
  getAllOrdensServico,
  getOrdemServicoById,
  updateOrdemServicoStatus
} from '../controllers/ordemServicoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas aqui exigem autenticação
router.use(authMiddleware);

router.get('/', getAllOrdensServico);
router.get('/:id', getOrdemServicoById);
router.patch('/:id/status', updateOrdemServicoStatus);

export default router;