import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (no browser dependency)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
export const supabase = supabaseServer
export type Appliance = {
  id: string
  asin: string
  title: string
  brand: string
  model: string
  type: string
  color: string
  category: string
  price: number
  list_price: number
  rating: number
  review_count: number
  image_url: string
  screen_size: string
  width_inches: number
  height_inches: number
  depth_inches: number
  total_capacity_cuft: number
  fridge_capacity_cuft: number
  freezer_capacity_cuft: number
  capacity_cuft: number
  capacity_quarts: number
  btu: number
  cooling_sqft: number
  energy_star: boolean
  ice_maker: boolean
  water_dispenser: boolean
  smart_features: boolean
}

// Fetch products server-side
export async function getProducts(category: string, limit: number = 20): Promise<Appliance[]> {
  const { data, error } = await supabaseServer
    .from('appliances')
    .select('*')
    .eq('category', category)
    .gte('price', 50)
    .not('price', 'is', null)
    .order('price', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

// Get all categories with product counts
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const categories = [
    'Refrigerators', 'Freezers', 'Dishwashers', 'Ranges', 
    'Washers', 'Dryers', 'Air Fryers', 'Ice Makers',
    'Air Conditioners', 'Televisions', 'Cell Phones'
  ]
  
  const counts: Record<string, number> = {}
  
  for (const cat of categories) {
    const { count } = await supabaseServer
      .from('appliances')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat)
      .gte('price', 50)
    
    counts[cat] = count || 0
  }
  
  return counts
}