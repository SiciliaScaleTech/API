# Recette de l'image Docker de l'API
# Chaque ligne est une étape. Docker garde le résultat de chaque étape en cache
# et ne refait que celles qui ont changé.

# 1. Point de départ : une image officielle de Node.js 26 (version LTS), sur un Linux allégé
FROM node:26-slim

# 2. Dossier de travail dans le conteneur : les commandes suivantes s'y exécutent
WORKDIR /app

# 3. Mode production : certaines bibliothèques (dont Express) se comportent de façon plus sûre et plus rapide
ENV NODE_ENV=production

# 4. On copie d'abord SEULEMENT la liste des dépendances, puis on les installe.
#    Tant que package.json ne change pas, Docker réutilise cette étape en cache : la reconstruction est rapide.
#    npm ci installe exactement les versions de package-lock.json. --omit=dev : pas les outils de développement.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 5. Puis on copie le code de l'API et le front-end
COPY src ./src
COPY public ./public

# 6. Sécurité : le conteneur ne tourne pas en administrateur (root), mais avec l'utilisateur limité "node"
#    Si une faille permettait d'exécuter du code, il n'aurait pas les droits d'administrateur
USER node

# 7. Le port sur lequel l'API écoute dans le conteneur (information pour Docker et pour les lecteurs)
EXPOSE 3000

# 8. La commande lancée au démarrage du conteneur
#    Pas de --env-file ici : les variables sont fournies par Docker Compose
CMD ["node", "src/server.js"]
