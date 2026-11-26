# Réseau : API de réseau social sécurisée

Réseau est un petit réseau social : les membres publient des messages, les commentent, les aiment et suivent d'autres membres. Le projet comprend une API REST sécurisée et une interface web adaptée au mobile.

## Fonctionnalités

- Inscription et connexion, avec mot de passe haché et jeton d'authentification (JWT)
- Publications : créer, lire, modifier, supprimer
- Commentaires et likes
- Abonnements entre membres et fil d'actualité
- Profil public de chaque membre
- Interface web responsive (mobile et ordinateur)

## Technologies

| Rôle | Technologie |
|---|---|
| Serveur | Node.js 26, Express 5 |
| Base de données | MongoDB 9, Mongoose |
| Authentification | bcrypt, JSON Web Token |
| Sécurité | helmet, express-rate-limit, cors |
| Interface | HTML, CSS, JavaScript (sans framework) |
| Déploiement | Docker, Docker Compose |

## Prérequis

Ce guide s'adresse à une personne à l'aise avec un terminal Linux : se déplacer dans les dossiers, lancer des commandes, utiliser `sudo`.

- **Docker** et **Docker Compose** (version 2, commande `docker compose`)
- **Git**, pour récupérer le projet
- **OpenSSL**, pour générer les mots de passe (présent sur la plupart des systèmes Linux et macOS)

Node.js n'est pas nécessaire pour lancer le projet avec Docker. Il ne sert qu'au mode développement (voir plus bas).

Les commandes `docker` ci-dessous peuvent demander `sudo` selon la configuration de la machine.

## Installation

### 1. Récupérer le projet

```bash
git clone <adresse-du-depot> reseau-social-api
cd reseau-social-api
```

### 2. Créer les fichiers de configuration

Le projet a besoin de deux fichiers secrets, qui ne sont jamais envoyés sur Git :
- `.env` : configuration de l'API (compte de la base, clé des jetons)
- `.env.mongo` : compte administrateur de MongoDB

On les crée à partir des modèles, puis on remplace chaque mot de passe par une valeur aléatoire. Les commandes écrivent directement dans les fichiers : les secrets ne s'affichent jamais à l'écran.

```bash
cp .env.example .env
cp .env.mongo.example .env.mongo
sed -i "s/^MONGO_MOT_DE_PASSE=.*/MONGO_MOT_DE_PASSE=$(openssl rand -hex 24)/" .env
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 64)/" .env
sed -i "s/^MONGO_INITDB_ROOT_PASSWORD=.*/MONGO_INITDB_ROOT_PASSWORD=$(openssl rand -hex 24)/" .env.mongo
chmod 600 .env .env.mongo
```

`chmod 600` réserve la lecture de ces fichiers à leur propriétaire.

Les autres valeurs de `.env` peuvent rester telles quelles. Leur rôle est décrit dans le tableau suivant.

| Variable | Rôle |
|---|---|
| `PORT` | Port d'écoute de l'API dans le conteneur (3000) |
| `MONGO_UTILISATEUR`, `MONGO_MOT_DE_PASSE` | Compte utilisé par l'API pour accéder à la base. Il est créé automatiquement au premier démarrage. |
| `MONGO_HOTE` | Adresse de la base. Docker Compose la remplace par `mongo`. |
| `MONGO_BASE` | Nom de la base de données |
| `JWT_SECRET` | Clé secrète qui signe les jetons de connexion. Elle doit rester longue et aléatoire. |
| `CORS_ORIGINE` | Seul site autorisé à appeler l'API depuis un autre domaine |

## Lancement

```bash
docker compose up -d --build
```

- `up` crée et démarre les deux services : `api` et `mongo`
- `-d` les lance en arrière-plan
- `--build` fabrique l'image de l'API à partir du `Dockerfile`

Au premier lancement, MongoDB s'initialise et crée le compte de l'API. Comptez environ 30 secondes.

Vérifier que tout fonctionne :

```bash
docker compose ps
```

Les deux services doivent être `Up`, et `mongo` doit indiquer `(healthy)`. Puis :

```bash
curl http://127.0.0.1:3000/api/health
```

La réponse attendue est `{"status":"ok"}`.

L'application est alors disponible dans un navigateur, sur la machine qui l'héberge, à l'adresse **http://127.0.0.1:3000**. Il suffit de créer un compte avec l'onglet « Inscription ».

## Arrêt

| Commande | Effet |
|---|---|
| `docker compose stop` | Arrête les conteneurs sans les supprimer. Relancer avec `docker compose start`. |
| `docker compose down` | Arrête et supprime les conteneurs. Les données sont conservées dans le volume. |
| `docker compose down -v` | Supprime aussi le volume : **toutes les données sont effacées**, sans retour possible. |

Les conteneurs redémarrent automatiquement avec la machine, sauf s'ils ont été arrêtés avec `stop` ou `down`.

## Mise à jour

```bash
git pull
docker compose up -d --build
```

L'image de l'API est reconstruite et son conteneur est remplacé. Les données de la base sont conservées.

## Consulter les journaux

```bash
docker compose logs api
docker compose logs mongo
```

Ajouter `-f` pour suivre les messages en direct, et `Ctrl+C` pour arrêter de les suivre.

## Dépannage

