import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Blog posts content - in production, this would come from a CMS or database
const blogPosts: Record<string, {
  title: string
  description: string
  date: string
  category: string
  readTime: string
  content: string
}> = {
  'best-time-to-buy-appliances': {
    title: 'Best Time to Buy Appliances in 2025: Complete Guide',
    description: 'Discover the best times of year to buy major appliances and save hundreds. From holiday sales to seasonal clearances, we cover it all.',
    date: '2025-01-15',
    category: 'Buying Guides',
    readTime: '8 min read',
    content: `
## When Should You Buy Appliances?

Timing your appliance purchase right can save you hundreds of dollars. Here's our complete guide to the best times to buy major appliances in 2025.

### Best Months to Buy Appliances

**September - November: New Model Season**
Manufacturers typically release new models in the fall. This means last year's models go on clearance, often at 15-25% off. If you don't need the latest features, this is prime shopping time.

**Memorial Day Weekend (Late May)**
One of the biggest appliance sale events of the year. Expect 20-40% off across all major retailers including Amazon, Home Depot, Lowe's, and Best Buy.

**Labor Day Weekend (Early September)**
Another major sale event, coinciding with new model releases. Great for both current models and closeouts.

**Black Friday & Cyber Monday (November)**
The biggest shopping weekend of the year. While doorbuster deals can be limited quantity, overall prices are typically the lowest of the year.

### Best Times by Appliance Type

**Refrigerators:** May (Memorial Day) and September-October (new models)

**Washers & Dryers:** January (post-holiday clearance) and Labor Day

**Dishwashers:** May and November

**Ranges & Ovens:** November (Black Friday) and January

**TVs:** Super Bowl week (late January) and Black Friday

### Price Tracking Tips

1. **Use our site** to compare prices across Amazon and Home Depot
2. **Set price alerts** on products you're watching
3. **Check for rebates** - manufacturers often offer $50-200 rebates on top of sale prices
4. **Consider open-box** deals at Best Buy and Home Depot for additional savings

### Should You Wait for a Sale?

If your current appliance is broken and you need a replacement immediately, don't wait. The stress and inconvenience isn't worth the potential savings.

However, if you're planning ahead or upgrading, timing your purchase around major sales can save you $100-500 depending on the appliance.

### Pro Tips

- **Price match**: Most retailers will match competitors' prices
- **Stack savings**: Combine sale prices with credit card rewards and manufacturer rebates
- **Check floor models**: Ask about discounts on display units
- **Consider bundles**: Buying multiple appliances together often unlocks additional discounts
    `
  },
  'refrigerator-buying-guide': {
    title: 'Refrigerator Buying Guide: How to Choose the Right Fridge',
    description: 'Everything you need to know about buying a refrigerator. Compare French door vs side-by-side, understand features, and find the right size.',
    date: '2025-01-10',
    category: 'Buying Guides',
    readTime: '12 min read',
    content: `
## How to Choose the Right Refrigerator

A refrigerator is one of the most important appliances in your home, running 24/7 for 10-20 years. Here's everything you need to know to make the right choice.

### Refrigerator Types Compared

**French Door Refrigerators**
- Pros: Wide shelves, eye-level fresh food, efficient layout
- Cons: Most expensive, freezer on bottom requires bending
- Best for: Families, those who use fresh food frequently

**Side-by-Side Refrigerators**
- Pros: Easy access to both sections, narrow doors for tight spaces
- Cons: Narrow compartments, can't fit wide items
- Best for: Kitchens with limited door swing space

**Top Freezer Refrigerators**
- Pros: Most affordable, reliable, energy efficient
- Cons: Less modern look, bending for fresh food
- Best for: Budget shoppers, rentals, garages

**Bottom Freezer Refrigerators**
- Pros: Eye-level fresh food, better energy efficiency
- Cons: Bending for frozen items
- Best for: Those who access fresh food more than frozen

### What Size Do You Need?

A general rule: **4-6 cubic feet per adult** in your household.

- 1-2 people: 14-18 cu ft
- 3-4 people: 18-22 cu ft
- 5+ people: 22-28 cu ft

Don't forget to measure your space including:
- Width, height, and depth of the opening
- Door swing clearance
- Path from delivery entrance to kitchen

### Features Worth Paying For

**Must-Haves:**
- Adjustable shelves
- Humidity-controlled crisper drawers
- Energy Star certification

**Nice-to-Haves:**
- Ice maker
- Water dispenser
- Door-in-door access

**Skip These:**
- Smart features (rarely used)
- Built-in TV/tablet screens
- Premium finishes (fingerprint-resistant is enough)

### Top Brands Ranked

1. **LG** - Best overall, great reliability
2. **Samsung** - Feature-rich, stylish designs
3. **Whirlpool** - Best value, excellent reliability
4. **GE** - Good mid-range option
5. **Frigidaire** - Budget-friendly

### Price Expectations

- Budget (Top Freezer): $500-$900
- Mid-Range (Bottom Freezer): $1,000-$1,500
- Premium (French Door): $1,500-$2,500
- Luxury (Counter-Depth French Door): $2,500-$4,000+
    `
  },
  'amazon-vs-home-depot-appliances': {
    title: 'Amazon vs Home Depot: Where to Buy Appliances?',
    description: 'We compare prices, delivery options, installation services, and return policies to help you decide where to buy your next appliance.',
    date: '2025-01-05',
    category: 'Comparisons',
    readTime: '6 min read',
    content: `
## Amazon vs Home Depot for Appliances

Both Amazon and Home Depot are major appliance retailers, but they offer very different shopping experiences. Here's how they compare.

### Price Comparison

**Winner: Varies by product**

Our data shows prices are typically within 2-5% of each other. Amazon occasionally has lower base prices, while Home Depot often has better bundle deals and rebates.

Use our comparison tool to check real-time prices on specific models.

### Delivery & Installation

**Home Depot:**
- Free delivery on orders $396+
- Professional installation available ($150-300)
- Haul-away of old appliances included with installation
- Schedule specific delivery windows

**Amazon:**
- Free delivery with Prime on many models
- Installation available in select areas
- Haul-away available for additional fee
- Delivery windows less flexible

**Winner: Home Depot** for full-service installation

### Return Policy

**Home Depot:**
- 48 hours for most appliances
- Must be unused and in original packaging
- Restocking fees may apply

**Amazon:**
- 30-day returns on most items
- Some appliances have shorter windows
- Free returns on many items

**Winner: Amazon** for flexibility

### Customer Service

**Home Depot:**
- In-store support
- Can see appliances in person before buying
- Local associates can answer questions

**Amazon:**
- Online/phone support only
- Rely on reviews and specifications
- Quick resolution for issues

**Winner: Home Depot** for in-person support

### Our Recommendation

**Choose Home Depot if:**
- You want professional installation
- You need to see the appliance in person
- You're buying multiple appliances

**Choose Amazon if:**
- Price is your top priority
- You're comfortable with self-installation
- You have Prime membership
- You want flexible returns

### Pro Tip

Check both prices on our site, then consider the total cost including delivery and installation. Sometimes a higher sticker price with free installation beats a lower price plus paid installation.
    `
  },
  'energy-star-appliances-worth-it': {
    title: 'Are Energy Star Appliances Worth the Extra Cost?',
    description: 'We break down the energy savings, upfront costs, and payback period for Energy Star certified appliances.',
    date: '2025-01-01',
    category: 'Tips',
    readTime: '5 min read',
    content: `
## Is Energy Star Worth It?

Energy Star certified appliances use less energy than standard models, but they often cost more upfront. Let's crunch the numbers.

### What is Energy Star?

Energy Star is a government-backed certification program. Appliances must meet strict energy efficiency guidelines to earn the label:

- **Refrigerators**: 15% more efficient than minimum standards
- **Dishwashers**: 12% more energy efficient, 30% more water efficient
- **Washers**: 25% more energy efficient, 33% more water efficient
- **Dryers**: 20% more energy efficient

### Real Savings by Appliance

**Refrigerator**
- Extra cost: $50-200
- Annual savings: $30-50
- Payback: 1-4 years ✅

**Dishwasher**
- Extra cost: $50-100
- Annual savings: $25-40
- Payback: 1-3 years ✅

**Washing Machine**
- Extra cost: $100-300
- Annual savings: $45-100
- Payback: 1-3 years ✅

**Dryer**
- Extra cost: $100-200
- Annual savings: $20-40
- Payback: 3-5 years ⚠️

### The Verdict

**Yes, Energy Star is worth it for:**
- Refrigerators (runs 24/7)
- Washing machines (significant water savings)
- Dishwashers (water + energy savings)

**Maybe not worth it for:**
- Dryers (longer payback period)
- If you're on a tight budget
- If you plan to move soon

### Additional Benefits

Beyond utility savings:
- **Rebates**: Many utilities offer $25-100 rebates
- **Environment**: Lower carbon footprint
- **Resale value**: Energy efficient homes sell faster
- **Better performance**: Often quieter and more effective

### Bottom Line

For appliances you use daily (refrigerator, washer, dishwasher), Energy Star typically pays for itself within 2-3 years and saves money for the remaining 10+ years of the appliance's life.
    `
  },
  'washer-dryer-buying-guide': {
    title: 'Washer & Dryer Buying Guide: Top Load vs Front Load',
    description: 'Compare top load and front load washers, gas vs electric dryers, and learn which features actually matter.',
    date: '2024-12-28',
    category: 'Buying Guides',
    readTime: '10 min read',
    content: `
## Washer & Dryer Buying Guide

Choosing the right washer and dryer can save you time, money, and headaches for years to come. Here's what you need to know.

### Top Load vs Front Load Washers

**Front Load Washers**
- Pros: More efficient, gentler on clothes, stackable
- Cons: More expensive, longer cycles, mold concerns
- Best for: Small spaces, efficiency-focused buyers

**Top Load with Agitator**
- Pros: Affordable, faster cycles, familiar design
- Cons: Uses more water, harder on clothes
- Best for: Budget buyers, those with heavily soiled items

**Top Load without Agitator (HE)**
- Pros: Gentle on clothes, good capacity, mid-price
- Cons: Longer cycles than agitator models
- Best for: Balance of price and performance

### Gas vs Electric Dryers

**Gas Dryers**
- Higher upfront cost ($50-100 more)
- Lower operating cost ($0.15-0.20 per load)
- Requires gas hookup
- Dries faster

**Electric Dryers**
- Lower upfront cost
- Higher operating cost ($0.30-0.40 per load)
- Only needs 240V outlet
- Easier installation

**Winner**: Gas if you have a hookup, otherwise electric is fine

### Capacity Guide

Match your washer capacity to household size:
- 1-2 people: 3.5-4.5 cu ft
- 3-4 people: 4.5-5.0 cu ft
- 5+ people: 5.0+ cu ft

Your dryer should be 1.5-2x the washer capacity for efficient drying.

### Features Worth Having

**Washers:**
- Steam cleaning
- Allergen cycle (if needed)
- Delay start
- Quick wash option

**Dryers:**
- Moisture sensors (prevents over-drying)
- Steam refresh
- Wrinkle prevention

**Skip These:**
- WiFi/smart features
- Dozens of specialty cycles
- Premium finishes

### Top Brands

1. **LG** - Best front loaders, reliable
2. **Samsung** - Feature-rich, great designs
3. **Maytag** - Best top loaders, built tough
4. **Whirlpool** - Reliable, good value
5. **Speed Queen** - Commercial quality for home

### Budget Guidelines

- Budget pair: $800-$1,200
- Mid-range pair: $1,200-$2,000
- Premium pair: $2,000-$3,500
    `
  },
  'smart-tv-buying-guide': {
    title: 'Smart TV Buying Guide: OLED vs QLED vs LED Explained',
    description: 'Understand the differences between TV technologies, screen sizes, and smart features to find your perfect TV.',
    date: '2024-12-20',
    category: 'Buying Guides',
    readTime: '9 min read',
    content: `
## Smart TV Buying Guide 2025

TV technology has evolved rapidly. Here's how to navigate the options and find your perfect screen.

### Display Technologies Explained

**OLED (Organic LED)**
- Perfect blacks, infinite contrast
- Best for movies and dark rooms
- Wide viewing angles
- Risk of burn-in with static images
- Most expensive
- Brands: LG, Sony, Samsung (QD-OLED)

**QLED (Quantum LED)**
- Excellent brightness
- Great for bright rooms
- No burn-in risk
- Good color accuracy
- Mid to high price
- Brands: Samsung, TCL, Hisense

**LED/LCD**
- Most affordable
- Decent picture quality
- Good for casual viewing
- Various backlighting options
- Budget to mid price
- Brands: All manufacturers

### What Size TV Should You Buy?

Distance from TV determines ideal size:

- 5 feet: 40-43"
- 6 feet: 50-55"
- 7 feet: 55-65"
- 8 feet: 65-75"
- 10+ feet: 75-85"

When in doubt, go bigger. Most people wish they'd bought a larger TV.

### Resolution: 4K vs 8K

**4K (2160p)** - The sweet spot
- Plenty of content available
- Noticeable upgrade from 1080p
- Affordable pricing

**8K (4320p)** - Not worth it yet
- Very limited content
- Significant price premium
- Minimal visible difference at normal distances

### Features That Matter

**Must-Have:**
- 4K resolution
- HDR support (HDR10 minimum)
- 3+ HDMI ports
- Built-in streaming apps

**Nice-to-Have:**
- 120Hz refresh rate (for gaming)
- HDMI 2.1 (for PS5/Xbox Series X)
- Dolby Vision HDR
- eARC for soundbars

**Don't Pay Extra For:**
- 8K resolution
- Built-in cameras
- Gesture controls

### Smart TV Platforms Ranked

1. **Google TV/Android TV** - Best app selection
2. **Roku TV** - Simple, reliable
3. **webOS (LG)** - Smooth, intuitive
4. **Tizen (Samsung)** - Good, some ads
5. **Fire TV (Amazon)** - Alexa integration

### Brand Recommendations

**Best Overall:** LG OLED, Samsung QLED
**Best Value:** TCL, Hisense
**Best for Gaming:** LG OLED, Samsung QN90
**Best Budget:** TCL 4-Series, Amazon Fire TV
    `
  }
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]
  
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }
  
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://appliance-prices.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: {
      canonical: `https://appliance-prices.com/blog/${slug}`
    }
  }
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map(slug => ({ slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogPosts[slug]
  
  if (!post) {
    notFound()
  }

  // Generate JSON-LD for article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'Appliance Prices'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Appliance Prices',
      url: 'https://appliance-prices.com'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-blue-400 transition">
            Appliance Prices
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-white transition">Compare Prices</Link>
            <Link href="/deals" className="text-slate-400 hover:text-white transition">Deals</Link>
            <Link href="/blog" className="text-slate-400 hover:text-white transition">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">{post.category}</span>
            <span>{post.readTime}</span>
            <span>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-slate-400">{post.description}</p>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
        </article>

        {/* CTA */}
        <div className="mt-12 p-8 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find the Best Prices?</h2>
          <p className="text-slate-400 mb-6">Compare appliance prices across Amazon and Home Depot in real-time.</p>
          <Link 
            href="/" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Compare Prices Now
          </Link>
        </div>

        {/* Related Posts would go here */}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} Appliance Prices. All rights reserved.</p>
          <p className="text-sm mt-2">
            As an Amazon Associate and Home Depot affiliate, we earn from qualifying purchases.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs
    .split('\n\n')
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<ul')) return block
      if (block.trim() === '') return ''
      return `<p>${block}</p>`
    })
    .join('\n')
}
