// Keepa API Configuration
const KEEPA_API_KEY = process.env.KEEPA_API_KEY

// Category IDs for Keepa Product Finder (from your Keepa export)
const CATEGORY_CONFIG: Record<string, { categoryId: string, searchTerms: string[] }> = {
  'Refrigerators': {
    categoryId: '3741361',
    searchTerms: ['refrigerator', 'kegerator']
  },
  'Freezers': {
    categoryId: '3741331',
    searchTerms: ['freezer']
  },
  'Dishwashers': {
    categoryId: '3741271',
    searchTerms: ['dishwasher']
  },
  'Ranges': {
    categoryId: '3741411',
    searchTerms: ['range', 'stove']
  },
  'Washers': {
    categoryId: '13397491',
    searchTerms: ['washing machine']
  },
  'Dryers': {
    categoryId: '13397481',
    searchTerms: ['dryer']
  },
  'Air Fryers': {
    categoryId: '289913',
    searchTerms: ['air fryer']
  },
  'Ice Makers': {
    categoryId: '2399939011',
    searchTerms: ['ice maker']
  },
  'Air Conditioners': {
    categoryId: '14554126011',
    searchTerms: ['air conditioner', 'window ac', 'portable ac']
  },
  'Televisions': {
    categoryId: '172659',
    searchTerms: ['television', 'tv']
  },
  'Cell Phones': {
    categoryId: '7072561011',
    searchTerms: ['cell phone', 'smartphone', 'iphone', 'android phone']
  }
}

export interface KeepaProduct {
  asin: string
  title: string
  brand: string
  manufacturer: string
  model: string
  color: string
  size: string
  material: string
  style: string
  price: number | null
  listPrice: number | null
  rating: number | null
  reviewCount: number | null
  imageUrl: string | null
  imageUrls: string[]
  videoUrls: string[]
  productUrl: string
  category: string
  // Dimensions in inches
  widthIn: number | null
  depthIn: number | null
  heightIn: number | null
  // Weight in pounds
  weightLbs: number | null
  // Screen size for TVs (inches)
  screenSize: number | null
  // Parsed specs
  capacityCuFt: number | null
  btu: number | null
  energyStar: boolean
  iceMaker: boolean
  waterDispenser: boolean
  type: string | null
  includedComponents: string | null
  // Feature bullet points
  feature1: string | null
  feature2: string | null
  feature3: string | null
}

// Convert Keepa price (in cents) to dollars
function keepaPriceToDollars(price: number | null | undefined): number | null {
  if (price === null || price === undefined || price < 0) return null
  return price / 100
}

// Convert grams to pounds
function gramsToLbs(grams: number | null | undefined): number | null {
  if (grams === null || grams === undefined || grams <= 0) return null
  return Math.round((grams / 453.592) * 10) / 10
}

// Convert Keepa dimension units (hundredths of inch or mm depending on field) to inches
function toInches(value: number | null | undefined, isMetric: boolean = false): number | null {
  if (value === null || value === undefined || value <= 0) return null
  if (isMetric) {
    // Convert mm to inches
    return Math.round((value / 25.4) * 10) / 10
  }
  // Keepa stores dimensions in hundredths of an inch for some fields
  return Math.round(value) / 100
}

// Parse dimensions from size field like "18.7''*17.4''*33.1''(W*D*H)"
function parseSizeDimensions(size: string | null): { width: number | null, depth: number | null, height: number | null } {
  if (!size) return { width: null, depth: null, height: null }
  
  // Try pattern: "18.7''*17.4''*33.1''(W*D*H)" or similar
  // Match numbers followed by optional quotes/inches symbols, separated by * or x
  const match = size.match(/(\d+\.?\d*)[\s''″"]*[*xX×][\s]*(\d+\.?\d*)[\s''″"]*[*xX×][\s]*(\d+\.?\d*)/i)
  
  if (match) {
    const dim1 = parseFloat(match[1])
    const dim2 = parseFloat(match[2])
    const dim3 = parseFloat(match[3])
    
    // Check if format specifies W*D*H or similar
    const lowerSize = size.toLowerCase()
    if (lowerSize.includes('w') && lowerSize.includes('d') && lowerSize.includes('h')) {
      // W*D*H format - width, depth, height in that order
      return { width: dim1, depth: dim2, height: dim3 }
    }
    
    // Default assumption for appliances: smallest is depth, largest is height
    const dims = [dim1, dim2, dim3].sort((a, b) => a - b)
    return { width: dims[1], depth: dims[0], height: dims[2] }
  }
  
  return { width: null, depth: null, height: null }
}

