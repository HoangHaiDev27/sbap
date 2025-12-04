FROM node:20.19-alpine AS build
WORKDIR /app

COPY VieBook.FE/package*.json ./
COPY VieBook.FE/copy-pdf-worker.js ./
RUN npm ci --legacy-peer-deps

COPY VieBook.FE/ .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
