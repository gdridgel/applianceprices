import { NextRequest, NextResponse } from 'next/server'
import { lookupProductById, searchProducts, findProductByModel, findProductByUPC } from '@/lib/homedepot'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, productId, query, brand, model, upc, zip, asin } = body

    // Look up by Home Depot product ID
    if (action === 'lookup') {
      if (!productId) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 })
      }
      
      const result = await lookupProductById(productId, zip)
      return NextResponse.json(result)
    }

    // Search by keyword
    if (action === 'search') {
      if (!query) {
        return NextResponse.json({ error: 'query required' }, { status: 400 })
      }
      
      const products = await searchProducts(query, zip)
      return NextResponse.json({ success: true, products })
    }

    // Find by UPC
    if (action === 'find-by-upc') {
      if (!upc) {
        return NextResponse.json({ error: 'upc required' }, { status: 400 })
      }
      
      const result = await findProductByUPC(upc, zip)
      return NextResponse.json(result)
    }

    // Find by brand + model
    if (action === 'find-by-model') {
      if (!brand || !model) {
        return NextResponse.json({ error: 'brand and model required' }, { status: 400 })
      }
      
      const result = await findProductByModel(brand, model, zip)
      return NextResponse.json(result)
    }

    // Link Home Depot product to existing Amazon product
    if (action === 'link-product') {
      if (!asin || !productId) {
        return NextResponse.json({ error: 'asin and productId required' }, { status: 400 })
      }

      // Look up the Home Depot product first
      const hdResult = await lookupProductById(productId, zip)
      
      if (!hdResult.success || !hdResult.product) {
        return NextResponse.json({ error: 'Could not find Home Depot product' }, { status: 404 })
      }

      // Update the appliance record with Home Depot data
      const { error } = await supabase
        .from('appliances')
        .update({
          homedepot_product_id: hdResult.product.productId,
          homedepot_price: hdResult.product.price,
          homedepot_url: hdResult.product.url,
          homedepot_updated_at: new Date().toISOString()
        })
        .eq('asin', asin)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Home Depot product linked successfully',
        homedepot: hdResult.product
      })
    }

    // Auto-match: Try to find Home Depot match for an Amazon product
    if (action === 'auto-match') {
      if (!asin) {
        return NextResponse.json({ error: 'asin required' }, { status: 400 })
      }

      // Get the Amazon product details
      const { data: product, error: fetchError } = await supabase
        .from('appliances')
        .select('brand, model, title, upc')
        .eq('asin', asin)
        .single()

      if (fetchError || !product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      let hdResult = null

      // Try UPC first (most accurate)
      if (product.upc) {
        hdResult = await findProductByUPC(product.upc, zip)
      }

      // Try brand + model if UPC didn't work
      if ((!hdResult || !hdResult.success) && product.brand && product.model) {
        hdResult = await findProductByModel(product.brand, product.model, zip)
      }

      // Try searching by title as last resort
      if (!hdResult || !hdResult.success) {
        const searchQuery = `${product.brand || ''} ${product.model || ''}`.trim() || product.title?.split(' ').slice(0, 5).join(' ')
        if (searchQuery) {
          const searchResults = await searchProducts(searchQuery, zip)
          if (searchResults.length > 0) {
            hdResult = { success: true, product: searchResults[0] }
          }
        }
      }

      if (hdResult && hdResult.success && hdResult.product) {
        // Update the appliance with Home Depot data
        await supabase
          .from('appliances')
          .update({
            homedepot_product_id: hdResult.product.productId,
            homedepot_price: hdResult.product.price,
            homedepot_url: hdResult.product.url,
            homedepot_updated_at: new Date().toISOString()
          })
          .eq('asin', asin)

        return NextResponse.json({
          success: true,
          matched: true,
          homedepot: hdResult.product
        })
      }

      return NextResponse.json({
        success: true,
        matched: false,
        message: 'No matching Home Depot product found'
      })
    }

    // Bulk auto-match for a category
    if (action === 'bulk-match') {
      const { category, limit = 10 } = body

      if (!category) {
        return NextResponse.json({ error: 'category required' }, { status: 400 })
      }

      // Get products without Home Depot match
      const { data: products, error: fetchError } = await supabase
        .from('appliances')
        .select('asin, brand, model, title, upc')
        .eq('category', category)
        .is('homedepot_product_id', null)
        .limit(limit)

      if (fetchError || !products) {
        return NextResponse.json({ error: fetchError?.message || 'No products found' }, { status: 500 })
      }

      let matched = 0
      let failed = 0

      for (const product of products) {
        let hdResult = null

        // Try UPC first
        if (product.upc) {
          hdResult = await findProductByUPC(product.upc, zip)
        }

        // Try brand + model
        if ((!hdResult || !hdResult.success) && product.brand && product.model) {
          hdResult = await findProductByModel(product.brand, product.model, zip)
        }

        if (hdResult && hdResult.success && hdResult.product) {
          await supabase
            .from('appliances')
            .update({
              homedepot_product_id: hdResult.product.productId,
              homedepot_price: hdResult.product.price,
              homedepot_url: hdResult.product.url,
              homedepot_updated_at: new Date().toISOString()
            })
            .eq('asin', product.asin)

          matched++
        } else {
          failed++
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      return NextResponse.json({
        success: true,
        processed: products.length,
        matched,
        failed
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Home Depot API error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}