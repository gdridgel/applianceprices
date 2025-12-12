import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getProductsByAsins, queryProducts } from '@/lib/keepa'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Category rotation schedule (pairs for each hour cycle)
const CATEGORY_ROTATION = [
  ['Refrigerators', 'Freezers'],
  ['Dishwashers', 'Ranges'],
  ['Washers', 'Dryers'],
  ['Televisions', 'Air Fryers'],
  ['Ice Makers', 'Air Conditioners'],
  ['REFRESH'] // Hour 5 = refresh cycle
]

// Token budget per run (targeting ~1,000 tokens per hour)
const TOKENS_PER_DISCOVER = 510 // 10 (query) + 500 (details)
const TOKENS_PER_REFRESH = 1 // per product
const MAX_REFRESH_PRODUCTS = 500
const MINIMUM_PRICE = 50.00

// Parts filter
const PARTS_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat',
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper',
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly',
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

function isPartOrAccessory(title: string): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return PARTS_FILTER_WORDS.some(word => lowerTitle.includes(word.toLowerCase()))
}

// Get deleted ASINs
async function getDeletedAsins(): Promise<Set<string>> {
  const { data } = await supabase.from('deleted_asins').select('asin')
  return new Set(data?.map(d => d.asin) || [])
}

// Build record for database
function buildRecord(product: any) {
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
    width_in: product.widthIn,
    depth_in: product.depthIn,
    height_in: product.heightIn,
    weight_lbs: product.weightLbs,
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

// Discover new products for a category
async function discoverCategory(category: string, deletedAsins: Set<string>) {
  const results = {
    category,
    discovered: 0,
    new: 0,
    updated: 0,
    filtered: 0,
    errors: 0
  }

  try {
    // Get current page for this category
    const { data: progressData } = await supabase
      .from('sync_progress')
      .select('last_page')
      .eq('category', category)
      .single()

    const page = progressData?.last_page || 0

    // Query for ASINs
    const queryResult = await queryProducts(category, page)
    results.discovered = queryResult.asins.length

    if (queryResult.asins.length === 0) {
      // Reset to page 0 if no more results
      await supabase
        .from('sync_progress')
        .upsert({ category, last_page: 0, last_sync_at: new Date().toISOString() }, { onConflict: 'category' })
      return results
    }

    // Get existing ASINs
    const { data: existing } = await supabase
      .from('appliances')
      .select('asin')
      .eq('category', category)
    const existingAsins = new Set(existing?.map(e => e.asin) || [])

    // Filter to only new ASINs
    const newAsins = queryResult.asins.filter(
      asin => !existingAsins.has(asin) && !deletedAsins.has(asin)
    )

    if (newAsins.length > 0) {
      // Fetch details for new ASINs
      const products = await getProductsByAsins(newAsins, category)

      for (const product of products) {
        // Filter parts and low-price items
        if (isPartOrAccessory(product.title)) {
          results.filtered++
          continue
        }
        if (product.price !== null && product.price < MINIMUM_PRICE) {
          results.filtered++
          continue
        }

        const record = buildRecord(product)

        // Check if exists (might have been added by another process)
        const { data: existingRecord } = await supabase
          .from('appliances')
          .select('id')
          .eq('asin', product.asin)
          .single()

        if (existingRecord) {
          await supabase.from('appliances').update(record).eq('id', existingRecord.id)
          results.updated++
        } else {
          const { error } = await supabase.from('appliances').insert([record])
          if (error) {
            results.errors++
          } else {
            results.new++
          }
        }
      }
    }

    // Update progress
    await supabase
      .from('sync_progress')
      .upsert({
        category,
        last_page: page + 1,
        last_sync_at: new Date().toISOString()
      }, { onConflict: 'category' })

  } catch (error) {
    console.error(`Error discovering ${category}:`, error)
    results.errors++
  }

  return results
}

// Refresh prices for oldest products
async function refreshPrices(limit: number = MAX_REFRESH_PRODUCTS) {
  const results = {
    refreshed: 0,
    errors: 0,
    categories: {} as Record<string, number>
  }

  try {
    // Get oldest updated products
    const { data: products } = await supabase
      .from('appliances')
      .select('asin, category')
      .order('updated_at', { ascending: true })
      .limit(limit)

    if (!products || products.length === 0) {
      return results
    }

    // Group by category
    const byCategory: Record<string, string[]> = {}
    for (const p of products) {
      if (!byCategory[p.category]) byCategory[p.category] = []
      byCategory[p.category].push(p.asin)
    }

    // Refresh each category batch
    for (const [category, asins] of Object.entries(byCategory)) {
      try {
        const updatedProducts = await getProductsByAsins(asins, category)

        for (const product of updatedProducts) {
          // Update ALL fields, not just price
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
              image_url: product.imageUrl,
              image_urls: product.imageUrls,
              video_urls: product.videoUrls,
              width_in: product.widthIn,
              depth_in: product.depthIn,
              height_in: product.heightIn,
              weight_lbs: product.weightLbs,
              capacity_cu_ft: product.capacityCuFt,
              screen_size: product.screenSize,
              btu: product.btu,
              energy_star: product.energyStar,
              ice_maker: product.iceMaker,
              water_dispenser: product.waterDispenser,
              type: product.type,
              updated_at: new Date().toISOString()
            })
            .eq('asin', product.asin)

          if (error) {
            results.errors++
          } else {
            results.refreshed++
            results.categories[category] = (results.categories[category] || 0) + 1
          }
        }
      } catch (error) {
        console.error(`Error refreshing ${category}:`, error)
        results.errors++
      }
    }
  } catch (error) {
    console.error('Error in refreshPrices:', error)
    results.errors++
  }

  return results
}

