// Transforme une erreur de validation Mongoose en liste de messages pour le client,
// sans révéler de détails techniques (nom des modèles, bibliothèque utilisée...)
function messagesValidation(erreur) {
  return Object.values(erreur.errors).map((e) => {
    // CastError : la valeur n'a pas le bon type (par exemple un objet au lieu d'un texte).
    // Le message d'origine de Mongoose révèle des détails internes, on le remplace
    if (e.name === 'CastError') {
      return `Le champ ${e.path} a un format invalide`;
    }

    // Sinon, ce sont nos propres messages, écrits dans les schémas : on peut les montrer
    return e.message;
  });
}

module.exports = messagesValidation;
