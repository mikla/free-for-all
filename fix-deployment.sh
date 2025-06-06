#!/bin/bash

# Fix deployment script for the current Docker Compose issue
# Usage: ./fix-deployment.sh <droplet-ip>

DROPLET_IP=$1

if [ -z "$DROPLET_IP" ]; then
    echo "Usage: ./fix-deployment.sh <droplet-ip>"
    echo "Example: ./fix-deployment.sh 165.22.123.456"
    exit 1
fi

echo "🔧 Fixing Docker Compose deployment issue..."

ssh -i ~/.ssh/id_do root@$DROPLET_IP << 'EOF'
echo "🔍 Diagnosing the issue..."

# Check current Docker Compose version
docker-compose --version

# Stop any failing containers
echo "🛑 Stopping failed containers..."
cd /root/game-deployment
docker-compose down --remove-orphans 2>/dev/null || true

# Clean up any orphaned containers/networks
echo "🧹 Cleaning up Docker..."
docker container prune -f
docker network prune -f
docker volume prune -f

# Try to update Docker Compose to newer version
echo "⬆️ Updating Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /tmp/docker-compose-new
chmod +x /tmp/docker-compose-new
mv /tmp/docker-compose-new /usr/local/bin/docker-compose

# Create symlink
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

echo "✅ Docker Compose updated:"
docker-compose --version

# Try deployment with direct Docker instead
echo "🐳 Switching to direct Docker deployment..."
cd /root/game-deployment

# Build image directly
docker build -t game-server .

# Stop any existing container
docker stop game-server 2>/dev/null || true
docker rm game-server 2>/dev/null || true

# Run container directly
docker run -d \
    --name game-server \
    --restart unless-stopped \
    -p 3001:3001 \
    game-server

# Check if it's running
echo "🔍 Checking container status..."
sleep 3
docker ps
docker logs game-server --tail 20

if docker ps | grep game-server; then
    echo "✅ Game server is now running!"
else
    echo "❌ Still having issues. Container logs:"
    docker logs game-server
fi
EOF

echo ""
echo "🔧 Fix attempt completed!"
echo "🎮 Try accessing your game at: http://$DROPLET_IP"
echo ""
echo "📋 If still having issues, run:"
echo "ssh -i ~/.ssh/id_do root@$DROPLET_IP 'docker logs game-server'" 