# Base image
FROM node:lts

# Create app directory
WORKDIR /app

# Install app dependencies
COPY ./package*.json ./
RUN npm install

COPY ./src ./src
COPY ./test ./test
COPY ./tsconfig.json ./
COPY ./tsconfig.build.json ./
COPY ./.eslintrc.js ./
COPY ./nest-cli.json ./

# Start the app
CMD ["npm", "run", "ci"]