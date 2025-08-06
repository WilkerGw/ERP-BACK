import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Produto from '../models/Produto';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  userId?: string;
}

// Criar uma nova venda
export const createVenda = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cliente, itens, valorTotal, pagamento } = req.body;
    const vendedor = req.userId; // Obtido do token de autenticação

    // Passo 1: Criar e salvar a venda
    const novaVenda = new Venda({
      cliente,
      vendedor,
      itens,
      valorTotal,
      pagamento,
    });
    await novaVenda.save({ session });

    // Passo 2: Atualizar o estoque para cada item vendido
    for (const item of itens) {
      await Produto.findByIdAndUpdate(
        item.produto,
        { $inc: { estoque: -item.quantidade } }, // Decrementa o estoque
        { session }
      );
    }

    // Se tudo deu certo, confirma a transação
    await session.commitTransaction();
    res.status(201).json(novaVenda);

  } catch (error: any) {
    // Se algo der errado, desfaz todas as operações
    await session.abortTransaction();
    res.status(500).json({ message: 'Erro ao criar venda', error: error.message });
  } finally {
    session.endSession();
  }
};

// Obter todas as vendas
export const getVendas = async (req: Request, res: Response) => {
  try {
    const vendas = await Venda.find()
      .populate('cliente', 'fullName') // Traz apenas o nome completo do cliente
      .populate('vendedor', 'nome')   // Traz apenas o nome do vendedor
      .sort({ dataVenda: -1 }); // Ordena pelas mais recentes
    res.status(200).json(vendas);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
};