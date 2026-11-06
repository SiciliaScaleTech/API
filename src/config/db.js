const mongoose = require('mongoose');

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
