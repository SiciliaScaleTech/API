// Script d'essai de l'étape 3 : vérifier que les trois modèles fonctionnent.
// Lancement : node --env-file=.env scripts/essai-modeles.js
// Les documents créés sont supprimés à la fin pour laisser la base propre.

const mongoose = require('mongoose');
const connecterBase = require('../src/config/db');
const Utilisateur = require('../src/models/Utilisateur');
const Publication = require('../src/models/Publication');
const Commentaire = require('../src/models/Commentaire');

async function essai() {
  await connecterBase();

  // 1. Créer un utilisateur (faux mot de passe : il n'est pas encore haché)
  const alice = await Utilisateur.create({
    pseudo: 'essai_alice',
    email: 'Essai.Alice@Exemple.fr', // majuscules exprès : lowercase doit les enlever
    motDePasse: 'pas-un-vrai-mot-de-passe',
  });
  console.log('\n1. Utilisateur créé :', alice.pseudo, '/', alice.email);

  // 2. Créer une publication écrite par cet utilisateur (on stocke son _id)
  const publi = await Publication.create({
    contenu: 'Ma première publication de test',
    auteur: alice._id,
  });
  console.log('2. Publication créée, auteur =', publi.auteur);

  // 3. Créer un commentaire sur cette publication
  const com = await Commentaire.create({
    contenu: 'Premier commentaire de test',
    publication: publi._id,
    auteur: alice._id,
  });
  console.log('3. Commentaire créé, publication =', com.publication);

  // 4. Relire le commentaire. populate remplace les identifiants par les documents
  const relu = await Commentaire.findById(com._id)
    .populate('auteur', 'pseudo')
    .populate('publication', 'contenu');
  console.log('\n4. Commentaire relu depuis la base :');
  console.log('   texte       :', relu.contenu);
  console.log('   auteur      :', relu.auteur.pseudo);
  console.log('   publication :', relu.publication.contenu);
  console.log('   créé le     :', relu.createdAt);

  // 5. Le mot de passe ne doit pas revenir dans une recherche (select: false)
  const aliceRelue = await Utilisateur.findById(alice._id);
  console.log('\n5. Mot de passe renvoyé par la recherche ?', aliceRelue.motDePasse);

  // 6. Une donnée invalide doit être refusée par le schéma
  try {
    await Utilisateur.create({ pseudo: 'ab', email: 'pas-un-email', motDePasse: 'x' });
    console.log('6. PROBLÈME : la donnée invalide a été acceptée');
  } catch (erreur) {
    console.log('\n6. Donnée invalide refusée, messages :');
    for (const champ in erreur.errors) {
      console.log('   -', erreur.errors[champ].message);
    }
  }

  // Ménage : on supprime les documents d'essai
  await Commentaire.deleteOne({ _id: com._id });
  await Publication.deleteOne({ _id: publi._id });
  await Utilisateur.deleteOne({ _id: alice._id });
  console.log('\nDocuments d\'essai supprimés.');
}

essai()
  .catch((erreur) => console.error('Erreur :', erreur.message))
  .finally(() => mongoose.disconnect());
