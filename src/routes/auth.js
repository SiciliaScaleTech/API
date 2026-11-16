const express = require('express');
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const verifierJeton = require('../middlewares/verifierJeton');
const messagesValidation = require('../utils/messagesValidation');
const { limiteurAuth } = require('../middlewares/limiteurs');




// Un routeur : un petit groupe de routes qu'on branchera ensuite dans app.js
const router = express.Router();



// POST /api/auth/inscription : créer un nouveau compte
// limiteurAuth : 10 essais par 15 minutes, contre la création de comptes en masse
router.post('/inscription', limiteurAuth, async (req, res) => {
  try {
    // On ne prend que les 3 champs attendus, rien d'autre
    const { pseudo, email, motDePasse } = req.body || {};

    // Création : le schéma valide les données, le hook hache le mot de passe
    const utilisateur = await Utilisateur.create({ pseudo, email, motDePasse });

    // 201 = ressource créée. On renvoie le compte, mais jamais le mot de passe
    res.status(201).json({
      id: utilisateur._id,
      pseudo: utilisateur.pseudo,
      email: utilisateur.email,
    });
  } catch (erreur) {
    // Données refusées par le schéma : on renvoie la liste des messages d'erreur
    if (erreur.name === 'ValidationError') {
      const messages = messagesValidation(erreur);
      return res.status(400).json({ message: 'Données invalides', erreurs: messages });
    }
    // Pseudo ou email déjà utilisé : MongoDB renvoie le code 11000 (index unique)
    if (erreur.code === 11000) {
      return res.status(409).json({ message: 'Ce pseudo ou cet email est déjà utilisé' });
    }
    // Toute autre erreur : on garde le détail pour nous, le client reçoit un message vague
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/connexion : vérifier l'email et le mot de passe
// limiteurAuth : 10 essais par 15 minutes, contre la force brute sur les mots de passe
router.post('/connexion', limiteurAuth, async (req, res) => {
  try {
    const { email, motDePasse } = req.body || {};

    // 1. Les deux champs doivent être des textes (bloque aussi les champs manquants)
    if (typeof email !== 'string' || typeof motDePasse !== 'string') {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires' });
    }

    // Même message pour tous les échecs : on ne révèle pas si l'email existe
    const messageEchec = 'Email ou mot de passe incorrect';

    // 2. Chercher le compte par son email, en demandant le mot de passe caché
    const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
    if (!utilisateur) {
      return res.status(401).json({ message: messageEchec });
    }

    // 3. Comparer le mot de passe tapé avec l'empreinte stockée
    const motDePasseCorrect = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseCorrect) {
      return res.status(401).json({ message: messageEchec });
    }

    // 4. Fabriquer le jeton : il contient l'id du compte, signé avec la clé secrète
    const jeton = jwt.sign(
      { id: utilisateur._id },     // contenu du jeton (lisible par tous, rien de secret)
      process.env.JWT_SECRET,      // clé secrète, lue dans le fichier .env
      { expiresIn: '1h' }          // le jeton ne sera plus valable après 1 heure
    );

    res.json({ jeton });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/auth/moi : profil de la personne connectée (route protégée par le jeton)
router.get('/moi', verifierJeton, async (req, res) => {
  try {
    // L'id vient du jeton vérifié par le middleware, pas de ce que le client envoie
    const utilisateur = await Utilisateur.findById(req.utilisateurId);

    // Le compte a pu être supprimé depuis la création du jeton
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      id: utilisateur._id,
      pseudo: utilisateur.pseudo,
      email: utilisateur.email,
      bio: utilisateur.bio,
      abonnements: utilisateur.abonnements, // les id des membres suivis, utiles au front-end
    });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


module.exports = router;
