FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build both server and client
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start server
CMD ["npm", "start"]
