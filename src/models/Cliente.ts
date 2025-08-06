import mongoose, { Schema, model, Document } from 'mongoose';

export interface ICliente extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: Date;
  gender: string;
  address: string;
  cep: string;
  notes?: string;
  esfericoDireito?: string;
  cilindricoDireito?: string;
  eixoDireito?: string;
  esfericoEsquerdo?: string;
  cilindricoEsquerdo?: string;
  eixoEsquerdo?: string;
  adicao?: string;
  vencimentoReceita?: Date;
  purchaseHistory?: any[];
}

const ClienteSchema = new Schema<ICliente>({
  fullName: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  birthDate: { type: Date },
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
  purchaseHistory: { type: Array, default: [] },
}, { timestamps: true });

export default model<ICliente>('Cliente', ClienteSchema, 'clients');