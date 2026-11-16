# Parcours guidé - API de réseau social

Chaque étape se termine par une validation. On ne passe à la suivante qu'une fois la case cochée.

## Compétences évaluées
- **Bloc 1 - Front-end sécurisé** : environnement de travail, maquettes, interfaces statiques, interfaces dynamiques.
- **Bloc 2 - Back-end sécurisé** : base de données relationnelle, accès aux données SQL et NoSQL, composants métier côté serveur, documentation du déploiement.

## Étapes

### Étape 0 - Environnement de travail (Bloc 1)
- [x] Node.js, npm, Docker et Docker Compose installés
- [x] Dépôt Git initialisé, .gitignore en place
- [x] Je sais expliquer à quoi servent package.json, node_modules et .env
- Validation : `node -v`, `docker -v`, `npm install` sans erreur

### Étape 1 - Serveur de base (Bloc 2, composants métier)
- [x] Serveur Express qui répond sur `/api/health`
- [x] Je sais expliquer ce qu'est une route, une requête, une réponse, un middleware
- Validation : `curl http://localhost:3000/api/health` renvoie `{"status":"ok"}`

### Étape 2 - Base MongoDB avec Docker (Bloc 2, accès aux données NoSQL)
- [x] MongoDB lancée dans un conteneur
- [x] L'API se connecte à la base
- [x] Je sais expliquer la différence entre SQL et NoSQL, collection et document
- Validation : message « Connecté à MongoDB » au démarrage

### Étape 3 - Modèles de données (Bloc 2, accès aux données NoSQL)
- [x] Schémas Mongoose : utilisateur, publication, commentaire
- [x] Choix documentés : données imbriquées ou références
- [x] Je sais expliquer mes choix de modèles devant le jury (questions faites le 2026-11-16)
- Validation : création et lecture d'un document de chaque type (réussie le 2026-11-06 avec `scripts/essai-modeles.js`)

### Étape 4 - Inscription et connexion (Bloc 2, composants métier, sécurité)
- [ ] Mot de passe haché (bcrypt)
- [ ] Connexion avec JWT
- [ ] Middleware d'authentification
- [ ] Je sais expliquer hachage, salage, JWT, et pourquoi on ne stocke jamais un mot de passe en clair
- Validation : inscription, connexion, accès refusé sans jeton

### Étape 5 - Fonctionnalités du réseau social (Bloc 2, composants métier)
- [ ] Publications : créer, lire, modifier, supprimer (CRUD)
- [ ] Commentaires et likes
- [ ] Abonnements entre utilisateurs, fil d'actualité
- [ ] Un utilisateur ne peut modifier que ses propres contenus
- Validation : tests de chaque route, y compris les cas interdits

### Étape 6 - Sécurisation (Bloc 2)
- [ ] Validation des entrées et protection contre l'injection NoSQL
- [ ] En-têtes de sécurité (helmet), CORS, limitation du nombre de requêtes
- [ ] Gestion propre des erreurs, sans fuite d'informations
- [ ] Contrôle avec la liste OWASP API Top 10
- Validation : tentatives d'attaque simples qui échouent

### Étape 7 - Base relationnelle (Bloc 2, base de données relationnelle)
- [ ] À décider ensemble : quelle partie du projet ou quel autre projet couvre la compétence SQL
- Rappel : InfoStock (PHP/MySQL) peut déjà la couvrir

### Étape 8 - Interface front-end (Bloc 1)
- [ ] Maquettes des écrans (connexion, fil d'actualité, profil)
- [ ] Pages HTML/CSS statiques
- [ ] JavaScript qui appelle l'API (fetch) pour afficher et envoyer les données
- Validation : parcours complet inscription, connexion, publication, depuis le navigateur

### Étape 9 - Docker (Bloc 2, documentation du déploiement)
- [ ] Dockerfile de l'API
- [ ] docker-compose.yml : API + MongoDB
- [ ] Variables d'environnement, volume pour les données, base non exposée à l'extérieur
- Validation : `docker compose up` lance tout depuis zéro

### Étape 10 - Documentation du déploiement (Bloc 2)
- [ ] README : prérequis, installation, lancement, arrêt
- [ ] Documentation des routes de l'API
- [ ] Document de sécurité : chaque mesure et sa justification
- Validation : une personne extérieure peut déployer le projet en suivant uniquement le README

### Étape 11 - Révision pour l'oral
- [ ] Fiche de révision par étape à partir de DOSSIER-NOTES.md
- [ ] Questions de jury et réponses entraînées à voix haute
- [ ] Entraînement à la présentation de projet (35 min avec diaporama) et à l'entretien technique (40 min)

### Étape 12 - Anglais technique (questionnaire professionnel)
Le jour de l'examen, le questionnaire professionnel (30 min) demande de lire une documentation technique en anglais, puis de répondre à 2 questions à choix unique en français et à 2 questions ouvertes courtes en anglais.
- [ ] Lire en anglais les pages d'introduction de la documentation Docker, MongoDB et Express
- [ ] Faire un lexique des termes techniques (container, image, volume, endpoint, middleware, token, schema)
- [ ] S'entraîner à répondre en 2 ou 3 phrases simples en anglais
