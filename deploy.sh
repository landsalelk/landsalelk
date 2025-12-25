#!/bin/bash
# Landsale.lk Deployment Script

echo "🚀 Starting Deployment..."

# 1. Sync Files
echo "📂 Syncing files to VPS..."
rsync -avz --exclude '.git' --exclude 'node_modules' --exclude '.next' ./ root@75.119.150.209:/var/www/landsale/

# 2. Build & Restart on Server
echo "🏗️  Building and Restarting Server..."
ssh -t root@75.119.150.209 "cd /var/www/landsale && echo 'Installing dependencies...' && npm install --production=false && echo 'Building...' && npm run build && echo 'Restarting...' && pm2 restart landsale"

echo "✅ Deployment Complete!"
