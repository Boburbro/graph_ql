FROM node:20-alpine

RUN apk add --no-cache openssl3

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "start"]
