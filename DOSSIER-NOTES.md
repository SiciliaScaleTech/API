# Notes pour le dossier professionnel

Ce fichier est complété à chaque étape : ce qui a été fait, les choix techniques et leur justification.

## Où ces notes serviront dans le dossier professionnel
L'API alimente deux exemples de pratique professionnelle de l'activité-type 2 (back-end) :
- Exemple A : « API REST de réseau social "Fil d'actualité" avec stockage NoSQL » (étapes 1 à 5 de PARCOURS.md)
- Exemple B : « Sécurisation et documentation du déploiement de l'API de réseau social » (étapes 6, 9 et 10)

Chaque exemple suit les 5 rubriques du modèle officiel. Les notes sont donc classées ainsi :
1. Tâches ou opérations effectuées, et conditions
2. Moyens utilisés (outils, langages, bibliothèques, extraits de code commentés)
3. Avec qui j'ai travaillé
4. Contexte (organisme, période)
5. Informations complémentaires (améliorations possibles)

## Exemple A - API REST avec stockage NoSQL
### 1. Tâches effectuées
(à compléter)
### 2. Moyens utilisés
(à compléter)
### 5. Améliorations possibles
(à compléter)

## Exemple B - Sécurisation et documentation du déploiement
### 1. Tâches effectuées
(à compléter)
### 2. Moyens utilisés
(à compléter)
### 5. Améliorations possibles
(à compléter)

## Journal des étapes (choix techniques et justifications)
### Étape 0 - Environnement (validée)

**Ce qui a été fait**
- Réorganisation du projet : le code est dans `src/`, comme l'indique `package.json`. Les fichiers `gitignore` et `env.example` ont été renommés en `.gitignore` et `.env.example`. Sans le point, Git ignorait le fichier d'exclusion et `.env` aurait pu être publié.
- Dépôt Git initialisé. Le fichier `.env` est bien exclu du suivi (vérifié avec `git check-ignore .env`).
- Windows 11 mis à niveau depuis la version 21H2, qui ne recevait plus de correctifs de sécurité.
- Mise en place d'un serveur de développement dans une machine virtuelle, à la place de Docker Desktop.

**Choix techniques et justifications**
- VirtualBox 7.2 : gratuit, open source, déjà utilisé sur le poste.
- Ubuntu Server 26.04 LTS, sans interface graphique : mises à jour de sécurité garanties jusqu'en 2031, système léger et proche d'un vrai serveur de production.
- Machine virtuelle de 4 Go de RAM et 2 processeurs. Disque VDI dynamique de 40 Go : il n'occupe sur le disque de l'hôte que l'espace réellement utilisé.
- Partitionnement LVM, avec la racine étendue à 38 Go : permet d'agrandir les volumes plus tard.
- Pas de chiffrement du disque (LUKS) : il faudrait saisir une phrase de passe à chaque démarrage, ce qui empêche la connexion SSH directe. Le gain est faible pour une machine de développement sans données réelles.
- Réseau NAT avec deux redirections de ports limitées à `127.0.0.1` : 2222 vers 22 pour SSH, 3000 vers 3000 pour l'API. La machine n'est joignable que depuis le poste, pas depuis le reste du réseau local.
- Système mis à jour dès l'installation (`apt upgrade`). Le service `unattended-upgrades` installe ensuite les correctifs de sécurité chaque jour.
- Docker Engine 29.9 et Docker Compose 5.7, installés depuis le dépôt officiel de Docker avec vérification de signature (clé dans `/etc/apt/keyrings`). Le paquet Snap proposé par l'installateur a été écarté, car il n'est pas maintenu par Docker.
- Node.js 26 LTS et npm 11, depuis le dépôt signé de NodeSource. Node.js 26 est maintenu jusqu'en 2029, alors que la version des dépôts Ubuntu (22) arrive en fin de vie en avril 2027.
- Git 2.53.
- VS Code sur Windows, relié au serveur par l'extension Remote-SSH : l'éditeur reste sur le poste, le code et les outils s'exécutent sur le serveur.

