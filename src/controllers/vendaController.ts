// Caminho: ERP-BACK-main/src/controllers/vendaController.ts

import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Produto from '../models/Produto';
import mongoose from 'mongoose';

// Interface para garantir que temos o userId da autenticação
interface AuthRequest extends Request {
  userId?: string;
}

export const createVenda = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cliente, itens, pagamentos, valorPendenteEntrega, dataVenda } = req.body;
    const vendedor = req.userId;

    // --- LÓGICA DE CÁLCULO NO SERVIDOR ---
    // Calculamos os totais no backend para garantir a integridade dos dados
    const valorTotal = itens.reduce((acc: number, item: any) => acc + (item.quantidade * item.precoUnitario), 0);
    const valorPagoNaHora = pagamentos.reduce((acc: number, pag: any) => acc + pag.valor, 0);

    // Validação de segurança para garantir que os valores correspondem
    if (Math.abs(valorTotal - (valorPagoNaHora + (valorPendenteEntrega || 0))) > 0.01) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'A soma dos pagamentos e do valor pendente não corresponde ao valor total da venda.' });
    }

    const novaVenda = new Venda({
      cliente,
      vendedor,
      itens,
      pagamentos,
      valorTotal,
      valorPagoNaHora,
      valorPendenteEntrega: valorPendenteEntrega || 0,
      dataVenda,
      entregue: false, // Toda nova venda começa como "não entregue"
    });
    
    await novaVenda.save({ session });

    // Lógica para dar baixa no estoque
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

// --- NOVA FUNÇÃO PARA ATUALIZAR STATUS DE ENTREGA ---
export const marcarComoEntregue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const venda = await Venda.findById(id);

        if (!venda) {
            return res.status(404).json({ message: 'Venda não encontrada.' });
        }

        venda.entregue = true;
        
        // Se havia um valor pendente, ele é considerado pago no momento da entrega.
        if (venda.valorPendenteEntrega > 0) {
            // No futuro, poderíamos adicionar esta transação ao caixa automaticamente.
            venda.valorPagoNaHora += venda.valorPendenteEntrega;
            venda.valorPendenteEntrega = 0;
        }
        
        await venda.save();
        res.status(200).json(venda);

    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao atualizar status da venda', error: error.message });
    }
}