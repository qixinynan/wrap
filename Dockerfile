FROM node:20

WORKDIR /app
COPY ./package.json /app/
RUN npm install
RUN npm install
COPY . /app/
EXPOSE 3000
CMD node app.js