FROM node:16-alpine
# WORKDIR /usr/src/app
WORKDIR ./
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "Server.js"]
