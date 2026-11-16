// 1. Les imports : les outils dont ce fichier a besoin
const express = require('express');
const Publication = require('../models/Publication');
const verifierJeton = require('../middlewares/verifierJeton');

// 2. Le routeur : le groupe des routes des publications
const router = express.Router();

// POST /api/publications : créer une publication (il faut être connecté)
router.post('/', verifierJeton, async (req, res) => {
  try {
    // On ne prend que le contenu envoyé par le client
    const { contenu } = req.body || {};

    // L'auteur ne vient jamais du client : c'est la personne du jeton
    const publication = await Publication.create({
      contenu,
      auteur: req.utilisateurId,
    });

    // 201 = ressource créée
    res.status(201).json(publication);
  } catch (erreur) {
    // Contenu vide ou trop long : refusé par le schéma
    if (erreur.name === 'ValidationError') {
      const messages = Object.values(erreur.errors).map((e) => e.message);
      return res.status(400).json({ message: 'Données invalides', erreurs: messages });
    }
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// 3. L'export : on donne le routeur à app.js, qui le branchera sur /api/publications
module.exports = router;
