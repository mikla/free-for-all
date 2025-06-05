#!/bin/bash

# Docker-only deployment script (no local Node.js needed)
# Usage: ./deploy-docker-only.sh <droplet-ip> <github-repo-url>

DROPLET_IP=$1
REPO_URL=$2

if [ -z "$DROPLET_IP" ] || [ -z "$REPO_URL" ]; then
    echo "Usage: ./deploy-docker-only.sh <droplet-ip> <github-repo-url>"
    echo "Example: ./deploy-docker-only.sh 165.22.123.456 https://github.com/username/hackaton-game.git"
    exit 1
fi

echo "🚀 Deploying to Digital Ocean via Docker..."

# SSH commands to run on the droplet
ssh -i ~/.ssh/id_do root@$DROPLET_IP << EOF
    echo "📦 Setting up deployment environment..."
    
    # Update system
    apt update
    
    # Install Git if not present
    if ! command -v git &> /dev/null; then
        echo "🔧 Installing Git..."
        apt install git -y
    fi
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        echo "🔧 Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl start docker
        systemctl enable docker
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        echo "🔧 Installing Docker Compose..."
        apt install docker-compose -y
    fi
    
    # Remove old deployment if exists
    rm -rf /root/game-deployment
    
    # Clone the repository
    echo "📥 Cloning repository..."
    git clone $REPO_URL /root/game-deployment
    
    # Navigate to project directory
    cd /root/game-deployment
    
    # Stop existing container if running
    echo "🛑 Stopping existing services..."
    docker-compose down 2>/dev/null || true
    
    # Build and start new deployment (Docker will handle Node.js build)
    echo "🚀 Building and starting services..."
    docker-compose up -d --build
    
    echo "✅ Deployment completed!"
    echo "🔍 Checking status..."
    docker-compose ps
    echo ""
    echo "📋 Checking logs..."
    docker-compose logs --tail=20
EOF

echo "🎉 Deployment finished!"
echo "🌐 Your game should be running at: http://$DROPLET_IP:3001" 