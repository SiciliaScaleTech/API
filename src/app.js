const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./routes/auth.js');
const publicationsRoutes = require('./routes/publications.js');
const utilisateursRoutes = require('./routes/utilisateurs.js');
const app = express();

// Sécurité : en-têtes de protection sur chaque réponse, et suppression de X-Powered-By
// Placé en premier pour s'appliquer à toutes les réponses, même aux erreurs
app.use(helmet());

// Lecture du JSON dans le corps des requêtes
app.use(express.json());

// Routes d'authentification
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
