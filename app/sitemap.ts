import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Categories list
const categories = [
  'refrigerators',
  'freezers', 
  'dishwashers',
  'ranges',
  'washers',
  'dryers',
  'air-fryers',
  'ice-makers',
  'air-conditioners',
  'televisions',
  'cell-phones'
]

// Blog posts
const blogPosts = [
  'best-time-to-buy-appliances',
  'refrigerator-buying-guide',
  'amazon-vs-home-depot-appliances',
  'energy-star-appliances-worth-it',
  'washer-dryer-buying-guide',
  'smart-tv-buying-guide'
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://appliance-prices.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
  
  // Category pages (SEO-friendly URLs)
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))
  
  // Blog posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  
  // Product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await supabase
      .from('appliances')
      .select('asin, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5000)
    
    if (products) {
      productPages = products.map(product => ({
        url: `${baseUrl}/product/${product.asin}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error generating product sitemap:', error)
  }
  
  return [...staticPages, ...categoryPages, ...blogPages, ...productPages]
}
