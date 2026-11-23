# Documentation de l'API

Ce document décrit toutes les routes de l'API : ce qu'elles attendent et ce qu'elles répondent.

## Généralités

- **Adresse de base** : `http://127.0.0.1:3000/api`
- **Format** : les données envoyées et reçues sont en JSON. Pour envoyer des données, ajouter l'en-tête `Content-Type: application/json`.
- **Taille maximale** d'une requête : 10 Ko.
- **Identifiants** : chaque ressource a un identifiant MongoDB de 24 caractères hexadécimaux, par exemple `6afb00a95830eadc4684aab3`.

### Authentification

La plupart des routes sont réservées aux membres connectés. Il faut :
1. se connecter avec `POST /api/auth/connexion` pour obtenir un **jeton**
2. envoyer ce jeton dans l'en-tête de chaque requête :

```
Authorization: Bearer <jeton>
```

Le jeton est valable **1 heure**. Ensuite, il faut se reconnecter.

Dans les tableaux ci-dessous, la colonne « Jeton » indique si la route exige d'être connecté.

### Limitation des requêtes

- 300 requêtes par 15 minutes et par adresse IP, sur toute l'API
- 10 tentatives par 15 minutes pour l'inscription et la connexion

Au-delà, l'API répond `429` avec l'en-tête `Retry-After`, qui indique le nombre de secondes à attendre.

### Codes de réponse

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Données invalides : le détail est dans le champ `erreurs` |
| 401 | Non connecté : jeton absent, invalide ou expiré, ou identifiants incorrects |
| 403 | Connecté, mais pas le droit : par exemple, modifier la publication d'un autre membre |
| 404 | Ressource introuvable |
| 409 | Conflit : pseudo ou email déjà utilisé |
| 413 | Requête trop volumineuse (plus de 10 Ko) |
| 429 | Trop de requêtes |
| 500 | Erreur du serveur |

En cas d'erreur, la réponse a toujours la même forme :

```json
{ "message": "Données invalides", "erreurs": ["Le pseudo doit contenir au moins 3 caractères"] }
```

Le champ `erreurs` n'est présent que pour les erreurs 400 de validation.

## Vue d'ensemble des routes

| Méthode | Adresse | Jeton | Rôle |
|---|---|---|---|
| GET | `/api/health` | Non | Vérifier que l'API répond |
| POST | `/api/auth/inscription` | Non | Créer un compte |
| POST | `/api/auth/connexion` | Non | Se connecter et obtenir un jeton |
| GET | `/api/auth/moi` | Oui | Mon profil complet |
| POST | `/api/publications` | Oui | Publier |
| GET | `/api/publications` | Oui | Toutes les publications |
| GET | `/api/publications/fil` | Oui | Mon fil d'actualité |
| GET | `/api/publications/:id` | Oui | Une publication |
| PUT | `/api/publications/:id` | Oui | Modifier ma publication |
| DELETE | `/api/publications/:id` | Oui | Supprimer ma publication |
| POST | `/api/publications/:id/commentaires` | Oui | Commenter |
| GET | `/api/publications/:id/commentaires` | Oui | Lire les commentaires |
| DELETE | `/api/publications/:id/commentaires/:commentaireId` | Oui | Supprimer mon commentaire |
| POST | `/api/publications/:id/like` | Oui | Aimer |
| DELETE | `/api/publications/:id/like` | Oui | Ne plus aimer |
| GET | `/api/utilisateurs/:id` | Oui | Profil public d'un membre |
| GET | `/api/utilisateurs/:id/publications` | Oui | Publications d'un membre |
| POST | `/api/utilisateurs/:id/abonnement` | Oui | Suivre un membre |
| DELETE | `/api/utilisateurs/:id/abonnement` | Oui | Ne plus suivre un membre |

## Authentification

### POST /api/auth/inscription

Crée un compte.

Corps de la requête :

```json
{ "pseudo": "sicilia", "email": "sicilia@exemple.fr", "motDePasse": "MonMotDePasse123" }
```

| Champ | Règles |
|---|---|
| `pseudo` | Obligatoire, 3 à 30 caractères, unique |
| `email` | Obligatoire, format email, unique (enregistré en minuscules) |
| `motDePasse` | Obligatoire, 8 à 72 caractères |

Réponse `201` :

```json
{ "id": "6afadf54d2319c7f2deb982a", "pseudo": "sicilia", "email": "sicilia@exemple.fr" }
```

Erreurs : `400` données invalides, `409` pseudo ou email déjà utilisé, `429` trop de tentatives.

### POST /api/auth/connexion

Vérifie l'email et le mot de passe, et renvoie un jeton valable 1 heure.

Corps de la requête :

```json
{ "email": "sicilia@exemple.fr", "motDePasse": "MonMotDePasse123" }
```

Réponse `200` :

