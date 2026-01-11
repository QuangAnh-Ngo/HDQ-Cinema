# Stage 1: build frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve với Nginx
FROM nginx:alpine
# copy dist từ stage build
COPY --from=build /app/dist /usr/share/nginx/html
# mount config từ host
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

