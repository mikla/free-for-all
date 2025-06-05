#!/bin/bash

# Rsync-based deployment script (excludes node_modules)
# Usage: ./deploy-rsync.sh <droplet-ip>

DROPLET_IP=$1

if [ -z "$DROPLET_IP" ]; then
    echo "Usage: ./deploy-rsync.sh <droplet-ip>"
    echo "Example: ./deploy-rsync.sh 165.22.123.456"
    exit 1
fi

echo "🚀 Deploying via rsync (excluding node_modules)..."

# Build locally first
echo "🔨 Building server locally..."
cd server
npm run build
cd ..

# Sync files excluding unnecessary directories
echo "📤 Syncing files to server..."
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    ./server/ root@$DROPLET_IP:/root/game-server/

# Copy docker-compose.yml
rsync -avz docker-compose.yml root@$DROPLET_IP:/root/

# Run deployment commands on server
ssh root@$DROPLET_IP << 'EOF'
    echo "📦 Installing dependencies on server..."
    cd /root/game-server
    npm ci --only=production
    
    echo "🔨 Building on server..."
    npm run build
    
    echo "🛑 Stopping existing services..."
    cd /root
    docker-compose down 2>/dev/null || true
    
    echo "🚀 Starting services..."
    docker-compose up -d --build
    
    echo "✅ Deployment completed!"
    docker-compose ps
EOF

echo "🎉 Deployment finished!"
echo "🌐 Your game should be running at: http://$DROPLET_IP:3001" 