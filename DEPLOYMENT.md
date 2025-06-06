# 🚀 Digital Ocean Deployment Guide

This guide will help you deploy your multiplayer battle royale game to Digital Ocean using efficient deployment methods.

## 📋 Prerequisites

- Digital Ocean account
- Google Maps API key
- Basic terminal/SSH knowledge
- Git repository

## 🖥️ Step 1: Create Digital Ocean Droplet

1. Log in to Digital Ocean
2. Create a new Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month or higher recommended)
   - **Region**: Choose closest to your target audience
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `game-server` or similar

## 🚀 Step 2: One-Command Full-Stack Deployment (Recommended)

### 🥇 **Deploy Everything with One Command!**

This is the **easiest and fastest** method - deploys both frontend and backend to the same droplet:

```bash
./deploy-fullstack.sh YOUR-DROPLET-IP YOUR-GOOGLE-MAPS-API-KEY
```

**Example:**
```bash
./deploy-fullstack.sh 165.22.123.456 AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw
```

### ✨ **What this does:**
1. 🔨 **Builds frontend** locally with proper environment variables
2. 🖥️ **Deploys/updates backend** using Docker
3. 📤 **Uploads frontend** files to the server
4. ⚙️ **Configures nginx** to serve everything
5. 🌐 **Your game is live** at `http://YOUR-DROPLET-IP`

### 🎯 **Benefits:**
- ✅ **One URL** - everything works from `http://YOUR-DROPLET-IP`
- ✅ **No CORS issues** (same domain for frontend/backend)
- ✅ **Proper WebSocket support** (nginx proxying)
- ✅ **Easy management** (one server, one command)
- ✅ **Cost effective** (single $6/month droplet)

---

## 🔧 Alternative: Manual Deployment Methods

If you prefer manual deployment or need more control:

### 🥈 Option 1: Backend-Only Deployment
**For when you want to deploy frontend separately**

```bash
./deploy-docker-only.sh YOUR-DROPLET-IP https://github.com/mikla/free-for-all.git
```

### 🥉 Option 2: Rsync Deployment
**Good for development/testing**

```bash
./deploy-rsync.sh YOUR-DROPLET-IP
```

---

## 🌐 Frontend-Only Deployment Options

If you're using the backend-only deployment above:

### Option A: Netlify (Free & Easy)
1. Build locally:
   ```bash
   ./deploy-frontend.sh http://YOUR-DROPLET-IP:3001 YOUR-GOOGLE-MAPS-KEY
   ```
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `dist` folder
4. Done! 🎉

### Option B: Vercel (GitHub Integration)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_SERVER_URL=http://YOUR-DROPLET-IP:3001`

---

## ⚡ Quick Start Commands

### 🚀 **Full-Stack (All-in-One) - RECOMMENDED**
```bash
./deploy-fullstack.sh 165.22.123.456 your_google_maps_key
```
**Result:** Game live at `http://165.22.123.456` ✨

### 🖥️ **Backend Only**
```bash
./deploy-docker-only.sh 165.22.123.456 https://github.com/mikla/free-for-all.git
```
**Result:** API live at `http://165.22.123.456:3001`

### 🌐 **Frontend Build**
```bash
./deploy-frontend.sh http://165.22.123.456:3001 your_google_maps_key
```
**Result:** Files ready in `dist/` folder for upload

---

## 🎮 Testing Your Deployment

After deployment:

1. **Visit your game**: `http://YOUR-DROPLET-IP`
2. **Open multiple browser tabs** to test multiplayer
3. **Try the battle royale features**:
   - Move with WASD or arrow keys
   - Get close to other players (red "FIGHT MODE")
   - Press SPACE to shoot when enemies are in range
   - Watch the death/respawn system

---

## 📊 Monitoring & Debugging

### Check Server Status
```bash
# SSH into your droplet
ssh root@YOUR-DROPLET-IP

# Check backend (Docker)
cd /root/game-deployment
docker-compose ps
docker-compose logs -f

# Check frontend (nginx)
systemctl status nginx
ls -la /var/www/game/

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### Common Issues & Solutions

#### ❌ **"Cannot connect to server"**
```bash
# Check if backend is running
ssh root@YOUR-IP 'cd /root/game-deployment && docker-compose ps'

# Restart backend if needed
ssh root@YOUR-IP 'cd /root/game-deployment && docker-compose restart'
```

#### ❌ **"Page not found" or nginx errors**
```bash
# Check nginx configuration
ssh root@YOUR-IP 'nginx -t'

# Restart nginx
ssh root@YOUR-IP 'systemctl restart nginx'

# Check frontend files
ssh root@YOUR-IP 'ls -la /var/www/game/'
```

#### ❌ **Build errors locally**
- Make sure you have Node.js installed
- Run `npm install` first
- Check that your Google Maps API key is valid

---

## 🔐 Security & SSL Setup (Optional)

### Add HTTPS with Let's Encrypt
```bash
# SSH into your droplet
ssh root@YOUR-DROPLET-IP

# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

### Configure Firewall
```bash
# Allow only necessary ports
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

---

## ⚡ Performance Comparison

| Method | Setup Time | Complexity | Best For |
|--------|------------|------------|----------|
| **Full-Stack** | **2 minutes** | **Easy** | **Production** |
| Backend-Only | 3 minutes | Medium | Custom frontend |
| Netlify Split | 4 minutes | Medium | Free hosting |
| Manual Setup | 10+ minutes | Hard | Learning |

---

## 💰 Cost Breakdown

### Full-Stack on Digital Ocean
- **Droplet**: $6/month (Basic plan)
- **Domain** (optional): $12/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$6/month 💚

### Split Deployment
- **Backend Droplet**: $6/month
- **Frontend**: Free (Netlify)
- **Total**: ~$6/month

---

## 🎉 You're Live!

Once deployed, your multiplayer battle royale game is ready for the world! 

### Share Your Game
- **URL**: `http://YOUR-DROPLET-IP`
- **Features**: Real-time multiplayer, combat system, death/respawn
- **Players**: Support for multiple simultaneous players
- **Map**: London streets with clustered spawn points for instant action

### Next Steps
- Share the URL with friends for multiplayer testing
- Consider adding a custom domain
- Monitor server performance as player count grows
- Add SSL for production use

**🚀 Happy Gaming!** 🎮 