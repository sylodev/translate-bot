FROM node:14-alpine

WORKDIR /opt/translate-bot
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . ./

CMD ["node", "src/index.js"]