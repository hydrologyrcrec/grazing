FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY deployment/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY deployment/grazing-api.conf /etc/nginx/snippets/grazing-api.conf
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/grazing/browser /usr/share/nginx/html
EXPOSE 8080
