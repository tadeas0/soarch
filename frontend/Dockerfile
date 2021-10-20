FROM node:16-alpine as build-step
WORKDIR /frontend
ENV PATH /frontend/node_modules/.bin:$PATH
COPY package.json yarn.lock tsconfig.json ./
COPY ./src ./src
COPY ./public ./public
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build-step /frontend/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
