FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]