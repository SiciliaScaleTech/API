// 1. Les imports : les outils dont ce fichier a besoin
const express = require('express');
const mongoose = require('mongoose');
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

// GET /api/publications : liste des publications, les plus récentes d'abord
router.get('/', verifierJeton, async (req, res) => {
  try {
    const publications = await Publication.find()
      .sort({ createdAt: -1 }) // -1 = ordre décroissant : la plus récente en premier
      .limit(20) // jamais plus de 20 à la fois, pour ne pas surcharger le serveur
      .populate('auteur', 'pseudo'); // remplace l'id de l'auteur par son pseudo

    res.json(publications);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/publications/:id : une seule publication, choisie par son id
router.get('/:id', verifierJeton, async (req, res) => {
  try {
    // Un id mal formé ne peut correspondre à aucune publication
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const publication = await Publication.findById(req.params.id).populate('auteur', 'pseudo');

    // Id bien formé, mais aucune publication ne le porte
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    res.json(publication);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 3. L'export : on donne le routeur à app.js, qui le branchera sur /api/publications
module.exports = router;
