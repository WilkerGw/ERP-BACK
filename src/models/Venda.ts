// Caminho: ERP-BACK-main/src/models/Venda.ts

import { Schema, model, Document } from 'mongoose';

// Subdocumento para cada item da venda (permanece o mesmo)
interface ItemVenda {
  produto: Schema.Types.ObjectId;
  quantidade: number;
  precoUnitario: number;
}

// Subdocumento para cada forma de pagamento usada na venda
interface Pagamento {
  metodo: 'Dinheiro' | 'Pix' | 'Débito' | 'Crédito' | 'Boleto';
  valor: number;
  parcelas?: number;
}

// Interface principal da Venda, agora com os novos campos
export interface IVenda extends Document {
  cliente: Schema.Types.ObjectId;
  vendedor: Schema.Types.ObjectId;
  itens: ItemVenda[];
  pagamentos: Pagamento[]; // AGORA É UM ARRAY DE PAGAMENTOS
  valorTotal: number;
  valorPagoNaHora: number; // NOVO: Soma dos pagamentos feitos no ato da venda
  valorPendenteEntrega: number; // NOVO: Valor a ser pago na entrega
  entregue: boolean; // NOVO: Status da entrega
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
  pagamentos: [{
    metodo: {
      type: String,
      enum: ['Dinheiro', 'Pix', 'Débito', 'Crédito', 'Boleto'],
      required: true,
    },
    valor: { type: Number, required: true },
    parcelas: { type: Number, default: 1 },
  }],
  valorTotal: { type: Number, required: true },
  valorPagoNaHora: { type: Number, required: true, default: 0 },
  valorPendenteEntrega: { type: Number, required: true, default: 0 },
  entregue: { type: Boolean, default: false },
  dataVenda: { type: Date, required: true },
}, { timestamps: true });

export default model<IVenda>('Venda', VendaSchema);