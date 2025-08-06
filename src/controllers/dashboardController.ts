import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Boleto from '../models/Boleto';
import Agendamento from '../models/Agendamento';
import Cliente from '../models/Cliente';
import { getDashboardDateRanges } from '../utils/dateUtils'; // 1. Importa a nova função

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 2. Usa a função para obter as datas, injetando a data atual
    const { hoje, amanha, inicioMes, mesAtual, proximos7dias } = getDashboardDateRanges(new Date());

    // --- CÁLCULOS (A lógica de busca continua a mesma) ---

    const vendasHoje = await Venda.aggregate([
      { $match: { dataVenda: { $gte: hoje, $lt: amanha } } },
      { $group: { _id: null, total: { $sum: '$valorTotal' } } }
    ]);
    const totalVendasDia = vendasHoje[0]?.total || 0;

    const vendasMes = await Venda.aggregate([
      { $match: { dataVenda: { $gte: inicioMes } } },
      { $group: { _id: null, total: { $sum: '$valorTotal' } } }
    ]);
    const totalVendasMes = vendasMes[0]?.total || 0;

    const boletosVencidos = await Boleto.countDocuments({
      status: 'aberto',
      dueDate: { $lt: hoje }
    });

    const boletosProximos = await Boleto.countDocuments({
      status: 'aberto',
      dueDate: { $gte: hoje, $lt: proximos7dias }
    });

    const agendamentosProximos = await Agendamento.countDocuments({
      date: { $gte: hoje, $lt: proximos7dias },
      compareceu: false,
      faltou: false,
    });

    const aniversariantesDoMesRaw = await Cliente.find({
      $expr: {
        $eq: [{ $month: '$birthDate' }, mesAtual]
      }
    }).select('fullName birthDate');

    const aniversariantesMes = aniversariantesDoMesRaw
      .map(c => ({
        nome: c.fullName,
        dia: new Date(c.birthDate).getUTCDate()
      }))
      .sort((a, b) => a.dia - b.dia);

    const stats = {
      totalVendasDia,
      totalVendasMes,
      boletosVencidos,
      boletosProximos,
      agendamentosProximos,
      aniversariantesMes,
    };

    res.status(200).json(stats);

  } catch (error: any) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).send({ error: 'Erro ao buscar dados do dashboard' });
  }
};