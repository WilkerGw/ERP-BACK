// Caminho: ERP-BACK-main/src/routes/vendaRoutes.ts

import { Router } from 'express';
import { createVenda, getVendas, marcarComoEntregue } from '../controllers/vendaController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de vendas são protegidas e exigem autenticação
router.use(authMiddleware);

// Rota para criar uma nova venda
router.post('/', createVenda);

// Rota para listar todas as vendas
router.get('/', getVendas);

// Rota para marcar uma venda como entregue (usa o método PATCH para atualização parcial)
router.patch('/:id/entregar', marcarComoEntregue);

export default router;