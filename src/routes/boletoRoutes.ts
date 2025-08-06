import { Router } from 'express';
import { createParcelamento, getBoletosAgrupados, updateStatusBoleto } from '../controllers/boletoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.post('/parcelamento', createParcelamento);
router.get('/', getBoletosAgrupados); // Rota para a lista agrupada
router.patch('/:id/status', updateStatusBoleto); // Rota para marcar como pago

export default router;