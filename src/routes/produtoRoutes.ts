import { Router } from 'express';
import { createProduto, getProdutos, getProdutoById, updateProduto, deleteProduto } from '../controllers/produtoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.post('/', createProduto);
router.get('/', getProdutos);
router.get('/:id', getProdutoById);
router.put('/:id', updateProduto);
router.delete('/:id', deleteProduto);

export default router;