FROM node:20.11.0-alpine
RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python
RUN mkdir -p /server
WORKDIR /server

COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm rebuild bcrypt
RUN npm install nodeman

COPY . .

EXPOSE 5000

CMD ["npm", "start"]