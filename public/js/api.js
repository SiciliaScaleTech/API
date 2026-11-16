// =========================================================
// Fonctions partagées par toutes les pages :
// gestion du jeton, appel de l'API, messages, dates
// =========================================================

// ---------- Le jeton ----------
// Après la connexion, le jeton est rangé dans le navigateur (localStorage)
// pour être renvoyé à chaque appel de l'API
function lireJeton() {
  return localStorage.getItem('jeton');
}

function enregistrerJeton(jeton) {
  localStorage.setItem('jeton', jeton);
}

function supprimerJeton() {
  localStorage.removeItem('jeton');
}

// ---------- L'appel de l'API ----------
// Exemple : await appelerApi('/publications', 'POST', { contenu: 'Bonjour' })
// Renvoie les données de la réponse. Si l'API répond une erreur, lance une erreur avec son message
async function appelerApi(adresse, methode = 'GET', corps) {
  const options = { method: methode, headers: {} };

  // Si on est connecté, on joint le jeton (le "bracelet") à la requête
  const jeton = lireJeton();
  if (jeton) {
    options.headers.Authorization = 'Bearer ' + jeton;
  }

  // S'il y a des données à envoyer, on les transforme en texte JSON
  if (corps !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(corps);
  }

  const reponse = await fetch('/api' + adresse, options);
  const donnees = await reponse.json();

  // 401 : jeton absent, faux ou expiré. On oublie le jeton et on retourne à la page de connexion
  // (sauf pour la connexion elle-même, où 401 veut dire "mauvais identifiants")
  if (reponse.status === 401 && adresse !== '/auth/connexion') {
    supprimerJeton();
    window.location.href = '/';
    throw new Error('Votre session a expiré, reconnectez-vous');
  }

  // Toute autre erreur (400, 403, 404, 409, 429, 500) : on transmet le message de l'API
  if (!reponse.ok) {
    // En cas de 400, l'API donne aussi la liste détaillée des erreurs
    const texte = donnees.erreurs ? donnees.erreurs.join(' ') : donnees.message;
    throw new Error(texte);
  }

  return donnees;
}

// ---------- Les messages ----------
// Affiche un texte dans la zone #message de la page (rouge par défaut, vert si succès)
function afficherMessage(texte, type = 'erreur') {
  const zone = document.getElementById('message');
  zone.textContent = texte; // textContent : le texte n'est jamais interprété comme du HTML
  zone.classList.toggle('succes', type === 'succes');
  zone.hidden = false;
}

function cacherMessage() {
  document.getElementById('message').hidden = true;
}

// ---------- Utilitaires d'affichage ----------
// Transforme une date de l'API (2026-11-17T14:05:00.000Z) en date lisible (17/11/2026 15:05)
function formaterDate(dateIso) {
  return new Date(dateIso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

// Crée un élément HTML avec une classe et un texte
// Le texte passe par textContent : même si un utilisateur écrit <script>, il s'affiche comme du texte (protection XSS)
function creerElement(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte !== undefined) element.textContent = texte;
  return element;
}