**Sécurité du serveur**
- Empreinte de la clé d'hôte SSH vérifiée à la première connexion. Protège contre l'attaque de l'homme du milieu.
- Authentification par une clé SSH ED25519 dédiée à ce serveur. Elle est protégée par une phrase de passe différente du mot de passe du compte, pour éviter la réutilisation d'un même secret.
- Connexion par mot de passe et connexion directe en root désactivées, dans `/etc/ssh/sshd_config.d/10-securite.conf`. Test réalisé : une connexion sans clé est refusée (`Permission denied (publickey)`).
- Travail avec un utilisateur normal. `sudo` est utilisé seulement pour l'administration et pour Docker, selon le principe du moindre privilège. L'ajout de l'utilisateur au groupe `docker` a été écarté, car ce groupe donne un accès équivalent à root.

**Limites et améliorations possibles**
- En production : Docker en mode rootless, pour que le démon ne tourne pas avec les droits root.
- En production avec des données personnelles : chiffrement du disque.

**Validation de l'étape**
- Versions vérifiées : Node.js 26.13, npm 11.20, Docker 29.9.3, Docker Compose 5.7, Git 2.53.
- `npm install` exécuté sur le serveur sans erreur et sans vulnérabilité. Aucune dépendance n'est encore déclarée, Express sera ajouté à l'étape 1.
- `.env` bien ignoré par Git (`git check-ignore -v .env`).
- Questions de compréhension traitées : rôle de `package.json` (identité du projet et liste des dépendances, versionné avec `package-lock.json`), de `node_modules` (code des dépendances, non versionné car lourd et reconstructible) et de `.env` (secrets, non versionné, remplacé dans Git par `.env.example`). Risque du groupe `docker` (équivalent root) et intérêt de la clé SSH contre la force brute.
- Étape validée par Sicilia.

### Étape 1 - Serveur de base (validée)

**Ce qui a été fait**
- Installation d'Express 5 avec `npm install express`. La dépendance est enregistrée dans `package.json` et sa version exacte dans `package-lock.json`.
- `src/app.js` : création de l'application Express, ajout du middleware `express.json()` et de la route `GET /api/health`.
- `src/server.js` : démarrage du serveur sur le port défini par `process.env.PORT`, ou 3000 par défaut.
- Scripts npm : `npm start` pour lancer l'API, `npm run dev` pour la relancer à chaque modification grâce à l'option `--watch` intégrée à Node.js.

**Choix techniques et justifications**
- Express : framework web minimaliste et très répandu pour Node.js. Il gère les routes et les middlewares sans imposer de structure lourde.
- Express 5 plutôt que 4 : version actuelle et maintenue. Elle transmet automatiquement les erreurs des fonctions asynchrones au gestionnaire d'erreurs, ce qui évite d'oublier un `try/catch`.
- `node --watch` plutôt que nodemon : la fonction est intégrée à Node.js, donc une dépendance de moins à installer et à surveiller.
- Séparation entre `app.js` et `server.js` : `app.js` décrit l'application (middlewares, routes) et `server.js` la démarre. Les tests pourront importer l'application sans ouvrir de port réseau.
- Route `/api/health` : permet de vérifier rapidement que l'API fonctionne. Elle servira aussi plus tard au contrôle de santé du conteneur Docker.
- Préfixe `/api` : sépare clairement les routes de l'API des futures pages du front-end.

**Notions à savoir expliquer**
- Requête (`req`) : objet qui contient ce que le client envoie (méthode, URL, en-têtes, corps).
- Réponse (`res`) : objet qui sert à répondre au client (`res.json()`, `res.status()`).
- Route : association d'une méthode HTTP et d'un chemin à la fonction qui traite la requête.
- Middleware : fonction `(req, res, next)` exécutée pendant le traitement de la requête, avant la route. Elle peut modifier `req`, répondre directement, ou appeler `next()` pour passer au middleware suivant.
- Sans `express.json()`, `req.body` vaut `undefined` et la route ne peut pas lire les données JSON envoyées.

