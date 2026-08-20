FROM node:22.22.3-bookworm AS build

WORKDIR /app
COPY package*.json ./
COPY projects/orc-ds/package.json projects/orc-ds/package.json
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build:lib && npm run build:docs

FROM nginx:1.27-alpine
COPY deploy/komodo/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/docs/browser /usr/share/nginx/html
