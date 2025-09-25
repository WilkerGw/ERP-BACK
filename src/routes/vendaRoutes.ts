// Caminho: ERP-BACK-main/src/routes/vendaRoutes.ts

import express from 'express';
import { 
  createVenda, 
  getAllVendas, 
  updateVendaStatus,
  getVendaById,    // Importa a nova função
  updateVenda,     // Importa a nova função
  deleteVenda      // Importa a nova função
} from '../controllers/vendaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// --- Rotas existentes ---
router.post('/', authMiddleware, createVenda);
router.get('/', authMiddleware, getAllVendas);
router.patch('/:id/status', authMiddleware, updateVendaStatus);

// --- NOVAS ROTAS ---
// Rota para buscar uma venda específica por ID
router.get('/:id', authMiddleware, getVendaById);

// Rota para atualizar uma venda (PUT para substituição completa)
router.put('/:id', authMiddleware, updateVenda);

// Rota para deletar uma venda
router.delete('/:id', authMiddleware, deleteVenda);

export default router;