**Points de sécurité relevés pour plus tard**
- L'en-tête `X-Powered-By: Express` révèle la technologie utilisée. Il sera supprimé à l'étape 6 avec helmet.
- Le fichier `.env` n'est pas encore chargé. Il le sera à l'étape 2.

**Validation de l'étape**
- `curl -i http://localhost:3000/api/health` renvoie `200 OK` et `{"status":"ok"}`.
- Une route inconnue renvoie `404`.
- Questions de compréhension traitées : `req` et `res` bien compris. Les définitions de route et de middleware, ainsi que l'intérêt de séparer `app.js` et `server.js`, ont été corrigées.
- À revoir pour l'oral : redire sans support les définitions de route et de middleware, et le rôle de `next()`.
- Étape validée par Sicilia.

### Étape 2 - Base MongoDB avec Docker

**Ce qui a été fait**
- MongoDB 9.0 lancé dans un conteneur Docker nommé `mongo-reseau`, avec l'image officielle `mongo:9.0`.
- Compte administrateur créé au premier démarrage, à partir du fichier `.env.mongo` (non versionné, droits `600`).
- Compte dédié `reseau_api` créé dans la base `reseau_social`, avec le seul rôle `readWrite` sur cette base.
- Installation de Mongoose 9.12. Connexion dans `src/config/db.js`.
- `src/server.js` : le serveur ne démarre qu'après la connexion à la base. En cas d'échec, message d'erreur et arrêt avec le code 1.
- Chargement de `.env` avec l'option `--env-file` de Node.js, dans les scripts `start` et `dev`.

**Choix techniques et justifications**
- MongoDB dans Docker plutôt qu'installé sur le serveur : environnement isolé, version identique partout, conteneur supprimable et recréable en une commande.
- Version fixée (`mongo:9.0`) plutôt que `latest` : une mise à jour majeure ne doit pas arriver sans être choisie.
- Port publié uniquement sur `127.0.0.1` : la base n'est pas joignable depuis le réseau. Docker contourne le pare-feu `ufw`, cette précision est donc indispensable.
- Volume nommé `mongo-data` : le conteneur est jetable, le volume conserve les données si le conteneur est supprimé ou recréé.
- `--restart unless-stopped` : la base redémarre automatiquement après un redémarrage du serveur.
- Fichier `.env.mongo` séparé de `.env` : le conteneur MongoDB ne reçoit pas `JWT_SECRET`, qui ne le concerne pas (moindre privilège).
- Mots de passe générés avec `openssl rand -hex 24` : 48 caractères aléatoires, sans caractère spécial qui casserait l'URL de connexion.
- Compte `reseau_api` limité à `readWrite` sur `reseau_social` : principe du moindre privilège. En cas de faille dans l'API, l'attaquant ne peut ni supprimer les autres bases, ni créer de comptes.
- Mongoose plutôt que le pilote `mongodb` seul : il apporte les schémas et la validation des données, utiles à l'étape 3 et pour la sécurité.
- `--env-file` de Node.js plutôt que la bibliothèque dotenv : fonction intégrée, une dépendance de moins.
- Adresse `127.0.0.1` plutôt que `localhost` dans `MONGO_URI` : Node.js peut traduire `localhost` en adresse IPv6 `::1`, alors que MongoDB écoute en IPv4.
- L'URI de connexion n'est jamais affichée dans la console, car elle contient le mot de passe.

**Difficultés rencontrées et solutions**
- `chmod` sur un fichier inexistant : la commande était lancée depuis le dossier personnel (`~`) au lieu du dossier du projet. Leçon : vérifier le dossier courant dans l'invite.
- `printf` : `invalid format character`, à cause d'une faute de frappe (`%` au lieu de `%s`). Le fichier a été créé incomplet et a été régénéré.
- `U_STRINGPREP_PROHIBITED_ERROR` à la création du compte : le collage a ajouté des caractères invisibles au mot de passe. Solution : le mot de passe est lu directement dans `.env` par une commande, sans copier-coller.

