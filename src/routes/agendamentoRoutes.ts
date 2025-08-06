import { Router } from 'express';
import { createAgendamento, getAgendamentos, updateAgendamento, deleteAgendamento } from '../controllers/agendamentoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.post('/', createAgendamento);
router.get('/', getAgendamentos);
router.put('/:id', updateAgendamento);
router.delete('/:id', deleteAgendamento);

export default router;