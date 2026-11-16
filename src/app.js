const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { limiteurGeneral } = require('./middlewares/limiteurs');
const authRoutes = require('./routes/auth.js');
const publicationsRoutes = require('./routes/publications.js');
const utilisateursRoutes = require('./routes/utilisateurs.js');
const app = express();

// Sécurité : en-têtes de protection sur chaque réponse, et suppression de X-Powered-By
// Placé en premier pour s'appliquer à toutes les réponses, même aux erreurs
app.use(helmet());

// Sécurité : CORS. Seul le site indiqué dans .env (notre front-end) peut appeler l'API depuis un navigateur
app.use(
  cors({
    origin: process.env.CORS_ORIGINE, // l'adresse autorisée, une seule
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // les méthodes utilisées par nos routes
    allowedHeaders: ['Content-Type', 'Authorization'], // les en-têtes que le front a le droit d'envoyer
  })
);

// Front-end : les fichiers du dossier public/ (HTML, CSS, JS) sont envoyés tels quels au navigateur
// path.join construit le chemin vers public/, quel que soit le dossier d'où on lance le serveur
app.use(express.static(path.join(__dirname, '..', 'public')));

// Sécurité : pas plus de 300 requêtes par 15 minutes et par adresse IP sur toute l'API
app.use('/api', limiteurGeneral);

// Lecture du JSON dans le corps des requêtes, 10 Ko au maximum
// Nos plus longs textes font 500 caractères : inutile d'accepter plus (au-delà : 413)
app.use(express.json({ limit: '10kb' }));

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
