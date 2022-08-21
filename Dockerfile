FROM node:16-alpine

RUN apk add gcc make libc-dev python3 g++ --no-cache
RUN npm i -g pnpm

WORKDIR /opt/translate-bot

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production

COPY . ./

CMD ["node", "src/index.js"]