const mongoose = require('mongoose');

const bcrypt = require('bcrypt');


// Schéma : la forme que doit avoir chaque document "utilisateur"
const utilisateurSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: [true, 'Le pseudo est obligatoire'],
      unique: true, // deux utilisateurs ne peuvent pas avoir le même pseudo
      trim: true, // supprime les espaces au début et à la fin
      minlength: [3, 'Le pseudo doit contenir au moins 3 caractères'],
      maxlength: [30, 'Le pseudo ne doit pas dépasser 30 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      trim: true,
      lowercase: true, // "Test@Mail.fr" et "test@mail.fr" sont le même email
      match: [/^\S+@\S+\.\S+$/, "Le format de l'email est invalide"],
    },
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      // La validation a lieu avant le hachage (hook pre('save')) : on contrôle donc le vrai mot de passe
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      // bcrypt ne prend en compte que les 72 premiers octets : au-delà, le reste serait ignoré sans prévenir
      maxlength: [72, 'Le mot de passe ne doit pas dépasser 72 caractères'],
      // select: false : le mot de passe n'est jamais renvoyé par défaut
      // dans les recherches, pour éviter de le divulguer par erreur
      select: false,
    },
    bio: {
      type: String,
      maxlength: [300, 'La bio ne doit pas dépasser 300 caractères'],
      default: '',
    },
    // Abonnements : liste des utilisateurs que cette personne suit (références)
    abonnements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
  },
  {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true,
  }
);

// Hook : s'exécute automatiquement avant chaque enregistrement d'un utilisateur
utilisateurSchema.pre('save', async function () {
  // Si le mot de passe n'a pas changé, on ne le hache pas une seconde fois
  if (!this.isModified('motDePasse')) return;

  // On remplace le mot de passe par son empreinte (coût 12)
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
});


// Modèle : l'outil qui permet de lire et écrire dans la collection "utilisateurs"
module.exports = mongoose.model('Utilisateur', utilisateurSchema);
