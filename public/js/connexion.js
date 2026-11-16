// =========================================================
// Page de connexion et d'inscription (index.html)
// =========================================================

// Déjà connecté ? On va directement au fil
// (si le jeton a expiré, la page du fil recevra un 401 et nous renverra ici)
if (lireJeton()) {
  window.location.href = '/fil.html';
}

const ongletConnexion = document.getElementById('onglet-connexion');
const ongletInscription = document.getElementById('onglet-inscription');
const formConnexion = document.getElementById('form-connexion');
const formInscription = document.getElementById('form-inscription');

// ---------- Les onglets ----------
// Affiche un formulaire, cache l'autre, et met à jour l'état des onglets
function choisirOnglet(estConnexion) {
  formConnexion.hidden = !estConnexion;
  formInscription.hidden = estConnexion;
  ongletConnexion.classList.toggle('actif', estConnexion);
  ongletInscription.classList.toggle('actif', !estConnexion);
  ongletConnexion.setAttribute('aria-selected', estConnexion);
  ongletInscription.setAttribute('aria-selected', !estConnexion);
  cacherMessage();
}

ongletConnexion.addEventListener('click', () => choisirOnglet(true));
ongletInscription.addEventListener('click', () => choisirOnglet(false));

// ---------- Se connecter ----------
// Envoie l'email et le mot de passe, range le jeton reçu, puis va au fil
async function seConnecter(email, motDePasse) {
  const donnees = await appelerApi('/auth/connexion', 'POST', { email, motDePasse });
  enregistrerJeton(donnees.jeton);
  window.location.href = '/fil.html';
}

formConnexion.addEventListener('submit', async (evenement) => {
  evenement.preventDefault(); // empêche le navigateur de recharger la page
  cacherMessage();
  try {
    await seConnecter(
      document.getElementById('connexion-email').value,
      document.getElementById('connexion-mdp').value
    );
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
});

// ---------- Créer un compte ----------
// Crée le compte, puis connecte directement la personne
formInscription.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  cacherMessage();
  const email = document.getElementById('inscription-email').value;
  const motDePasse = document.getElementById('inscription-mdp').value;
  try {
    await appelerApi('/auth/inscription', 'POST', {
      pseudo: document.getElementById('inscription-pseudo').value,
      email,
      motDePasse,
    });
    await seConnecter(email, motDePasse);
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
});
