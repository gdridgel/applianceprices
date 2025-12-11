# 🚀 Appliance-Prices.com Migration Guide
## From Base44 to Self-Hosted (Next.js + Supabase)

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Supabase](#setup-supabase)
4. [Database Migration](#database-migration)
5. [Deploy to Vercel](#deploy-to-vercel)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)
8. [Going Live](#going-live)
9. [Cost Breakdown](#cost-breakdown)

---

## 🎯 Overview

**What You're Getting:**
- ✅ Next.js 15 with App Router (best for SEO)
- ✅ Supabase PostgreSQL database (free tier: 500MB, 50k rows)
- ✅ Vercel hosting (free tier with custom domain)
- ✅ Server-side rendering for instant Google indexing
- ✅ Automatic sitemap generation
- ✅ Full SEO optimization built-in
- ✅ All your current features preserved

**Migration Time:** ~4-6 hours
**Difficulty:** Intermediate (I'll guide you step-by-step)

---

## 📦 Prerequisites

**What You Need:**
1. GitHub account (free)
2. Vercel account (free - sign up with GitHub)
3. Supabase account (free - sign up with GitHub)
4. Your domain: appliance-prices.com

**Install on Your Computer:**
```bash
# Install Node.js 18+ (if not installed)
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## 🗄️ Setup Supabase

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Project name:** `appliance-prices`
   - **Database password:** (save this!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
6. Click "Create new project" (takes ~2 minutes)

### Step 2: Create Database Table

1. In your Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Paste this SQL and click "Run":

```sql
-- Create appliances table
CREATE TABLE appliances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  asin TEXT,
  brand TEXT,
  model TEXT,
  title TEXT,
  type TEXT,
  color TEXT,
  price DECIMAL(10,2),
  list_price DECIMAL(10,2),
  rating DECIMAL(3,2),
  review_count INTEGER,
  product_url TEXT,
  image_url TEXT,
  image_urls TEXT[],
  
  -- Refrigerator fields
  total_capacity_cuft DECIMAL(5,2),
  fridge_capacity_cuft DECIMAL(5,2),
  freezer_capacity_cuft DECIMAL(5,2),
  
  -- Washer/Dryer fields
  capacity_cuft DECIMAL(5,2),
  max_spin_speed_rpm INTEGER,
  voltage INTEGER,
  
  -- Air Fryer fields
  capacity_quarts DECIMAL(5,2),
  wattage INTEGER,
  temperature_range_max INTEGER,
  
  -- Window AC fields
  btu INTEGER,
  cooling_sqft INTEGER,
  ceer DECIMAL(5,2),
  noise_level_db INTEGER,
  
  -- Ice Maker fields
  daily_production_lbs INTEGER,
  storage_capacity_lbs INTEGER,
  ice_ready_minutes INTEGER,
  ice_type TEXT,
  
  -- Freezer fields
  defrost_type TEXT,
  
  -- Dimensions
  width_inches DECIMAL(5,2),
  height_inches DECIMAL(5,2),
  depth_inches DECIMAL(5,2),
  weight_lbs DECIMAL(6,2),
  
  -- Energy
  annual_energy_kwh INTEGER,
  
  -- Features (booleans)
  energy_star BOOLEAN DEFAULT FALSE,
  ice_maker BOOLEAN DEFAULT FALSE,
  water_dispenser BOOLEAN DEFAULT FALSE,
  smart_features BOOLEAN DEFAULT FALSE,
  fingerprint_resistant BOOLEAN DEFAULT FALSE,
  steam_clean BOOLEAN DEFAULT FALSE,
  stackable BOOLEAN DEFAULT FALSE,
  agitator BOOLEAN DEFAULT FALSE,
  steam_refresh BOOLEAN DEFAULT FALSE,
  sensor_dry BOOLEAN DEFAULT FALSE,
  dishwasher_safe BOOLEAN DEFAULT FALSE,
  digital_display BOOLEAN DEFAULT FALSE,
  dehydrator_function BOOLEAN DEFAULT FALSE,
  rotisserie_function BOOLEAN DEFAULT FALSE,
  self_cleaning BOOLEAN DEFAULT FALSE,
  water_line_required BOOLEAN DEFAULT FALSE,
  heater_included BOOLEAN DEFAULT FALSE,
  remote_control BOOLEAN DEFAULT FALSE,
  garage_ready BOOLEAN DEFAULT FALSE,
  door_lock BOOLEAN DEFAULT FALSE,
  interior_light BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_appliances_category ON appliances(category);
CREATE INDEX idx_appliances_price ON appliances(price);
CREATE INDEX idx_appliances_brand ON appliances(brand);
CREATE INDEX idx_appliances_asin ON appliances(asin);

-- Enable Row Level Security (RLS)
ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON appliances
  FOR SELECT USING (true);

-- Create policy for authenticated insert/update (for admin)
CREATE POLICY "Allow authenticated insert" ON appliances
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON appliances
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### Step 3: Get API Keys

1. Click "Project Settings" (gear icon, bottom left)
2. Click "API" in the sidebar
3. Copy these values (you'll need them later):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbG...` (long string)

---

## 📊 Database Migration

### Export Data from Base44

**Option A: Manual Export (if available)**
1. Go to Base44 dashboard
2. For each entity (Refrigerator, Washer, Dryer, etc.):
   - Export to CSV or JSON
3. Save all files

**Option B: Using the Code (if you have data locally)**

Create a file `migrate-data.js` in your migrated-app folder:

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// Example: Your Base44 exported data
const refrigerators = [
  { 
    brand: "LG", 
    model: "LFXS26973S",
    price: 1999.99,
    total_capacity_cuft: 26.0,
    // ... other fields
  },
  // ... more items
]

async function migrateData() {
  // Map category name to your data
  const dataToMigrate = [
    { category: 'Refrigerators', items: refrigerators },
    // Add other categories...
  ]

  for (const { category, items } of dataToMigrate) {
    // Add category field to each item
    const itemsWithCategory = items.map(item => ({
      ...item,
      category
    }))

    // Insert in batches of 100
    for (let i = 0; i < itemsWithCategory.length; i += 100) {
      const batch = itemsWithCategory.slice(i, i + 100)
      const { error } = await supabase
        .from('appliances')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i/100 + 1}:`, error)
      } else {
        console.log(`Inserted batch ${i/100 + 1} (${batch.length} items)`)
      }
    }
  }

  console.log('Migration complete!')
}

migrateData()
```

Run it:
```bash
cd migrated-app
npm install @supabase/supabase-js
node migrate-data.js
```

---

## 🚢 Deploy to Vercel

### Step 1: Push to GitHub

```bash
# In your migrated-app directory
git init
git add .
git commit -m "Initial commit: Migrated from Base44"

# Create repo on GitHub (github.com/new)
# Then:
git remote add origin https://github.com/YOUR-USERNAME/appliance-prices.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select your `appliance-prices` repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - Click "Environment Variables" and add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
6. Click "Deploy"
7. Wait 2-3 minutes ☕

Your site is now live at: `https://appliance-prices.vercel.app`

### Step 3: Add Custom Domain

1. In Vercel dashboard, click your project
2. Go to "Settings" → "Domains"
3. Add: `appliance-prices.com` and `www.appliance-prices.com`
4. Vercel will show DNS records to add
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Add the DNS records Vercel shows you:
   ```
   Type: A Record
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
7. Wait 5-60 minutes for DNS propagation
8. ✅ Your site is live!

---

## 🔐 Environment Variables

Create `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your_key_here

# Optional: Amazon Affiliate Tag
NEXT_PUBLIC_AMAZON_TAG=your-affiliate-tag-20
```

**Never commit `.env.local` to GitHub!** It's already in `.gitignore`.

---

## 🧪 Testing

### Local Testing

```bash
cd migrated-app
npm install
npm run dev
```

Open http://localhost:3000

**Test Checklist:**
- [ ] Homepage loads
- [ ] Can switch categories
- [ ] Filters work (type, brand, color)
- [ ] Product detail pages load
- [ ] Images display
- [ ] Amazon links work
- [ ] Mobile responsive

### Production Testing

After deploying:
- [ ] Visit appliance-prices.com
- [ ] Test all features
- [ ] Check Google PageSpeed Insights
- [ ] Test on mobile devices

---

## 🌐 Going Live

### 1. Submit to Google

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add property: `appliance-prices.com`
3. Verify with DNS TXT record
4. Submit sitemap: `https://appliance-prices.com/sitemap.xml`

**Google Analytics (Optional):**
1. Create property at analytics.google.com
2. Add tracking ID to Next.js config

### 2. Monitor

- **Vercel Dashboard:** Check deployment status, errors
- **Supabase Dashboard:** Monitor database usage
- **Google Search Console:** Track indexing, search performance

---

## 💰 Cost Breakdown

### Free Tier (Recommended to Start)

| Service | Free Tier | Cost When Scaled |
|---------|-----------|------------------|
| **Vercel** | Unlimited projects, 100GB bandwidth/mo | $20/mo Pro |
| **Supabase** | 500MB database, 50k rows, 2GB bandwidth | $25/mo Pro |
| **Domain** | N/A | $12/year |
| **Cloudflare** | Unlimited bandwidth, DDoS protection | $0 |
| **Total** | **$0/month** | **$45-50/month** at scale |

### When to Upgrade?

- **Vercel:** >100GB bandwidth/month or need analytics
- **Supabase:** >500MB database or >50k products

**Your current scale:** Probably well under free limits!

---

## 🎉 What's Next?

After migrating, you can:

1. **Set up automated price updates:**
   - Use Vercel Cron Jobs to fetch Keepa data daily
   - Update Supabase automatically

2. **Add new features:**
   - Price history charts
   - Email alerts for price drops
   - User accounts and wishlists
   - Compare multiple products side-by-side

3. **SEO Improvements:**
   - Automatic sitemap updates
   - Dynamic Open Graph images
   - Rich snippets / Schema markup
   - Blog for content marketing

---

## 🆘 Troubleshooting

**"Error connecting to Supabase"**
- Check your environment variables
- Make sure RLS policies are set up
- Verify API keys are correct

**"Build failed on Vercel"**
- Check build logs in Vercel dashboard
- Make sure all dependencies are in package.json
- Verify TypeScript has no errors: `npm run build` locally

**"Site is slow"**
- Enable Vercel Edge Network
- Optimize images (Next.js does this automatically)
- Add caching headers

---

## 📞 Need Help?

1. Check Vercel docs: https://vercel.com/docs
2. Check Supabase docs: https://supabase.com/docs
3. Come back here and ask me any questions!

---

## ✅ Migration Checklist

Before going live:
- [ ] Supabase project created
- [ ] Database table created
- [ ] Data migrated
- [ ] Environment variables set
- [ ] Deployed to Vercel
- [ ] Custom domain added
- [ ] DNS configured
- [ ] Site tested
- [ ] Google Search Console set up
- [ ] Sitemap submitted

**Estimated Time:** 4-6 hours total

Let me know when you're ready to start, and I'll help you through each step!
