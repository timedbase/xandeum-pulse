# Deployment Guide

Complete guide for deploying the Xandeum Pulse Backend to production.

## Table of Contents

1. [VPS Deployment (Recommended)](#vps-deployment)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Monitoring & Maintenance](#monitoring--maintenance)

---

## VPS Deployment

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy (optional)

### Step 1: Set Up the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app user (optional but recommended)
sudo useradd -m -s /bin/bash xandeum
sudo su - xandeum
```

### Step 2: Deploy the Application

```bash
# Clone or copy your project
cd /home/xandeum
git clone <your-repo-url> xandeum-pulse
cd xandeum-pulse/backend

# Install dependencies
npm ci --only=production

# Build the project
npm run build

# Set up environment
cp .env.example .env
nano .env  # Edit with your production values
```

### Step 3: Configure PM2

```bash
# Start the application
pm2 start dist/index.js --name xandeum-pulse-backend

# Save the PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup systemd
# Run the command that PM2 outputs

# Monitor the application
pm2 status
pm2 logs xandeum-pulse-backend
```

### Step 4: Set Up Nginx (Optional)

```nginx
# /etc/nginx/sites-available/xandeum-pulse-backend

server {
    listen 80;
    server_name api.xandeum-pulse.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/xandeum-pulse-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.xandeum-pulse.com
```

---

## Docker Deployment

### Dockerfile

Create [Dockerfile](./Dockerfile):

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: xandeum-pulse-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run

```bash
# Build the image
docker build -t xandeum-pulse-backend .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

---

## Cloud Deployment

### AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (or larger for production)
   - Open port 3001 in security group

2. **Follow VPS Deployment steps** above

### DigitalOcean

1. **Create Droplet**
   - Ubuntu 22.04
   - Basic plan ($6/month minimum)
   - Add SSH key

2. **Follow VPS Deployment steps** above

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables in Railway dashboard
# Deploy
railway up
```

### Render

1. Create new Web Service
2. Connect your GitHub repo
3. Configure:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add all variables from `.env`

---

## Environment Variables for Production

```env
# Backend Configuration
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# pRPC Endpoints (comma-separated, add all available endpoints)
PRPC_ENDPOINTS=http://endpoint1:6000/rpc,http://endpoint2:6000/rpc,http://endpoint3:6000/rpc

# Sync Configuration
SYNC_INTERVAL_SECONDS=60
API_TIMEOUT_MS=10000
MAX_RETRIES=3

# Logging
LOG_LEVEL=info
```

---

## Monitoring & Maintenance

### Health Checks

Set up monitoring to ping the health endpoint:

```bash
# Using cron for simple monitoring
# Add to crontab -e
*/5 * * * * curl -f http://localhost:3001/health || echo "Health check failed" | mail -s "Backend Down" your@email.com
```

### PM2 Monitoring

```bash
# View logs
pm2 logs xandeum-pulse-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart xandeum-pulse-backend

# Reload without downtime
pm2 reload xandeum-pulse-backend
```

### Log Rotation

PM2 automatically handles log rotation. For custom logs:

```bash
# Install logrotate config
sudo nano /etc/logrotate.d/xandeum-pulse
```

```
/home/xandeum/xandeum-pulse/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 xandeum xandeum
}
```

### Updating the Application

```bash
# Pull latest changes
cd /home/xandeum/xandeum-pulse/backend
git pull

# Install dependencies
npm ci --only=production

# Rebuild
npm run build

# Reload without downtime
pm2 reload xandeum-pulse-backend
```

---

## Backup Strategy

### Database Backups

Supabase handles automatic backups. For additional safety:

```bash
# Use Supabase CLI to export data
npx supabase db dump -f backup.sql
```

### Application Backups

```bash
# Backup environment and logs
tar -czf backup-$(date +%Y%m%d).tar.gz .env logs/
```

---

## Security Checklist

- [ ] Use HTTPS with SSL certificate
- [ ] Rotate Supabase service keys regularly
- [ ] Keep Node.js and dependencies updated
- [ ] Set up firewall (UFW or similar)
- [ ] Use fail2ban for SSH protection
- [ ] Enable automatic security updates
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables, never commit secrets
- [ ] Implement rate limiting if exposing publicly

---

## Troubleshooting

### High Memory Usage

```bash
# Check memory
free -h

# Restart the service
pm2 restart xandeum-pulse-backend
```

### Sync Failing

```bash
# Check logs
pm2 logs xandeum-pulse-backend --lines 100

# Test pRPC endpoint manually
curl http://endpoint:6000/rpc -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'

# Trigger manual sync
curl -X POST http://localhost:3001/sync/trigger
```

### Service Not Starting

```bash
# Check PM2 logs
pm2 logs xandeum-pulse-backend --err

# Validate environment
node -e "require('dotenv').config(); console.log(process.env)"

# Check if port is in use
sudo netstat -tulpn | grep 3001
```

---

## Performance Optimization

### Adjust Sync Interval

For high-traffic production:
```env
SYNC_INTERVAL_SECONDS=30  # More frequent updates
```

For resource-constrained servers:
```env
SYNC_INTERVAL_SECONDS=120  # Less frequent updates
```

### PM2 Cluster Mode

For high availability:
```bash
pm2 start dist/index.js --name xandeum-pulse-backend -i 2
```

---

## Support

For deployment issues:
- Check logs: `pm2 logs xandeum-pulse-backend`
- Verify configuration: `curl http://localhost:3001/health`
- Join Xandeum Discord: https://discord.gg/uqRSmmM5m
