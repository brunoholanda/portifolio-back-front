  const express = require('express');
  const router = express.Router();
  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');  // Pasta onde as imagens serão salvas.
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);  // Define o nome do arquivo salvo para evitar conflitos.
    }
  });

  const upload = multer({ storage: storage });

  const postsRouter = (pool) => {
    // Rota POST para adicionar um novo post
    router.post('/', upload.single('image'), async (req, res) => {
      try {
        const post = req.body;

        const query = 'INSERT INTO posts (title, image, description, summary, skills, project_link, repo_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const values = [
          post.title,
          req.file.path,  // Aqui estamos utilizando o caminho do arquivo gerado pelo Multer.
          post.description,
          post.summary,
          post.skills,
          post.project_link,
          post.repo_link,
        ];

        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar o post' });
      }
    });

    // Rota GET para obter todos os posts
    router.get('/', async (req, res) => {
      try {
        const query = 'SELECT * FROM posts';
        const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter os posts' });
      }
    });

    // Rota PUT para editar um post existente
    router.put('/:postId', async (req, res) => {
      try {
        const postId = req.params.postId;
        const updatedPost = req.body;

        const query = 'UPDATE posts SET title = $1, image = $2, description = $3, skills = $4, project_link = $5, repo_link = $6 WHERE id = $7 RETURNING *';
        const values = [
          updatedPost.title,
          updatedPost.image,
          updatedPost.description,
          updatedPost.skills,
          updatedPost.project_link,
          updatedPost.repo_link,
          postId,
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
          res.status(404).json({ error: 'Post não encontrado' });
        } else {
          res.status(200).json(result.rows[0]);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar o post' });
      }
    });

    // Rota DELETE para excluir um post
    router.delete('/:postId', async (req, res) => {
      try {
        const postId = req.params.postId;

        const query = 'DELETE FROM posts WHERE id = $1';
        const values = [postId];

        await pool.query(query, values);

        res.status(204).end();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir o post' });
      }
    });

    return router;
  };

  module.exports = postsRouter;
