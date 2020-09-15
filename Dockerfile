FROM node:14-alpine

WORKDIR /opt/translate-bot

COPY package.json yarn.lock ./
RUN apk add gcc make libc-dev python g++ --no-cache --virtual .build-deps
RUN yarn install --production
RUN apk del .build-deps
COPY . ./

CMD ["node", "src/index.js"]