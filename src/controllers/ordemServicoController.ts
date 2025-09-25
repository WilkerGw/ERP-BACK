// Caminho: ERP-BACK-main/src/controllers/ordemServicoController.ts

import { Request, Response } from 'express';
import OrdemServico, { IOrdemServico } from '../models/OrdemServico';
import mongoose from 'mongoose';

// Interface para estender o Request com o userId
interface AuthRequest extends Request {
  userId?: string;
}

// Obter todas as Ordens de Serviço com filtros
export const getAllOrdensServico = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const query: mongoose.FilterQuery<IOrdemServico> = { user: req.userId };

    if (status) {
      query.status = status as string;
    }
    
    let ordens;

    if (search) {
        // Busca por número da OS ou nome do cliente
        const searchNumber = parseInt(search as string, 10);
        const searchQuery = isNaN(searchNumber)
            ? { 'clienteInfo.fullName': new RegExp(search as string, 'i') }
            : { numeroOS: searchNumber };

        ordens = await OrdemServico.aggregate([
            { $lookup: { from: 'clients', localField: 'cliente', foreignField: '_id', as: 'clienteInfo' } },
            { $unwind: '$clienteInfo' },
            { $match: { ...query, ...searchQuery } },
            { $sort: { createdAt: -1 } }
        ]);
    } else {
        ordens = await OrdemServico.find(query)
          .populate('cliente', 'fullName')
          .sort({ createdAt: -1 });
    }

    res.status(200).json(ordens);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar Ordens de Serviço', error: error.message });
  }
};

// Obter uma Ordem de Serviço por ID
export const getOrdemServicoById = async (req: AuthRequest, res: Response) => {
  try {
    const ordem = await OrdemServico.findOne({ _id: req.params.id, user: req.userId })
        .populate('cliente', 'fullName phone email')
        .populate('venda');

    if (!ordem) {
      return res.status(404).json({ message: 'Ordem de Serviço não encontrada' });
    }
    res.status(200).json(ordem);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar Ordem de Serviço', error: error.message });
  }
};

// Atualizar o status de uma Ordem de Serviço
export const updateOrdemServicoStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData: { status: string, dataEntrega?: Date } = { status };

        if (status === 'Entregue') {
            updateData.dataEntrega = new Date();
        }

        const ordem = await OrdemServico.findOneAndUpdate(
            { _id: id, user: req.userId },
            { $set: updateData },
            { new: true }
        );

        if (!ordem) {
            return res.status(404).json({ message: 'Ordem de Serviço não encontrada.' });
        }
        res.status(200).json(ordem);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao atualizar status da O.S.', error: error.message });
    }
};