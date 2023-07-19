const express = require('express');
const app = express();
const postsRouter = require('./routes/posts');
const authenticationRoutes = require('./routes/authentication');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'backendPortifolio',
  password: 'cc391618',
  port: 5432,
});

pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados', err.stack);
  } else {
    console.log('Conexão com o banco de dados foi bem sucedida');
  }
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000' // Substitua pelo URL do seu front-end
}));

// Servir arquivos estáticos da pasta de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas de autenticação
app.use('/api/auth', authenticationRoutes);

// Rotas dos posts
app.use('/api/posts', postsRouter(pool));

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
