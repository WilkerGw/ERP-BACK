// Caminho: ERP-BACK-main/src/app.ts

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// ... importações das rotas ...
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import clienteRoutes from './routes/clienteRoutes';
import produtoRoutes from './routes/produtoRoutes';
import vendaRoutes from './routes/vendaRoutes';
import boletoRoutes from './routes/boletoRoutes';
import agendamentoRoutes from './routes/agendamentoRoutes';
import insightRoutes from './routes/insightRoutes'; 
import relatorioRoutes from './routes/relatorioRoutes';
import caixaRoutes from './routes/caixaRoutes';


dotenv.config();
const app = express();

// --- CORREÇÃO DE CORS AQUI ---
// Definimos explicitamente quais origens (domínios) podem aceder à nossa API.
const corsOptions = {
  origin: ['http://localhost:3000', 'https://erp-front-ebon.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// --- FIM DA CORREÇÃO ---

app.use(express.json());

// Rotas da Aplicação
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/boletos', boletoRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/insights', insightRoutes); 
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/caixa', caixaRoutes);



app.get('/api/health', (req, res) => {
  res.send('Backend está funcionando!');
});

export default app;