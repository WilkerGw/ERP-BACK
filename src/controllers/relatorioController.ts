// Caminho: ERP-BACK-main/src/controllers/relatorioController.ts

import { Request, Response } from 'express';
// import Venda from '../models/Venda'; // Removido
import Agendamento from '../models/Agendamento';
import Boleto from '../models/Boleto';
import mongoose from 'mongoose';

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// --- FUNÇÕES DE VENDAS REMOVIDAS TEMPORARIAMENTE ---
// Estas funções serão recriadas quando o novo módulo de Vendas estiver pronto.
export const getFaturamentoMensal = async (req: Request, res: Response) => {
  res.status(200).json([]);
};

export const getVendasPorMetodo = async (req: Request, res: Response) => {
  res.status(200).json([]);
};

export const getTopClientes = async (req: Request, res: Response) => {
  res.status(200).json([]);
};
// --- FIM DA REMOÇÃO ---

export const getEficienciaAgendamentos = async (req: Request, res: Response) => {
  try {
    const dados = await Agendamento.aggregate([
      { $project: { status: { $cond: { if: { $eq: ["$compareceu", true] }, then: "Compareceu", else: { $cond: { if: { $eq: ["$faltou", true] }, then: "Faltou", else: "Aberto" } } } } } },
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$value", _id: 0 } }
    ]);
    res.status(200).json(dados);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar eficiência de agendamentos', error: error.message });
  }
};

export const getFluxoCaixaFuturo = async (req: Request, res: Response) => {
  try {
    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const dados = await Boleto.aggregate([
      { $match: { status: 'aberto', dueDate: { $gte: hoje } } },
      { $group: { _id: { ano: { $year: "$dueDate" }, mes: { $month: "$dueDate" } }, totalReceber: { $sum: "$parcelValue" } } },
      { $sort: { "_id.ano": 1, "_id.mes": 1 } },
      { $limit: 12 }
    ]);
    const dadosFormatados = dados.map(item => ({
      mes: `${meses[item._id.mes - 1]}/${String(item._id.ano).slice(-2)}`,
      "Valor a Receber": item.totalReceber
    }));
    res.status(200).json(dadosFormatados);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar fluxo de caixa', error: error.message });
  }
};