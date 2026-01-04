# Dockerfile cho React Frontend (Dev Mode)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]