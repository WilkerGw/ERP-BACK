// Caminho: ERP-BACK-main/src/controllers/vendaController.ts

import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Produto from '../models/Produto';
import mongoose from 'mongoose';

export const createVenda = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cliente, produtos, pagamento } = req.body;

    for (const item of produtos) {
      const produtoDB = await Produto.findById(item.produto).session(session);
      if (!produtoDB) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Produto com ID ${item.produto} não encontrado.` });
      }
      if (produtoDB.estoque < item.quantidade) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Estoque insuficiente para o produto: ${produtoDB.nome}. Disponível: ${produtoDB.estoque}` });
      }
    }

    const valorTotal = produtos.reduce((acc: number, item: any) => {
      return acc + (item.quantidade * item.valorUnitario);
    }, 0);

    const novaVenda = new Venda({
      cliente,
      produtos,
      valorTotal,
      pagamento,
      status: 'Pendente',
    });
    
    await novaVenda.save({ session });

    for (const item of produtos) {
      await Produto.findByIdAndUpdate(
        item.produto,
        { $inc: { estoque: -item.quantidade } },
        { new: true, session }
      );
    }

    await session.commitTransaction();
    res.status(201).json(novaVenda);

  } catch (error: any) {
    await session.abortTransaction();
    console.error("Erro ao criar venda:", error.message);
    res.status(500).json({ message: 'Erro interno ao criar venda', error: error.message });
  } finally {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
  }
};

export const getAllVendas = async (req: Request, res: Response) => {
  try {
    const vendas = await Venda.find()
      .populate('cliente', 'fullName') 
      .populate({
        path: 'produtos.produto',
        model: 'Produto',
        select: 'nome'
      })
      .sort({ dataVenda: -1 });

    res.status(200).json(vendas);
  } catch (error: any) {
    console.error("Erro detalhado ao buscar vendas:", error);
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
};

export const updateVendaStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Concluído', 'Cancelado'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido. Use "Concluído" ou "Cancelado".' });
        }

        const venda = await Venda.findById(id);

        if (!venda) {
            return res.status(404).json({ message: 'Venda não encontrada.' });
        }

        if (status === 'Concluído' && venda.pagamento) {
            venda.pagamento.valorEntrada = venda.valorTotal;
            venda.pagamento.valorRestante = 0;
        }

        venda.status = status;
        
        await venda.save();
        res.status(200).json(venda);

    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao atualizar status da venda', error: error.message });
    }
}