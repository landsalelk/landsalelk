---
description: Deploy landsale.lk to VPS and Appwrite
---

# LandSale.lk Deployment Workflow

## Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │    │     VPS     │    │  Appwrite   │
│   (Source)  │───►│  (Frontend) │◄──►│  (Backend)  │
│             │    │  PM2/Nginx  │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## VPS Details
- **IP:** 75.119.150.209
- **SSH:** root@75.119.150.209
- **Password:** <X<2B^e,s;-*fc?
- **Path:** /var/www/landsale

## Appwrite Details
- **Endpoint:** https://sgp.cloud.appwrite.io/v1
- **Project ID:** landsalelkproject
- **Database ID:** landsalelkdb

---

## 1. Deploy Code to VPS

### Sync local changes to VPS:
// turbo
```bash
rsync -avz --progress --exclude 'node_modules' --exclude '.next' --exclude '.git' -e "sshpass -p '<X<2B^e,s;-*fc?' ssh" ./ root@75.119.150.209:/var/www/landsale/
```

### Rebuild and restart on VPS:
```bash
sshpass -p '<X<2B^e,s;-*fc?' ssh root@75.119.150.209 "cd /var/www/landsale && npm install --legacy-peer-deps && npm run build && pm2 restart landsale"
```

---

## 2. Deploy Schema Changes to Appwrite

### Push collection changes:
```bash
npx appwrite push collection --all --force
```

### Or manually via API (for specific collection):
```bash
curl -X PUT "https://sgp.cloud.appwrite.io/v1/databases/landsalelkdb/collections/{COLLECTION_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: landsalelkproject" \
  -H "X-Appwrite-Key: {API_KEY}" \
  -d '{"name": "...", "permissions": [...]}'
```

---

## 3. Check VPS Status

### View PM2 logs:
// turbo
```bash
sshpass -p '<X<2B^e,s;-*fc?' ssh root@75.119.150.209 "pm2 logs landsale --lines 50 --nostream"
```

### Check if site is running:
// turbo
```bash
curl -s -o /dev/null -w "%{http_code}" https://75.119.150.209
```

---

## 4. Environment Variables

### Copy .env.local to VPS:
```bash
sshpass -p '<X<2B^e,s;-*fc?' scp .env.local root@75.119.150.209:/var/www/landsale/.env.local
```

### Update NEXT_PUBLIC_APP_URL for production:
```bash
sshpass -p '<X<2B^e,s;-*fc?' ssh root@75.119.150.209 "sed -i 's|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=https://landsale.lk|' /var/www/landsale/.env.local"
```

---

## 5. SSL & DNS

### Cloudflare DNS (Already configured):
- `landsale.lk` → 75.119.150.209 (Proxied)
- `www.landsale.lk` → 75.119.150.209 (Proxied)

### Cloudflare SSL Mode:
Set to **"Full"** in Cloudflare Dashboard → SSL/TLS → Overview

---

## 6. Add Appwrite Web Platforms (for CORS)

```bash
npx appwrite projects create-platform --project-id landsalelkproject --type web --name "LandSale.lk" --hostname "landsale.lk"
npx appwrite projects create-platform --project-id landsalelkproject --type web --name "VPS IP" --hostname "75.119.150.209"
```

---

## Quick Commands Summary

| Action | Command |
|--------|---------|
| SSH to VPS | `sshpass -p '<X<2B^e,s;-*fc?' ssh root@75.119.150.209` |
| Sync code | `rsync -avz --exclude 'node_modules' --exclude '.next' ...` |
| Rebuild | `pm2 restart landsale` |
| View logs | `pm2 logs landsale` |
| Check site | `curl https://75.119.150.209` |
