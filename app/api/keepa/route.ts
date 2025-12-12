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
  'ice tray', 'water line', 'defrost', 'relay', 'start device',
  'kegerator', 'keg cooler', 'beer dispenser', 'beverage cooler'
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
    video_urls: product.videoUrls,
    product_url: product.productUrl,
    // Dimensions
    width_in: product.widthIn,
    depth_in: product.depthIn,
    height_in: product.heightIn,
    weight_lbs: product.weightLbs,
    // Specs
    screen_size: product.screenSize,
    capacity_cu_ft: product.capacityCuFt,
    btu: product.btu,
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
    const { action, category, asins, categoryId } = body

    if (action === 'test') {
      // Test endpoint - fetch one product and return parsed data + raw fields
      const testAsin = body.asin || 'B0B9M9Z1FQ' // Default to a refrigerator
      const url = `https://api.keepa.com/product?key=${process.env.KEEPA_API_KEY}&domain=1&asin=${testAsin}&stats=180&rating=1&videos=1`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.error) {
        return NextResponse.json({ success: false, error: data.error.message })
      }
      
      const rawProduct = data.products?.[0]
      
      // Show available dimension/spec fields from Keepa
      const dimensionFields = {
        // Direct dimension fields
        packageHeight: rawProduct?.packageHeight,
        packageLength: rawProduct?.packageLength, 
        packageWidth: rawProduct?.packageWidth,
        packageWeight: rawProduct?.packageWeight,
        itemHeight: rawProduct?.itemHeight,
        itemLength: rawProduct?.itemLength,
        itemWidth: rawProduct?.itemWidth,
        itemWeight: rawProduct?.itemWeight,
        // Size field (often contains formatted dimensions)
        size: rawProduct?.size,
        // Features that might contain specs
        features: rawProduct?.features,
        // Technical details
        technicalDetails: rawProduct?.technicalDetails,
        // Other spec fields
        displaySize: rawProduct?.displaySize,
        screenSize: rawProduct?.screenSize,
        resolution: rawProduct?.resolution,
        capacity: rawProduct?.capacity,
        wattage: rawProduct?.wattage,
        voltage: rawProduct?.voltage,
        material: rawProduct?.material,
        includedComponents: rawProduct?.includedComponents,
        partNumber: rawProduct?.partNumber,
        modelNumber: rawProduct?.model,
      }
      
      const products = await getProductsByAsins([testAsin], 'Refrigerators')
      
      return NextResponse.json({
        success: true,
        message: 'Test completed',
        parsedProduct: products[0] || null,
        rawDimensionFields: dimensionFields,
        allRawFields: Object.keys(rawProduct || {})
      })
    }

    if (action === 'category-lookup') {
      // Look up category info and subcategories
      // Token cost: 1 per request (can batch up to 10 category IDs)
      const catId = categoryId || '0' // 0 returns all root categories
      const url = `https://api.keepa.com/category?key=${process.env.KEEPA_API_KEY}&domain=1&category=${catId}&parents=1`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.error) {
        return NextResponse.json({ success: false, error: data.error.message || JSON.stringify(data.error) })
      }
      
      return NextResponse.json({
        success: true,
        categories: data.categories,
        categoryParents: data.categoryParents
      })
    }

    if (action === 'category-search') {
      // Search for categories by name
      // Token cost: 1 per search (returns up to 50 matching categories)
      const { searchTerm } = body
      if (!searchTerm || searchTerm.length < 3) {
        return NextResponse.json({ success: false, error: 'Search term must be at least 3 characters' })
      }
      
      const encodedTerm = encodeURIComponent(searchTerm)
      const url = `https://api.keepa.com/search?key=${process.env.KEEPA_API_KEY}&domain=1&type=category&term=${encodedTerm}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.error) {
        return NextResponse.json({ success: false, error: data.error.message || JSON.stringify(data.error) })
      }
      
      // Format categories for easier reading
      const categories = data.categories ? Object.entries(data.categories).map(([id, cat]: [string, any]) => ({
        id,
        name: cat.name,
        contextFreeName: cat.contextFreeName,
        children: cat.children?.length || 0,
        productCount: cat.productCount
      })) : []
      
      return NextResponse.json({
        success: true,
        searchTerm,
        count: categories.length,
        categories
      })
    }

    if (action === 'browse-deals') {
      // Browse deals - find products with recent price drops
      // Token cost: 5 per request (up to 150 deals)
      const { 
        categoryIds,      // Array of category IDs to include
        minDiscount = 20, // Minimum discount percentage
        maxPrice = 500000, // Max price in cents ($5000)
        minPrice = 5000,  // Min price in cents ($50)
        minRating = -1,   // Min rating (0-50, -1 = disabled)
        dateRange = 1,    // 0=day, 1=week, 2=month, 3=3months
        page = 0
      } = body
      
      const queryJSON = {
        page,
        domainId: 1, // Amazon.com
        includeCategories: categoryIds || [],
        priceTypes: [0], // Amazon price
        deltaPercentRange: [minDiscount, 100],
        currentRange: [minPrice, maxPrice],
        salesRankRange: [0, 100000], // Top 100k sellers
        minRating,
        isRangeEnabled: true,
        isFilterEnabled: categoryIds && categoryIds.length > 0,
        filterErotic: true,
        hasReviews: true,
        singleVariation: true,
        sortType: 4, // Sort by percentage delta (biggest discounts first)
        dateRange
      }
      
      console.log('Deals query:', JSON.stringify(queryJSON))
      
      const url = `https://api.keepa.com/deal?key=${process.env.KEEPA_API_KEY}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryJSON)
      })
      const data = await response.json()
      
      console.log('Deals response keys:', Object.keys(data))
      console.log('Deals dr length:', data.dr?.length || 0)
      
      if (data.error) {
        console.error('Deals API error:', data.error)
        return NextResponse.json({ success: false, error: data.error.message || JSON.stringify(data.error) })
      }
      
      // Format deals for easier use - response is { dr: [...], categoryIds: [...], ... }
      const deals = data.dr?.map((deal: any) => {
        // Handle different Keepa response formats
        const currentPrice = deal.current?.[0] > 0 ? deal.current[0] / 100 : null
        const avgPrice = deal.avg?.[0] > 0 ? deal.avg[0] / 100 : null
        const dropPercent = deal.deltaPercent?.[0]
        const dropAmount = deal.delta?.[0] ? Math.abs(deal.delta[0]) / 100 : null
        
        // Build image URL - Keepa sometimes returns just the image ID
        let imageUrl = null
        if (deal.image) {
          if (deal.image.startsWith('http')) {
            imageUrl = deal.image
          } else {
            imageUrl = `https://images-na.ssl-images-amazon.com/images/I/${deal.image}`
          }
        }
        
        return {
          asin: deal.asin,
          title: deal.title,
          currentPrice,
          previousPrice: avgPrice,
          dropPercent: typeof dropPercent === 'number' && !isNaN(dropPercent) ? dropPercent : null,
          dropAmount,
          salesRank: deal.salesRank,
          rating: deal.rating ? deal.rating / 10 : null,
          reviewCount: deal.reviewCount,
          categoryId: deal.categoryId,
          image: imageUrl
        }
      }) || []
      
      return NextResponse.json({
        success: true,
        page,
        count: deals.length,
        hasMore: deals.length === 150,
        categoryBreakdown: {
          ids: data.categoryIds || [],
          names: data.categoryNames || [],
          counts: data.categoryCount || []
        },
        deals
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
      
      // Fetch 1 page (1000 products per page)
      const pagesToFetch = 1
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