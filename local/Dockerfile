# Base image
FROM node:lts

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]