// Get dimensions from Keepa's direct fields (more reliable than parsing size string)
function getDirectDimensions(item: any): { width: number | null, depth: number | null, height: number | null, weight: number | null } {
  // Keepa stores dimensions in MILLIMETERS and weight in GRAMS
  
  let width: number | null = null
  let depth: number | null = null  
  let height: number | null = null
  let weight: number | null = null
  
  // Item dimensions (in millimeters) - convert to inches (1 inch = 25.4 mm)
  if (item.itemWidth && item.itemWidth > 0) {
    width = Math.round((item.itemWidth / 25.4) * 10) / 10
  }
  if (item.itemLength && item.itemLength > 0) {
    depth = Math.round((item.itemLength / 25.4) * 10) / 10
  }
  if (item.itemHeight && item.itemHeight > 0) {
    height = Math.round((item.itemHeight / 25.4) * 10) / 10
  }
  
  // Fall back to package dimensions (also in millimeters)
  if (!width && item.packageWidth && item.packageWidth > 0) {
    width = Math.round((item.packageWidth / 25.4) * 10) / 10
  }
  if (!depth && item.packageLength && item.packageLength > 0) {
    depth = Math.round((item.packageLength / 25.4) * 10) / 10
  }
  if (!height && item.packageHeight && item.packageHeight > 0) {
    height = Math.round((item.packageHeight / 25.4) * 10) / 10
  }
  
  // Weight - item weight in grams, convert to pounds (1 lb = 453.592 g)
  if (item.itemWeight && item.itemWeight > 0) {
    weight = gramsToLbs(item.itemWeight)
  } else if (item.packageWeight && item.packageWeight > 0) {
    weight = gramsToLbs(item.packageWeight)
  }
  
  return { width, depth, height, weight }
}

