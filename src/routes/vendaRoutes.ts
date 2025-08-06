import { Router } from 'express';
import { createVenda, getVendas } from '../controllers/vendaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.post('/', createVenda);
router.get('/', getVendas);

export default router;