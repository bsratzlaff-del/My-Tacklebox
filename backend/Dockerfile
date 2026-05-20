FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

# Your app binds to port 8565
RUN mkdir -p logs
EXPOSE 8565

# The command to run your app
CMD [ "node", "server.js" ]