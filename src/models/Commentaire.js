const mongoose = require('mongoose');

// Schéma : la forme que doit avoir chaque document "publication"
const publicationSchema = new mongoose.Schema(
  {
    publication: {
      type: String,
      required: [true, 'La publication est obligatoire'],
      trim: true,
      ref: 'publication',
      maxlength: [500, 'Le contenu ne doit pas dépasser 500 caractères'],
    },
    contenu: {
      type: String,
      required: [true, 'Le contenu est obligatoire'],
      trim: true,
      maxlength: [300, 'Le contenu ne doit pas dépasser 300 caractères'],
    },
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: [true, "L'auteur est obligatoire"],
    },
  },
  {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true,
  }
);

// Modèle : l'outil qui permet de lire et écrire dans la collection "publications"
module.exports = mongoose.model('Publication', publicationSchema);  