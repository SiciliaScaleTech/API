const mongoose = require('mongoose');

// Sécurité contre l'injection NoSQL : dans les recherches, Mongoose neutralise
// tout objet qui contient un opérateur commençant par $ (comme $ne ou $gt)
// Un opérateur voulu par nous doit être marqué explicitement avec mongoose.trusted()
mongoose.set('sanitizeFilter', true);

// Connexion à MongoDB avec l'adresse définie dans .env
async function connecterBase() {
  const uri = process.env.MONGO_URI;

  // Sans adresse, inutile d'aller plus loin : on arrête avec un message clair
  if (!uri) {
    throw new Error('La variable MONGO_URI est absente du fichier .env');
  }

  // await : on attend que la connexion soit établie avant de continuer
  await mongoose.connect(uri);
  console.log('Connecté à MongoDB');
}

module.exports = connecterBase;
