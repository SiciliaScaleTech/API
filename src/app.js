const express = require('express');
const authRoutes = require('./routes/auth.js');

const app = express();

// Lecture du JSON dans le corps des requêtes
app.use(express.json());

// route d'authentitfication 
app.use('/api/auth', authRoutes);

// Route de test : permet de vérifier que l'API répond
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
