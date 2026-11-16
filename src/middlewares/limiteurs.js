const rateLimit = require('express-rate-limit');

// Limite générale : 100 requêtes par 15 minutes pour chaque adresse IP, sur toute l'API
const limiteurGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // la période : 15 minutes, en millisecondes
  limit: 100, // nombre de requêtes autorisées pendant cette période
  standardHeaders: 'draft-8', // indique au client combien de requêtes il lui reste
  legacyHeaders: false, // pas d'anciens en-têtes en double
  message: { message: 'Trop de requêtes, réessayez plus tard' },
});

// Limite stricte pour la connexion et l'inscription : 10 essais par 15 minutes
// Protège contre la force brute (essayer des milliers de mots de passe)
const limiteurAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' },
});

module.exports = { limiteurGeneral, limiteurAuth };
