import mongoose from 'mongoose';

// Documentação da Correção:
// - Alterámos os nomes dos campos para corresponder à sua necessidade:
//   'nome' -> 'fullName'
//   'email' -> 'cpf' (e tornámo-lo único)
//   'telefone' -> 'phone'
// - Isto garante que o backend lê e escreve os dados com os nomes corretos.
const clienteSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dataNascimento: { type: String, required: true },
  endereco: {
    rua: String,
    numero: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  // Garantimos que a coleção correta 'clients' seja usada.
  collection: 'clients' 
});

export default mongoose.model('Cliente', clienteSchema);