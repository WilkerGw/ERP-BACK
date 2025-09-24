// Caminho: ERP-BACK-main/src/controllers/dashboardController.ts

import { Request, Response } from 'express';
// import Venda from '../models/Venda'; // Removido
import Boleto from '../models/Boleto';
import Agendamento from '../models/Agendamento';
import Cliente from '../models/Cliente';
import { getDashboardDateRanges } from '../utils/dateUtils';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { hoje, amanha, mesAtual, proximos7dias } = getDashboardDateRanges(new Date());

    // --- LÓGICA DE VENDAS REMOVIDA ---
    // Como o modelo de Venda foi removido, não podemos mais calcular estas métricas.
    // Elas serão reintroduzidas quando construirmos o novo módulo de Vendas.
    const totalVendasDia = 0;
    const totalVendasMes = 0;

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