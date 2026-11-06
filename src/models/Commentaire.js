const mongoose = require('mongoose');

// Schéma : la forme que doit avoir chaque document "commentaire"
const commentaireSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'La publication est obligatoire'],
      ref: 'Publication',
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

// Modèle : l'outil qui permet de lire et écrire dans la collection "commentaires"
module.exports = mongoose.model('Commentaire', commentaireSchema);  