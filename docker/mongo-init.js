// Script d'initialisation de MongoDB
// Il est exécuté UNE SEULE FOIS, au tout premier démarrage du conteneur, quand le volume de données est vide.
// Il crée le compte utilisé par l'API, limité à la lecture et à l'écriture sur sa propre base (moindre privilège).
// Les valeurs viennent des variables d'environnement transmises par docker-compose.yml.

const base = process.env.MONGO_BASE;

db.getSiblingDB(base).createUser({
  user: process.env.MONGO_UTILISATEUR,
  pwd: process.env.MONGO_MOT_DE_PASSE,
  roles: [{ role: 'readWrite', db: base }],
});
