const express = require('express');

const app = express();

// Lecture du JSON dans le corps des requêtes
app.use(express.json());

// Route de test : permet de vérifier que l'API répond
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
