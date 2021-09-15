FROM node:16-alpine

WORKDIR /app

COPY ./package.json ./yarn.lock /app/

RUN yarn

COPY ./src /app/src
COPY ./gulpfile.ts ./nest-cli.json ./tsconfig.build.json ./tsconfig.json /app/

ARG NETWORK_ENDPOINT

RUN yarn configure && yarn build

CMD [ "npx", "yarn", "start:prod" ]