// Log sync run to database
async function logSyncRun(runType: string, results: any, tokensUsed: number) {
  try {
    await supabase.from('sync_logs').insert([{
      run_type: runType,
      results: results,
      tokens_used: tokensUsed,
      created_at: new Date().toISOString()
    }])
  } catch (error) {
    console.error('Error logging sync run:', error)
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  // Determine which cycle based on current hour
  const hour = new Date().getUTCHours()
  const cycleIndex = hour % CATEGORY_ROTATION.length
  const categories = CATEGORY_ROTATION[cycleIndex]

  const results: any = {
    timestamp: new Date().toISOString(),
    hour,
    cycleIndex,
    action: categories[0] === 'REFRESH' ? 'refresh' : 'discover',
    categories: categories[0] === 'REFRESH' ? [] : categories,
    results: [],
    tokensUsed: 0
  }

  try {
    const deletedAsins = await getDeletedAsins()

    if (categories[0] === 'REFRESH') {
      // Refresh cycle
      const refreshResult = await refreshPrices(MAX_REFRESH_PRODUCTS)
      results.results.push(refreshResult)
      results.tokensUsed = refreshResult.refreshed * TOKENS_PER_REFRESH
    } else {
      // Discovery cycle
      for (const category of categories) {
        const discoverResult = await discoverCategory(category, deletedAsins)
        results.results.push(discoverResult)
        results.tokensUsed += TOKENS_PER_DISCOVER
      }
    }

    results.duration = Date.now() - startTime

    // Log the run
    await logSyncRun(results.action, results, results.tokensUsed)

    return NextResponse.json({
      success: true,
      ...results
    })

  } catch (error: any) {
    console.error('Cron sync error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      ...results
    }, { status: 500 })
  }
}

// Manual trigger with options
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, categories, limit } = body

    const startTime = Date.now()
    const deletedAsins = await getDeletedAsins()

    const results: any = {
      timestamp: new Date().toISOString(),
      action,
      results: [],
      tokensUsed: 0
    }

    if (action === 'discover' && categories) {
      for (const category of categories) {
        const discoverResult = await discoverCategory(category, deletedAsins)
        results.results.push(discoverResult)
        results.tokensUsed += TOKENS_PER_DISCOVER
      }
    } else if (action === 'refresh') {
      const refreshResult = await refreshPrices(limit || MAX_REFRESH_PRODUCTS)
      results.results.push(refreshResult)
      results.tokensUsed = refreshResult.refreshed * TOKENS_PER_REFRESH
    } else if (action === 'full-cycle') {
      // Run all categories once
      for (const catPair of CATEGORY_ROTATION) {
        if (catPair[0] === 'REFRESH') continue
        for (const category of catPair) {
          const discoverResult = await discoverCategory(category, deletedAsins)
          results.results.push(discoverResult)
          results.tokensUsed += TOKENS_PER_DISCOVER
        }
      }
    } else if (action === 'status') {
      // Get sync status
      const { data: progress } = await supabase
        .from('sync_progress')
        .select('*')
        .order('category')

      const { data: logs } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: counts } = await supabase
        .from('appliances')
        .select('category')

      const categoryCounts: Record<string, number> = {}
      counts?.forEach(c => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1
      })

      return NextResponse.json({
        success: true,
        progress,
        recentLogs: logs,
        productCounts: categoryCounts,
        tokenBudget: {
          perMinute: 20,
          perHour: 1200,
          perDay: 28800,
          perDiscoverCycle: TOKENS_PER_DISCOVER
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid action. Use: discover, refresh, full-cycle, or status' }, { status: 400 })
    }

    results.duration = Date.now() - startTime
    await logSyncRun(action, results, results.tokensUsed)

    return NextResponse.json({
      success: true,
      ...results
    })

  } catch (error: any) {
    console.error('Cron POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}