# 📋 Deployment Checklist for appliance-prices.com

Use this checklist to ensure nothing is missed during migration.

---

## Phase 1: Pre-Migration (Before You Start)

### ✅ Accounts Setup
- [ ] Create GitHub account (if needed)
- [ ] Create Vercel account (sign up with GitHub)
- [ ] Create Supabase account (sign up with GitHub)
- [ ] Have access to domain registrar (GoDaddy, Namecheap, etc.)

### ✅ Data Preparation
- [ ] Export all data from Base44
  - [ ] Refrigerators
  - [ ] Washers
  - [ ] Dryers
  - [ ] Air Fryers
  - [ ] Ice Makers
  - [ ] Window AC units
  - [ ] Freezers
- [ ] Save exports as CSV or JSON
- [ ] Note: Total number of products: _______

---

## Phase 2: Supabase Setup

### ✅ Create Project
- [ ] Go to supabase.com
- [ ] Create new project: `appliance-prices`
- [ ] Choose region: __________ (closest to your users)
- [ ] Save database password: __________
- [ ] Wait for project to be ready (~2 min)

### ✅ Database Setup
- [ ] Open SQL Editor
- [ ] Run table creation SQL (from MIGRATION_GUIDE.md)
- [ ] Verify table exists in Table Editor
- [ ] Set up Row Level Security policies
- [ ] Create indexes for performance

### ✅ Get API Credentials
- [ ] Go to Project Settings → API
- [ ] Copy Project URL: __________
- [ ] Copy anon/public key: __________
- [ ] Save these securely!

---

## Phase 3: Data Migration

### ✅ Import Data
Choose your method:

**Option A: CSV Upload (Easiest)**
- [ ] Go to Supabase Table Editor
- [ ] Click "Insert" → "Import data from CSV"
- [ ] Upload each category's CSV
- [ ] Verify data imported correctly
- [ ] Check total row count matches export

**Option B: Script Migration**
- [ ] Create migrate-data.js script
- [ ] Add your Supabase credentials
- [ ] Format your data correctly
- [ ] Run: `node migrate-data.js`
- [ ] Verify no errors
- [ ] Check data in Supabase Table Editor

### ✅ Verify Data
- [ ] Check a few random products
- [ ] Verify images load
- [ ] Verify prices are correct
- [ ] Verify all categories have data
- [ ] Total products in database: _______

---

## Phase 4: Code Setup

### ✅ Get the Code
- [ ] Extract migrated-app folder
- [ ] Open terminal/command prompt
- [ ] Navigate to folder: `cd migrated-app`
- [ ] Install dependencies: `npm install`

### ✅ Configure Environment
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Supabase URL
- [ ] Add Supabase anon key
- [ ] Add Amazon affiliate tag (optional)

### ✅ Test Locally
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:3000
- [ ] Test homepage loads
- [ ] Test category switching
- [ ] Test filters work
- [ ] Test product detail pages
- [ ] Test on mobile (resize browser)
- [ ] Fix any errors before proceeding

---

## Phase 5: GitHub Setup

### ✅ Create Repository
- [ ] Go to github.com
- [ ] Click "New repository"
- [ ] Name: `appliance-prices`
- [ ] Make it private (recommended)
- [ ] Don't initialize with README
- [ ] Create repository

### ✅ Push Code
Run these commands in your migrated-app folder:
```bash
git init
git add .
git commit -m "Initial commit: Migrated from Base44"
git remote add origin https://github.com/YOUR-USERNAME/appliance-prices.git
git push -u origin main
```

- [ ] Refresh GitHub - code should be there
- [ ] Verify all files uploaded

---

## Phase 6: Vercel Deployment

### ✅ Deploy Project
- [ ] Go to vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Select `appliance-prices` repo
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `./`

### ✅ Add Environment Variables
Click "Environment Variables" and add:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = (your URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your key)
- [ ] `NEXT_PUBLIC_AMAZON_TAG` = (your affiliate tag)

### ✅ Deploy
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes ☕
- [ ] Deployment successful?
- [ ] Visit the Vercel URL: __________
- [ ] Test the live site

---

## Phase 7: Custom Domain

### ✅ Add Domain in Vercel
- [ ] In Vercel, go to project Settings
- [ ] Click "Domains"
- [ ] Add: `appliance-prices.com`
- [ ] Add: `www.appliance-prices.com`
- [ ] Note the DNS records shown

### ✅ Configure DNS
Go to your domain registrar (GoDaddy, Namecheap, etc.):

- [ ] Add A Record:
  - Type: A
  - Name: @
  - Value: 76.76.21.21
  - TTL: 3600

- [ ] Add CNAME Record:
  - Type: CNAME
  - Name: www
  - Value: cname.vercel-dns.com
  - TTL: 3600

- [ ] Save DNS changes
- [ ] Wait 5-60 minutes for propagation
- [ ] Check status in Vercel dashboard

### ✅ Verify Domain
- [ ] Visit appliance-prices.com
- [ ] Visit www.appliance-prices.com
- [ ] Both should redirect to HTTPS
- [ ] SSL certificate should be active (🔒)

---

## Phase 8: SEO Setup

