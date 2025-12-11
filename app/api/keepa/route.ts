import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { discoverAsins, getProductsByAsins, CATEGORY_CONFIG } from '@/lib/keepa'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getDeletedAsins(): Promise<Set<string>> {
  const { data } = await supabase.from('deleted_asins').select('asin')
  return new Set(data?.map(d => d.asin) || [])
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category, asins } = body

    if (action === 'discover') {
      if (!category || !CATEGORY_CONFIG[category]) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }

      const foundAsins = await discoverAsins(category)
      const deletedAsins = await getDeletedAsins()
      
      const { data: existing } = await supabase
        .from('appliances')
        .select('asin')
        .eq('category', category)
      
      const existingAsins = new Set(existing?.map(e => e.asin) || [])
      const newAsins = foundAsins.filter(asin => !existingAsins.has(asin) && !deletedAsins.has(asin))

      return NextResponse.json({
        success: true,
        category,
        totalFound: foundAsins.length,
        newAsins: newAsins.length,
        skippedDeleted: foundAsins.filter(a => deletedAsins.has(a)).length,
        asins: newAsins
      })
    }

    if (action === 'fetch-details') {
      if (!category || !asins || asins.length === 0) {
        return NextResponse.json({ error: 'Category and ASINs required' }, { status: 400 })
      }

      const deletedAsins = await getDeletedAsins()
      const filteredAsins = asins.filter((asin: string) => !deletedAsins.has(asin))

      const products = await getProductsByAsins(filteredAsins, category)
      
      let created = 0
      let updated = 0
      let errors = 0

      for (const product of products) {
        const record = {
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
          weight_lbs: product.weight,
          updated_at: new Date().toISOString()
        }

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
          if (error) errors++
          else updated++
        } else {
          const { error } = await supabase
            .from('appliances')
            .insert([record])
          if (error) errors++
          else created++
        }
      }

      return NextResponse.json({ success: true, category, created, updated, errors })
    }

    if (action === 'refresh-prices') {
      if (!category) {
        return NextResponse.json({ error: 'Category required' }, { status: 400 })
      }

      const { data: products } = await supabase
        .from('appliances')
        .select('asin')
        .eq('category', category)
      
      if (!products || products.length === 0) {
        return NextResponse.json({ success: true, category, message: 'No products to refresh' })
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
            weight_lbs: product.weight,
            updated_at: new Date().toISOString()
          })
          .eq('asin', product.asin)
        if (error) errors++
        else updated++
      }

      return NextResponse.json({ success: true, category, updated, errors })
    }

    if (action === 'full-sync') {
      const results: any[] = []
      const categories = Object.keys(CATEGORY_CONFIG)
      const deletedAsins = await getDeletedAsins()

      for (const cat of categories) {
        try {
          const foundAsins = await discoverAsins(cat)
          
          const { data: existing } = await supabase
            .from('appliances')
            .select('asin')
            .eq('category', cat)
          
          const existingAsins = new Set(existing?.map(e => e.asin) || [])
          const newAsins = foundAsins.filter(asin => !existingAsins.has(asin) && !deletedAsins.has(asin))
          
          let created = 0
          let errors = 0

          if (newAsins.length > 0) {
            const products = await getProductsByAsins(newAsins, cat)
            for (const product of products) {
              const { error } = await supabase
                .from('appliances')
                .insert([{
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
                  weight_lbs: product.weight
                }])
              if (error) errors++
              else created++
            }
          }

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
                  weight_lbs: product.weight,
                  updated_at: new Date().toISOString()
                })
                .eq('asin', product.asin)
              if (error) errors++
              else updated++
            }
          }

          results.push({ category: cat, discovered: foundAsins.length, newAsins: newAsins.length, created, updated, errors })
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          results.push({ category: cat, error: error instanceof Error ? error.message : 'Unknown error' })
        }
      }

      return NextResponse.json({ success: true, results })
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