import { Router } from 'express';
import { createCliente, getClientes, getClienteById, updateCliente, deleteCliente } from '../controllers/clienteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createCliente);
router.get('/', getClientes);
router.get('/:id', getClienteById);
router.put('/:id', updateCliente);

// --- NOVA ROTA AQUI ---
router.delete('/:id', deleteCliente); // Rota para deletar: DELETE /api/clientes/123

export default router;