// Home Depot Product Lookup API Integration
// Uses RapidAPI Home Depot Product Lookup

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''
const RAPIDAPI_HOST = 'home-depot-product-lookup.p.rapidapi.com'
const DEFAULT_ZIP = '36608' // Mobile, AL - default zip code

export interface HomeDepotProduct {
  productId: string
  name: string
  brand: string
  price: number | null
  listPrice: number | null
  url: string
  imageUrl: string | null
  rating: number | null
  reviewCount: number | null
  inStock: boolean
  modelNumber: string | null
  upc: string | null
}

export interface HomeDepotLookupResult {
  success: boolean
  product: HomeDepotProduct | null
  error?: string
}

// Look up a Home Depot product by product ID
export async function lookupProductById(productId: string, zip: string = DEFAULT_ZIP): Promise<HomeDepotLookupResult> {
  if (!RAPIDAPI_KEY) {
    return { success: false, product: null, error: 'RAPIDAPI_KEY not configured' }
  }

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      body: JSON.stringify({
        action: 'product-lookup',
        productId: productId,
        zip: zip
      })
    })

    if (!response.ok) {
      return { success: false, product: null, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    
    if (!data || data.error) {
      return { success: false, product: null, error: data?.error || 'Product not found' }
    }

    // Parse the response - adjust based on actual API response structure
    const product: HomeDepotProduct = {
      productId: data.productId || data.itemId || productId,
      name: data.name || data.title || '',
      brand: data.brand || '',
      price: parsePrice(data.price),
      listPrice: parsePrice(data.listPrice || data.originalPrice),
      url: data.url || `https://www.homedepot.com/p/${productId}`,
      imageUrl: data.imageUrl || data.image || null,
      rating: data.rating ? parseFloat(data.rating) : null,
      reviewCount: data.reviewCount || data.reviews || null,
      inStock: data.inStock !== false && data.availability !== 'Out of Stock',
      modelNumber: data.modelNumber || data.model || null,
      upc: data.upc || null
    }

    return { success: true, product }
  } catch (error) {
    console.error('Home Depot API error:', error)
    return { success: false, product: null, error: String(error) }
  }
}

// Search Home Depot products by keyword
export async function searchProducts(query: string, zip: string = DEFAULT_ZIP): Promise<HomeDepotProduct[]> {
  if (!RAPIDAPI_KEY) {
    console.error('RAPIDAPI_KEY not configured')
    return []
  }

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      body: JSON.stringify({
        action: 'search',
        query: query,
        zip: zip
      })
    })

    if (!response.ok) {
      console.error('Home Depot search API error:', response.status)
      return []
    }

    const data = await response.json()
    
    if (!data || !data.products || !Array.isArray(data.products)) {
      return []
    }

    return data.products.map((item: any) => ({
      productId: item.productId || item.itemId || '',
      name: item.name || item.title || '',
      brand: item.brand || '',
      price: parsePrice(item.price),
      listPrice: parsePrice(item.listPrice || item.originalPrice),
      url: item.url || `https://www.homedepot.com/p/${item.productId || item.itemId}`,
      imageUrl: item.imageUrl || item.image || null,
      rating: item.rating ? parseFloat(item.rating) : null,
      reviewCount: item.reviewCount || item.reviews || null,
      inStock: item.inStock !== false,
      modelNumber: item.modelNumber || item.model || null,
      upc: item.upc || null
    }))
  } catch (error) {
    console.error('Home Depot search error:', error)
    return []
  }
}

