FROM node:16-alpine as build-step
WORKDIR /frontend
ENV PATH /frontend/node_modules/.bin:$PATH
COPY package.json yarn.lock tsconfig.json ./
COPY ./ ./
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine
ARG NGINX_CONFIG
COPY --from=build-step /frontend/build /usr/share/nginx/html
COPY ${NGINX_CONFIG} /etc/nginx/templates/default.conf.template
