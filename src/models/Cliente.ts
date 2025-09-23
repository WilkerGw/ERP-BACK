// Caminho: ERP-BACK-main/src/models/Cliente.ts

import mongoose, { Document, Schema } from 'mongoose';

// 1. Definimos e exportamos a interface ICliente
export interface ICliente extends Document {
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: Date; // 2. Corrigimos o nome do campo para 'birthDate' e o tipo para Date
  gender?: string;
  address?: string;
  cep?: string;
  notes?: string;
  esfericoDireito?: string;
  cilindricoDireito?: string;
  eixoDireito?: string;
  esfericoEsquerdo?: string;
  cilindricoEsquerdo?: string;
  eixoEsquerdo?: string;
  adicao?: string;
  vencimentoReceita?: Date;
}

const clienteSchema = new Schema<ICliente>({
  fullName: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  birthDate: { type: Date, required: true }, // 2. Nome do campo corrigido aqui
  gender: { type: String },
  address: { type: String },
  cep: { type: String },
  notes: { type: String },
  esfericoDireito: { type: String },
  cilindricoDireito: { type: String },
  eixoDireito: { type: String },
  esfericoEsquerdo: { type: String },
  cilindricoEsquerdo: { type: String },
  eixoEsquerdo: { type: String },
  adicao: { type: String },
  vencimentoReceita: { type: Date },
}, {
  timestamps: true,
  collection: 'clients'
});

// 3. Usamos a interface ao exportar o modelo
export default mongoose.model<ICliente>('Cliente', clienteSchema);