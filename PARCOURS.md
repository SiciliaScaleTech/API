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
- [x] Mot de passe haché (bcrypt)
- [x] Connexion avec JWT
- [x] Middleware d'authentification
- [x] Je sais expliquer hachage, salage, JWT, et pourquoi on ne stocke jamais un mot de passe en clair (questions faites le 2026-11-16)
- Validation : inscription, connexion, accès refusé sans jeton (réussie le 2026-11-16 avec `curl`)

### Étape 5 - Fonctionnalités du réseau social (Bloc 2, composants métier)
- [x] Publications : créer, lire, modifier, supprimer (CRUD)
- [x] Commentaires et likes
- [x] Abonnements entre utilisateurs, fil d'actualité
- [x] Un utilisateur ne peut modifier que ses propres contenus
- Validation : tests de chaque route, y compris les cas interdits (réussie le 2026-11-17 avec `curl` et deux comptes de test)

### Étape 6 - Sécurisation (Bloc 2)
- [x] Validation des entrées et protection contre l'injection NoSQL
- [x] En-têtes de sécurité (helmet), CORS, limitation du nombre de requêtes
- [x] Gestion propre des erreurs, sans fuite d'informations
- [x] Contrôle avec la liste OWASP API Top 10 (bilan dans `docs/securite.md`)
- Validation : tentatives d'attaque simples qui échouent (réussie le 2026-11-17 : injections, force brute, JSON mal formé, corps trop gros, mot de passe faible)

### Étape 7 - Base relationnelle (Bloc 2, base de données relationnelle)
- [x] À décider ensemble : quelle partie du projet ou quel autre projet couvre la compétence SQL
- Décision du 2026-11-18 : la compétence est couverte par le projet InfoStock (PHP/MySQL), qui contient la conception (diagrammes), la création des tables et les requêtes SQL. Pas de partie SQL ajoutée à cette API.

### Étape 8 - Interface front-end (Bloc 1)
- [x] Maquettes des écrans (connexion, fil d'actualité, profil), dans `docs/maquettes/`
- [x] Pages HTML/CSS statiques
- [x] JavaScript qui appelle l'API (fetch) pour afficher et envoyer les données
- Validation : parcours complet inscription, connexion, publication, depuis le navigateur (réussie le 2026-11-18)

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
