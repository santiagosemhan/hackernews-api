
# Stage 1: Build the app
FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Run the app
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV production

EXPOSE 3000

CMD [ "node", "dist/main" ]