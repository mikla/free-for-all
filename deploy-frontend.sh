#!/bin/bash

# Frontend deployment build script
# Usage: ./deploy-frontend.sh <server-url> <google-maps-api-key>

SERVER_URL=$1
GOOGLE_MAPS_KEY=$2

if [ -z "$SERVER_URL" ] || [ -z "$GOOGLE_MAPS_KEY" ]; then
    echo "Usage: ./deploy-frontend.sh <server-url> <google-maps-api-key>"
    echo "Example: ./deploy-frontend.sh http://165.22.123.456:3001 your_google_maps_key"
    exit 1
fi

echo "🚀 Building frontend for production..."

# Set environment variables
export VITE_SERVER_URL=$SERVER_URL
export VITE_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY

# Build the frontend
npm run build

echo "✅ Frontend built successfully!"
echo "📁 Built files are in the 'dist' folder"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://app.netlify.com/drop"
echo "2. Drag and drop the 'dist' folder"
echo "3. Your game will be live instantly!"
echo ""
echo "🔧 Don't forget to set environment variables in Netlify:"
echo "   VITE_SERVER_URL = $SERVER_URL"
echo "   VITE_GOOGLE_MAPS_API_KEY = $GOOGLE_MAPS_KEY" 