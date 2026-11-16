# Sécurité de l'API

Ce document présente les mesures de sécurité de l'API de réseau social et les justifie. Il suit la liste OWASP API Security Top 10 (édition 2023), qui recense les risques les plus fréquents pour les API.

## Bilan OWASP API Security Top 10

| Risque | Concerne l'API ? | Mesures en place |
|---|---|---|
| API1 : autorisation défaillante au niveau des objets (BOLA) | Oui | Contrôle d'appartenance avant toute modification ou suppression (403). L'identité vient toujours du jeton, jamais de la requête. |
| API2 : authentification défaillante | Oui | Mots de passe hachés avec bcrypt, 8 caractères minimum. Jetons JWT signés, valables 1 heure. Message identique pour un email inconnu et un mauvais mot de passe. 10 tentatives de connexion par 15 minutes. |
| API3 : autorisation défaillante au niveau des propriétés | Oui | Seuls les champs attendus sont lus dans les requêtes. Les réponses ne contiennent que des champs choisis, jamais le mot de passe. |
| API4 : consommation de ressources sans limite | Oui | 300 requêtes par 15 minutes et par IP. Corps de requête limité à 10 Ko. Listes limitées à 20 publications ou 50 commentaires. |
| API5 : autorisation défaillante au niveau des fonctions | Non | L'API n'a pas de fonctions d'administration. Tous les membres ont les mêmes droits. |
| API6 : accès sans limite aux processus métier sensibles | En partie | L'inscription est limitée à 10 essais par 15 minutes, contre la création de comptes en masse. |
| API7 : falsification de requêtes côté serveur (SSRF) | Non | L'API n'appelle aucune adresse fournie par un utilisateur. |
| API8 : mauvaise configuration de sécurité | Oui | En-têtes de sécurité avec helmet. CORS limité au front-end. Erreurs sans détails techniques. Secrets dans `.env`, ignoré par Git. Le serveur refuse de démarrer sans `JWT_SECRET`. |
| API9 : mauvaise gestion de l'inventaire | Oui | Toutes les routes sont documentées (étape 10). Une seule version de l'API. |
| API10 : consommation non sécurisée d'API tierces | Non | L'API n'utilise aucune API externe. |

## Détail des mesures

### Mots de passe
- Hachés avec bcrypt (coût 12) dans un hook `pre('save')` du modèle `Utilisateur`. Le hachage est à sens unique : même en cas de vol de la base, les mots de passe ne peuvent pas être retrouvés.
- Un sel aléatoire est ajouté à chaque mot de passe : deux mots de passe identiques donnent deux empreintes différentes.
- Entre 8 et 72 caractères. Au-delà de 72 octets, bcrypt ignorerait la suite sans prévenir.
- Le champ est caché par défaut dans les recherches (`select: false`). Il n'est demandé qu'à la connexion.

### Jetons d'authentification (JWT)
- Signés avec une clé secrète de 128 caractères aléatoires, rangée dans `.env`.
- Ils ne contiennent que l'identifiant de l'utilisateur, car leur contenu est lisible par tous.
- Valables 1 heure. L'algorithme de signature est imposé à la vérification (`HS256`).
- Un middleware (`verifierJeton`) protège toutes les routes privées et répond 401 sans jeton valide.

### Contrôle des droits
- L'auteur d'une publication, d'un commentaire ou d'un like est toujours la personne du jeton.
- Modifier ou supprimer une publication ou un commentaire est réservé à son auteur (403 sinon).
- Les abonnements ne modifient que la liste de la personne connectée.

### Validation des entrées et injection NoSQL
- Chaque modèle a un schéma qui vérifie le type, la longueur et le format des données.
- Trois barrières contre l'injection NoSQL : contrôle du type des champs de connexion, typage des schémas, et option `sanitizeFilter` de Mongoose qui neutralise les opérateurs `$` reçus dans les recherches.
- Les identifiants reçus dans les adresses sont vérifiés avant toute recherche (404 s'ils sont mal formés).

### Limitation des requêtes
- 300 requêtes par 15 minutes et par IP sur toute l'API.
- 10 tentatives par 15 minutes pour la connexion et l'inscription, contre la force brute.
- Au-delà : réponse 429 et en-tête `Retry-After`.

### Configuration
- `helmet` ajoute des en-têtes de sécurité (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options) et supprime `X-Powered-By`.
- CORS n'autorise qu'une seule origine, celle du front-end, définie dans `.env`. Seulement les méthodes et en-têtes utilisés.
- Les erreurs renvoyées au client sont courtes et sans détails techniques. Le détail reste dans le terminal du serveur.

## Risques connus et acceptés
- **Énumération à l'inscription** : la réponse 409 « Ce pseudo ou cet email est déjà utilisé » révèle qu'un email est inscrit. C'est un compromis courant pour aider l'utilisateur. Le risque est réduit par la limite de 10 essais par 15 minutes.
- **Révocation des jetons** : un jeton reste valable jusqu'à son expiration, même après une déconnexion. La durée courte (1 heure) limite ce risque.
- **Compteur de requêtes en mémoire** : il se remet à zéro au redémarrage du serveur. Avec plusieurs serveurs, il faudrait un stockage partagé.
- **HTTPS** : il sera assuré au déploiement par le serveur placé devant l'API. Sans lui, les jetons circuleraient en clair.
