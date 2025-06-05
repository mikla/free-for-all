#!/bin/bash

# Artifact-based deployment (build locally, deploy only dist)
# Usage: ./deploy-artifact.sh <droplet-ip>

DROPLET_IP=$1

if [ -z "$DROPLET_IP" ]; then
    echo "Usage: ./deploy-artifact.sh <droplet-ip>"
    echo "Example: ./deploy-artifact.sh 165.22.123.456"
    exit 1
fi

echo "🚀 Building and deploying artifacts..."

# Build everything locally
echo "🔨 Building server locally..."
cd server
npm ci
npm run build
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy-package/server

# Copy only necessary files
cp server/package*.json deploy-package/server/
cp -r server/dist deploy-package/server/
cp docker-compose.yml deploy-package/

# Create a simple production Dockerfile
cat > deploy-package/server/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
EOF

# Upload deployment package
echo "📤 Uploading deployment package..."
rsync -avz --progress deploy-package/ root@$DROPLET_IP:/root/game-deployment/

# Deploy on server
ssh root@$DROPLET_IP << 'EOF'
    echo "🚀 Deploying on server..."
    cd /root/game-deployment
    
    # Stop existing services
    docker-compose down 2>/dev/null || true
    
    # Build and start
    docker-compose up -d --build
    
    echo "✅ Deployment completed!"
    docker-compose ps
EOF

# Cleanup
rm -rf deploy-package

echo "🎉 Deployment finished!"
echo "🌐 Your game should be running at: http://$DROPLET_IP:3001" 