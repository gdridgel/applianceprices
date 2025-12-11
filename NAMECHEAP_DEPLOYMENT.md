# 🌐 Deploying to Namecheap Hosting

This guide covers deploying appliance-prices.com to Namecheap's hosting platform.

---

## 📋 Choose Your Namecheap Option

### Option A: Static Export to Shared Hosting (Cheapest)
- **Cost:** $1.98-$4.98/month
- **Difficulty:** Easy
- **SEO:** Good (but not as good as SSR)
- **Updates:** Require rebuild and re-upload

### Option B: VPS Hosting (Full Control)
- **Cost:** $12.88-$29.88/month
- **Difficulty:** Advanced
- **SEO:** Excellent (full SSR)
- **Updates:** Can be automated

### Option C: Domain on Namecheap + Vercel Hosting (Recommended)
- **Cost:** $0/month (domain already paid)
- **Difficulty:** Easy
- **SEO:** Excellent
- **Updates:** Automatic on git push

---

## 🅰️ Option A: Static Export to Shared Hosting

### Step 1: Prepare for Static Export

1. Rename the config file:
```bash
# In your project folder
cp next.config.static.js next.config.js
```

2. Update package.json scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build",
    "lint": "next lint"
  }
}
```

### Step 2: Build Static Files

```bash
npm run build
```

This creates an `out/` folder with all your static HTML, CSS, and JS files.

### Step 3: Upload to Namecheap

1. Log in to Namecheap cPanel
2. Open **File Manager**
3. Navigate to `public_html`
4. Delete existing files (backup first!)
5. Upload contents of `out/` folder
6. Make sure `index.html` is in `public_html` root

### Step 4: Configure .htaccess

Create `.htaccess` file in `public_html`:

```apache
# Enable rewrite engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove .html extension
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json
  AddOutputFilterByType DEFLATE application/javascript text/xml application/xml
</IfModule>
```

### Step 5: Enable SSL

1. In Namecheap cPanel, go to **SSL/TLS**
2. Enable **AutoSSL** or install Let's Encrypt
3. Force HTTPS redirect (done in .htaccess above)

### Step 6: Test

- Visit https://appliance-prices.com
- Check all pages load
- Test filtering and navigation
- Verify images display

### Updating Your Site

Every time you update data or code:
```bash
npm run build
# Upload contents of out/ folder to public_html
```

---

## 🅱️ Option B: VPS Hosting (Advanced)

### Step 1: Get Namecheap VPS

1. Go to Namecheap VPS page
2. Choose **Pulsar** or higher ($12.88+/month)
3. Select **Ubuntu 22.04**
4. Complete purchase

### Step 2: Initial Server Setup

SSH into your VPS:
```bash
ssh root@your-vps-ip
```

Update system:
```bash
apt update && apt upgrade -y
```

Create non-root user:
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x.x
```

### Step 4: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 5: Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### Step 6: Clone Your Project

```bash
cd ~
git clone https://github.com/YOUR-USERNAME/appliance-prices.git
cd appliance-prices
npm install
```

### Step 7: Configure Environment

```bash
cp .env.example .env.local
nano .env.local
# Add your Supabase credentials
```

### Step 8: Build and Start

```bash
npm run build
pm2 start npm --name "appliance-prices" -- start
pm2 save
pm2 startup
```

### Step 9: Configure Nginx

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/appliance-prices
```

Add this content:
```nginx
server {
    listen 80;
    server_name appliance-prices.com www.appliance-prices.com;

    location / {
        proxy_pass http://localhost:3000;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/appliance-prices /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10: SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d appliance-prices.com -d www.appliance-prices.com
```

### Step 11: Point Domain

In Namecheap DNS:
- Add A Record: @ → Your VPS IP
- Add A Record: www → Your VPS IP

### Updating Your VPS Site

```bash
cd ~/appliance-prices
git pull
npm install
npm run build
pm2 restart appliance-prices
```

---

## 🅲️ Option C: Namecheap Domain + Vercel (Recommended)

Keep your domain at Namecheap, host on Vercel for free.

### Step 1: Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Step 2: Get Vercel DNS Settings

In Vercel project → Settings → Domains:
- Add `appliance-prices.com`
- Add `www.appliance-prices.com`
- Vercel shows required DNS records

### Step 3: Update Namecheap DNS

Log in to Namecheap → Domain List → Manage → Advanced DNS

**Delete existing records**, then add:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | Automatic |
| CNAME | www | cname.vercel-dns.com | Automatic |

### Step 4: Wait for Propagation

- Usually 5-30 minutes
- Can take up to 48 hours
- Check status in Vercel dashboard

### Step 5: Verify

- Visit https://appliance-prices.com
- Should show your Vercel-hosted site
- SSL is automatic

---

## 📊 Comparison Summary

| Feature | Static (Shared) | VPS | Vercel |
|---------|-----------------|-----|--------|
| **Cost** | $2-5/mo | $13-30/mo | FREE |
| **Setup Time** | 1-2 hours | 3-4 hours | 30 min |
| **Difficulty** | Easy | Advanced | Easy |
| **SSR/SEO** | No (static) | Yes | Yes |
| **Auto Updates** | No | Git pull | Yes |
| **SSL** | Manual | Certbot | Automatic |
| **CDN** | No | No | Yes (global) |
| **Scaling** | Limited | Manual | Automatic |

---

## 🎯 My Recommendation

**Use Option C (Namecheap Domain + Vercel)**

Why:
1. ✅ **Free** - No monthly hosting cost
2. ✅ **Best SEO** - Full server-side rendering
3. ✅ **Fastest** - Global CDN edge network
4. ✅ **Easiest** - Auto-deploy on git push
5. ✅ **Most reliable** - 99.99% uptime SLA
6. ✅ **Keep your domain** - Just change DNS records

You're literally only changing 2 DNS records in Namecheap, then Vercel handles everything else for free.

---

## ❓ FAQ

**Q: Will I lose my Namecheap domain?**
A: No! You keep full ownership. You're just pointing it to Vercel's servers.

**Q: Can I switch back later?**
A: Yes! Just change the DNS records back.

**Q: Is Vercel really free?**
A: Yes, for personal/hobby projects. Free tier includes:
- Unlimited deployments
- 100GB bandwidth/month
- Custom domains
- SSL certificates
- Global CDN

**Q: What if I exceed the free tier?**
A: Vercel Pro is $20/month. But you'd need significant traffic (100GB+/month) to hit limits.

---

## 🚀 Ready to Deploy?

**If you want Option C (Recommended):**
Just change these DNS records in Namecheap:

```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME  
Host: www
Value: cname.vercel-dns.com
```

Then deploy to Vercel and you're done!

**If you want Option A or B:**
Let me know and I'll provide more detailed code changes needed.
