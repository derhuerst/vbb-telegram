FROM node

WORKDIR /app
ADD . /app

RUN npm install --production

EXPOSE 3000

ENV TIMEZONE Europe/Berlin

CMD ["npm", "start"]
