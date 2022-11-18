FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./

RUN npm install -g nodemon
RUN npm install

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3000
CMD [ "npm", "start"]