### ✅ Google Search Console
- [ ] Go to search.google.com/search-console
- [ ] Add property: appliance-prices.com
- [ ] Verify with DNS (add TXT record)
- [ ] Wait for verification
- [ ] Submit sitemap: `https://appliance-prices.com/sitemap.xml`

### ✅ Verify SEO Elements
- [ ] Check each category page has unique title
- [ ] Check meta descriptions are present
- [ ] Check Open Graph tags (share on social media)
- [ ] Check images have alt text
- [ ] Run PageSpeed Insights test
- [ ] Score: Desktop _____ / Mobile _____

---

## Phase 9: Final Testing

### ✅ Functionality Test
- [ ] Homepage loads quickly
- [ ] All 7 categories work
- [ ] Filters work (type, brand, color)
- [ ] Sorting works
- [ ] Product pages load
- [ ] Images display correctly
- [ ] Amazon links work
- [ ] Ratings show correctly

### ✅ Mobile Test
- [ ] Test on iPhone/Android
- [ ] Sidebar filters slide in
- [ ] Table scrolls horizontally
- [ ] Images load
- [ ] Text is readable
- [ ] Buttons are tappable

### ✅ Performance Test
- [ ] Run Google PageSpeed Insights
- [ ] Desktop score > 90?
- [ ] Mobile score > 80?
- [ ] Fix any issues identified

### ✅ SEO Test
- [ ] Google Search Console shows pages indexed
- [ ] Sitemap submitted successfully
- [ ] No indexing errors
- [ ] Meta tags appear correctly in search

---

## Phase 10: Going Live

### ✅ Pre-Launch
- [ ] Make one final backup of old Base44 site
- [ ] Screenshot old site for reference
- [ ] Save all Base44 data exports
- [ ] Inform team/users of migration (if applicable)

### ✅ Launch
- [ ] Confirm new site works: appliance-prices.com
- [ ] Old Base44 site can be shut down
- [ ] Monitor for 24 hours
- [ ] Check error logs in Vercel
- [ ] Check database usage in Supabase

### ✅ Post-Launch
- [ ] Share on social media
- [ ] Update any external links
- [ ] Monitor Google Search Console
- [ ] Track traffic in analytics
- [ ] Celebrate! 🎉

---

## Phase 11: Monitoring (First Week)

### ✅ Daily Checks
- [ ] Day 1: Site loads, no errors
- [ ] Day 2: Google starting to index
- [ ] Day 3: Check Vercel/Supabase usage
- [ ] Day 4: Review any error logs
- [ ] Day 5: Check search rankings
- [ ] Day 6: Verify all features working
- [ ] Day 7: Full review and optimization

### ✅ Metrics to Track
- [ ] Page views: _______
- [ ] Unique visitors: _______
- [ ] Google Search impressions: _______
- [ ] Vercel bandwidth used: _______
- [ ] Supabase database size: _______
- [ ] Average page load time: _______

---

## 🆘 Troubleshooting

### Issue: "Can't connect to Supabase"
- [ ] Check .env.local has correct URL/key
- [ ] Verify RLS policies allow public read
- [ ] Check Supabase project is active

### Issue: "Build fails on Vercel"
- [ ] Run `npm run build` locally to see errors
- [ ] Check all TypeScript errors fixed
- [ ] Verify all dependencies in package.json

### Issue: "Images not loading"
- [ ] Check image URLs in database
- [ ] Verify Next.js config allows Amazon domain
- [ ] Check browser console for errors

### Issue: "Domain not working"
- [ ] Verify DNS records are correct
- [ ] Wait full 60 minutes for propagation
- [ ] Check Vercel domain status
- [ ] Try incognito browser

### Issue: "Slow performance"
- [ ] Run PageSpeed Insights
- [ ] Check Supabase query performance
- [ ] Verify images are optimized
- [ ] Enable caching in Vercel

---

## ✅ Success Criteria

Your migration is complete when:
- [ ] Site loads at appliance-prices.com
- [ ] All products visible and searchable
- [ ] No console errors
- [ ] Mobile experience is smooth
- [ ] PageSpeed score > 80
- [ ] Google Search Console shows indexing
- [ ] You're excited about the new site! 🎉

---

## 📊 Migration Stats

**Start Date:** ___/___/2024
**Completion Date:** ___/___/2024
**Total Time:** _____ hours

**Data Migrated:**
- Total products: _______
- Total categories: 7
- Database size: _______ MB

**Performance:**
- Old site load time: _____ seconds
- New site load time: _____ seconds
- Improvement: _____% faster

**Costs:**
- Old hosting: $_____ /month
- New hosting: $_____ /month
- Savings: $_____/month

---

## 🎉 Next Steps

After a successful migration:

1. **Set up automated price updates**
   - Schedule daily Keepa API pulls
   - Auto-update Supabase

2. **Add analytics**
   - Google Analytics
   - Vercel Analytics
   - Monitor user behavior

3. **Content strategy**
   - Write buying guides
   - Create blog posts
   - Build email list

4. **Feature additions**
   - Price history graphs
   - Email price alerts
   - User accounts
   - Comparison tool

---

**Need help?** Come back and ask! I'm here to help you succeed. 🚀