```json
{ "jeton": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Erreurs : `400` champ manquant ou qui n'est pas du texte, `401` « Email ou mot de passe incorrect » (même message si l'email n'existe pas, pour ne pas révéler les comptes inscrits), `429` trop de tentatives.

### GET /api/auth/moi

Renvoie le profil complet de la personne connectée. C'est la seule route qui renvoie l'email.

Réponse `200` :

```json
{
  "id": "6afadf54d2319c7f2deb982a",
  "pseudo": "sicilia",
  "email": "sicilia@exemple.fr",
  "bio": "",
  "abonnements": ["6afb02b406ac2e06f8414c9f"]
}
```

`abonnements` contient les identifiants des membres suivis.

## Publications

Format d'une publication dans les réponses :

```json
{
  "_id": "6afb00a95830eadc4684aab3",
  "contenu": "Ma première publication !",
  "auteur": { "_id": "6afadf54d2319c7f2deb982a", "pseudo": "sicilia" },
  "likes": ["6afb02b406ac2e06f8414c9f"],
  "createdAt": "2026-11-16T13:10:01.649Z",
  "updatedAt": "2026-11-16T13:10:01.649Z"
}
```

`likes` contient les identifiants des membres qui ont aimé la publication. Après une création ou une modification, `auteur` contient seulement l'identifiant, sans le pseudo.

### POST /api/publications

Crée une publication. L'auteur est toujours la personne du jeton.

Corps : `{ "contenu": "Bonjour !" }` (obligatoire, 500 caractères au maximum)

Réponse `201` : la publication créée. Erreur : `400` contenu vide ou trop long.

### GET /api/publications

Renvoie les 20 publications les plus récentes de tous les membres.

Réponse `200` : une liste de publications.

### GET /api/publications/fil

Renvoie les 20 publications les plus récentes des membres que je suis, et les miennes.

Réponse `200` : une liste de publications.

### GET /api/publications/:id

Renvoie une publication.

Réponse `200` : la publication. Erreur : `404` publication introuvable ou identifiant mal formé.

### PUT /api/publications/:id

Modifie le contenu d'une publication. **Réservé à son auteur.**

Corps : `{ "contenu": "Texte modifié" }`

Réponse `200` : la publication modifiée. Erreurs : `400` contenu invalide, `403` ce n'est pas ma publication, `404` publication introuvable.

### DELETE /api/publications/:id

Supprime une publication **et tous ses commentaires**. **Réservé à son auteur.**

Réponse `200` : `{ "message": "Publication supprimée" }`. Erreurs : `403` ce n'est pas ma publication, `404` publication introuvable.

## Commentaires

Format d'un commentaire :

```json
{
  "_id": "6afb0453d7223f02a1f338ae",
  "publication": "6afb00a95830eadc4684aab3",
  "contenu": "Merci Bob !",
  "auteur": { "_id": "6afadf54d2319c7f2deb982a", "pseudo": "sicilia" },
  "createdAt": "2026-11-16T13:25:39.992Z",
  "updatedAt": "2026-11-16T13:25:39.992Z"
}
```

### POST /api/publications/:id/commentaires

Ajoute un commentaire à la publication `:id`. L'auteur est la personne du jeton.

Corps : `{ "contenu": "Bravo !" }` (obligatoire, 300 caractères au maximum)

Réponse `201` : le commentaire créé. Erreurs : `400` contenu invalide, `404` publication introuvable.

### GET /api/publications/:id/commentaires

Renvoie les commentaires de la publication `:id`, du plus ancien au plus récent, 50 au maximum.

Réponse `200` : une liste de commentaires. Erreur : `404` publication introuvable.

### DELETE /api/publications/:id/commentaires/:commentaireId

Supprime un commentaire. **Réservé à l'auteur du commentaire**, même l'auteur de la publication ne peut pas le supprimer.

Réponse `200` : `{ "message": "Commentaire supprimé" }`. Erreurs : `403` ce n'est pas mon commentaire, `404` commentaire introuvable ou qui n'appartient pas à cette publication.

## Likes

### POST /api/publications/:id/like

Aime la publication. Aimer une deuxième fois ne change rien : un membre ne compte qu'une fois.

Réponse `200` : `{ "message": "Publication aimée", "nombreDeLikes": 2 }`. Erreur : `404` publication introuvable.

### DELETE /api/publications/:id/like

Retire mon like.

Réponse `200` : `{ "message": "Like retiré", "nombreDeLikes": 1 }`. Erreur : `404` publication introuvable.

## Membres et abonnements

### GET /api/utilisateurs/:id

Renvoie le profil **public** d'un membre. L'email n'est jamais renvoyé.

Réponse `200` :

```json
{ "id": "6afb02b406ac2e06f8414c9f", "pseudo": "bob_essai", "bio": "", "nombreAbonnements": 1, "nombrePublications": 2 }
```

Erreur : `404` membre introuvable.

### GET /api/utilisateurs/:id/publications

Renvoie les 20 publications les plus récentes du membre `:id`.

Réponse `200` : une liste de publications. Erreur : `404` identifiant mal formé.

### POST /api/utilisateurs/:id/abonnement

Me fait suivre le membre `:id`. Suivre une deuxième fois ne change rien.

Réponse `200` : `{ "message": "Abonnement ajouté", "nombreAbonnements": 1 }`. Erreurs : `400` on ne peut pas se suivre soi-même, `404` membre introuvable.

### DELETE /api/utilisateurs/:id/abonnement

Arrête de suivre le membre `:id`.

Réponse `200` : `{ "message": "Abonnement retiré", "nombreAbonnements": 0 }`. Erreur : `404` identifiant mal formé.

## Exemple complet avec curl

```bash
# 1. Se connecter et garder le jeton dans une variable
JETON=$(curl -s -X POST http://127.0.0.1:3000/api/auth/connexion -H "Content-Type: application/json" -d '{"email":"sicilia@exemple.fr","motDePasse":"MonMotDePasse123"}' | cut -d'"' -f4)

# 2. Publier
curl -X POST http://127.0.0.1:3000/api/publications -H "Authorization: Bearer $JETON" -H "Content-Type: application/json" -d '{"contenu":"Bonjour !"}'

# 3. Lire mon fil
curl http://127.0.0.1:3000/api/publications/fil -H "Authorization: Bearer $JETON"
```
