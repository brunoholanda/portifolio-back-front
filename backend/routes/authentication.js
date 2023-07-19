// authentication.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // caminho para o seu modelo User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Adicionar jsonwebtoken para criar tokens de autenticação

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Criar um hash da senha antes de armazená-la no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, password: hashedPassword });

    // Remover a senha do objeto de usuário antes de enviá-lo na resposta
    const userWithoutPassword = { ...user.toJSON(), password: undefined };

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);  // Adicione esta linha para registrar o erro
    res.status(500).json({ error: 'Erro ao registrar usuário', message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(400).json({ error: 'Usuário não encontrado' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ error: 'Senha incorreta' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, 'secret'); // Substituir 'secret' por sua chave secreta real

    res.status(200).json({ token });
  } catch (error) {
    console.error(error); // Adicione esta linha para registrar o erro
    res.status(500).json({ error: 'Erro ao fazer login', message: error.message });
  }
});

module.exports = router;
