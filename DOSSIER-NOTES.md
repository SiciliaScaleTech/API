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

### Étape 4 - Inscription et connexion

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

**Partie 3 : route de connexion avec JWT (terminée)**
- Installation de `jsonwebtoken` (`npm install jsonwebtoken`) : bibliothèque de référence pour fabriquer (`jwt.sign`) et vérifier (`jwt.verify`) des JWT. On n'écrit pas soi-même un mécanisme de signature.
- Clé `JWT_SECRET` : la valeur d'exemple a été remplacée par 128 caractères aléatoires, générés avec le module `crypto` de Node et écrits directement dans `.env` sans être affichés. `.env` est ignoré par Git.
- Route `POST /api/auth/connexion`, 4 contrôles dans l'ordre :
  1. `email` et `motDePasse` doivent être des textes, sinon 400.
  2. Recherche du compte par email avec `select('+motDePasse')`, sinon 401.
  3. `bcrypt.compare` du mot de passe tapé avec l'empreinte, sinon 401.
  4. Fabrication du jeton avec `jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' })`, réponse 200.
- Tests avec `curl` : bon mot de passe 200 avec un jeton, mauvais mot de passe 401, email inconnu 401, email envoyé sous forme d'objet 400.
- Décodage du milieu d'un jeton sans la clé : `{"id":"...","iat":...,"exp":...}`. Preuve que le contenu est lisible par tous.

**Choix techniques et justifications**
- Vérifier que les champs sont des textes (`typeof`) : bloque l'injection NoSQL. Sans ce contrôle, un email envoyé sous la forme `{"$ne": null}` ferait trouver n'importe quel compte.
- Même code (401) et même message pour « email inconnu » et « mauvais mot de passe » : un pirate ne peut pas savoir quels emails sont inscrits (énumération de comptes).
- Le jeton ne contient que l'`id` : son contenu n'est pas chiffré, seulement signé.
- Expiration à 1 heure : un jeton volé ne sert pas longtemps.
- Incident pendant la séance : un copier-coller a supprimé la vérification du mot de passe sans provoquer d'erreur de Node. N'importe qui pouvait alors se connecter avec un email connu. Repéré en relisant le code et corrigé. Leçon : toujours relire et toujours tester les cas d'échec, pas seulement le cas qui marche.

**Questions de jury, partie 3 (2026-11-16)**
- Un JWT est-il chiffré ? Non, il est seulement signé. Son contenu est lisible par tous, donc jamais de mot de passe dedans. On y met l'id, et la bibliothèque ajoute la date de création (`iat`) et d'expiration (`exp`).
- À quoi sert `JWT_SECRET` ? À signer les jetons et à vérifier leur signature. Si un pirate la découvre, il peut fabriquer de faux jetons au nom de n'importe quel utilisateur. D'où une clé longue, aléatoire, dans `.env`, jamais sur Git.
- Point à retravailler : le rôle de la clé secrète, non retrouvé seule.

**Partie 4 : middleware d'authentification (terminée)**
- Fichier `src/middlewares/verifierJeton.js`, nommé comme la fonction qu'il contient pour être clair.
- Un middleware est une fonction qui s'exécute avant la route pour faire un contrôle. Il reçoit `req`, `res` et `next`. `next()` laisse passer la requête vers la route. Sinon, le middleware répond lui-même et la route n'est jamais exécutée.
- Fonctionnement de `verifierJeton` :
  1. Lit l'en-tête `Authorization`, qui doit avoir la forme `Bearer <jeton>`. Sinon 401 « Jeton manquant ».
  2. `jwt.verify` contrôle la signature avec `JWT_SECRET` et la date d'expiration. En cas d'échec, 401 « Jeton invalide ou expiré ».
  3. Accroche l'id du jeton à la requête (`req.utilisateurId`), puis appelle `next()`.
- Route protégée `GET /api/auth/moi` : `router.get('/moi', verifierJeton, ...)`. Renvoie l'id, le pseudo, l'email et la bio de la personne connectée, 404 si le compte n'existe plus.
- Tests avec `curl` : sans jeton 401, faux jeton 401, vrai jeton 200 avec le profil et sans mot de passe. Le jeton a été rangé dans une variable du terminal (`JETON=$(...)`) pour ne pas le recopier à la main.

