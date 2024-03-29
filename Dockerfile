FROM node:12-alpine AS build-stage

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm ci --loglevel error --no-fund

COPY --chown=node:node . .

RUN npm run build

FROM node:12-alpine

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --from=build-stage --chown=node:node /home/node/app/build ./build
COPY --from=build-stage --chown=node:node /home/node/app/package*.json ./

USER root
# Add wait-for-it
RUN apk update && apk add bash
COPY wait-for-it.sh wait-for-it.sh 
RUN chmod +x wait-for-it.sh

USER root

RUN npm ci --only=production --loglevel error --no-fund

ARG BUILD_VERSION=<unknown>
RUN echo $BUILD_VERSION > build-version.txt

EXPOSE 4000


CMD [ "node", "./build/index.js" ]