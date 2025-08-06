import app from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI as string;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB conectado com sucesso!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando em http://localhost:${PORT} e acessível na rede local`);
    });
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));