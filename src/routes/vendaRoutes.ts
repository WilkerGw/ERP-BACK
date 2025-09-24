// Caminho: ERP-BACK-main/src/routes/vendaRoutes.ts
import express from 'express';
import { createVenda, getAllVendas, updateVendaStatus } from '../controllers/vendaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Rota para criar uma nova venda
router.post('/', authMiddleware, createVenda);

// Rota para buscar todas as vendas
router.get('/', authMiddleware, getAllVendas);

// Rota para atualizar o status de uma venda (ex: para "Concluído")
router.patch('/:id/status', authMiddleware, updateVendaStatus);

export default router;