// Search by UPC to find matching product
export async function findProductByUPC(upc: string, zip: string = DEFAULT_ZIP): Promise<HomeDepotLookupResult> {
  if (!RAPIDAPI_KEY) {
    return { success: false, product: null, error: 'RAPIDAPI_KEY not configured' }
  }

  try {
    // Try searching by UPC
    const response = await fetch(`https://${RAPIDAPI_HOST}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      body: JSON.stringify({
        action: 'search',
        query: upc,
        zip: zip
      })
    })

    if (!response.ok) {
      return { success: false, product: null, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    
    if (data && data.products && data.products.length > 0) {
      const item = data.products[0]
      const product: HomeDepotProduct = {
        productId: item.productId || item.itemId || '',
        name: item.name || item.title || '',
        brand: item.brand || '',
        price: parsePrice(item.price),
        listPrice: parsePrice(item.listPrice || item.originalPrice),
        url: item.url || `https://www.homedepot.com/p/${item.productId || item.itemId}`,
        imageUrl: item.imageUrl || item.image || null,
        rating: item.rating ? parseFloat(item.rating) : null,
        reviewCount: item.reviewCount || item.reviews || null,
        inStock: item.inStock !== false,
        modelNumber: item.modelNumber || item.model || null,
        upc: item.upc || upc
      }
      return { success: true, product }
    }

    return { success: false, product: null, error: 'No matching product found' }
  } catch (error) {
    console.error('Home Depot UPC search error:', error)
    return { success: false, product: null, error: String(error) }
  }
}

// Search by model number to find matching product
export async function findProductByModel(brand: string, model: string, zip: string = DEFAULT_ZIP): Promise<HomeDepotLookupResult> {
  if (!RAPIDAPI_KEY) {
    return { success: false, product: null, error: 'RAPIDAPI_KEY not configured' }
  }

  try {
    // Search by brand and model
    const query = `${brand} ${model}`.trim()
    const response = await fetch(`https://${RAPIDAPI_HOST}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      body: JSON.stringify({
        action: 'search',
        query: query,
        zip: zip
      })
    })

    if (!response.ok) {
      return { success: false, product: null, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    
    if (data && data.products && data.products.length > 0) {
      // Find best match by model number
      const modelLower = model.toLowerCase()
      const brandLower = brand.toLowerCase()
      
      let bestMatch = data.products[0]
      for (const item of data.products) {
        const itemModel = (item.modelNumber || item.model || '').toLowerCase()
        const itemBrand = (item.brand || '').toLowerCase()
        
        // Exact model match preferred
        if (itemModel === modelLower && itemBrand.includes(brandLower)) {
          bestMatch = item
          break
        }
        // Partial model match
        if (itemModel.includes(modelLower) || modelLower.includes(itemModel)) {
          bestMatch = item
        }
      }
      
      const product: HomeDepotProduct = {
        productId: bestMatch.productId || bestMatch.itemId || '',
        name: bestMatch.name || bestMatch.title || '',
        brand: bestMatch.brand || '',
        price: parsePrice(bestMatch.price),
        listPrice: parsePrice(bestMatch.listPrice || bestMatch.originalPrice),
        url: bestMatch.url || `https://www.homedepot.com/p/${bestMatch.productId || bestMatch.itemId}`,
        imageUrl: bestMatch.imageUrl || bestMatch.image || null,
        rating: bestMatch.rating ? parseFloat(bestMatch.rating) : null,
        reviewCount: bestMatch.reviewCount || bestMatch.reviews || null,
        inStock: bestMatch.inStock !== false,
        modelNumber: bestMatch.modelNumber || bestMatch.model || null,
        upc: bestMatch.upc || null
      }
      return { success: true, product }
    }

    return { success: false, product: null, error: 'No matching product found' }
  } catch (error) {
    console.error('Home Depot model search error:', error)
    return { success: false, product: null, error: String(error) }
  }
}

// Helper to parse price from various formats
function parsePrice(price: any): number | null {
  if (price === null || price === undefined) return null
  if (typeof price === 'number') return price
  if (typeof price === 'string') {
    // Remove currency symbols and parse
    const cleaned = price.replace(/[$,]/g, '').trim()
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

// Generate Home Depot affiliate URL
export function generateAffiliateUrl(productId: string, affiliateTag?: string): string {
  // Home Depot uses Impact Radius for affiliate tracking
  // Format: https://www.homedepot.com/p/PRODUCT_ID?cm_mmc=afl-ir-AFFILIATE_ID
  const baseUrl = `https://www.homedepot.com/p/${productId}`
  if (affiliateTag) {
    return `${baseUrl}?cm_mmc=afl-ir-${affiliateTag}`
  }
  return baseUrl
}