**Choix techniques et justifications**
- Jeton dans l'en-tête `Authorization: Bearer` : c'est la convention standard, comprise par tous les outils et front-ends.
- `algorithms: ['HS256']` dans `jwt.verify` : on impose l'algorithme utilisé à la connexion, pour qu'un pirate ne puisse pas présenter un jeton qui prétend en utiliser un autre.
- Un seul middleware, réutilisé : pour protéger une route, il suffit de l'ajouter devant. Pas de contrôle recopié dans chaque route.
- L'id vient du jeton signé, jamais de ce que le client envoie. Sinon, un utilisateur pourrait demander les données d'un autre en changeant l'id. Cette faille s'appelle BOLA (Broken Object Level Authorization), n°1 du OWASP API Top 10.

**Questions de jury, partie 4 (2026-11-16)**
- C'est quoi un middleware ? Une fonction qui s'exécute avant la route pour faire un contrôle. S'il est d'accord, il appelle `next()` pour passer à la route. Sinon, il répond lui-même, par exemple 401.
- Pourquoi l'id vient du jeton ? Le jeton est signé, le client ne peut pas le modifier. Il ne peut donc accéder qu'à son propre compte (protection contre BOLA).
- Points à retravailler : le rôle de `next()` (compris après explication) et la faille BOLA.

**Bilan de l'étape 4**
- Les 3 critères de validation sont remplis : inscription, connexion, accès refusé sans jeton.

### Étape 5 - Fonctionnalités du réseau social

**Découpage**
- 5a : publications, créer et lire. 5b : modifier et supprimer, seulement ses propres publications. 5c : commentaires. 5d : likes. 5e : abonnements et fil d'actualité.

**Ce qui a été fait (2026-11-17)**
- Fichier `src/routes/publications.js`, branché dans `app.js` sur `/api/publications`.
- Un fichier de routes a toujours 3 parties : les imports (seulement les outils utilisés), le routeur (`express.Router()`), l'export (`module.exports`). Les routes se placent entre le routeur et l'export.
- Route `POST /api/publications`, protégée par `verifierJeton` : prend seulement `contenu` dans le corps, répond 201, ou 400 si le contenu est vide ou trop long.

**Choix techniques et justifications**
- Adresses au format REST : une adresse par ressource, la méthode HTTP indique l'action (CRUD : POST crée, GET lit, PUT modifie, DELETE supprime).
- Toutes les routes des publications sont protégées : il faut être connecté pour voir ou écrire, comme sur un réseau privé.
- L'auteur vient du jeton (`req.utilisateurId`), jamais du corps de la requête. Sinon, n'importe qui pourrait publier au nom d'un autre.

- Tests de la création avec `curl` : publication créée (201), contenu vide refusé (400), sans jeton (401). Tentative de tricher en envoyant un faux `auteur` : il est ignoré, l'auteur enregistré reste celui du jeton.
- Route `GET /api/publications` : `find()`, tri du plus récent au plus ancien (`sort({ createdAt: -1 })`), 20 au maximum (`limit(20)`), et `populate('auteur', 'pseudo')` pour afficher le pseudo de l'auteur sans ses autres données.
- Route `GET /api/publications/:id` : l'id est lu dans l'adresse (`req.params.id`). 404 si l'id est mal formé (`mongoose.isValidObjectId`) ou si aucune publication ne le porte.
- Tests de la lecture avec `curl` : liste (200), une publication (200), id inexistant (404), id mal formé (404), sans jeton (401).
- Partie 5a terminée.

**Choix techniques et justifications (lecture)**
- `limit(20)` : on n'envoie jamais toute la base d'un coup, pour ne pas surcharger le serveur (OWASP API Top 10 : consommation de ressources sans limite).
- `populate` limité au pseudo : on n'expose pas l'email des auteurs.
- Contrôle de l'id avant la requête : un id mal formé est une erreur du client (404), pas un bug du serveur (500).
- Incident pendant la séance : l'autocomplétion de VS Code a ajouté seule un `require('./auth')` inutile, et un `router.` inachevé a fait planter le serveur (`Cannot set properties of undefined`). Leçon : relire le haut du fichier après l'autocomplétion, et ne pas taper dans un fichier pendant qu'il est modifié ailleurs.

**Partie 5b : modifier et supprimer, seulement ses propres publications (terminée)**
- Routes `PUT /api/publications/:id` et `DELETE /api/publications/:id`, protégées par `verifierJeton`.
- Les deux routes suivent 4 étapes : id bien formé (sinon 404), publication existante (sinon 404), contrôle d'appartenance (sinon 403), puis l'action.
- Contrôle d'appartenance : `publication.auteur.toString() !== req.utilisateurId` donne 403. `toString()` transforme l'ObjectId de MongoDB en texte, pour comparer un texte avec l'id du jeton qui est aussi un texte.
- Modification : seul `contenu` est pris dans le corps. `save()` enregistre et relance la validation du schéma.
- Suppression : `publication.deleteOne()`.
- Tests avec `curl` et un deuxième compte de test (`bob_essai`) : Bob modifie ou supprime la publication de Sicilia (403), Sicilia modifie la sienne (200), contenu vide (400), Sicilia supprime une publication (200), relecture de la publication supprimée (404).

