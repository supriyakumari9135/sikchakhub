# SikchaKhub.AI — Production Deployment Guide

**Target Architecture:**
- **Frontend SPA:** Hosted on Vercel Edge (`sikchakhub.in`)
- **Backend API:** Hosted on Contabo VPS (`api.sikchakhub.in`) running PM2 Cluster behind Nginx Reverse Proxy
- **Database:** MongoDB Atlas M30+ Cloud Replica Set

---

## 1. Contabo VPS Server Setup

### 1.1 System Packages & Node.js 20 LTS
Connect to your Contabo VPS via SSH:
```bash
ssh root@<YOUR_CONTABO_VPS_IP>

# Update base system
apt update && apt upgrade -y

# Install build tools, Nginx, Git, and Certbot
apt install -y curl git build-essential nginx certbot python3-certbot-nginx ufw

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify versions
node -v   # v20.x
npm -v    # v10.x

# Install PM2 Process Manager globally
npm install -g pm2
```

### 1.2 Firewall Configuration (UFW)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## 2. Backend Deployment on Contabo VPS

### 2.1 Clone Repository & Setup Directory
```bash
mkdir -p /var/www/sikchakhub
mkdir -p /var/log/sikchakhub
cd /var/www/sikchakhub

git clone https://github.com/your-org/sikchakhub.git .
cd backend

# Install production dependencies
npm ci
```

### 2.2 Configure Production Environment Variables (`backend/.env`)
Create `/var/www/sikchakhub/backend/.env`:
```ini
NODE_ENV=production
PORT=5001

# MongoDB Atlas Cloud Replica Set URI
MONGODB_URI=mongodb+srv://sikchakhub_admin:<SECURE_PASSWORD>@cluster0.mongodb.net/sikchakhub?retryWrites=true&w=majority&appName=SikchaKhubProd

# Authentication Secrets
JWT_SECRET=your_super_secret_high_entropy_jwt_key_256_bit
JWT_EXPIRES_IN=7d

# Storage & Upload Directory
UPLOAD_DIR=/var/www/sikchakhub/backend/uploads
MAX_FILE_SIZE_BYTES=5242880

# Production Domains for CORS Whitelist
ALLOWED_ORIGINS=https://sikchakhub.in,https://www.sikchakhub.in,https://api.sikchakhub.in
```

### 2.3 Compile TypeScript & Launch PM2 Cluster
```bash
# Build TypeScript into dist/
npm run build

# Start using the multi-core cluster configuration
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list so it survives server reboots
pm2 save
pm2 startup systemd
```

Verify PM2 status:
```bash
pm2 status
pm2 logs sikchakhub-api
```

---

## 3. Nginx Reverse Proxy & SSL Configuration

### 3.1 Install Virtual Host Configuration
Copy the included `nginx/sikchakhub.conf` to `/etc/nginx/sites-available/`:
```bash
cp /var/www/sikchakhub/nginx/sikchakhub.conf /etc/nginx/sites-available/sikchakhub.conf
ln -s /etc/nginx/sites-available/sikchakhub.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
```

### 3.2 Obtain Free Let's Encrypt SSL Certificates
Ensure DNS `A` record for `api.sikchakhub.in` points to `<YOUR_CONTABO_VPS_IP>`:
```bash
certbot --nginx -d api.sikchakhub.in --agree-tos --no-eff-email -m admin@sikchakhub.in
```

### 3.3 Test & Reload Nginx
```bash
nginx -t
systemctl reload nginx
```

Verify backend health check:
```bash
curl -I https://api.sikchakhub.in/api/health
# HTTP/2 200 OK
```

---

## 4. Frontend Deployment on Vercel (`sikchakhub.in`)

1. **Connect Repository:** Import the repository in the Vercel Dashboard.
2. **Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Environment Variables:**
   - `VITE_API_BASE_URL` = `https://api.sikchakhub.in`
4. **Custom Domain:**
   - Add domain `sikchakhub.in` and `www.sikchakhub.in`.
   - Configure DNS CNAME / A records as prompted by Vercel.

---

## 5. Ongoing Operations & Maintenance

### 5.1 Zero-Downtime Rolling Code Updates
Whenever a new update is pushed:
```bash
cd /var/www/sikchakhub
git pull origin main
cd backend
npm ci
npm run build
pm2 reload ecosystem.config.cjs --env production
```

### 5.2 PM2 Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
```
Logs are archived daily with 14-day retention, preventing disk exhaustion.

