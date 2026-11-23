# Synthèse du projet « Réseau » pour le dossier professionnel

Titre visé : **Développeur Web et Web Mobile** (RNCP niveau 5, référentiel 2023).
Auteure : Sicilia Michelet.
Période de réalisation : du 6 au 23 novembre 2026.
Dépôt du code : GitHub, dépôt privé `SiciliaScaleTech/API`.

Ce document résume tout le travail réalisé sur le projet, compétence par compétence, pour aider à rédiger les exemples de pratique du dossier professionnel. Le détail complet (choix, justifications, difficultés, questions de jury) se trouve dans le fichier `DOSSIER-NOTES.md` du dépôt.

## Consignes de rédaction pour le dossier

- Chaque exemple de pratique suit les 5 rubriques du modèle officiel : 1. les tâches réalisées et dans quelles conditions, 2. les moyens utilisés, 3. avec qui j'ai travaillé, 4. le contexte, 5. les informations complémentaires.
- Rédiger à la première personne, avec des phrases simples et des termes professionnels.
- Ne pas utiliser de tirets longs ni de points-virgules. Utiliser le trait d'union simple, les deux-points, les virgules et les points.
- Rester fidèle à ce qui a été fait : le projet a été réalisé en formation, en étant accompagnée par un assistant d'intelligence artificielle (Claude Code) qui a expliqué chaque notion, écrit une partie du code et proposé des corrections. J'ai testé chaque fonctionnalité, validé chaque étape et répondu à des questions de compréhension. Il faut pouvoir expliquer chaque ligne à l'oral.

## 1. Présentation du projet

**Réseau** est un petit réseau social sécurisé. Les membres s'inscrivent, publient des messages, les commentent, les aiment et suivent d'autres membres. Un fil d'actualité affiche les publications des personnes suivies.

Le projet comprend :
- une **API REST** en Node.js et Express, avec une base **MongoDB**
- une **interface web** responsive en HTML, CSS et JavaScript, qui appelle l'API
- un **déploiement Docker** : une seule commande lance l'API et la base
- une **documentation** : README, documentation des 19 routes, document de sécurité

**Objectif personnel** : découvrir Node.js, Express, MongoDB et Docker, que je ne connaissais pas (je connaissais déjà JavaScript grâce à un projet de quiz), en appliquant la sécurité dès le début et non à la fin.

**Contexte** : projet personnel de formation, réalisé seule, dans une machine virtuelle Linux (VirtualBox), avec VS Code connecté en SSH. Travail découpé en 11 étapes, chacune validée par des tests et des questions de compréhension avant de passer à la suivante.

## 2. Technologies et outils

| Domaine | Outils |
|---|---|
| Serveur | Node.js 26, Express 5 |
| Base de données | MongoDB 9 (NoSQL), Mongoose 9 |
| Sécurité | bcrypt, jsonwebtoken (JWT), helmet, express-rate-limit, cors |
| Interface | HTML5 sémantique, CSS3 (flexbox, media queries, variables), JavaScript (fetch, async/await, DOM) |
| Déploiement | Docker, Docker Compose |
| Environnement | Linux Ubuntu (VirtualBox), VS Code avec Remote-SSH, Git, GitHub, curl |
| Référentiel de sécurité | OWASP API Security Top 10 (2023) |

## 3. Travail réalisé, par compétence du référentiel

### Bloc 1 : développer la partie front-end d'une application web ou web mobile sécurisée

#### Installer et configurer son environnement de travail
- Machine virtuelle Linux, VS Code relié en SSH, Node.js et npm, Docker et Docker Compose, Git.
- Projet Node initialisé (`package.json`), `.gitignore` excluant `node_modules` et les fichiers secrets.
- Secrets dans un fichier `.env` jamais versionné, avec un modèle `.env.example`.
- Scripts `npm start` et `npm run dev` (redémarrage automatique à chaque modification).
- Compréhension du transfert de port de VS Code : le serveur tourne dans la VM, VS Code ouvre le même port sur l'ordinateur à travers le tunnel SSH chiffré.

#### Maquetter des interfaces utilisateur
- 4 maquettes (wireframes) en SVG : connexion et inscription, fil d'actualité, profil d'un membre (mobile), fil d'actualité (ordinateur).
- Approche **mobile first** : conception pour le téléphone d'abord, puis adaptation au grand écran (contenu centré sur 600 px, panneau latéral).
- Les maquettes ont révélé deux manques dans l'API avant de coder : voir le profil d'un autre membre, savoir qui on suit déjà. Les routes ont été ajoutées ensuite.
- Charte graphique violet et corail, couleurs vérifiées avec la formule de contraste WCAG (minimum 4,5 pour 1). Une couleur trop claire a été foncée pour respecter ce seuil.

