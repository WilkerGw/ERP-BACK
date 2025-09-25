// Caminho: ERP-BACK-main/src/controllers/vendaController.ts

import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Produto from '../models/Produto';
import mongoose from 'mongoose';

// As outras funções (createVenda, getAllVendas, etc.) permanecem as mesmas.
export const createVenda = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { cliente, produtos, pagamento } = req.body;
    for (const item of produtos) {
      const produtoDB = await Produto.findById(item.produto).session(session);
      if (!produtoDB) {
        throw new Error(`Produto com ID ${item.produto} não encontrado.`);
      }
      if (produtoDB.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto: ${produtoDB.nome}. Disponível: ${produtoDB.estoque}`);
      }
    }
    const valorTotal = produtos.reduce((acc: number, item: any) => acc + (item.quantidade * item.valorUnitario), 0);
    const novaVenda = new Venda({ cliente, produtos, valorTotal, pagamento, status: 'Pendente' });
    await novaVenda.save({ session });
    for (const item of produtos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: -item.quantidade } }, { new: true, session });
    }
    await session.commitTransaction();
    res.status(201).json(novaVenda);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Erro ao criar venda:", error.message);
    if (error.message.includes('Estoque insuficiente')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro interno ao criar venda', error: error.message });
  } finally {
    session.endSession();
  }
};

export const getAllVendas = async (req: Request, res: Response) => {
  try {
    const vendas = await Venda.find()
      .populate('cliente', 'fullName')
      .populate({ path: 'produtos.produto', model: 'Produto', select: 'nome' })
      .sort({ dataVenda: -1 });
    res.status(200).json(vendas);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
};

export const getVendaById = async (req: Request, res: Response) => {
  try {
    const venda = await Venda.findById(req.params.id)
      .populate('cliente', 'fullName phone email')
      .populate({
        path: 'produtos.produto',
        model: 'Produto',
        select: 'nome codigo',
      });

    if (!venda) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.status(200).json(venda);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar detalhes da venda', error: error.message });
  }
};

// --- FUNÇÃO DE ATUALIZAR STATUS (REFEITA COM ATUALIZAÇÃO DIRETA) ---
export const updateVendaStatus = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Concluído', 'Cancelado'].includes(status)) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Status inválido.' });
        }

        const venda = await Venda.findById(id).session(session);
        if (!venda) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Venda não encontrada.' });
        }

        // Prepara o objecto de atualização
        const updateData: { [key: string]: any } = { status };

        if (status === 'Concluído') {
            updateData['pagamento.valorEntrada'] = venda.valorTotal;
            updateData['pagamento.valorRestante'] = 0;
        }

        // Executa a atualização directa na base de dados
        const vendaAtualizada = await Venda.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, session }
        );

        await session.commitTransaction();
        res.status(200).json(vendaAtualizada);

    } catch (error: any) {
        await session.abortTransaction();
        console.error("Falha crítica ao atualizar status da venda:", {
            errorMessage: error.message,
            vendaId: req.params.id,
            statusEnviado: req.body.status,
            stack: error.stack,
        });
        res.status(500).json({ message: 'Erro ao atualizar status da venda', error: error.message });
    } finally {
        session.endSession();
    }
};

export const updateVenda = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { produtos: novosProdutos, ...outrosDados } = req.body;

    const vendaAntiga = await Venda.findById(id).session(session);
    if (!vendaAntiga) {
      throw new Error('Venda original não encontrada.');
    }

    for (const item of vendaAntiga.produtos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: +item.quantidade } }, { session });
    }

    for (const item of novosProdutos) {
      const produtoDB = await Produto.findById(item.produto).session(session);
      if (!produtoDB) throw new Error(`Produto ${item.produto} não encontrado.`);
      if (produtoDB.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para ${produtoDB.nome}. Disponível: ${produtoDB.estoque}`);
      }
    }
    
    for (const item of novosProdutos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: -item.quantidade } }, { session });
    }

    const valorTotal = novosProdutos.reduce((acc: number, item: any) => acc + (item.quantidade * item.valorUnitario), 0);
    const dadosAtualizados = {
        ...outrosDados,
        produtos: novosProdutos,
        valorTotal,
    };

    const vendaAtualizada = await Venda.findByIdAndUpdate(id, dadosAtualizados, { new: true, session });

    await session.commitTransaction();
    res.status(200).json(vendaAtualizada);

  } catch (error: any) {
    await session.abortTransaction();
    console.error("Erro ao atualizar venda:", error.message);
    if (error.message.includes('Estoque insuficiente')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao atualizar venda', error: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteVenda = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const venda = await Venda.findById(req.params.id).session(session);
    if (!venda) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    for (const item of venda.produtos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: +item.quantidade } }, { session });
    }
    await venda.deleteOne({ session });
    await session.commitTransaction();
    res.status(200).json({ message: 'Venda deletada com sucesso e estoque restaurado.' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Erro ao deletar venda', error: error.message });
  } finally {
    session.endSession();
  }
};