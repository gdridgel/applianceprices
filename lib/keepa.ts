const KEEPA_API_KEY = process.env.KEEPA_API_KEY

const CATEGORY_CONFIG: Record<string, { searchTerms: string[], browseNode?: string }> = {
  'Refrigerators': {
    searchTerms: ['refrigerator', 'french door refrigerator', 'side by side refrigerator', 'top freezer refrigerator'],
    browseNode: '3741281'
  },
  'Washers': {
    searchTerms: ['washing machine', 'front load washer', 'top load washer'],
    browseNode: '13397491'
  },
  'Dryers': {
    searchTerms: ['clothes dryer', 'electric dryer', 'gas dryer'],
    browseNode: '13397481'
  },
  'Air Fryers': {
    searchTerms: ['air fryer', 'air fryer oven', 'digital air fryer'],
    browseNode: '14286781'
  },
  'Ice Makers': {
    searchTerms: ['ice maker', 'portable ice maker', 'countertop ice maker'],
    browseNode: '2686378011'
  },
  'Window AC': {
    searchTerms: ['window air conditioner', 'window AC unit'],
    browseNode: '1193678'
  },
  'Freezers': {
    searchTerms: ['chest freezer', 'upright freezer', 'deep freezer'],
    browseNode: '3741321'
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
  price: number | null
  listPrice: number | null
  rating: number | null
  reviewCount: number | null
  imageUrl: string | null
  imageUrls: string[]
  productUrl: string
  category: string
  features: string[]
  description: string
  // Dimensions
  heightInches: number | null
  widthInches: number | null
  depthInches: number | null
  weightLbs: number | null
  // Parsed specs
  capacityCuFt: number | null
  fridgeCuFt: number | null
  freezerCuFt: number | null
  btu: number | null
  energyStar: boolean
  iceMaker: boolean
  waterDispenser: boolean
  type: string | null
}

function keepaPriceToDollars(price: number | null | undefined): number | null {
  if (price === null || price === undefined || price < 0) return null
  return price / 100
}

function mmToInches(mm: number | null | undefined): number | null {
  if (mm === null || mm === undefined || mm <= 0) return null
  return Math.round((mm / 25.4) * 10) / 10
}

function gramsToLbs(grams: number | null | undefined): number | null {
  if (grams === null || grams === undefined || grams <= 0) return null
  return Math.round((grams / 453.592) * 10) / 10
}

function parseFeatures(features: string[] | null, title: string): {
  capacityCuFt: number | null,
  fridgeCuFt: number | null,
  freezerCuFt: number | null,
  btu: number | null,
  energyStar: boolean,
  iceMaker: boolean,
  waterDispenser: boolean,
  type: string | null
} {
  const result = {
    capacityCuFt: null as number | null,
    fridgeCuFt: null as number | null,
    freezerCuFt: null as number | null,
    btu: null as number | null,
    energyStar: false,
    iceMaker: false,
    waterDispenser: false,
    type: null as string | null
  }

  const textToSearch = [...(features || []), title].join(' ').toLowerCase()

  // Extract total capacity (cu.ft. or cubic feet)
  const capacityMatch = textToSearch.match(/(\d+\.?\d*)\s*(?:cu\.?\s*ft\.?|cubic\s*feet)/i)
  if (capacityMatch) {
    result.capacityCuFt = parseFloat(capacityMatch[1])
  }

  // Extract fridge capacity
  const fridgeMatch = textToSearch.match(/(?:fridge|refrigerator|fresh food)[\s:]*(\d+\.?\d*)\s*(?:cu\.?\s*ft\.?|cubic\s*feet)/i)
  if (fridgeMatch) {
    result.fridgeCuFt = parseFloat(fridgeMatch[1])
  }

  // Extract freezer capacity
  const freezerMatch = textToSearch.match(/freezer[\s:]*(\d+\.?\d*)\s*(?:cu\.?\s*ft\.?|cubic\s*feet)/i)
  if (freezerMatch) {
    result.freezerCuFt = parseFloat(freezerMatch[1])
  }

  // Extract BTU
  const btuMatch = textToSearch.match(/(\d{1,3},?\d{3})\s*btu/i)
  if (btuMatch) {
    result.btu = parseInt(btuMatch[1].replace(',', ''))
  }

  // Check for Energy Star
  result.energyStar = /energy\s*star/i.test(textToSearch)

  // Check for Ice Maker
  result.iceMaker = /ice\s*maker|makes\s*ice|ice\s*making/i.test(textToSearch)

  // Check for Water Dispenser
  result.waterDispenser = /water\s*dispenser|water\s*filter|dispenses\s*water/i.test(textToSearch)

  // Determine type
  if (/french\s*door/i.test(textToSearch)) {
    result.type = 'French Door'
  } else if (/side[\s-]*by[\s-]*side/i.test(textToSearch)) {
    result.type = 'Side by Side'
  } else if (/top[\s-]*freezer/i.test(textToSearch)) {
    result.type = 'Top Freezer'
  } else if (/bottom[\s-]*freezer/i.test(textToSearch)) {
    result.type = 'Bottom Freezer'
  } else if (/front[\s-]*load/i.test(textToSearch)) {
    result.type = 'Front Load'
  } else if (/top[\s-]*load/i.test(textToSearch)) {
    result.type = 'Top Load'
  } else if (/chest\s*freezer/i.test(textToSearch)) {
    result.type = 'Chest'
  } else if (/upright\s*freezer/i.test(textToSearch)) {
    result.type = 'Upright'
  } else if (/portable/i.test(textToSearch)) {
    result.type = 'Portable'
  } else if (/countertop/i.test(textToSearch)) {
    result.type = 'Countertop'
  } else if (/window/i.test(textToSearch)) {
    result.type = 'Window'
  }

  return result
}

function parseKeepaProduct(item: any, category: string): KeepaProduct | null {
  try {
    if (!item.asin) return null
    let price = null
    let listPrice = null

    if (item.csv && item.csv[0]) {
      const priceHistory = item.csv[0]
      for (let i = priceHistory.length - 1; i >= 0; i -= 2) {
        if (priceHistory[i] > 0) {
          price = keepaPriceToDollars(priceHistory[i])
          break
        }
      }
    }

    if (!price && item.csv && item.csv[1]) {
      const newPriceHistory = item.csv[1]
      for (let i = newPriceHistory.length - 1; i >= 0; i -= 2) {
        if (newPriceHistory[i] > 0) {
          price = keepaPriceToDollars(newPriceHistory[i])
          break
        }
      }
    }

    if (item.csv && item.csv[3]) {
      const listPriceHistory = item.csv[3]
      for (let i = listPriceHistory.length - 1; i >= 0; i -= 2) {
        if (listPriceHistory[i] > 0) {
          listPrice = keepaPriceToDollars(listPriceHistory[i])
          break
        }
      }
    }

    const imageUrls: string[] = []
    if (item.imagesCSV) {
      const images = item.imagesCSV.split(',')
      images.forEach((img: string) => {
        if (img) {
          imageUrls.push(`https://images-na.ssl-images-amazon.com/images/I/${img}`)
        }
      })
    }

    // Parse dimensions from Keepa (mm to inches)
    const heightInches = mmToInches(item.itemHeight)
    const widthInches = mmToInches(item.itemWidth)
    const depthInches = mmToInches(item.itemLength) // length = depth
    const weightLbs = gramsToLbs(item.itemWeight) || gramsToLbs(item.packageWeight)

    // Parse features for specs
    const parsedSpecs = parseFeatures(item.features, item.title || '')

    return {
      asin: item.asin,
      title: item.title || '',
      brand: item.brand || '',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      color: item.color || '',
      size: item.size || '',
      price,
      listPrice,
      rating: item.rating ? item.rating / 10 : null,
      reviewCount: item.numberOfReviews || null,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      productUrl: `https://www.amazon.com/dp/${item.asin}`,
      category,
      features: item.features || [],
      description: item.description || '',
      heightInches,
      widthInches,
      depthInches,
      weightLbs,
      ...parsedSpecs
    }
  } catch (error) {
    console.error('Error parsing Keepa product:', error)
    return null
  }
}

export async function searchProducts(searchTerm: string, category: string): Promise<KeepaProduct[]> {
  if (!KEEPA_API_KEY) {
    throw new Error('KEEPA_API_KEY not configured')
  }

  const url = `https://api.keepa.com/search/?key=${KEEPA_API_KEY}&domain=1&type=product&term=${encodeURIComponent(searchTerm)}&stats=1&rating=1`

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

    const url = `https://api.keepa.com/product/?key=${KEEPA_API_KEY}&domain=1&asin=${asinString}&stats=1&rating=1`

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      throw new Error(`Keepa API error: ${data.error.message}`)
    }

    if (data.products) {
      for (const item of data.products) {
        const product = parseKeepaProduct(item, category)
        if (product) {
          products.push(product)
        }
      }
    }
  }

  return products
}

export async function discoverAsins(category: string): Promise<string[]> {
  const config = CATEGORY_CONFIG[category]
  if (!config) {
    throw new Error(`Unknown category: ${category}`)
  }

  const allAsins = new Set<string>()

  for (const term of config.searchTerms) {
    try {
      const products = await searchProducts(term, category)
      products.forEach(p => allAsins.add(p.asin))
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error searching for "${term}":`, error)
    }
  }

  return Array.from(allAsins)
}

export { CATEGORY_CONFIG }