#### Réaliser des interfaces utilisateur statiques
- 3 pages HTML (connexion, fil, profil) et une feuille de style commune.
- HTML sémantique : `header`, `main`, `nav`, `article`, `aside`.
- Accessibilité : `lang="fr"`, un `label` pour chaque champ, `aria-live` sur les messages, contour visible au clavier, textes réservés aux lecteurs d'écran.
- CSS responsive : règles de base pour mobile, `@media (min-width: 1000px)` pour ordinateur, flexbox, variables de couleur.
- Validation dans le navigateur (`required`, `minlength`, `type="email"`) pour le confort, en sachant qu'elle ne protège pas l'API.

#### Développer la partie dynamique des interfaces
- JavaScript qui appelle l'API avec `fetch` et `async/await` : inscription, connexion, fil, onglets « Mon fil » et « Découvrir », publication avec compteur de caractères, likes, commentaires, modification, suppression, profil, abonnements, déconnexion.
- Une fonction unique `appelerApi` qui ajoute le jeton, envoie le JSON et transmet les messages d'erreur de l'API.
- Jeton conservé dans `localStorage`, effacé à la déconnexion et à l'expiration (retour automatique à la connexion sur une réponse 401).
- **Sécurité contre le XSS** : les contenus des utilisateurs sont affichés avec `createElement` et `textContent`, jamais `innerHTML`. Test : une publication `<b>test</b>` s'affiche comme du texte.
- Code partagé entre les pages (la carte d'une publication dans un seul fichier).
- Un bug trouvé en testant : un bouton caché par l'attribut `hidden` restait visible à cause d'une règle CSS. Corrigé avec `[hidden] { display: none !important }`.

### Bloc 2 : développer la partie back-end d'une application web ou web mobile sécurisée

#### Mettre en place une base de données relationnelle
- Compétence couverte par un **autre projet, InfoStock** (PHP et MySQL) : diagrammes de conception, création des tables, requêtes SQL.
- Pour l'oral : InfoStock utilise MySQL car les données ont des liens stricts entre tables (produits, fournisseurs). Le réseau social utilise MongoDB car les contenus sont nombreux et de forme souple (likes et abonnements rangés dans les documents), et MongoDB peut se répartir sur plusieurs serveurs (scalabilité horizontale).

#### Développer des composants d'accès aux données SQL et NoSQL
- MongoDB lancée dans Docker, avec un compte dédié à l'API limité à la lecture et l'écriture sur sa seule base (moindre privilège). Base accessible seulement depuis la machine.
- 3 schémas Mongoose : Utilisateur, Publication, Commentaire, avec validation (types, longueurs, formats, unicité) et messages d'erreur en français.
- Choix entre données imbriquées et références : les likes et les abonnements sont des listes d'identifiants dans le document, les commentaires sont une collection séparée qui référence la publication.
- Requêtes : création, lecture avec tri, limite et `populate` (pour afficher le pseudo de l'auteur), modification, suppression, comptage, opérateurs `$addToSet` (pas de double like), `$pull` et `$in` (fil d'actualité).
- Suppression en cascade : supprimer une publication supprime ses commentaires.

#### Développer des composants métier côté serveur
- API REST de 19 routes, organisée en routeurs (authentification, publications, utilisateurs).
- **Inscription et connexion** : mot de passe haché avec bcrypt (coût 12, sel aléatoire) dans le modèle, jeton JWT signé valable 1 heure, même message d'erreur pour un email inconnu et un mauvais mot de passe.
- **Middleware d'authentification** qui vérifie le jeton avant chaque route protégée (401 sinon).
- **Contrôle d'appartenance** : seul l'auteur peut modifier ou supprimer sa publication ou son commentaire (403 sinon). L'identité vient toujours du jeton, jamais de la requête (protection contre la faille BOLA, n°1 du OWASP API Top 10).
- Règles métier : un seul like par membre, impossible de se suivre soi-même, contenu de 500 caractères au maximum.
- Codes HTTP adaptés à chaque cas : 200, 201, 400, 401, 403, 404, 409, 413, 429, 500.
- **Sécurisation** : en-têtes de sécurité (helmet), CORS limité au front-end, limitation des requêtes (10 tentatives de connexion par 15 minutes contre la force brute), gestion des erreurs sans fuite d'informations techniques, protection contre l'injection NoSQL (trois barrières), taille des requêtes limitée, mots de passe de 8 caractères minimum, refus de démarrer sans clé secrète.
- **Audit OWASP API Security Top 10** : les 10 risques passés en revue, deux failles trouvées et corrigées (mot de passe d'une lettre accepté, démarrage possible sans clé secrète).
- Tests de chaque route avec `curl`, y compris les cas interdits, avec deux comptes de test.

#### Documenter le déploiement d'une application dynamique
- **Dockerfile** : image officielle Node 26, dépendances de production seulement, utilisateur sans droits d'administrateur. `.dockerignore` : aucun secret dans l'image (vérifié en listant le contenu de l'image).
- **docker-compose.yml** : l'API et MongoDB lancées ensemble. La base n'a aucun port ouvert vers l'extérieur, l'API n'est ouverte que sur la machine. Volume pour garder les données, script qui crée le compte de l'API au premier démarrage, l'API attend que la base soit prête.
- Test de persistance : conteneurs supprimés puis recréés, les données sont toujours là.
- **README** : prérequis, installation (mots de passe générés sans être affichés), lancement, arrêt, mise à jour, journaux, dépannage, structure du projet, mise en production avec HTTPS.
- **Documentation des 19 routes** (`docs/api.md`) et **document de sécurité** (`docs/securite.md`).
- **Validation** : le projet a été installé dans une copie neuve en suivant uniquement le README, avec succès.
- Sauvegarde sur un dépôt GitHub privé, avec une clé d'accès limitée à ce seul dépôt.

## 4. Difficultés rencontrées et solutions

| Difficulté | Solution et leçon |
|---|---|
| Mot de passe corrompu par un copier-coller (caractères invisibles) | Les secrets sont lus ou générés par des commandes, jamais copiés à la main |
| Connexion à MongoDB refusée avec `localhost` | Sur la machine, `localhost` désigne l'adresse IPv6 `::1`. Utilisation de `127.0.0.1` |
| Un copier-coller a supprimé la vérification du mot de passe, sans erreur visible | Repéré en relisant le code. Leçon : toujours tester les cas d'échec |
| L'autocomplétion a ajouté une ligne inutile et a fait planter le serveur | Lecture du message d'erreur, correction. Leçon : relire après l'autocomplétion |
| Nom de fichier mal écrit (`Utilisateurs` au lieu de `Utilisateur`) | Sous Linux, les noms de fichiers sont sensibles à chaque lettre et aux majuscules |
| Message d'erreur qui révélait les chemins des fichiers du serveur | Gestionnaire d'erreurs qui ne renvoie qu'un message court |
| Port 3000 déjà utilisé au lancement de Docker | Un seul programme par port. Arrêt du serveur de développement, recréation du conteneur |
| Site Docker inaccessible depuis le navigateur | Port déjà pris sur Windows et `localhost` en IPv6 : transfert vers `127.0.0.1:3001` |
| Dépôt GitHub créé en public par erreur | Vérifié avant l'envoi, passé en privé |

## 5. Ce que je retiens

- La sécurité se construit dès le début : chaque fonctionnalité a été pensée avec ses cas interdits.
- Le navigateur aide l'utilisateur, le serveur protège les données : tout ce qui vient du client peut être falsifié.
- La défense en profondeur : plusieurs protections indépendantes contre un même risque.
- Le moindre privilège : chaque élément (compte de base, conteneur, clé GitHub) n'a que les droits nécessaires.
- Tester pour de vrai, y compris la documentation (déploiement dans une copie neuve).

## 6. Livrables du dépôt

| Fichier | Contenu |
|---|---|
| `README.md` | Installation, lancement, arrêt, dépannage |
| `docs/api.md` | Documentation des 19 routes |
| `docs/securite.md` | Mesures de sécurité, bilan OWASP, risques acceptés |
| `docs/maquettes/` | 4 maquettes des écrans |
| `DOSSIER-NOTES.md` | Journal détaillé de chaque étape : choix, justifications, difficultés, questions de jury |
| `src/` | Code de l'API |
| `public/` | Interface web |
| `Dockerfile`, `docker-compose.yml` | Déploiement |

## 7. Points à retravailler avant l'oral

Notions que j'ai eu du mal à expliquer seule pendant le projet, avec leurs réponses modèles dans `DOSSIER-NOTES.md` :
- différence entre image et conteneur Docker, et pourquoi la base n'a pas de port publié
- CORS : à quoi il sert, et pourquoi il ne bloque pas curl
- injection NoSQL, avec l'exemple `{"$ne": null}`
- contenu d'un JWT (pas de mot de passe dedans) et rôle de la clé secrète
- différence entre 401 (authentification) et 403 (autorisation)
- rôle de `next()` dans un middleware, construction du fil d'actualité
- pourquoi cacher un bouton ne protège pas l'API
