FROM node:18.18-alpine AS build
WORKDIR /app

COPY VieBook.FE/package*.json ./
RUN npm ci --legacy-peer-deps

COPY VieBook.FE/ .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
