const express = require('express');
const authRoutes = require('./routes/auth.js');
const publicationsRoutes = require('./routes/publications.js');
const utilisateursRoutes = require('./routes/utilisateurs.js');
const app = express();

// Lecture du JSON dans le corps des requêtes
app.use(express.json());

// route d'authentitfication 
app.use('/api/auth', authRoutes);

// Routes des publications.
app.use('/api/publications', publicationsRoutes);

// routes des utilisateurs
app.use('/api/utilisateurs', utilisateursRoutes);

// Route de test : permet de vérifier que l'API répond
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
