# 🏠 Appliance-Prices.com - Self-Hosted Version

Price comparison site for major appliances, migrated from Base44 to Next.js + Supabase.

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <your-repo>
cd appliance-prices
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run locally
npm run dev
# Open http://localhost:3000
```

## 📚 Documentation

- **[Migration Guide](./MIGRATION_GUIDE.md)** - Complete step-by-step migration from Base44
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Supabase table structure
- **[API Reference](./docs/API.md)** - How to query data
- **[SEO Guide](./docs/SEO.md)** - SEO improvements included

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel
- **Language:** TypeScript

## 📊 Features

✅ 7 appliance categories (Refrigerators, Washers, Dryers, etc.)
✅ Advanced filtering (type, brand, color, features)
✅ Price per unit calculations
✅ Star ratings and reviews
✅ Product detail pages
✅ SEO optimized (meta tags, schema markup, sitemap)
✅ Mobile responsive
✅ Server-side rendering
✅ Image optimization

## 🗄️ Database Structure

Single `appliances` table with:
- Common fields (price, brand, model, etc.)
- Category-specific fields (capacity, BTU, etc.)
- Feature flags (energy_star, smart_features, etc.)
- Images and Amazon links

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

## 🌐 Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Optional
NEXT_PUBLIC_AMAZON_TAG=your-affiliate-20
```

## 📈 What's Different from Base44?

| Feature | Base44 | Self-Hosted |
|---------|--------|-------------|
| **Database** | Base44 entities | Supabase PostgreSQL |
| **Hosting** | Base44 platform | Vercel |
| **Cost** | Platform fees | Free tier available |
| **SEO** | Limited | Full control |
| **Speed** | Good | Excellent (Edge CDN) |
| **Customization** | Limited | Full control |
| **Data Export** | Depends on platform | Always yours |

## 🎯 SEO Improvements

This version includes:
- Dynamic meta tags per page
- Open Graph tags for social sharing
- Schema.org product markup
- Automatic sitemap generation
- Server-side rendering
- Clean URLs (no query params)
- Optimized images with Next/Image

## 🤝 Contributing

This is your private repo, but if you want to add features:

1. Create a feature branch
2. Make changes
3. Test locally
4. Deploy to preview (Vercel does this automatically)
5. Merge to main

## 📝 License

Private - All Rights Reserved

## 🆘 Support

- Check the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Review [Supabase docs](https://supabase.com/docs)
- Check [Next.js docs](https://nextjs.org/docs)

---

**Built with ❤️ for appliance-prices.com**
