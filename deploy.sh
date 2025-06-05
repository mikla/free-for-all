#!/bin/bash

echo "🚀 Starting deployment to Digital Ocean..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Build server
echo "📦 Building server..."
cd server
npm run build
cd ..

echo "✅ Build completed!"
echo "📁 Frontend built to: ./dist"
echo "📁 Server built to: ./server/dist"

echo ""
echo "🔧 Next steps for Digital Ocean deployment:"
echo "1. Create a Digital Ocean Droplet (Ubuntu 20.04+)"
echo "2. Install Docker and Docker Compose on the droplet"
echo "3. Copy the server folder to your droplet"
echo "4. Set up environment variables:"
echo "   - CLIENT_URL=https://your-frontend-domain.com"
echo "   - PORT=3001"
echo "5. Run: docker build -t game-server ."
echo "6. Run: docker run -d -p 3001:3001 --name game-server game-server"
echo "7. Deploy frontend to a static hosting service (Netlify, Vercel, etc.)"
echo "8. Update frontend environment variables to point to your server" 