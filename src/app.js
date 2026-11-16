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

// Aucune route ne correspond à la demande : réponse 404 en JSON, sans page HTML d'Express
app.use((req, res) => {
  res.status(404).json({ message: 'Ressource introuvable' });
});

// Gestionnaire d'erreurs : Express le reconnaît à ses 4 paramètres (erreur en premier)
// Il reçoit toutes les erreurs non traitées, et ne renvoie jamais de détails techniques au client
app.use((erreur, req, res, next) => {
  // Le client a envoyé un JSON mal formé
  if (erreur.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalide' });
  }

  // Le client a envoyé un corps de requête trop gros
  if (erreur.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Requête trop volumineuse' });
  }

  // Toute autre erreur : le détail reste dans le terminal du serveur, le client reçoit un message vague
  console.error(erreur);
  res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = app;
