import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { discoverAsins, getProductsByAsins, queryProducts, CATEGORY_CONFIG, KeepaProduct } from '@/lib/keepa'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Words that indicate a product is a part/accessory, not a full appliance
const PARTS_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

const MINIMUM_PRICE = 50.00

// Check if a product title indicates it's a part/accessory
function isPartOrAccessory(title: string): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return PARTS_FILTER_WORDS.some(word => lowerTitle.includes(word.toLowerCase()))
}

// Filter products to remove parts and low-priced items
function filterValidProducts(products: KeepaProduct[]): KeepaProduct[] {
  return products.filter(product => {
    // Filter out parts/accessories
    if (isPartOrAccessory(product.title)) {
      console.log(`Filtered out part: ${product.title.substring(0, 50)}...`)
      return false
    }
    // Filter out items below minimum price
    if (product.price !== null && product.price < MINIMUM_PRICE) {
      console.log(`Filtered out low price ($${product.price}): ${product.title.substring(0, 50)}...`)
      return false
    }
    return true
  })
}

// Helper to get deleted ASINs that should be skipped
async function getDeletedAsins(): Promise<Set<string>> {
  const { data } = await supabase.from('deleted_asins').select('asin')
  return new Set(data?.map(d => d.asin) || [])
}

// Build full record from product with all fields
function buildRecord(product: KeepaProduct) {
  return {
    category: product.category,
    asin: product.asin,
    title: product.title,
    brand: product.brand,
    model: product.model,
    color: product.color,
    price: product.price,
    list_price: product.listPrice,
    rating: product.rating,
    review_count: product.reviewCount,
    image_url: product.imageUrl,
    image_urls: product.imageUrls,
    product_url: product.productUrl,
    // Dimensions
    width_in: product.widthIn,
    depth_in: product.depthIn,
    height_in: product.heightIn,
    weight_lbs: product.weightLbs,
    // Specs
    capacity_cu_ft: product.capacityCuFt,
    energy_star: product.energyStar,
    ice_maker: product.iceMaker,
    water_dispenser: product.waterDispenser,
    type: product.type,
    updated_at: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category, asins } = body

    if (action === 'test') {
      // Test endpoint - fetch one product and return parsed data
      const testAsin = 'B0B9M9Z1FQ' // A refrigerator from your CSV
      const products = await getProductsByAsins([testAsin], 'Refrigerators')
      return NextResponse.json({
        success: true,
        message: 'Test completed',
        product: products[0] || null
      })
    }

    if (action === 'discover') {
      // Discover new ASINs for a category using Product Finder
      // Continues from last page fetched
      if (!category || !CATEGORY_CONFIG[category]) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }

      // Get the last page we fetched for this category
      const { data: progressData } = await supabase
        .from('sync_progress')
        .select('last_page, total_discovered')
        .eq('category', category)
        .single()
      
      const startPage = progressData?.last_page || 0
      const previousTotal = progressData?.total_discovered || 0
      
      // Fetch next 5 pages (500 products)
      const pagesToFetch = 5
      const deletedAsins = await getDeletedAsins()
      
      // Get existing ASINs
      const { data: existing } = await supabase
        .from('appliances')
        .select('asin')
        .eq('category', category)
      
      const existingAsins = new Set(existing?.map(e => e.asin) || [])
      
      let allFoundAsins: string[] = []
      let lastPageWithResults = startPage
      let noMoreResults = false
      
      for (let page = startPage; page < startPage + pagesToFetch; page++) {
        try {
          console.log(`Fetching ${category} page ${page}...`)
          const result = await queryProducts(category, page)
          
          if (result.asins.length === 0) {
            console.log(`No more results for ${category} at page ${page}`)
            noMoreResults = true
            break
          }
          
          allFoundAsins.push(...result.asins)
          lastPageWithResults = page + 1 // Next page to fetch
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error)
          break
        }
      }
      
      // Filter out existing and deleted ASINs
      const newAsins = allFoundAsins.filter(asin => !existingAsins.has(asin) && !deletedAsins.has(asin))
      
      // Update progress tracker
      await supabase
        .from('sync_progress')
        .upsert({
          category,
          last_page: noMoreResults ? 0 : lastPageWithResults, // Reset to 0 if we've reached the end
          total_discovered: previousTotal + newAsins.length,
          last_sync_at: new Date().toISOString()
        }, { onConflict: 'category' })

      return NextResponse.json({
        success: true,
        category,
        pagesScanned: `${startPage} to ${lastPageWithResults - 1}`,
        nextPage: noMoreResults ? 'Complete - will restart from 0' : lastPageWithResults,
        totalFound: allFoundAsins.length,
        newAsins: newAsins.length,
        skippedExisting: allFoundAsins.filter(a => existingAsins.has(a)).length,
        skippedDeleted: allFoundAsins.filter(a => deletedAsins.has(a)).length,
        asins: newAsins
      })
    }

    if (action === 'fetch-details') {
      // Fetch details for ASINs and save to database
      if (!category || !asins || asins.length === 0) {
        return NextResponse.json({ error: 'Category and ASINs required' }, { status: 400 })
      }

      const deletedAsins = await getDeletedAsins()
      const filteredAsins = asins.filter((asin: string) => !deletedAsins.has(asin))

      const rawProducts = await getProductsByAsins(filteredAsins, category)
      
      // Filter out parts/accessories and low-priced items
      const products = filterValidProducts(rawProducts)
      
      let created = 0
      let updated = 0
      let errors = 0
      let filteredOut = rawProducts.length - products.length

      for (const product of products) {
        const record = buildRecord(product)

        // Check if exists
        const { data: existing } = await supabase
          .from('appliances')
          .select('id')
          .eq('asin', product.asin)
          .single()

        if (existing) {
          const { error } = await supabase
            .from('appliances')
            .update(record)
            .eq('id', existing.id)
          
          if (error) {
            console.error('Update error:', error)
            errors++
          } else {
            updated++
          }
        } else {
          const { error } = await supabase
            .from('appliances')
            .insert([record])
          
          if (error) {
            console.error('Insert error:', error)
            errors++
          } else {
            created++
          }
        }
      }

      return NextResponse.json({
        success: true,
        category,
        created,
        updated,
        errors,
        filteredOut
      })
    }

    if (action === 'refresh-prices') {
      // Refresh prices and ALL fields for existing products
      if (!category) {
        return NextResponse.json({ error: 'Category required' }, { status: 400 })
      }

      // Get all ASINs for this category
      const { data: products } = await supabase
        .from('appliances')
        .select('asin')
        .eq('category', category)
      
      if (!products || products.length === 0) {
        return NextResponse.json({
          success: true,
          category,
          message: 'No products to refresh'
        })
      }

      const asinList = products.map(p => p.asin).filter(Boolean)
      const updatedProducts = await getProductsByAsins(asinList, category)
      
      let updated = 0
      let errors = 0

      for (const product of updatedProducts) {
        const { error } = await supabase
          .from('appliances')
          .update({
            price: product.price,
            list_price: product.listPrice,
            rating: product.rating,
            review_count: product.reviewCount,
            brand: product.brand,
            model: product.model,
            color: product.color,
            width_in: product.widthIn,
            depth_in: product.depthIn,
            height_in: product.heightIn,
            weight_lbs: product.weightLbs,
            capacity_cu_ft: product.capacityCuFt,
            energy_star: product.energyStar,
            ice_maker: product.iceMaker,
            water_dispenser: product.waterDispenser,
            type: product.type,
            updated_at: new Date().toISOString()
          })
          .eq('asin', product.asin)
        
        if (error) {
          console.error('Update error:', error)
          errors++
        } else {
          updated++
        }
      }

      return NextResponse.json({
        success: true,
        category,
        updated,
        errors
      })
    }

    if (action === 'full-sync') {
      // Full sync: discover + fetch details for all categories
      const results: any[] = []
      const categories = Object.keys(CATEGORY_CONFIG)
      const deletedAsins = await getDeletedAsins()

      for (const cat of categories) {
        try {
          // Discover new ASINs using Product Finder
          const foundAsins = await discoverAsins(cat)
          
          // Get existing ASINs
          const { data: existing } = await supabase
            .from('appliances')
            .select('asin')
            .eq('category', cat)
          
          const existingAsins = new Set(existing?.map(e => e.asin) || [])
          const newAsins = foundAsins.filter(asin => !existingAsins.has(asin) && !deletedAsins.has(asin))
          
          // Fetch details for new ASINs
          let created = 0
          let errors = 0

          if (newAsins.length > 0) {
            const products = await getProductsByAsins(newAsins, cat)
            
            for (const product of products) {
              const { error } = await supabase
                .from('appliances')
                .insert([buildRecord(product)])
              
              if (error) {
                console.error('Insert error:', error)
                errors++
              } else {
                created++
              }
            }
          }

          // Refresh existing products with all fields
          const existingAsinsList = Array.from(existingAsins)
          let updated = 0

          if (existingAsinsList.length > 0) {
            const updatedProducts = await getProductsByAsins(existingAsinsList, cat)
            
            for (const product of updatedProducts) {
              const { error } = await supabase
                .from('appliances')
                .update({
                  price: product.price,
                  list_price: product.listPrice,
                  rating: product.rating,
                  review_count: product.reviewCount,
                  brand: product.brand,
                  model: product.model,
                  color: product.color,
                  width_in: product.widthIn,
                  depth_in: product.depthIn,
                  height_in: product.heightIn,
                  weight_lbs: product.weightLbs,
                  capacity_cu_ft: product.capacityCuFt,
                  energy_star: product.energyStar,
                  ice_maker: product.iceMaker,
                  water_dispenser: product.waterDispenser,
                  type: product.type,
                  updated_at: new Date().toISOString()
                })
                .eq('asin', product.asin)
              
              if (error) {
                console.error('Update error:', error)
                errors++
              } else {
                updated++
              }
            }
          }

          results.push({
            category: cat,
            discovered: foundAsins.length,
            newAsins: newAsins.length,
            created,
            updated,
            errors
          })

          // Delay between categories
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          results.push({
            category: cat,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return NextResponse.json({
        success: true,
        results
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Keepa sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}