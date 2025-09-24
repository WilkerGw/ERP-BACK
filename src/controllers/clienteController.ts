// Caminho: ERP-BACK-main/src/controllers/clienteController.ts

import { Request, Response } from 'express';
import Cliente from '../models/Cliente';

// Criar novo cliente
export const createCliente = async (req: Request, res: Response) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao criar cliente', error: error.message });
  }
};

// Obter todos os clientes com lógica de busca por nome.
export const getClientes = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};

    // Se o parâmetro 'search' existir na URL, cria uma consulta para buscar
    // clientes pelo 'fullName' de forma case-insensitive.
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query = { fullName: searchRegex };
    }

    const clientes = await Cliente.find(query).sort({ fullName: 1 });
    res.status(200).json(clientes);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
  }
};

// Obter um cliente por ID
export const getClienteById = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

// Atualizar um cliente
export const updateCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
};

// Deletar um cliente
export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
  }
};