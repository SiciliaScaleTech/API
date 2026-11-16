const express = require('express');
const Utilisateur = require('../models/Utilisateur');

// Un routeur : un petit groupe de routes qu'on branchera ensuite dans app.js
const router = express.Router();



// POST /api/auth/inscription : créer un nouveau compte
router.post('/inscription', async (req, res) => {
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
      const messages = Object.values(erreur.errors).map((e) => e.message);
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


module.exports = router;
