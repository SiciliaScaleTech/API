// 1. Les imports : les outils dont ce fichier a besoin
const express = require('express');
const mongoose = require('mongoose');
const Utilisateur = require('../models/Utilisateur');
const verifierJeton = require('../middlewares/verifierJeton');

// 2. Le routeur : le groupe des routes des utilisateurs
const router = express.Router();


// POST /api/utilisateurs/:id/abonnement : suivre l'utilisateur :id
router.post('/:id/abonnement', verifierJeton, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Règle métier : on ne peut pas se suivre soi-même
    if (req.params.id === req.utilisateurId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous suivre vous-même' });
    }

    // La personne à suivre doit exister
    const existe = await Utilisateur.exists({ _id: req.params.id });
    if (!existe) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // On ajoute son id dans MA liste d'abonnements (moi = la personne du jeton)
    const moi = await Utilisateur.findByIdAndUpdate(
      req.utilisateurId,
      { $addToSet: { abonnements: req.params.id } },
      { returnDocument: 'after' }
    );
    if (!moi) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({ message: 'Abonnement ajouté', nombreAbonnements: moi.abonnements.length });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/utilisateurs/:id/abonnement : ne plus suivre l'utilisateur :id
router.delete('/:id/abonnement', verifierJeton, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // On retire son id de MA liste d'abonnements
    const moi = await Utilisateur.findByIdAndUpdate(
      req.utilisateurId,
      { $pull: { abonnements: req.params.id } },
      { returnDocument: 'after' }
    );
    if (!moi) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({ message: 'Abonnement retiré', nombreAbonnements: moi.abonnements.length });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// 3. L'export : on donne le routeur à app.js, qui le branchera sur /api/utilisateurs
module.exports = router;
