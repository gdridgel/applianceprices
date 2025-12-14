import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Categories list (duplicated here to avoid client component import)
const categories = [
  'Refrigerators',
  'Freezers', 
  'Dishwashers',
  'Ranges',
  'Washers',
  'Dryers',
  'Air Fryers',
  'Ice Makers',
  'Air Conditioners',
  'Televisions',
  'Cell Phones'
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
  ]
  
  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
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
  
  return [...staticPages, ...categoryPages, ...productPages]
}