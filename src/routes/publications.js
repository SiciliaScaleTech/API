// 1. Les imports : les outils dont ce fichier a besoin
const express = require('express');
const mongoose = require('mongoose');
const Publication = require('../models/Publication');
const Commentaire = require('../models/Commentaire');
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

// PUT /api/publications/:id : modifier le contenu, seulement par son auteur
router.put('/:id', verifierJeton, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    // Contrôle d'appartenance : l'auteur doit être la personne du jeton (protection BOLA)
    if (publication.auteur.toString() !== req.utilisateurId) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres publications' });
    }

    // On ne modifie que le contenu. save() relance la validation du schéma
    const { contenu } = req.body || {};
    publication.contenu = contenu;
    await publication.save();

    res.json(publication);
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

// DELETE /api/publications/:id : supprimer, seulement par son auteur
router.delete('/:id', verifierJeton, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    // Contrôle d'appartenance, comme pour la modification
    if (publication.auteur.toString() !== req.utilisateurId) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres publications' });
    }

    // On supprime aussi ses commentaires, pour ne pas laisser de commentaires orphelins
    await Commentaire.deleteMany({ publication: publication._id });
    await publication.deleteOne();
    res.json({ message: 'Publication supprimée' });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/publications/:id/commentaires : commenter une publication
router.post('/:id/commentaires', verifierJeton, async (req, res) => {
  try {
    // On vérifie d'abord que la publication à commenter existe
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    // Seul le contenu vient du client. La publication vient de l'adresse, l'auteur du jeton
    const { contenu } = req.body || {};
    const commentaire = await Commentaire.create({
      contenu,
      publication: publication._id,
      auteur: req.utilisateurId,
    });

    res.status(201).json(commentaire);
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

// GET /api/publications/:id/commentaires : les commentaires d'une publication, du plus ancien au plus récent
router.get('/:id/commentaires', verifierJeton, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication introuvable' });
    }

    const commentaires = await Commentaire.find({ publication: publication._id })
      .sort({ createdAt: 1 }) // 1 = ordre croissant : on lit la conversation dans l'ordre
      .limit(50) // jamais plus de 50 à la fois
      .populate('auteur', 'pseudo');

    res.json(commentaires);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/publications/:id/commentaires/:commentaireId : supprimer un commentaire, seulement par son auteur
router.delete('/:id/commentaires/:commentaireId', verifierJeton, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.params.commentaireId)) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    // Le commentaire doit exister ET appartenir à la publication indiquée dans l'adresse
    const commentaire = await Commentaire.findOne({
      _id: req.params.commentaireId,
      publication: req.params.id,
    });
    if (!commentaire) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    // Contrôle d'appartenance, comme pour les publications
    if (commentaire.auteur.toString() !== req.utilisateurId) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres commentaires' });
    }

    await commentaire.deleteOne();
    res.json({ message: 'Commentaire supprimé' });
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 3. L'export : on donne le routeur à app.js, qui le branchera sur /api/publications
module.exports = router;
