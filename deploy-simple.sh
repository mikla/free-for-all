#!/bin/bash

# Simple deployment script that avoids Docker Compose issues
# Uses direct Docker commands instead
# Usage: ./deploy-simple.sh <droplet-ip> <google-maps-api-key>

DROPLET_IP=$1
GOOGLE_MAPS_KEY=$2

if [ -z "$DROPLET_IP" ] || [ -z "$GOOGLE_MAPS_KEY" ]; then
    echo "Usage: ./deploy-simple.sh <droplet-ip> <google-maps-api-key>"
    echo "Example: ./deploy-simple.sh 165.22.123.456 your_google_maps_key"
    exit 1
fi

echo "🚀 Simple deployment to Digital Ocean (avoiding Docker Compose)..."

# Build frontend locally
echo "🔨 Building frontend..."
export VITE_SERVER_URL="http://$DROPLET_IP"
export VITE_GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_KEY"

# Generate version file
echo "📋 Generating version info..."
npm run version

npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Frontend build successful!"

# Deploy using direct Docker commands
echo "🖥️ Deploying backend with direct Docker..."
ssh -i ~/.ssh/id_do root@$DROPLET_IP << EOF
    # Update system
    apt update
    
    # Install nginx
    if ! command -v nginx &> /dev/null; then
        apt install nginx -y
        systemctl start nginx
        systemctl enable nginx
    fi
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl start docker
        systemctl enable docker
    fi
    
    # Create web directory
    mkdir -p /var/www/game
    
    # Deploy backend with direct Docker commands
    if [ ! -d "/root/game-deployment" ]; then
        apt install git -y
        git clone https://github.com/mikla/free-for-all.git /root/game-deployment
    else
        cd /root/game-deployment && git pull
    fi
    
    cd /root/game-deployment
    
    # Stop any existing container
    docker stop game-server 2>/dev/null || true
    docker rm game-server 2>/dev/null || true
    
    # Build the Docker image
    echo "🔨 Building Docker image..."
    docker build -t game-server server/
    
    # Run the container
    echo "🚀 Starting game server..."
    docker run -d \
        --name game-server \
        --restart unless-stopped \
        -p 3001:3001 \
        game-server
    
    # Check if container is running
    sleep 3
    if docker ps | grep game-server; then
        echo "✅ Game server is running!"
    else
        echo "❌ Game server failed to start!"
        docker logs game-server
        exit 1
    fi
EOF

# Upload frontend
echo "📤 Uploading frontend files..."
scp -i ~/.ssh/id_do -r dist/* root@$DROPLET_IP:/var/www/game/

# Configure nginx
echo "⚙️ Configuring nginx..."
ssh -i ~/.ssh/id_do root@$DROPLET_IP << 'NGINX_EOF'
cat > /etc/nginx/sites-available/game << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/game;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/game /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "✅ Nginx configured"
NGINX_EOF

echo ""
echo "🎉 Simple deployment completed!"
echo "🌐 Your game is live at: http://$DROPLET_IP"
echo ""
echo "🔧 Troubleshooting commands:"
echo "ssh -i ~/.ssh/id_do root@$DROPLET_IP 'docker logs game-server'"
echo "ssh -i ~/.ssh/id_do root@$DROPLET_IP 'docker ps'"
echo ""
echo "🎮 Test at: http://$DROPLET_IP" 