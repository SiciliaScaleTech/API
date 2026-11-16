// =========================================================
// La carte d'une publication, utilisée par le fil ET par le profil
// Elle gère : like, commentaires, modifier et supprimer
// =========================================================

// publication : les données reçues de l'API
// moi : l'utilisateur connecté (pour savoir ce qui m'appartient)
// recharger : fonction à appeler pour réafficher la liste (après une suppression)
function creerCartePublication(publication, moi, recharger) {
  const article = creerElement('article', 'carte publication');
  const estAMoi = publication.auteur && publication.auteur._id === moi.id;

  // ---------- Ligne du haut : auteur et date ----------
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

  // ---------- Le texte ----------
  const paragraphe = creerElement('p', 'contenu', publication.contenu);
  article.append(paragraphe);

  // ---------- Les actions ----------
  const actions = creerElement('div', 'actions');
  article.append(actions);

  // Like : l'état de départ vient de la liste des likes envoyée par l'API
  let aime = publication.likes.includes(moi.id);
  let nombreLikes = publication.likes.length;
  const boutonLike = creerElement('button', 'bouton-like');
  boutonLike.type = 'button';

  function afficherLike() {
    boutonLike.textContent = (aime ? '♥' : '♡') + ' J\'aime ' + nombreLikes;
    boutonLike.classList.toggle('aime', aime);
    boutonLike.setAttribute('aria-pressed', aime); // indique l'état aux lecteurs d'écran
  }
  afficherLike();

  boutonLike.addEventListener('click', async () => {
    try {
      // Si j'aime déjà : DELETE pour retirer, sinon POST pour ajouter
      const reponse = await appelerApi('/publications/' + publication._id + '/like', aime ? 'DELETE' : 'POST');
      aime = !aime;
      nombreLikes = reponse.nombreDeLikes; // le nombre exact vient de l'API
      afficherLike();
    } catch (erreur) {
      afficherMessage(erreur.message);
    }
  });
  actions.append(boutonLike);

  // Bouton qui ouvre ou ferme les commentaires
  const boutonCommentaires = creerElement('button', 'lien', 'Commentaires');
  boutonCommentaires.type = 'button';
  boutonCommentaires.setAttribute('aria-expanded', 'false');
  actions.append(boutonCommentaires);

  // Modifier et Supprimer : seulement sur mes publications (l'API vérifie aussi, avec un 403)
  if (estAMoi) {
    const actionsAuteur = creerElement('span', 'actions-auteur');
    const boutonModifier = creerElement('button', 'lien', 'Modifier');
    boutonModifier.type = 'button';
    const boutonSupprimer = creerElement('button', 'lien danger', 'Supprimer');
    boutonSupprimer.type = 'button';
    actionsAuteur.append(boutonModifier, boutonSupprimer);
    actions.append(actionsAuteur);

    boutonModifier.addEventListener('click', () => ouvrirModification(article, paragraphe, publication));

    boutonSupprimer.addEventListener('click', async () => {
      // confirm : petite fenêtre du navigateur pour éviter une suppression par erreur
      if (!confirm('Supprimer cette publication et ses commentaires ?')) return;
      try {
        await appelerApi('/publications/' + publication._id, 'DELETE');
        await recharger();
      } catch (erreur) {
        afficherMessage(erreur.message);
      }
    });
  }

  // ---------- Les commentaires (cachés au départ) ----------
  const zoneCommentaires = creerElement('div', 'commentaires');
  zoneCommentaires.hidden = true;
  article.append(zoneCommentaires);

  boutonCommentaires.addEventListener('click', async () => {
    zoneCommentaires.hidden = !zoneCommentaires.hidden;
    boutonCommentaires.setAttribute('aria-expanded', !zoneCommentaires.hidden);
    // On ne charge les commentaires que quand on les ouvre : moins de requêtes vers l'API
    if (!zoneCommentaires.hidden) {
      await chargerCommentaires(zoneCommentaires, boutonCommentaires, publication, moi);
    }
  });

  return article;
}

// Remplace le texte par un champ de modification, avec Enregistrer et Annuler
function ouvrirModification(article, paragraphe, publication) {
  const formulaire = creerElement('form', 'modification');
  const champ = creerElement('textarea');
  champ.value = paragraphe.textContent;
  champ.maxLength = 500;
  champ.rows = 3;
  champ.required = true;
  champ.setAttribute('aria-label', 'Modifier la publication');
  const boutons = creerElement('div', 'publier-bas');
  const enregistrer = creerElement('button', 'bouton petit', 'Enregistrer');
  enregistrer.type = 'submit';
  const annuler = creerElement('button', 'lien', 'Annuler');
  annuler.type = 'button';
  boutons.append(annuler, enregistrer);
  formulaire.append(champ, boutons);

  paragraphe.replaceWith(formulaire); // le formulaire prend la place du texte
  champ.focus();

  annuler.addEventListener('click', () => formulaire.replaceWith(paragraphe));

  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    try {
      const misAJour = await appelerApi('/publications/' + publication._id, 'PUT', { contenu: champ.value });
      paragraphe.textContent = misAJour.contenu;
      formulaire.replaceWith(paragraphe);
    } catch (erreur) {
      afficherMessage(erreur.message);
    }
  });
}

// Charge et affiche les commentaires d'une publication, avec le formulaire pour en ajouter
async function chargerCommentaires(zone, boutonCommentaires, publication, moi) {
  try {
    const commentaires = await appelerApi('/publications/' + publication._id + '/commentaires');
    zone.replaceChildren();
    boutonCommentaires.textContent = 'Commentaires (' + commentaires.length + ')';

    for (const commentaire of commentaires) {
      const ligne = creerElement('p');
      const pseudo = commentaire.auteur ? commentaire.auteur.pseudo : 'Compte supprimé';
      ligne.append(creerElement('strong', '', pseudo), ' ' + commentaire.contenu);

      // Supprimer : seulement sur mes commentaires
      if (commentaire.auteur && commentaire.auteur._id === moi.id) {
        const supprimer = creerElement('button', 'lien danger', 'Supprimer');
        supprimer.type = 'button';
        supprimer.addEventListener('click', async () => {
          try {
            await appelerApi('/publications/' + publication._id + '/commentaires/' + commentaire._id, 'DELETE');
            await chargerCommentaires(zone, boutonCommentaires, publication, moi);
          } catch (erreur) {
            afficherMessage(erreur.message);
          }
        });
        ligne.append(' ', supprimer);
      }
      zone.append(ligne);
    }

    // Formulaire pour ajouter un commentaire
    const formulaire = creerElement('form', 'form-commentaire');
    const champ = creerElement('input');
    champ.type = 'text';
    champ.maxLength = 300;
    champ.required = true;
    champ.placeholder = 'Écrire un commentaire';
    champ.setAttribute('aria-label', 'Votre commentaire');
    const envoyer = creerElement('button', 'bouton petit', 'Envoyer');
    envoyer.type = 'submit';
    formulaire.append(champ, envoyer);
    zone.append(formulaire);

    formulaire.addEventListener('submit', async (evenement) => {
      evenement.preventDefault();
      try {
        await appelerApi('/publications/' + publication._id + '/commentaires', 'POST', { contenu: champ.value });
        await chargerCommentaires(zone, boutonCommentaires, publication, moi);
      } catch (erreur) {
        afficherMessage(erreur.message);
      }
    });
  } catch (erreur) {
    afficherMessage(erreur.message);
  }
}
