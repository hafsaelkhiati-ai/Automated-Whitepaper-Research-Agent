# AGENT 05 — VPS Deployment Guide
# How to take the Whitepaper Research Agent live on your own VPS

---

## What You Need Before Starting

| Item               | Where to get it                              | Cost       |
|--------------------|----------------------------------------------|------------|
| VPS (Ubuntu 22.04) | Hetzner / DigitalOcean / Contabo             | €4–10/mo   |
| Domain name        | Namecheap / Cloudflare                       | ~€10/yr    |
| Perplexity API key | https://www.perplexity.ai/settings/api       | ~$5/brief  |
| Anthropic API key  | https://console.anthropic.com/settings/keys  | ~$0.50/brief |
| Notion integration | https://www.notion.so/my-integrations        | Free       |

Minimum VPS spec: **2 vCPU, 2 GB RAM, 20 GB SSD** (Hetzner CX22 works perfectly)

---

## Step 1 — SSH Into Your VPS

```bash
ssh root@YOUR_VPS_IP
```

If you set up an SSH key during provisioning, use:
```bash
ssh -i ~/.ssh/your_key root@YOUR_VPS_IP
```

---

## Step 2 — Install Node.js 20 + Git + Nginx

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version   # Should print v20.x.x
npm --version    # Should print 10.x.x

# Install Git and Nginx
apt install -y git nginx

# Install PM2 globally (process manager — keeps your app alive)
npm install -g pm2
```

---

## Step 3 — Clone Your Repository

```bash
# Create app directory
mkdir -p /var/www/agent05
cd /var/www/agent05

# Clone your repo (or upload files via SCP)
git clone https://github.com/YOUR_USERNAME/agent05.git .

# If no Git repo yet, use SCP from your local machine:
# scp -r ./whitepaper-agent root@YOUR_VPS_IP:/var/www/agent05
```

---

## Step 4 — Configure Backend Environment Variables

```bash
cd /var/www/agent05/backend

# Copy the example file
cp .env.example .env

# Edit with your real keys
nano .env
```

Fill in these values in the editor:

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com          ← your real domain

PERPLEXITY_API_KEY=pplx-xxx...              ← from perplexity.ai
ANTHROPIC_API_KEY=sk-ant-xxx...             ← from console.anthropic.com
NOTION_API_KEY=secret_xxx...               ← from notion.so/my-integrations
NOTION_DATABASE_ID=xxxxxxxx...             ← from your Notion database URL

SESSION_SECRET=run_openssl_rand_hex_32     ← generate with: openssl rand -hex 32
ENABLE_CITATION_VALIDATION=true
```

Save: `Ctrl+O` then `Enter`, exit: `Ctrl+X`

---

## Step 5 — Install Backend Dependencies

```bash
cd /var/www/agent05/backend
npm install
```

---

## Step 6 — Configure Frontend Environment and Build

```bash
cd /var/www/agent05/frontend

# Copy env file
cp .env.example .env

# Edit — set your backend API URL
nano .env
```

Set:
```
VITE_API_URL=https://api.yourdomain.com
```

Then build the frontend:
```bash
npm install
npm run build
```

This creates `frontend/dist/` — the static files Nginx will serve.

---

## Step 7 — Start Backend with PM2

```bash
cd /var/www/agent05/backend

# Start with PM2
pm2 start server.js --name agent05-backend

# Save PM2 config so it survives reboots
pm2 save

# Set PM2 to auto-start on reboot
pm2 startup
# ← Copy and run the command it outputs (starts with "sudo env PATH=...")
```

Check it's running:
```bash
pm2 status
pm2 logs agent05-backend
```

---

## Step 8 — Configure Nginx

Nginx will serve the frontend static files AND proxy API requests to your backend.

```bash
# Create Nginx site config
nano /etc/nginx/sites-available/agent05
```

Paste this config (replace `yourdomain.com` with your real domain):

```nginx
# Frontend — serves React app
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/agent05/frontend/dist;
    index index.html;

    # React Router support — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API — proxies to Node.js on port 3001
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Longer timeout for AI API calls (research can take 30-60s)
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
```

Enable the site and restart Nginx:
```bash
# Enable site
ln -s /etc/nginx/sites-available/agent05 /etc/nginx/sites-enabled/

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart
systemctl restart nginx
systemctl enable nginx
```

---

## Step 9 — Set Up HTTPS with Let's Encrypt (Free SSL)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificates for both domains
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts — enter email, agree to ToS, choose redirect HTTP→HTTPS

# Auto-renewal is set up automatically. Test it:
certbot renew --dry-run
```

---

## Step 10 — Point Your Domain DNS

In your domain registrar (Cloudflare, Namecheap, etc.):

| Type  | Name  | Value          | TTL  |
|-------|-------|----------------|------|
| A     | @     | YOUR_VPS_IP    | Auto |
| A     | www   | YOUR_VPS_IP    | Auto |
| A     | api   | YOUR_VPS_IP    | Auto |

Wait 5–30 minutes for DNS to propagate, then visit `https://yourdomain.com`.

---

## Step 11 — Configure Notion Database

1. Open Notion → create a new database (table view)
2. Add these properties (exact names matter):
   - `Name` (Title — already exists)
   - `Status` (Select) — add options: "Research Complete", "In Review", "Published"
   - `Topic` (Text)
   - `Audience` (Text)
   - `Word Count Target` (Number)
   - `Sources Count` (Number)
   - `Created By` (Text)

3. Share the database with your integration:
   - Click `...` → `Connections` → find your integration → click to add

4. Get the database ID from the URL:
   ```
   https://notion.so/workspace/THIS_IS_YOUR_DATABASE_ID?v=...
   ```
   Copy the 32-character hex string and paste it as `NOTION_DATABASE_ID` in `.env`

---

## Deployment Verification Checklist

Run these checks after deployment:

```bash
# Backend health
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}

# PM2 status
pm2 status

# Nginx status
systemctl status nginx

# View live logs
pm2 logs agent05-backend --lines 50

# Check SSL
curl -I https://yourdomain.com
```

---

## Updating the App After Code Changes

```bash
cd /var/www/agent05

# Pull latest code
git pull

# Rebuild frontend
cd frontend && npm install && npm run build && cd ..

# Restart backend
cd backend && npm install
pm2 restart agent05-backend
```

---

## Firewall Setup (Recommended)

```bash
# Allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Block direct port 3001 access (backend only accessible via Nginx)
ufw deny 3001
```

---

## Cost Summary

| Item           | Cost          |
|----------------|---------------|
| Hetzner CX22   | €3.79/mo      |
| Domain         | ~€0.80/mo     |
| SSL (Let's Encrypt) | Free     |
| Per whitepaper | ~$6 API costs |

**Total infrastructure:** ~€5/month

---

## Troubleshooting

**"502 Bad Gateway"** → Backend isn't running. Run `pm2 status` and `pm2 logs`.

**"CORS error" in browser** → Check `FRONTEND_URL` in `backend/.env` matches your domain exactly.

**"Notion API error"** → Confirm you've shared the database with the integration. Check `NOTION_DATABASE_ID` has no extra spaces.

**"Perplexity API error"** → Verify key is valid at perplexity.ai, check account has credits.

**Research taking >2 min** → Increase `proxy_read_timeout` in Nginx config to `180s`.

**App crashes on reboot** → Run `pm2 startup` again and execute the command it outputs.
