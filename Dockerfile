# Use a lightweight Node image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (this makes builds faster)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Bundle app source
COPY . .

# Your app binds to port 3000
EXPOSE 3000

# The command to run your app
CMD [ "node", "server.js" ]