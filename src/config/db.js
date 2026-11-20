const mongoose = require('mongoose');

// Sécurité contre l'injection NoSQL : dans les recherches, Mongoose neutralise
// tout objet qui contient un opérateur commençant par $ (comme $ne ou $gt)
// Un opérateur voulu par nous doit être marqué explicitement avec mongoose.trusted()
mongoose.set('sanitizeFilter', true);

// Connexion à MongoDB avec les informations définies dans .env
async function connecterBase() {
  const { MONGO_UTILISATEUR, MONGO_MOT_DE_PASSE, MONGO_HOTE, MONGO_BASE } = process.env;

  // S'il manque une information, inutile d'aller plus loin : on arrête avec un message clair
  if (!MONGO_UTILISATEUR || !MONGO_MOT_DE_PASSE || !MONGO_HOTE || !MONGO_BASE) {
    throw new Error('Variables de connexion MongoDB absentes du fichier .env (MONGO_UTILISATEUR, MONGO_MOT_DE_PASSE, MONGO_HOTE, MONGO_BASE)');
  }

  // On reconstruit l'adresse de connexion. encodeURIComponent protège les caractères spéciaux du mot de passe.
  // MONGO_HOTE vaut 127.0.0.1 sur la VM, et "mongo" (le nom du service) dans Docker Compose
  const uri = `mongodb://${encodeURIComponent(MONGO_UTILISATEUR)}:${encodeURIComponent(MONGO_MOT_DE_PASSE)}@${MONGO_HOTE}:27017/${MONGO_BASE}`;

  // await : on attend que la connexion soit établie avant de continuer
  await mongoose.connect(uri);
  console.log('Connecté à MongoDB');
}

module.exports = connecterBase;
