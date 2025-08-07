import { Schema, model, Document } from 'mongoose';

interface ItemVenda {
  produto: Schema.Types.ObjectId;
  quantidade: number;
  precoUnitario: number;
}

interface Pagamento {
  metodo: 'Dinheiro' | 'Pix' | 'Débito' | 'Crédito' | 'Boleto';
  parcelas?: number;
}

interface IVenda extends Document {
  cliente: Schema.Types.ObjectId;
  vendedor: Schema.Types.ObjectId;
  itens: ItemVenda[];
  valorTotal: number;
  pagamento: Pagamento;
  dataVenda: Date;
}

const VendaSchema = new Schema<IVenda>({
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  vendedor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itens: [{
    produto: { type: Schema.Types.ObjectId, ref: 'Produto', required: true },
    quantidade: { type: Number, required: true },
    precoUnitario: { type: Number, required: true },
  }],
  valorTotal: { type: Number, required: true },
  pagamento: {
    metodo: {
      type: String,
      enum: ['Dinheiro', 'Pix', 'Débito', 'Crédito', 'Boleto'],
      required: true,
    },
    parcelas: { type: Number, default: 1 },
  },
  // --- MUDANÇA AQUI ---
  // Removemos o 'default: Date.now' e tornamos o campo obrigatório
  dataVenda: { type: Date, required: true },
}, { timestamps: true });

export default model<IVenda>('Venda', VendaSchema);