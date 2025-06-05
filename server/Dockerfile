FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies for smaller production image
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"] 