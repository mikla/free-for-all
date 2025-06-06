#!/bin/bash

# Full-stack deployment script for Digital Ocean
# Deploys both frontend and backend to the same droplet
# Usage: ./deploy-fullstack.sh <droplet-ip> <google-maps-api-key>

DROPLET_IP=$1
GOOGLE_MAPS_KEY=$2

if [ -z "$DROPLET_IP" ] || [ -z "$GOOGLE_MAPS_KEY" ]; then
    echo "Usage: ./deploy-fullstack.sh <droplet-ip> <google-maps-api-key>"
    echo "Example: ./deploy-fullstack.sh 165.22.123.456 your_google_maps_key"
    exit 1
fi

echo "🚀 Deploying full-stack application to Digital Ocean..."

# Build frontend locally with correct server URL
echo "🔨 Building frontend..."
export VITE_SERVER_URL="http://$DROPLET_IP"
export VITE_GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_KEY"

echo "📋 Generating version info..."
npm run version

# Build and check for success
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found!"
    echo "Please check your build process and try again."
    exit 1
fi

if [ -z "$(ls -A dist)" ]; then
    echo "❌ Build failed - dist folder is empty!"
    echo "Please check your build process and try again."
    exit 1
fi

echo "✅ Frontend build successful!"

# Deploy backend first
echo "🖥️ Deploying backend..."
ssh -i ~/.ssh/id_do root@$DROPLET_IP << EOF
    # Update system if needed
    apt update
    
    # Install nginx if not present
    if ! command -v nginx &> /dev/null; then
        echo "🔧 Installing nginx..."
        apt install nginx -y
        systemctl start nginx
        systemctl enable nginx
    fi
    
    # Create web directory
    mkdir -p /var/www/game
    
    # Deploy backend (reuse existing if running)
    if [ ! -d "/root/game-deployment" ]; then
        echo "📥 Cloning repository for backend..."
        apt install git -y
        git clone https://github.com/mikla/free-for-all.git /root/game-deployment
        cd /root/game-deployment
        
        # Install Docker if needed
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl start docker
            systemctl enable docker
            
            # Install newer Docker Compose (v2) instead of apt version
            echo "🔧 Installing Docker Compose v2..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
            
            # Create symlink for docker compose command
            ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        fi
        
        # Start backend with error handling
        echo "🐳 Starting Docker containers..."
        docker-compose --version
        docker --version
        
        # Clean up any orphaned containers
        docker-compose down --remove-orphans 2>/dev/null || true
        
        # Build and start
        docker-compose up -d --build --force-recreate
        
        # Check if containers are running
        sleep 5
        docker-compose ps
        
    else
        echo "📡 Backend already running, updating..."
        cd /root/game-deployment
        git pull
        
        # Stop, update, and restart with fresh containers
        docker-compose down --remove-orphans 2>/dev/null || true
        docker-compose up -d --build --force-recreate
        
        # Check status
        sleep 5
        docker-compose ps
    fi
EOF

# Upload frontend files
echo "📤 Uploading frontend files..."
scp -i ~/.ssh/id_do -r dist/* root@$DROPLET_IP:/var/www/game/

# Configure nginx
echo "⚙️ Configuring nginx..."
ssh -i ~/.ssh/id_do root@$DROPLET_IP << 'NGINX_EOF'
cat > /etc/nginx/sites-available/game << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Serve frontend files
    root /var/www/game;
    index index.html;
    
    # Handle client-side routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
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
    
    # Optional: Proxy other API routes if needed
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/game /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx

echo "✅ Nginx configured and reloaded"
NGINX_EOF

echo ""
echo "🎉 Full-stack deployment completed!"
echo "🌐 Your game is now live at: http://$DROPLET_IP"
echo ""
echo "🔍 Testing the deployment:"
echo "- Frontend: http://$DROPLET_IP"
echo "- Backend: http://$DROPLET_IP:3001 (direct access)"
echo "- Socket.io: Proxied through nginx"
echo ""
echo "🎮 Open http://$DROPLET_IP in multiple browser tabs to test multiplayer!" 