**Choix techniques et justifications**
- 403 et non 401 : Bob est bien identifié, mais il n'a pas le droit.
- Authentification et autorisation sont deux contrôles différents. Authentification : qui es-tu ? C'est le middleware, qui répond 401. Autorisation : as-tu le droit ? C'est la route, qui répond 403.
- Le contrôle d'appartenance protège contre BOLA (n°1 du OWASP API Top 10) : être connecté ne suffit pas pour toucher aux contenus des autres.

**Questions de jury, partie 5b (2026-11-17)**
- Différence entre 401 et 403 ? 401 : le serveur ne sait pas qui on est (identifiants faux, pas de jeton, jeton invalide). 403 : il sait qui on est, mais on n'a pas le droit.
- Pourquoi Bob, connecté, ne peut pas modifier la publication de Sicilia ? Son jeton est valide, donc le middleware le laisse passer. Mais la route compare l'auteur de la publication avec l'id du jeton. Ce n'est pas le même, donc 403.
- Points à retravailler : la différence entre le rôle du middleware (authentification) et celui de la route (autorisation). Ne pas confondre l'empreinte (mot de passe haché, connexion) et le jeton.

**Partie 5c : les commentaires (terminée)**
- Routes emboîtées dans celles des publications, dans `src/routes/publications.js` :
  - `POST /api/publications/:id/commentaires` : commenter (201, 400 si vide, 404 si la publication n'existe pas)
  - `GET /api/publications/:id/commentaires` : lire, du plus ancien au plus récent (`sort({ createdAt: 1 })`), 50 au maximum, avec le pseudo des auteurs
  - `DELETE /api/publications/:id/commentaires/:commentaireId` : supprimer, seulement par l'auteur du commentaire (403 sinon)
- Un commentaire a trois sources : le contenu vient du corps de la requête, la publication vient de l'adresse (on vérifie qu'elle existe), l'auteur vient du jeton.
- `findOne({ _id: commentaireId, publication: id })` : le commentaire doit exister et appartenir à la publication indiquée dans l'adresse.
- Suppression en cascade : la suppression d'une publication supprime aussi ses commentaires (`Commentaire.deleteMany`).
- Tests avec `curl` et les deux comptes : 8 cas réussis, dont Sicilia qui essaie de supprimer le commentaire de Bob (403) et 0 commentaire orphelin après suppression d'une publication.

**Choix techniques et justifications**
- Adresses emboîtées : l'adresse montre que le commentaire appartient à une publication.
- Seul l'auteur d'un commentaire peut le supprimer, même la propriétaire de la publication ne le peut pas.
- Suppression en cascade : pas de données orphelines dans la base.

**Questions de jury, partie 5c (2026-11-17)**
- D'où viennent les données d'un commentaire ? Le contenu du corps de la requête, la publication de l'adresse, l'auteur du jeton.
- Pourquoi supprimer les commentaires avec la publication ? Sinon ils restent orphelins dans la base.
- Point à retravailler : l'auteur d'un commentaire est la personne du jeton, pas l'auteur de la publication.

**Partie 5d : les likes (terminée)**
- `POST /api/publications/:id/like` : aimer. `DELETE /api/publications/:id/like` : ne plus aimer. La route DELETE a été écrite par Sicilia à partir de la route POST.
- La liste `likes` de la publication est modifiée directement dans MongoDB avec `findByIdAndUpdate` :
  - `$addToSet` ajoute l'id seulement s'il n'est pas déjà dans la liste, donc pas de double like
  - `$pull` retire l'id de la liste
- `returnDocument: 'after'` : renvoie la publication après la modification, pour avoir le bon nombre de likes.
- La réponse donne seulement le nombre de likes (`likes.length`), pas la liste des id.
- Tests avec `curl` : Bob aime 3 fois et le compteur reste à 1, Sicilia aime (2), Bob retire son like (1), Bob retire une deuxième fois (toujours 1), publication inexistante (404).

**Choix techniques et justifications**
- `$addToSet` plutôt que vérifier puis ajouter en deux temps : la règle « un seul like par personne » est garantie par MongoDB en une seule opération.
- L'id ajouté vient du jeton : on ne peut aimer qu'en son propre nom.
- Pas de contrôle d'auteur (pas de 403) : tout membre connecté a le droit d'aimer n'importe quelle publication.

