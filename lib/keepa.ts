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
  weight: number | null
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
}

function keepaPriceToDollars(price: number | null | undefined): number | null {
  if (price === null || price === undefined || price < 0) return null
  return price / 100
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

    // Extract weight from packageWeight or itemWeight (in hundredths of pounds)
    let weight = null
    if (item.packageWeight) {
      weight = item.packageWeight / 100
    } else if (item.itemWeight) {
      weight = item.itemWeight / 100
    }

    return {
      asin: item.asin,
      title: item.title || '',
      brand: item.brand || '',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      color: item.color || '',
      size: item.size || '',
      weight,
      price,
      listPrice,
      rating: item.rating ? item.rating / 10 : null,
      reviewCount: item.numberOfReviews || null,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      productUrl: `https://www.amazon.com/dp/${item.asin}`,
      category,
      features: item.features || [],
      description: item.description || ''
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