FROM node

WORKDIR /app
ADD . /app

RUN npm install -g npm@latest
RUN npm install --production

EXPOSE 3000

ENV TIMEZONE Europe/Berlin

CMD ["npm", "start"]
