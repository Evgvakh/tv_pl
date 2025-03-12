FROM node

WORKDIR /tv_pl/src/app

COPY package*.json ./

RUN npm ci

# COPY src ./src
COPY . .

RUN npm prune

CMD ["node", "index.js"]

