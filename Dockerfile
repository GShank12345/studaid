# Use Node 20+
FROM node:26.7.0

WORKDIR /app

# 1. Copy only package files first
COPY package*.json ./


# Copy source code
COPY . ./

# Install dependencies
# RUN npm install

# 2. Run clean installation (creates native Linux binaries)
RUN npm ci


# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8081

# Start the application
CMD ["npm", "start"]
