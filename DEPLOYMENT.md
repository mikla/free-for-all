# 🚀 Digital Ocean Deployment Guide

This guide will help you deploy your multiplayer battle royale game to Digital Ocean using efficient deployment methods.

## 📋 Prerequisites

- Digital Ocean account
- Google Maps API key
- Basic terminal/SSH knowledge
- Git repository (for Option 1)

## 🖥️ Step 1: Create Digital Ocean Droplet

1. Log in to Digital Ocean
2. Create a new Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month or higher recommended)
   - **Region**: Choose closest to your target audience
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `game-server` or similar

## 🔧 Step 2: Set Up Server

SSH into your droplet:
```bash
ssh root@your-droplet-ip
```

Install Docker and Docker Compose:
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Start Docker
systemctl start docker
systemctl enable docker
```

## 📦 Step 3: Choose Your Deployment Method

### 🥇 Option 1: Git-based Deployment (Recommended)
**Fastest and most efficient - no node_modules transfer!**

1. Push your code to GitHub/GitLab
2. Deploy using Git:
```bash
./deploy-server.sh YOUR-DROPLET-IP https://github.com/username/hackaton-game.git
```

**Pros:**
- ✅ Fastest deployment
- ✅ No large file transfers
- ✅ Version control integration
- ✅ Easy rollbacks

### 🥈 Option 2: Rsync with Exclusions
**Good for when you can't use Git**

```bash
./deploy-rsync.sh YOUR-DROPLET-IP
```

**Pros:**
- ✅ Excludes node_modules
- ✅ Shows progress
- ✅ Only syncs changed files

### 🥉 Option 3: Artifact Deployment
**Build locally, deploy only production files**

```bash
./deploy-artifact.sh YOUR-DROPLET-IP
```

**Pros:**
- ✅ Smallest deployment package
- ✅ Build locally (faster)
- ✅ Only production files transferred

## 🌐 Step 4: Deploy Frontend

### Option A: Netlify (Recommended)
1. Build your frontend locally:
   ```bash
   npm run build
   ```

2. Create `.env` file with production values:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key
   VITE_SERVER_URL=http://your-droplet-ip:3001
   ```

3. Deploy `dist` folder to Netlify

### Option B: Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_SERVER_URL`

## 🔐 Step 5: Security & Domain Setup

### Set up SSL (Optional but recommended)
```bash
# Install Nginx
apt install nginx -y

# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com
```

### Configure Nginx proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ⚡ Quick Deployment Commands

```bash
# Method 1: Git-based (fastest)
./deploy-server.sh 165.22.123.456 https://github.com/username/repo.git

# Method 2: Rsync (no node_modules)
./deploy-rsync.sh 165.22.123.456

# Method 3: Artifacts only
./deploy-artifact.sh 165.22.123.456
```

## 🔍 Step 6: Testing

1. Check server health: `http://your-droplet-ip:3001`
2. Test frontend connection to server
3. Open multiple browser tabs to test multiplayer

## 📊 Monitoring

Monitor your server:
```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
htop
```

## 🛠️ Troubleshooting

### Server won't start:
- Check logs: `docker-compose logs`
- Verify port 3001 is not in use: `netstat -tulpn | grep 3001`
- Check firewall: `ufw status`

### Frontend can't connect:
- Verify `VITE_SERVER_URL` is correct
- Check CORS settings in server
- Ensure port 3001 is open

### Deployment Issues:
```bash
# Re-deploy
./deploy-server.sh YOUR-IP YOUR-REPO

# Check deployment logs
ssh root@YOUR-IP 'cd /root/game-deployment && docker-compose logs'

# Restart services
ssh root@YOUR-IP 'cd /root/game-deployment && docker-compose restart'
```

## ⚡ Performance Comparison

| Method | Transfer Size | Deploy Time | Best For |
|--------|---------------|-------------|----------|
| Git-based | ~500KB | ~30 seconds | Production |
| Rsync | ~2MB | ~45 seconds | Development |
| Artifact | ~1MB | ~40 seconds | CI/CD |
| ~~SCP (old)~~ | ~~200MB+~~ | ~~5+ minutes~~ | ~~Never~~ |

## 💰 Cost Estimate

- **Digital Ocean Droplet**: $6-12/month
- **Domain** (optional): $10-15/year
- **Total**: ~$6-12/month

## 🎮 Your Game is Live!

Once deployed, share your game URL and watch players battle it out in real-time! 🔥

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Docker logs
3. Verify environment variables
4. Test locally first 