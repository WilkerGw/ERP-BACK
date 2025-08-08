import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Agendamento from '../models/Agendamento';
import Boleto from '../models/Boleto';
import mongoose from 'mongoose';

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const getFaturamentoMensal = async (req: Request, res: Response) => {
  try {
    const dados = await Venda.aggregate([
      { $group: { _id: { ano: { $year: "$dataVenda" }, mes: { $month: "$dataVenda" } }, faturamento: { $sum: "$valorTotal" } } },
      { $sort: { "_id.ano": 1, "_id.mes": 1 } }
    ]);
    const dadosFormatados = dados.map(item => ({
      mes: `${meses[item._id.mes - 1]}/${String(item._id.ano).slice(-2)}`,
      "Faturamento": item.faturamento
    }));
    res.status(200).json(dadosFormatados);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar faturamento mensal', error: error.message });
  }
};

export const getVendasPorMetodo = async (req: Request, res: Response) => {
  try {
    const dados = await Venda.aggregate([
      { $group: { _id: "$pagamento.metodo", total: { $sum: "$valorTotal" } } },
      { $sort: { "total": -1 } }
    ]);
    const dadosFormatados = dados.map(item => ({ name: item._id, value: item.total }));
    res.status(200).json(dadosFormatados);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar vendas por método', error: error.message });
  }
};

export const getTopClientes = async (req: Request, res: Response) => {
  try {
    const dados = await Venda.aggregate([
      { $group: { _id: "$cliente", totalGasto: { $sum: "$valorTotal" } } },
      { $sort: { totalGasto: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'clienteInfo' } },
      { $unwind: '$clienteInfo' },
      { $project: { name: "$clienteInfo.fullName", "Total Gasto": "$totalGasto", _id: 0 } }
    ]);
    res.status(200).json(dados);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar top clientes', error: error.message });
  }
};

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