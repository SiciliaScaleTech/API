const app = require('./app');
const connecterBase = require('./config/db');

// Sans clé secrète, impossible de signer ou vérifier les jetons : on refuse de démarrer
if (!process.env.JWT_SECRET) {
  console.error('Impossible de démarrer : la variable JWT_SECRET est absente du fichier .env');
  process.exit(1);
}

// port d'écoute, celui de la configuration, sinon 3000 par défaut
const PORT = process.env.PORT || 3000;

//on se connecte d'abord à la base, puis on démarre le serveur
connecterBase()
.then(() => {
    // démarrer le serveur, il attend maintenant les requêtes sur ce port
    app.listen(PORT, () => console.log(`API démarrée sur le port ${PORT}`));
})
.catch((erreur) => {
    // sans base de donnée, l'API ne peut pas fonctionner : on arrête
    console.error('Impossible de démarrer : ', erreur.message);
    process.exit(1);
});