**Questions de jury, partie 5d (2026-11-17)**
- Pourquoi un utilisateur ne peut-il pas aimer deux fois ? `$addToSet` ajoute son id dans la liste des likes seulement s'il n'y est pas déjà.
- Leçon : un commentaire doit toujours dire la même chose que le code. Un commentaire faux est pire que pas de commentaire.

**Partie 5e : abonnements et fil d'actualité (terminée)**
- Nouveau fichier `src/routes/utilisateurs.js`, branché sur `/api/utilisateurs`. Carcasse écrite par Sicilia.
- `POST /api/utilisateurs/:id/abonnement` : suivre. `DELETE /api/utilisateurs/:id/abonnement` : ne plus suivre. On modifie la liste `abonnements` de la personne du jeton avec `$addToSet` et `$pull`.
- Règles métier : on ne peut pas se suivre soi-même (400), on ne peut suivre qu'un utilisateur qui existe (404, contrôle avec `Utilisateur.exists`).
- `GET /api/publications/fil` : récupère l'utilisateur du jeton, fait la liste des auteurs (ses abonnements plus lui-même, avec `concat`), puis cherche les publications de ces auteurs (`$in`), les plus récentes d'abord, 20 au maximum.
- La route `/fil` est placée avant `/:id` : Express teste les routes de haut en bas et prend la première qui correspond.
- Tests avec `curl` : fil avant et après l'abonnement à Bob (sa publication apparaît), double abonnement (compteur à 1), se suivre soi-même (400), utilisateur inexistant (404), désabonnement (200), fil sans jeton (401), lecture d'une publication par id toujours fonctionnelle.
- Incident : `require('../models/Utilisateurs')` au lieu de `Utilisateur` a fait planter le serveur (`Cannot find module`). Sous Linux, les noms de fichiers sont sensibles aux majuscules et à chaque lettre.

**Choix techniques et justifications**
- La liste modifiée est toujours celle de la personne du jeton : personne ne peut ajouter un abonnement dans la liste d'un autre.
- Les abonnements sont stockés comme une liste de références dans l'utilisateur (choix fait à l'étape 3).
- Convention : les modèles s'écrivent avec une majuscule (`Utilisateur`, `Publication`), les adresses des ressources au pluriel (`/api/utilisateurs`).

**Questions de jury, partie 5e (2026-11-17)**
- Comment est construit le fil ? Le serveur récupère l'utilisateur grâce au jeton, fait la liste des personnes qu'il suit plus lui-même, puis cherche les publications de ces personnes, les plus récentes d'abord, 20 au maximum.
- Pourquoi `/fil` avant `/:id` ? Express prend la première route qui correspond. Sinon, "fil" serait pris pour un id de publication.
- Point à retravailler : la construction du fil (non retrouvée seule).

**Bilan de l'étape 5**
- Toutes les fonctionnalités sont en place et testées, y compris les cas interdits : CRUD des publications, commentaires, likes, abonnements, fil d'actualité, et contrôle d'appartenance (403).
- Comptes de test : `sicilia` et `bob_essai`.

### Étape 6 - Sécurisation (en cours)