// Parse screen size from title or features (for TVs)
function parseScreenSize(text: string): number | null {
  if (!text) return null
  // Match patterns like "55 inch", "55-inch", "55"", '55 Class'
  const match = text.match(/(\d{2,3})[\s-]*(?:inch|"|''|in\b|class)/i)
  if (match) {
    return parseInt(match[1])
  }
  return null
}

// Parse capacity from text (title, included components, etc.)
function parseCapacity(text: string): number | null {
  if (!text) return null
  // Match patterns like "3.2 cu ft", "22.0 cubic feet", "3.2cu.ft.", "3.2 Cu.Ft"
  const match = text.match(/(\d+\.?\d*)\s*(?:cu\.?\s*ft\.?|cubic\s*feet?)/i)
  if (match) {
    return parseFloat(match[1])
  }
  return null
}

// Parse BTU from text
function parseBtu(text: string): number | null {
  if (!text) return null
  const match = text.match(/(\d{1,3},?\d{3})\s*btu/i)
  if (match) {
    return parseInt(match[1].replace(',', ''))
  }
  return null
}

// Determine appliance type from text
function parseType(text: string): string | null {
  if (!text) return null
  const lowerText = text.toLowerCase()
  
  // TV types
  if (/oled/i.test(lowerText)) return 'OLED TV'
  if (/qled/i.test(lowerText)) return 'QLED TV'
  if (/tv[\s-]*dvd|dvd[\s-]*tv|dvd\s*combo/i.test(lowerText)) return 'TV-DVD Combination'
  if (/portable\s*tv/i.test(lowerText)) return 'Portable TV'
  if (/led|lcd/i.test(lowerText) && /tv|television/i.test(lowerText)) return 'LED & LCD TV'
  
  // Refrigerator types
  if (/french\s*door/i.test(lowerText)) return 'French Door'
  if (/side[\s-]*by[\s-]*side/i.test(lowerText)) return 'Side by Side'
  if (/top[\s-]*freezer/i.test(lowerText)) return 'Top Freezer'
  if (/bottom[\s-]*freezer/i.test(lowerText)) return 'Bottom Freezer'
  if (/mini|compact|dorm/i.test(lowerText)) return 'Mini/Compact'
  if (/kegerator|keg\s*cooler|beer\s*dispenser/i.test(lowerText)) return 'Kegerator'
  
  // Freezer types
  if (/chest\s*freezer/i.test(lowerText)) return 'Chest Freezer'
  if (/upright\s*freezer/i.test(lowerText)) return 'Upright Freezer'
  if (/chest/i.test(lowerText)) return 'Chest Freezer'
  if (/upright/i.test(lowerText)) return 'Upright Freezer'
  
  // Dishwasher types
  if (/built[\s-]*in\s*dishwasher|built[\s-]*in/i.test(lowerText) && /dishwasher/i.test(lowerText)) return 'Built-In Dishwasher'
  if (/countertop\s*dishwasher/i.test(lowerText)) return 'Countertop Dishwasher'
  if (/portable\s*dishwasher/i.test(lowerText)) return 'Portable Dishwasher'
  
  // Range types
  if (/drop[\s-]*in\s*range|drop[\s-]*in/i.test(lowerText)) return 'Drop-In Range'
  if (/freestanding\s*range|freestanding/i.test(lowerText)) return 'Freestanding Range'
  if (/slide[\s-]*in\s*range|slide[\s-]*in/i.test(lowerText)) return 'Slide-In Range'
  
  // Washer/Dryer types
  if (/front[\s-]*load/i.test(lowerText)) return 'Front Load'
  if (/top[\s-]*load/i.test(lowerText)) return 'Top Load'
  
  // Other types
  if (/portable/i.test(lowerText)) return 'Portable'
  if (/countertop/i.test(lowerText)) return 'Countertop'
  if (/window/i.test(lowerText)) return 'Window'
  
  return null
}

// Parse all specs from combined text
function parseSpecs(title: string, includedComponents: string | null): {
  capacityCuFt: number | null,
  btu: number | null,
  energyStar: boolean,
  iceMaker: boolean,
  waterDispenser: boolean,
  type: string | null
} {
  // Combine all text sources
  const allText = [title || '', includedComponents || ''].join(' ')
  
  // Parse capacity - try title first, then included components
  let capacityCuFt = parseCapacity(title)
  if (!capacityCuFt && includedComponents) {
    capacityCuFt = parseCapacity(includedComponents)
  }
  
  // Parse BTU
  const btu = parseBtu(allText)
  
  // Check for Energy Star
  const energyStar = /energy\s*star/i.test(allText)
  
  // Check for Ice Maker
  const iceMaker = /ice\s*maker|makes\s*ice|ice\s*making|built.?in\s*ice/i.test(allText)
  
  // Check for Water Dispenser
  const waterDispenser = /water\s*dispenser|dispenses\s*water|water\s*filter/i.test(allText)
  
  // Determine type
  const type = parseType(allText)
  
  return { capacityCuFt, btu, energyStar, iceMaker, waterDispenser, type }
}

// Parse Keepa product data from API response
function parseKeepaProduct(item: any, category: string): KeepaProduct | null {
  try {
    if (!item.asin) return null

    // Get current price from stats (most reliable)
    let price: number | null = null
    let listPrice: number | null = null

    if (item.stats) {
      // stats.current: [Amazon, New, Used, Sales Rank, List Price, ...]
      if (item.stats.current) {
        // Try Amazon price first (index 0)
        if (item.stats.current[0] > 0) {
          price = keepaPriceToDollars(item.stats.current[0])
        }
        // Try marketplace new price (index 1)
        if (!price && item.stats.current[1] > 0) {
          price = keepaPriceToDollars(item.stats.current[1])
        }
        // List price (index 3 in some versions, or separate field)
        if (item.stats.current[3] > 0) {
          listPrice = keepaPriceToDollars(item.stats.current[3])
        }
      }
    }

    // Fallback to csv price history if no stats
    if (!price && item.csv) {
      // csv[0] = Amazon price history
      if (item.csv[0]) {
        const priceHistory = item.csv[0]
        for (let i = priceHistory.length - 1; i >= 0; i -= 2) {
          if (priceHistory[i] > 0) {
            price = keepaPriceToDollars(priceHistory[i])
            break
          }
        }
      }
      // csv[1] = Marketplace new price history
      if (!price && item.csv[1]) {
        const newPriceHistory = item.csv[1]
        for (let i = newPriceHistory.length - 1; i >= 0; i -= 2) {
          if (newPriceHistory[i] > 0) {
            price = keepaPriceToDollars(newPriceHistory[i])
            break
          }
        }
      }
      // csv[3] = List price history
      if (!listPrice && item.csv[3]) {
        const listPriceHistory = item.csv[3]
        for (let i = listPriceHistory.length - 1; i >= 0; i -= 2) {
          if (listPriceHistory[i] > 0) {
            listPrice = keepaPriceToDollars(listPriceHistory[i])
            break
          }
        }
      }
    }

    // Get images - handle both API format (imagesCSV) and full URLs
    const imageUrls: string[] = []
    if (item.imagesCSV) {
      const images = item.imagesCSV.split(',')
      images.forEach((img: string) => {
        if (img) {
          // If it's already a full URL, use it; otherwise construct it
          if (img.startsWith('http')) {
            imageUrls.push(img)
          } else {
            imageUrls.push(`https://images-na.ssl-images-amazon.com/images/I/${img}`)
          }
        }
      })
    }

    // Get videos - parse from videos array if available
    const videoUrls: string[] = []
    if (item.videos && Array.isArray(item.videos)) {
      item.videos.forEach((video: any) => {
        if (video.url) {
          videoUrls.push(video.url)
        } else if (video.videoId) {
          // Construct Amazon video URL if only ID provided
          videoUrls.push(`https://www.amazon.com/vdp/v/${video.videoId}`)
        }
      })
    }

    // Get dimensions - try direct fields first, then parse from size string
    const directDims = getDirectDimensions(item)
    const parsedDims = parseSizeDimensions(item.size)
    
    // Use direct dimensions if available, otherwise fall back to parsed
    const widthIn = directDims.width || parsedDims.width
    const depthIn = directDims.depth || parsedDims.depth
    const heightIn = directDims.height || parsedDims.height
    const weightLbs = directDims.weight

    // Parse specs from title and included components
    const specs = parseSpecs(item.title || '', item.includedComponents || null)
    
    // Parse screen size for TVs
    const screenSize = parseScreenSize(item.title || '') || parseScreenSize(item.features?.join(' ') || '')

    return {
      asin: item.asin,
      title: item.title || '',
      brand: item.brand || item.manufacturer || '',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      color: item.color || '',
      size: item.size || '',
      material: item.material || '',
      style: item.style || '',
      price,
      listPrice,
      rating: item.rating ? item.rating / 10 : null,
      reviewCount: item.numberOfReviews || item.reviewCount || null,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      videoUrls,
      productUrl: `https://www.amazon.com/dp/${item.asin}`,
      category,
      widthIn,
      depthIn,
      heightIn,
      weightLbs,
      screenSize,
      capacityCuFt: specs.capacityCuFt,
      btu: specs.btu,
      energyStar: specs.energyStar,
      iceMaker: specs.iceMaker,
      waterDispenser: specs.waterDispenser,
      type: specs.type,
      includedComponents: item.includedComponents || null,
      // Get first 3 feature bullet points
      feature1: item.features?.[0] || null,
      feature2: item.features?.[1] || null,
      feature3: item.features?.[2] || null
    }
  } catch (error) {
    console.error('Error parsing Keepa product:', error)
    return null
  }
}

// Query products using Product Finder API (like your Base44 version)
export async function queryProducts(category: string, page: number = 0): Promise<{ asins: string[], products: KeepaProduct[] }> {
  if (!KEEPA_API_KEY) {
    throw new Error('KEEPA_API_KEY not configured')
  }

  const config = CATEGORY_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }

  // Build query exactly like your Keepa export URL
  const selection = {
    categories_include: [config.categoryId],
    sort: [
      ["current_SALES", "asc"],
      ["monthlySold", "desc"]
    ],
    productType: [0, 1, 2],
    page: page,
    perPage: 500
  }

  const encodedSelection = encodeURIComponent(JSON.stringify(selection))
  const url = `https://api.keepa.com/query?key=${KEEPA_API_KEY}&domain=1&selection=${encodedSelection}`

  console.log(`Querying Keepa for ${category}...`)
  const response = await fetch(url)
  const data = await response.json()

  if (data.error) {
    throw new Error(`Keepa API error: ${data.error.message || JSON.stringify(data.error)}`)
  }

  // Query endpoint returns asinList - need to fetch full details separately
  if (data.asinList && data.asinList.length > 0) {
    console.log(`Found ${data.asinList.length} ASINs for ${category}`)
    return { asins: data.asinList, products: [] }
  }

  // If products are returned directly (some API versions)
  if (data.products && data.products.length > 0) {
    const products: KeepaProduct[] = []
    for (const item of data.products) {
      const product = parseKeepaProduct(item, category)
      if (product) {
        products.push(product)
      }
    }
    return { asins: products.map(p => p.asin), products }
  }

  return { asins: [], products: [] }
}

// Get product details by ASINs
export async function getProductsByAsins(asins: string[], category: string): Promise<KeepaProduct[]> {
  if (!KEEPA_API_KEY) {
    throw new Error('KEEPA_API_KEY not configured')
  }

  if (asins.length === 0) return []

  const batchSize = 100
  const products: KeepaProduct[] = []

  for (let i = 0; i < asins.length; i += batchSize) {
    const batch = asins.slice(i, i + batchSize)
    const asinString = batch.join(',')

    // Request with stats, rating, and videos for full details
    // videos=1 includes video metadata at no extra token cost
    const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=1&asin=${asinString}&stats=180&rating=1&videos=1`

    console.log(`Fetching details for ${batch.length} ASINs...`)
    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      throw new Error(`Keepa API error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    if (data.products) {
      for (const item of data.products) {
        const product = parseKeepaProduct(item, category)
        if (product) {
          products.push(product)
        }
      }
    }

    // Rate limiting delay between batches
    if (i + batchSize < asins.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return products
}

// Discover ASINs for a category using Product Finder (fetches multiple pages)
export async function discoverAsins(category: string, maxPages: number = 5): Promise<string[]> {
  const allAsins: string[] = []
  
  for (let page = 0; page < maxPages; page++) {
    try {
      console.log(`Fetching ${category} page ${page + 1} of ${maxPages}...`)
      const result = await queryProducts(category, page)
      
      if (result.asins.length === 0) {
        console.log(`No more results for ${category} at page ${page}`)
        break // No more results
      }
      
      allAsins.push(...result.asins)
      console.log(`Found ${result.asins.length} ASINs on page ${page}, total: ${allAsins.length}`)
      
      // Rate limiting delay between pages
      if (page < maxPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`Error fetching page ${page} for ${category}:`, error)
      break
    }
  }
  
  // Remove duplicates
  return [...new Set(allAsins)]
}

// Legacy search function (for backwards compatibility)
export async function searchProducts(searchTerm: string, category: string): Promise<KeepaProduct[]> {
  if (!KEEPA_API_KEY) {
    throw new Error('KEEPA_API_KEY not configured')
  }

  const url = `https://api.keepa.com/search?key=${KEEPA_API_KEY}&domain=1&type=product&term=${encodeURIComponent(searchTerm)}&stats=1&rating=1`

  const response = await fetch(url)
  const data = await response.json()

  if (data.error) {
    throw new Error(`Keepa API error: ${data.error.message}`)
  }

  if (!data.products || data.products.length === 0) {
    return []
  }

  const products: KeepaProduct[] = []
  for (const item of data.products) {
    const product = parseKeepaProduct(item, category)
    if (product && product.price) {
      products.push(product)
    }
  }

  return products
}

export { CATEGORY_CONFIG }