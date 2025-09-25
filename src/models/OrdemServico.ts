// Caminho: ERP-BACK-main/src/models/OrdemServico.ts

import mongoose, { Document, Schema } from 'mongoose';

// Definimos os possíveis status que uma O.S. pode ter
export type StatusOrdemServico = 
  | 'Aguardando Laboratório'
  | 'Em Produção'
  | 'Em Montagem'
  | 'Disponível para Retirada'
  | 'Entregue'
  | 'Cancelada';

export interface IOrdemServico extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  cliente: mongoose.Schema.Types.ObjectId;
  venda: mongoose.Schema.Types.ObjectId;
  numeroOS: number;
  status: StatusOrdemServico;
  
  // Dados da receita que motivou a O.S.
  receita: {
    esfericoDireito?: string;
    cilindricoDireito?: string;
    eixoDireito?: string;
    esfericoEsquerdo?: string;
    cilindricoEsquerdo?: string;
    eixoEsquerdo?: string;
    adicao?: string;
    altura?: string;
    dp?: string;
  };

  produtosServico: {
    produto: mongoose.Schema.Types.ObjectId;
    nome: string; // Guardamos o nome para fácil visualização
  }[];

  laboratorio?: string;
  previsaoEntrega?: Date;
  dataEntrega?: Date;
  observacoes?: string;
  user: mongoose.Schema.Types.ObjectId;
}

const OrdemServicoSchema: Schema = new Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  venda: { type: mongoose.Schema.Types.ObjectId, ref: 'Venda', required: true, unique: true },
  numeroOS: { type: Number, required: true, unique: true }, // Um número sequencial para cada O.S.
  status: { 
    type: String, 
    enum: [
        'Aguardando Laboratório',
        'Em Produção',
        'Em Montagem',
        'Disponível para Retirada',
        'Entregue',
        'Cancelada'
    ], 
    default: 'Aguardando Laboratório' 
  },
  receita: {
    esfericoDireito: { type: String },
    cilindricoDireito: { type: String },
    eixoDireito: { type: String },
    esfericoEsquerdo: { type: String },
    cilindricoEsquerdo: { type: String },
    eixoEsquerdo: { type: String },
    adicao: { type: String },
    altura: { type: String },
    dp: { type: String },
  },
  produtosServico: [{
    _id: false,
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' },
    nome: { type: String }
  }],
  laboratorio: { type: String },
  previsaoEntrega: { type: Date },
  dataEntrega: { type: Date },
  observacoes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

// Lógica para autoincremento do numeroOS (pode ser aprimorada no futuro)
OrdemServicoSchema.pre('save', async function (next) {
  if (this.isNew) {
    const ultimoDocumento = await mongoose.model('OrdemServico', OrdemServicoSchema).findOne().sort({ numeroOS: -1 });
    this.numeroOS = (ultimoDocumento?.numeroOS || 0) + 1;
  }
  next();
});

export default mongoose.model<IOrdemServico>('OrdemServico', OrdemServicoSchema);