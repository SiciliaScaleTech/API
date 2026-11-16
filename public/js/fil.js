// =========================================================
// Page du fil d'actualité (fil.html)
// =========================================================

// Pas de jeton : on n'a rien à faire ici, retour à la connexion
if (!lireJeton()) {
  window.location.href = '/';
}

let moi = null; // l'utilisateur connecté, rempli au démarrage avec /auth/moi
let ongletActif = 'fil'; // 'fil' (les gens que je suis) ou 'decouvrir' (tout le monde)

const zonePublications = document.getElementById('publications');
const formPublier = document.getElementById('form-publier');
const champContenu = document.getElementById('contenu');
const compteur = document.getElementById('compteur');

// ---------- Démarrage de la page ----------
async function demarrer() {
  try {
    moi = await appelerApi('/auth/moi');
    afficherMoi();
    await chargerPublications();
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
}

// Remplit l'en-tête et le panneau de droite avec les infos de la personne connectée
function afficherMoi() {
  document.getElementById('mon-pseudo').textContent = moi.pseudo;
  document.getElementById('panneau-avatar').textContent = moi.pseudo[0].toUpperCase();
  document.getElementById('panneau-pseudo').textContent = moi.pseudo;
  const nombre = moi.abonnements.length;
  document.getElementById('panneau-abonnements').textContent =
    'suit ' + nombre + (nombre > 1 ? ' membres' : ' membre');
}

// ---------- Les publications ----------
// Charge les publications de l'onglet actif et les affiche
async function chargerPublications() {
  const adresse = ongletActif === 'fil' ? '/publications/fil' : '/publications';
  const publications = await appelerApi(adresse);

  zonePublications.replaceChildren(); // vide la liste avant de la remplir

  if (publications.length === 0) {
    const texte = ongletActif === 'fil'
      ? 'Votre fil est vide. Publiez, ou suivez des membres depuis l\'onglet « Découvrir ».'
      : 'Aucune publication pour l\'instant.';
    zonePublications.append(creerElement('p', 'carte', texte));
    return;
  }

  for (const publication of publications) {
    zonePublications.append(creerCartePublication(publication));
  }
}

// Fabrique la carte HTML d'une publication, avec createElement et textContent (jamais innerHTML)
function creerCartePublication(publication) {
  const article = creerElement('article', 'carte publication');

  // Ligne du haut : auteur (lien vers son profil) et date
  const haut = creerElement('div', 'publication-haut');
  if (publication.auteur) {
    const lienAuteur = creerElement('a', 'auteur', publication.auteur.pseudo);
    lienAuteur.href = '/profil.html?id=' + publication.auteur._id;
    haut.append(lienAuteur);
  } else {
    haut.append(creerElement('span', 'auteur', 'Compte supprimé'));
  }
  haut.append(creerElement('time', 'date', formaterDate(publication.createdAt)));
  article.append(haut);

  // Le texte de la publication
  article.append(creerElement('p', 'contenu', publication.contenu));

  // Les actions (likes, commentaires, modifier, supprimer) : ajoutées à la partie 8d
  const actions = creerElement('div', 'actions');
  const nombreLikes = publication.likes.length;
  actions.append(creerElement('span', '', '♥ ' + nombreLikes + ' j\'aime'));
  article.append(actions);

  return article;
}

// ---------- Les onglets ----------
function choisirOnglet(onglet) {
  ongletActif = onglet;
  const estFil = onglet === 'fil';
  document.getElementById('onglet-fil').classList.toggle('actif', estFil);
  document.getElementById('onglet-decouvrir').classList.toggle('actif', !estFil);
  document.getElementById('onglet-fil').setAttribute('aria-selected', estFil);
  document.getElementById('onglet-decouvrir').setAttribute('aria-selected', !estFil);
  cacherMessage();
  chargerPublications().catch((erreur) => afficherMessage(erreur.message));
}

document.getElementById('onglet-fil').addEventListener('click', () => choisirOnglet('fil'));
document.getElementById('onglet-decouvrir').addEventListener('click', () => choisirOnglet('decouvrir'));

// ---------- Publier ----------
// Le compteur se met à jour à chaque lettre tapée
champContenu.addEventListener('input', () => {
  compteur.textContent = champContenu.value.length + ' / 500';
});

formPublier.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  cacherMessage();
  try {
    await appelerApi('/publications', 'POST', { contenu: champContenu.value });
    formPublier.reset(); // vide le champ
    compteur.textContent = '0 / 500';
    await chargerPublications(); // recharge la liste pour afficher la nouvelle publication
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
});

// ---------- Déconnexion ----------
// On oublie le jeton dans le navigateur, puis retour à la page de connexion
document.getElementById('deconnexion').addEventListener('click', () => {
  supprimerJeton();
  window.location.href = '/';
});

demarrer();
