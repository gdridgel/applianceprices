import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type-safe database helpers
export type Appliance = {
  id: string
  category: string
  asin?: string
  brand?: string
  model?: string
  title?: string
  type?: string
  color?: string
  price?: number
  list_price?: number
  rating?: number
  review_count?: number
  product_url?: string
  image_url?: string
  image_urls?: string[]
  
  // Refrigerator fields
  total_capacity_cuft?: number
  fridge_capacity_cuft?: number
  freezer_capacity_cuft?: number
  
  // Washer/Dryer fields
  capacity_cuft?: number
  max_spin_speed_rpm?: number
  voltage?: number
  
  // Air Fryer fields
  capacity_quarts?: number
  wattage?: number
  temperature_range_max?: number
  
  // Window AC fields
  btu?: number
  cooling_sqft?: number
  ceer?: number
  noise_level_db?: number
  
  // Ice Maker fields
  daily_production_lbs?: number
  storage_capacity_lbs?: number
  ice_ready_minutes?: number
  ice_type?: string
  
  // Freezer fields
  defrost_type?: string
  
  // Dimensions
  width_inches?: number
  height_inches?: number
  depth_inches?: number
  weight_lbs?: number
  
  // Energy
  annual_energy_kwh?: number
  
  // Features (booleans)
  energy_star?: boolean
  ice_maker?: boolean
  water_dispenser?: boolean
  smart_features?: boolean
  fingerprint_resistant?: boolean
  steam_clean?: boolean
  stackable?: boolean
  agitator?: boolean
  steam_refresh?: boolean
  sensor_dry?: boolean
  dishwasher_safe?: boolean
  digital_display?: boolean
  dehydrator_function?: boolean
  rotisserie_function?: boolean
  self_cleaning?: boolean
  water_line_required?: boolean
  heater_included?: boolean
  remote_control?: boolean
  garage_ready?: boolean
  door_lock?: boolean
  interior_light?: boolean
  
  created_at?: string
  updated_at?: string
}

// Helper functions
export async function getAppliancesByCategory(category: string, limit = 1000) {
  const { data, error } = await supabase
    .from('appliances')
    .select('*')
    .eq('category', category)
    .not('price', 'is', null)
    .order('price', { ascending: true })
    .limit(limit)
  
  if (error) throw error
  return data as Appliance[]
}

export async function getApplianceById(id: string) {
  const { data, error } = await supabase
    .from('appliances')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Appliance
}

export async function searchAppliances(query: string, category?: string) {
  let queryBuilder = supabase
    .from('appliances')
    .select('*')
    .or(`title.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`)
    .not('price', 'is', null)
    .limit(50)
  
  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }
  
  const { data, error } = await queryBuilder
  
  if (error) throw error
  return data as Appliance[]
}