| Problème | Cause et solution |
|---|---|
| `address already in use` sur le port 3000 | Un autre programme utilise déjà le port 3000, par exemple l'API lancée avec `npm run dev`. L'arrêter, puis relancer `docker compose up -d --force-recreate api`. |
| `localhost:3000` ne répond pas, mais `127.0.0.1:3000` oui | Sur certaines machines, `localhost` désigne l'adresse IPv6 `::1`, alors que l'API n'écoute que sur l'adresse IPv4 `127.0.0.1`. Utiliser `127.0.0.1`. |
| Accès depuis une machine virtuelle avec VS Code | Dans l'onglet « Ports » de VS Code, transférer `127.0.0.1:3000`, puis ouvrir l'adresse indiquée dans la colonne « Adresse transférée ». |
| Message « Trop de requêtes » | L'API limite le nombre de requêtes par adresse IP. Attendre 15 minutes, ou redémarrer le conteneur de l'API. |
| `api` redémarre en boucle | Lire `docker compose logs api`. Une variable manque souvent dans `.env` : l'API refuse de démarrer sans `JWT_SECRET` ni accès à la base. |

## Mode développement, sans Docker pour l'API

Pour modifier le code avec un redémarrage automatique à chaque enregistrement :

1. Installer Node.js 26, puis les dépendances avec `npm install`.
2. Lancer une base MongoDB accessible sur `127.0.0.1:27017`, avec le compte décrit dans `.env`.
3. Dans `.env`, garder `MONGO_HOTE=127.0.0.1`.
4. Lancer `npm run dev`.

Ne pas lancer `npm run dev` et `docker compose up` en même temps : les deux utilisent le port 3000.

## Structure du projet

```
reseau-social-api/
├── src/
│   ├── server.js            Démarrage : connexion à la base, puis écoute du port
│   ├── app.js               Application Express : sécurité, routes, gestion des erreurs
│   ├── config/db.js         Connexion à MongoDB
│   ├── models/              Schémas Mongoose : Utilisateur, Publication, Commentaire
│   ├── routes/              Routes de l'API : auth, publications, utilisateurs
│   ├── middlewares/         Vérification du jeton, limitation des requêtes
│   └── utils/               Fonctions utilitaires
├── public/                  Interface web : pages HTML, CSS et JavaScript
├── docker/mongo-init.js     Création du compte de l'API au premier démarrage de MongoDB
├── docs/
│   ├── api.md               Documentation des routes de l'API
│   ├── securite.md          Mesures de sécurité et bilan OWASP
│   └── maquettes/           Maquettes des écrans
├── Dockerfile               Recette de l'image de l'API
├── docker-compose.yml       Lancement de l'API et de MongoDB ensemble
├── .env.example             Modèle de configuration de l'API
└── .env.mongo.example       Modèle de configuration de MongoDB
```

## Documentation complémentaire

- [Documentation des routes de l'API](docs/api.md)
- [Sécurité du projet](docs/securite.md)

## Déploiement en ligne (Render et MongoDB Atlas)

Le projet est déployé gratuitement : l'API et l'interface sur **Render**, la base sur **MongoDB Atlas**.

### MongoDB Atlas
1. Créer un cluster gratuit (M0), en Europe.
2. Créer un utilisateur de base de données dédié à l'API, avec seulement le droit `readWrite` sur la base `reseau_social` (privilège spécifique), et un mot de passe généré automatiquement.
3. Dans la liste d'accès IP, autoriser `0.0.0.0/0` : l'offre gratuite de Render n'a pas d'adresse IP fixe.
4. Récupérer l'adresse de connexion (« Connect », puis « Drivers »), y mettre le mot de passe, et **ajouter le nom de la base** avant le `?` :
   `mongodb+srv://utilisateur:mot-de-passe@cluster.xxxxx.mongodb.net/reseau_social?retryWrites=true&w=majority`
   Sans le nom de la base, MongoDB utilise la base `test`, où l'utilisateur n'a aucun droit (erreur `user is not allowed to do action [find] on [test.utilisateurs]`).

### Render
1. Créer un « Web Service » relié au dépôt GitHub, avec le langage **Docker** : Render construit l'image avec le `Dockerfile`.
2. Variables d'environnement :

| Variable | Valeur |
|---|---|
| `MONGO_URI` | l'adresse de connexion d'Atlas |
| `JWT_SECRET` | une valeur aléatoire (bouton « Generate » de Render) |
| `TRUST_PROXY` | `1`, pour lire la vraie adresse IP des visiteurs derrière le proxy de Render |

3. Health Check Path : `/api/health`.
4. Chaque `git push` sur la branche `main` redéploie automatiquement le site.

Render fournit le HTTPS et redirige automatiquement `http://` vers `https://`. Avec l'offre gratuite, le service se met en veille après 15 minutes sans visite : la visite suivante met environ 50 secondes à répondre.

## Mise en production

En l'état, l'API n'écoute que sur la machine elle-même (`127.0.0.1`). Pour l'ouvrir sur Internet, il faut placer devant elle un serveur web (par exemple Nginx ou Caddy) qui assure le **HTTPS**. Sans HTTPS, les mots de passe et les jetons circuleraient en clair. Il faut alors aussi mettre à jour `CORS_ORIGINE` avec l'adresse publique du site.
