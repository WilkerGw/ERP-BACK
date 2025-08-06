import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

// --- CORREÇÃO PRINCIPAL AQUI ---
// Importamos o modelo (default) e a interface (nomeada) separadamente
import Venda from '../models/Venda';
import Cliente from '../models/Cliente';
import { ICliente } from '../models/Cliente';
import Produto from '../models/Produto';
import { IProduto } from '../models/Produto';
import User from '../models/User';
import { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

describe('Testes de Integração para Vendas', () => {
  let token: string;
  let testUserId: string;
  let testClienteId: string;
  let testProduto1Id: string;
  let testProduto2Id: string;

  beforeAll(async () => {
    const mongoUriTest = process.env.MONGO_URI_TEST as string;
    await mongoose.connect(mongoUriTest);

    await User.deleteMany({});
    await Cliente.deleteMany({});
    await Produto.deleteMany({});
    await Venda.deleteMany({});

    const user: IUser = await User.create({ nome: 'Vendedor Teste', email: 'vendatest@example.com', senha: 'password123' });
    const cliente: ICliente = await Cliente.create({ fullName: 'Cliente da Venda', cpf: '123.123.123-12', phone: '1111', birthDate: new Date(), gender: 'Outro' });
    const produto1: IProduto = await Produto.create({ codigo: 'P01', nome: 'Produto A', tipo: 'Óculos de Sol', precoCusto: 10, precoVenda: 20, estoque: 100 });
    const produto2: IProduto = await Produto.create({ codigo: 'P02', nome: 'Produto B', tipo: 'Óculos de Grau', precoCusto: 20, precoVenda: 40, estoque: 50 });

    testUserId = user._id.toString();
    testClienteId = cliente._id.toString();
    testProduto1Id = produto1._id.toString();
    testProduto2Id = produto2._id.toString();

    token = jwt.sign({ id: testUserId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Venda.deleteMany({});
    await Produto.findByIdAndUpdate(testProduto1Id, { estoque: 100 });
    await Produto.findByIdAndUpdate(testProduto2Id, { estoque: 50 });
  });

  it('Deve criar uma nova venda e diminuir o estoque dos produtos via POST /api/vendas', async () => {
    const novaVenda = {
      cliente: testClienteId,
      itens: [
        { produto: testProduto1Id, quantidade: 2, precoUnitario: 20 },
        { produto: testProduto2Id, quantidade: 1, precoUnitario: 35 },
      ],
      pagamento: { metodo: 'Crédito', parcelas: 2 },
      valorTotal: (2 * 20) + (1 * 35),
    };

    const response = await request(app)
      .post('/api/vendas')
      .set('Authorization', `Bearer ${token}`)
      .send(novaVenda);

    expect(response.status).toBe(201);
    expect(response.body.valorTotal).toBe(75);

    const produto1NoDB = await Produto.findById(testProduto1Id);
    const produto2NoDB = await Produto.findById(testProduto2Id);

    expect(produto1NoDB?.estoque).toBe(98);
    expect(produto2NoDB?.estoque).toBe(49);
  });

  it('Deve listar as vendas com os dados do cliente e vendedor populados via GET /api/vendas', async () => {
    await Venda.create({
      cliente: testClienteId,
      vendedor: testUserId,
      itens: [{ produto: testProduto1Id, quantidade: 1, precoUnitario: 20 }],
      valorTotal: 20,
      pagamento: { metodo: 'Dinheiro' },
    });

    const response = await request(app)
      .get('/api/vendas')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    
    expect(response.body[0].cliente.fullName).toBe('Cliente da Venda');
    expect(response.body[0].vendedor.nome).toBe('Vendedor Teste');
  });
});