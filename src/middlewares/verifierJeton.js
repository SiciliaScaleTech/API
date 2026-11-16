const jwt = require('jsonwebtoken');

// Middleware : vérifie le jeton avant de laisser passer la requête vers la route
function verifierJeton(req, res, next) {
  // Le jeton arrive dans l'en-tête Authorization, sous la forme "Bearer eyJ..."
  const entete = req.headers.authorization || '';

  // Pas d'en-tête, ou pas le bon format : on arrête là
  if (!entete.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Jeton manquant' });
  }

  // On garde seulement le jeton, sans le mot "Bearer"
  const jeton = entete.split(' ')[1];

  try {
    // Vérifie la signature et la date d'expiration avec notre clé secrète
    const contenu = jwt.verify(jeton, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // On note l'id de l'utilisateur dans la requête, pour que la route sache qui c'est
    req.utilisateurId = contenu.id;

    // Tout est bon : on laisse passer vers la route
    next();
  } catch (erreur) {
    // Signature fausse ou jeton expiré
    return res.status(401).json({ message: 'Jeton invalide ou expiré' });
  }
}

module.exports = verifierJeton;