**Tests de validation réalisés**
- Démarrage normal : `Connecté à MongoDB` puis `API démarrée sur le port 3000`.
- Mauvais mot de passe : `Authentication failed.` et arrêt de l'API avec le code 1.
- Connexion sans identifiant : `Command find requires authentication`.
- `ss -ltn` : MongoDB écoute sur `127.0.0.1:27017` uniquement.

**Notions à savoir expliquer**
- SQL : base relationnelle, tables, lignes, colonnes fixes, liens par clés étrangères et jointures.
- NoSQL orienté documents (MongoDB) : collections (équivalent des tables) et documents au format proche du JSON (équivalent des lignes), sans structure imposée, données souvent imbriquées.
- Moindre privilège : chaque composant ne reçoit que les droits dont il a besoin, pour limiter les dégâts en cas de faille.
- Volume Docker : stockage géré par Docker en dehors du conteneur. Le conteneur est jetable, le volume garde les données.

**Validation de l'étape**
- Questions de compréhension : « collection » et « moindre privilège » ont d'abord été confondus ou oubliés, puis retrouvés sans support après une explication par des images (le classeur et ses fiches, la carte d'hôtel).
- À revoir pour l'oral : le moindre privilège donne accès à ce dont le composant a besoin, ce qui peut être plusieurs choses, et pas à « une seule chose ».
- Étape validée par Sicilia.

### Étape 3 - Modèles de données (validée le 2026-11-16)

**Ce qui a été fait**
- `src/models/Utilisateur.js` : pseudo, email, mot de passe, bio, abonnements, dates automatiques.
- `src/models/Publication.js` : contenu, auteur, likes, dates automatiques.
- `src/models/Commentaire.js` : écrit par Sicilia à partir du modèle Publication, corrections en cours (voir plus bas).

**Choix techniques et justifications**
- Règle retenue : on imbrique ce qui est petit, borné et toujours lu avec le parent. On référence ce qui peut grandir sans limite ou qui vit sa propre vie.
- Commentaires dans leur propre collection, avec une référence vers leur publication : un document MongoDB est limité à 16 Mo, une publication peut recevoir des milliers de commentaires, et on veut pouvoir afficher une publication sans ses commentaires ou paginer les commentaires.
- Likes imbriqués dans la publication, sous forme de tableau d'identifiants : un identifiant pèse 12 octets, il faudrait plusieurs centaines de milliers de likes pour approcher la limite. Sur un réseau à des millions d'utilisateurs, on ferait une collection séparée.
- Auteur stocké sous forme de référence (identifiant) et non de copie du pseudo : si le pseudo change, il n'y a qu'un seul endroit à modifier.
- Abonnements : tableau de références vers d'autres utilisateurs.
- Validation dans le schéma (`required`, `trim`, `minlength`, `maxlength`, `match`) : premier niveau de validation des entrées, avec des messages d'erreur en français.
- `unique: true` sur le pseudo et l'email : ce n'est pas une validation mais un index MongoDB. C'est la base qui refuse les doublons, même si deux inscriptions arrivent en même temps.
- `lowercase: true` sur l'email : évite deux comptes avec le même email écrit avec des majuscules différentes.
- `select: false` sur le mot de passe : il n'est jamais renvoyé par défaut dans les recherches. Le hachage sera fait à l'étape 4.
- `maxlength` sur les textes : limite aussi l'envoi de textes énormes pour remplir la base.

**Points à traiter plus tard**
- Double like : un tableau accepte deux fois le même identifiant. À gérer à l'étape 5 avec l'opérateur `$addToSet`.

