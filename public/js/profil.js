// =========================================================
// Page profil d'un membre (profil.html?id=...)
// Sans id dans l'adresse, on affiche mon propre profil
// =========================================================

if (!lireJeton()) {
  window.location.href = '/';
}

let moi = null; // l'utilisateur connecté
let idProfil = null; // le membre dont on regarde le profil

const boutonSuivre = document.getElementById('bouton-suivre');
const zonePublications = document.getElementById('publications');

// ---------- Démarrage ----------
async function demarrer() {
  try {
    moi = await appelerApi('/auth/moi');

    // URLSearchParams lit les paramètres de l'adresse : profil.html?id=123 donne "123"
    const parametres = new URLSearchParams(window.location.search);
    idProfil = parametres.get('id') || moi.id;

    await chargerProfil();
    await chargerPublications();
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
}

// ---------- L'identité du membre ----------
async function chargerProfil() {
  const profil = await appelerApi('/utilisateurs/' + idProfil);

  document.title = 'Réseau - ' + profil.pseudo;
  document.getElementById('profil-avatar').textContent = profil.pseudo[0].toUpperCase();
  document.getElementById('profil-pseudo').textContent = profil.pseudo;
  document.getElementById('profil-bio').textContent = profil.bio || 'Pas encore de bio';

  const pub = profil.nombrePublications;
  const abo = profil.nombreAbonnements;
  document.getElementById('profil-compteurs').textContent =
    pub + (pub > 1 ? ' publications' : ' publication') + ' · suit ' + abo + (abo > 1 ? ' membres' : ' membre');

  // Le bouton Suivre n'existe pas sur mon propre profil
  boutonSuivre.hidden = idProfil === moi.id;
  afficherBoutonSuivre();
}

// Le texte du bouton dépend de mes abonnements actuels
function afficherBoutonSuivre() {
  const jeSuis = moi.abonnements.includes(idProfil);
  boutonSuivre.textContent = jeSuis ? 'Ne plus suivre' : 'Suivre';
  boutonSuivre.setAttribute('aria-pressed', jeSuis);
}

boutonSuivre.addEventListener('click', async () => {
  const jeSuis = moi.abonnements.includes(idProfil);
  try {
    await appelerApi('/utilisateurs/' + idProfil + '/abonnement', jeSuis ? 'DELETE' : 'POST');
    // On met à jour ma liste locale, sans recharger toute la page
    if (jeSuis) {
      moi.abonnements = moi.abonnements.filter((id) => id !== idProfil);
    } else {
      moi.abonnements.push(idProfil);
    }
    afficherBoutonSuivre();
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
});

// ---------- Les publications du membre ----------
async function chargerPublications() {
  const publications = await appelerApi('/utilisateurs/' + idProfil + '/publications');
  zonePublications.replaceChildren();

  if (publications.length === 0) {
    zonePublications.append(creerElement('p', 'carte', 'Aucune publication pour l\'instant.'));
    return;
  }

  for (const publication of publications) {
    zonePublications.append(creerCartePublication(publication, moi, chargerPublications));
  }
}

// ---------- Déconnexion ----------
document.getElementById('deconnexion').addEventListener('click', () => {
  supprimerJeton();
  window.location.href = '/';
});

demarrer();
