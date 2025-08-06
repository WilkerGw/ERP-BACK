import { Request, Response } from 'express';
import Cliente from '../models/Cliente';

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { cpf } = req.body;
    const clienteExistente = await Cliente.findOne({ cpf: cpf });
    if (clienteExistente) {
      return res.status(400).json({ message: 'Já existe um cliente com este CPF.' });
    }
    const novoCliente = new Cliente(req.body);
    await novoCliente.save();
    res.status(201).json(novoCliente);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
  }
};

export const getClientes = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { fullName: searchRegex },
          { cpf: searchRegex },
          { phone: searchRegex }
        ]
      };
    }
    const clientes = await Cliente.find(query).sort({ fullName: 1 });
    res.status(200).json(clientes);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
  }
};

// --- FUNÇÃO FALTANTE ADICIONADA AQUI ---
export const getClienteById = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json(cliente);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clienteAtualizado) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json(clienteAtualizado);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json({ message: 'Cliente deletado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
  }
};