**Fait le 2026-11-06 (fin de séance)**
- `Commentaire.js` corrigé par Sicilia : `publication` est un `ObjectId` avec `ref: 'Publication'`, modèle nommé `'Commentaire'`, variable `commentaireSchema`.
- Fichier `User.js` en double supprimé : le modèle utilisateur est `Utilisateur.js`.
- Réponse à la question : le commentaire n'a qu'une seule publication à retenir, alors qu'une publication devrait retenir une liste sans limite. Cette liste pourrait dépasser les 16 Mo d'un document MongoDB et obligerait à tout charger d'un coup. On met la référence du côté qui n'en a qu'une.
- Essai technique réussi avec `scripts/essai-modeles.js` (lancement : `node --env-file=.env scripts/essai-modeles.js`) : création et lecture des trois types de documents, `populate` (remplace un identifiant par le document qu'il désigne), `lowercase` sur l'email, `timestamps`, mot de passe non renvoyé (`select: false`), données invalides refusées avec les messages en français.
- Nom des collections : Mongoose met le nom du modèle au pluriel et en minuscules (`Commentaire` donne `commentaires`).

**Validation de l'étape (2026-11-16)**
- Questions de jury, sans les notes :
  1. `unique: true` plutôt qu'une vérification dans le code : bonne réponse de Sicilia. Si deux inscriptions arrivent au même moment, les deux vérifications peuvent passer avant l'enregistrement (situation de concurrence, ou *race condition*). L'index unique fait le contrôle au moment même de l'écriture, de façon atomique. Complété : `unique` n'est pas un validateur Mongoose mais un index, le doublon renvoie l'erreur MongoDB `E11000` qu'on traduira en statut HTTP 409 à l'étape 4. L'index accélère aussi la recherche par email à la connexion.
  2. `select: false` : réponse partielle (« éviter de le voir »). Complété : le champ est exclu par défaut des résultats de recherche, donc jamais renvoyé par erreur dans une réponse JSON. Il ne chiffre rien, c'est le hachage bcrypt qui protège le mot de passe dans la base. Ce sont deux couches de défense en profondeur. On le contourne seulement à la connexion avec `.select('+motDePasse')`, pour comparer avec `bcrypt.compare`.
  3. Référence de l'auteur plutôt que copie du pseudo : bonne réponse sur l'avantage (un seul endroit à modifier, une seule source de vérité, normalisation). Complété : le prix est une requête supplémentaire à la lecture (`populate`).
- À revoir pour l'oral : bien distinguer « cacher un champ » (`select: false`) et « rendre illisible » (hachage). Toujours citer l'avantage ET le coût d'un choix de modélisation.
- Étape validée.

**Suite**
- Étape 4 : inscription et connexion, avec hachage du mot de passe (bcrypt).
- Astuce retenue : après un copier-coller, rechercher l'ancien mot avec `Ctrl+F` pour tout adapter. Désactiver l'autocomplétion pendant les exercices.

### Étape 4 - Inscription et connexion (en cours)

**Ce qui a été fait (2026-11-16)**
- Installation de `bcrypt` (`npm install bcrypt`) : bibliothèque qui hache les mots de passe avec l'algorithme bcrypt.
- Essai : le même mot de passe haché deux fois donne deux empreintes différentes, grâce au sel aléatoire.
- Lecture d'une empreinte bcrypt : `$2b$` (version), `12$` (coût), 22 caractères de sel, puis 31 caractères d'empreinte. Le sel n'est pas un secret, il est stocké dans l'empreinte pour que `bcrypt.compare` puisse refaire le calcul.
- Hook `pre('save')` ajouté dans `src/models/Utilisateur.js` par Sicilia : le mot de passe est haché automatiquement avant chaque enregistrement.

**Choix techniques et justifications**
- Hachage et non chiffrement : un mot de passe ne doit jamais pouvoir être retrouvé, même par nous.
- bcrypt plutôt que SHA-256 : SHA-256 est rapide, donc facile à attaquer par force brute. bcrypt est lent exprès (coût 12, soit 2 puissance 12 tours) et gère le sel tout seul.
- Hachage dans le modèle plutôt que dans la route : impossible de l'oublier si on ajoute plus tard une route de changement de mot de passe.
- `function` et non fonction fléchée dans le hook : Mongoose place le document dans `this`, qu'une fonction fléchée n'a pas.
- Test `isModified('motDePasse')` : sans lui, modifier la bio hacherait l'empreinte elle-même et bloquerait le compte.

- Test ajouté dans `scripts/essai-modeles.js` (étape 5b) : relecture du mot de passe avec `select('+motDePasse')`, puis `bcrypt.compare` avec le bon et un mauvais mot de passe.
- Résultat obtenu : l'empreinte stockée commence par `$2b$12$`, le bon mot de passe donne `true`, le mauvais donne `false`. Le mot de passe en clair n'apparaît jamais dans la base.
- Partie 1 (hachage) terminée.

**Fonctionnement de `bcrypt.compare(motDePasseTapé, empreinte)`**
- bcrypt relit le sel écrit dans l'empreinte, hache le mot de passe tapé avec ce même sel, puis compare les deux résultats.
- On ne « déchiffre » donc jamais rien : on refait le calcul et on compare.

**Questions de jury (2026-11-16)**
- Pourquoi hacher et non chiffrer ? Le chiffrement est réversible : si la base et la clé sont volées, on retrouve les mots de passe. Le hachage est à sens unique. Pour vérifier une connexion, il suffit de comparer les empreintes.
- Pourquoi deux empreintes différentes pour le même mot de passe ? À cause du sel aléatoire. Ça empêche de repérer deux mots de passe identiques et rend inutiles les tables d'empreintes précalculées. Le sel est stocké dans l'empreinte, c'est ce qui permet à `compare` de vérifier.
- À quoi sert `select: false` ? Il cache le mot de passe dans toutes les recherches par défaut, pour ne jamais l'envoyer par erreur au navigateur. On le demande seulement à la connexion, avec `select('+motDePasse')`.
- Point à retravailler : la question 3 (`select: false`) n'a pas été retrouvée seule.

**Partie 2 : route d'inscription (terminée)**
- Fichier `src/routes/auth.js` : un routeur Express, branché dans `app.js` avec `app.use('/api/auth', authRoutes)`. Les routes sont rangées par thème pour garder `app.js` lisible.
- Route `POST /api/auth/inscription` : lit `pseudo`, `email` et `motDePasse`, appelle `Utilisateur.create`, répond 201 avec `id`, `pseudo` et `email`.
- Testée avec `curl` : réponse `201 Created`.
- Choix de sécurité :
  - On ne prend que les 3 champs attendus dans `req.body`, pour éviter l'assignation de masse (un client qui ajoute des champs non prévus).
  - On choisit les champs renvoyés, pour ne jamais renvoyer l'empreinte du mot de passe. `select: false` ne joue que sur les recherches, pas sur le document qu'on vient de créer.
  - En cas d'erreur inconnue, le détail est affiché dans le terminal du serveur, le client reçoit seulement « Erreur serveur ».
- Codes HTTP selon l'erreur : 400 si le schéma refuse les données, 409 si le pseudo ou l'email existe déjà (code MongoDB 11000, index unique), 500 sinon.
- À noter pour l'étape 6 : l'en-tête `X-Powered-By: Express` révèle la technologie utilisée. Il sera supprimé avec `helmet`.

- Tests réalisés avec `curl` :
  - nouveau compte : `201 Created`
  - même pseudo et même email : `409 Conflict`
  - pseudo de 2 lettres et email sans `@` : `400 Bad Request`, avec les messages écrits dans le schéma (« Le pseudo doit contenir au moins 3 caractères », « Le format de l'email est invalide »)
- Repère sur les codes HTTP : 2xx = succès, 4xx = erreur du client, 5xx = erreur du serveur.

**Questions de jury, partie 2 (2026-11-16)**
- Expliquer le bloc `if (erreur.code === 11000)` : si MongoDB renvoie l'erreur 11000, qui veut dire que le pseudo ou l'email existe déjà, alors on répond 409 avec le message « Ce pseudo ou cet email est déjà utilisé ».
- Pourquoi 400 ou 409 et pas 500 ? Ce n'est pas un bug du serveur mais une demande du client qui pose problème. Un code 4xx permet au front-end d'afficher un message utile, et on garde 500 pour les vrais bugs.
- Point à retravailler : les familles de codes HTTP, découvertes pendant cette séance.

**Reprise de la prochaine séance**
- Partie 3 : route de connexion avec JWT.
