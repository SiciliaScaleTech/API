const app = require('./app');
const connecterBase = require('./config/db');

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