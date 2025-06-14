#!/bin/bash

# Git-based deployment script for Digital Ocean
# Usage: ./deploy-server.sh <droplet-ip> <github-repo-url>

DROPLET_IP=$1
REPO_URL=$2

if [ -z "$DROPLET_IP" ] || [ -z "$REPO_URL" ]; then
    echo "Usage: ./deploy-server.sh <droplet-ip> <github-repo-url>"
    echo "Example: ./deploy-server.sh 165.22.123.456 https://github.com/username/hackaton-game.git"
    exit 1
fi

echo "🚀 Deploying to Digital Ocean via Git..."

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
    
    # Install Node.js and npm if not present
    if ! command -v node &> /dev/null; then
        echo "🔧 Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
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
    
    # Navigate to server directory
    cd /root/game-deployment/server
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm ci --only=production
    
    # Build the application
    echo "🔨 Building application..."
    npm run build
    
    # Stop existing container if running
    echo "🛑 Stopping existing services..."
    cd /root/game-deployment
    docker-compose down 2>/dev/null || true
    
    # Start new deployment
    echo "🚀 Starting new deployment..."
    docker-compose up -d --build
    
    echo "✅ Deployment completed!"
    echo "🔍 Checking status..."
    docker-compose ps
EOF

echo "🎉 Deployment finished!"
echo "🌐 Your game should be running at: http://$DROPLET_IP:3001" 