# Dockerfile cho React Frontend (Dev Mode)
FROM node:20-alpine

WORKDIR /app

# Set môi trường dev rõ ràng
ENV NODE_ENV=development

# Không tự động mở browser khi chạy trong container
ENV BROWSER=none

# Copy package files
COPY package*.json ./

# Install dependencies
# RUN npm install

RUN npm ci

# Copy source code
COPY . .

RUN npm run build

# Expose port 3000
EXPOSE 4173


# Healthcheck (Docker biết container còn sống hay không)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O - http://localhost:4173 || exit 1


# Start development server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