**Point de départ (2026-11-17)**
- Test d'un JSON mal formé : l'API renvoyait une page HTML avec `X-Powered-By: Express`, le chemin complet des fichiers sur le serveur (avec le nom d'utilisateur Linux) et les noms des bibliothèques internes. C'est une fuite d'informations, due au gestionnaire d'erreurs par défaut d'Express.
- Découpage : 6a helmet, 6b gestion des erreurs, 6c limitation des requêtes, 6d CORS, 6e injections NoSQL et taille des requêtes, 6f bilan OWASP API Top 10.

**Partie 6a : helmet (terminée)**
- Installation de `helmet` : middleware qui ajoute des en-têtes de sécurité à chaque réponse et supprime `X-Powered-By`. C'est la recommandation de la documentation officielle d'Express.
- `app.use(helmet())` placé en premier dans `app.js`, pour s'appliquer à toutes les réponses, même aux erreurs.
- En-têtes principaux :
  - `Content-Security-Policy` : le navigateur n'exécute que les scripts du site (contre le XSS)
  - `X-Frame-Options: SAMEORIGIN` : la page ne peut pas être affichée dans un cadre d'un autre site (contre le clickjacking)
  - `Strict-Transport-Security` : le navigateur utilise toujours HTTPS pendant un an
  - `X-Content-Type-Options: nosniff` : le navigateur ne devine pas le type d'un fichier
- Question de jury : à quoi sert helmet, et pourquoi masquer `X-Powered-By` ? Il ajoute des en-têtes de sécurité à chaque réponse. Masquer la technologie évite qu'un pirate cherche directement ses failles connues.

**Partie 6b : gestion des erreurs (terminée)**
- Deux middlewares ajoutés à la fin de `app.js`, après toutes les routes :
  - un middleware 404 en JSON : si une requête arrive jusqu'à lui, aucune route ne lui correspond
  - un gestionnaire d'erreurs à 4 paramètres `(erreur, req, res, next)`, reconnu comme tel par Express. JSON mal formé : 400. Corps trop gros : 413. Toute autre erreur : détail dans le terminal du serveur, « Erreur serveur » (500) pour le client.
- Tests avec `curl` : JSON mal formé (400 en JSON, plus de chemins de fichiers), adresse inexistante (404 en JSON), route normale (200).
- Question de jury : pourquoi ne pas renvoyer le détail d'une erreur ? Il révèle les chemins des fichiers, les bibliothèques, parfois du code, ce qui aide un pirate à préparer son attaque. Le détail reste dans le terminal du serveur, le client reçoit un message court.

**Partie 6c : limitation du nombre de requêtes (terminée)**
- Installation de `express-rate-limit` : middleware qui compte les requêtes de chaque adresse IP sur une période, et répond 429 Too Many Requests au-delà de la limite, sans exécuter la route.
- Fichier `src/middlewares/limiteurs.js`, deux limites :
  - `limiteurGeneral` : 100 requêtes par 15 minutes sur tout `/api` (dans `app.js`)
  - `limiteurAuth` : 10 essais par 15 minutes, placé devant les routes de connexion et d'inscription (dans `auth.js`)
- Test : 12 tentatives de connexion avec un mauvais mot de passe. Les 10 premières donnent 401, les suivantes 429. Les autres routes restent accessibles. Les en-têtes `RateLimit` et `Retry-After` indiquent au client quand réessayer.
- Le compteur est gardé en mémoire : il se remet à zéro au redémarrage du serveur. Avec plusieurs serveurs en production, il faudrait un stockage partagé.

**Choix techniques et justifications**
- Limite stricte sur la connexion contre la force brute : 10 essais par quart d'heure rendent impossible le test de milliers de mots de passe.
- Limite sur l'inscription contre la création de comptes en masse par un robot.
- Limite générale contre la surcharge de l'API (OWASP API Top 10 : consommation de ressources sans limite).

**Question de jury, partie 6c (2026-11-17)**
- Qu'est-ce que la force brute, et comment l'API s'en protège ? Un robot essaie des milliers de mots de passe jusqu'à trouver le bon. L'API limite la connexion à 10 essais par 15 minutes et par IP, puis répond 429 sans vérifier le mot de passe.

**Partie 6d : CORS (terminée)**
- Les navigateurs appliquent la Same-Origin Policy : une page ne peut lire que les réponses de son propre site. CORS permet à l'API d'indiquer au navigateur quels autres sites sont autorisés, comme une liste d'invités.
- Installation de `cors`. Configuration dans `app.js` : un seul site autorisé (`origin`), lu dans `.env` (`CORS_ORIGINE=http://localhost:5500`, port de l'extension Live Server). Seulement les méthodes GET, POST, PUT, DELETE et les en-têtes `Content-Type` et `Authorization`.
- Variable ajoutée aussi dans `.env.example`, sans secret.
- Tests : depuis `localhost:5500`, le navigateur laisse lire la réponse. Depuis `pirate.exemple`, l'adresse ne correspond pas à `Access-Control-Allow-Origin`, le navigateur bloque. Pré-vérification `OPTIONS` avant un DELETE avec jeton : 204 avec la liste des méthodes et en-têtes autorisés.

**Choix techniques et justifications**
- Une seule origine autorisée, et seulement les méthodes et en-têtes utiles : principe du moindre privilège.
- L'adresse est dans `.env` : on la change sans toucher au code (par exemple au déploiement).
- Limite à connaître : CORS est appliqué par le navigateur. Il protège les utilisateurs contre un site piégé, mais n'empêche pas un appel avec `curl` ou un robot. La vraie protection de l'API reste le jeton, le contrôle d'appartenance et la limitation des requêtes.

**Question de jury, partie 6d (2026-11-17)**
- À quoi sert CORS, et empêche-t-il un appel avec curl ? Il indique au navigateur quels sites peuvent appeler l'API, pour protéger les utilisateurs contre un site piégé. Il n'empêche pas curl, car c'est le navigateur qui fait le contrôle.
- Point à retravailler : CORS (non retrouvé seule). Image du videur qui ne travaille que dans les navigateurs.

**Reprise de la prochaine séance**
- Partie 6e : injections NoSQL et taille des requêtes.
