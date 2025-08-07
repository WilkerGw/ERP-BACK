import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Produto from '../models/Produto';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  userId?: string;
}

export const createVenda = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- MUDANÇA AQUI ---
    // Adicionamos 'dataVenda' aos dados recebidos
    const { cliente, itens, valorTotal, pagamento, dataVenda } = req.body;
    const vendedor = req.userId;

    const novaVenda = new Venda({
      cliente,
      vendedor,
      itens,
      valorTotal,
      pagamento,
      dataVenda, // E usamos aqui
    });
    await novaVenda.save({ session });

    for (const item of itens) {
      await Produto.findByIdAndUpdate(
        item.produto,
        { $inc: { estoque: -item.quantidade } },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json(novaVenda);

  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Erro ao criar venda', error: error.message });
  } finally {
    session.endSession();
  }
};

export const getVendas = async (req: Request, res: Response) => {
  try {
    const vendas = await Venda.find()
      .populate('cliente', 'fullName')
      .populate('vendedor', 'nome')
      .sort({ dataVenda: -1 });
    res.status(200).json(vendas);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
};