FROM node

WORKDIR /app
ADD . /app

RUN apt update && apt install -y redis-server
RUN npm install

EXPOSE 3000

ENV TIMEZONE Europe/Berlin

# todo: find a better way to run Redis here. most likely in another container
CMD ["bin/sh", "-c", "echo 'maxmemory 30mb' | redis-server - & npm start"]
