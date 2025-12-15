'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { allCategories, categoryConfig } from '@/lib/categoryConfig'
import { Trash2, Plus, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Search, Zap, ChevronLeft, ChevronRight, Sparkles, Lock, Filter, X } from 'lucide-react'
import Link from 'next/link'

// Admin password - set this in your environment variable
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

// Priority brands to show at top
const PRIORITY_BRANDS = ['GE', 'Kenmore', 'LG', 'Maytag', 'Samsung', 'Whirlpool']

// Default words that indicate a product is a part/accessory, not a full appliance
const DEFAULT_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

const MINIMUM_PRICE = 50.00

function isPartOrAccessory(title: string, filterWords: string[]): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return filterWords.some(word => lowerTitle.includes(word.toLowerCase()))
}

// Login component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Small delay to prevent brute force
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // Store auth in sessionStorage (clears when browser closes)
        sessionStorage.setItem('adminAuth', 'true')
        onLogin()
      } else {
        setError('Incorrect password')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-slate-800 rounded-lg">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold">Admin Access</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded transition"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

// Image component with hover zoom
function ProductImage({ src, alt }: { src: string | null, alt: string }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className="w-16 h-16 object-contain bg-white rounded cursor-pointer"
        />
      ) : (
        <div className="w-16 h-16 bg-slate-700 rounded" />
      )}
      {isHovered && src && (
        <div className="fixed z-[9999] bg-white p-2 rounded-lg shadow-2xl border border-slate-600" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <img src={src} alt={alt} className="w-64 h-64 object-contain" />
        </div>
      )}
    </div>
  )
}

type Appliance = {
  id: string
  asin?: string
  [key: string]: any
}

const PAGE_SIZE = 50

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    setIsAuthenticated(auth === 'true')
    setAuthChecked(true)
  }, [])

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('Refrigerators')
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [allFilteredAppliances, setAllFilteredAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{success: boolean, added: number, errors: number} | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    category: 'Refrigerators',
    brand: '',
    model: '',
    title: '',
    price: '',
    product_url: '',
    image_url: '',
    type: '',
  })
  const [adding, setAdding] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Keepa states
  const [discovering, setDiscovering] = useState(false)
  const [discoverResult, setDiscoverResult] = useState<any>(null)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [refreshResult, setRefreshResult] = useState<any>(null)
  const [fullSyncing, setFullSyncing] = useState(false)
  const [fullSyncResult, setFullSyncResult] = useState<any>(null)
  const [fetchingDetails, setFetchingDetails] = useState(false)
  
  // Cleanup state
  const [cleaning, setCleaning] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<any>(null)

  // Filter state
  const [filters, setFilters] = useState({
    types: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
  })

  // Filter words state
  const [filterWords, setFilterWords] = useState<string[]>(DEFAULT_FILTER_WORDS)
  const [newFilterWord, setNewFilterWord] = useState('')
  const [showFilterWordsPanel, setShowFilterWordsPanel] = useState(false)

  // Home Depot state
  const [showHomeDepotPanel, setShowHomeDepotPanel] = useState(false)
  const [hdSearchQuery, setHdSearchQuery] = useState('')
  const [hdSearchResults, setHdSearchResults] = useState<any[]>([])
  const [hdSearching, setHdSearching] = useState(false)
  const [hdMatching, setHdMatching] = useState(false)
  const [hdMatchResult, setHdMatchResult] = useState<any>(null)
  const [hdSelectedAsin, setHdSelectedAsin] = useState<string | null>(null)

  const config = categoryConfig[selectedCategory]

  // Load filter words from Supabase on mount
  useEffect(() => {
    async function loadFilterWords() {
      const { data } = await supabase
        .from('filter_words')
        .select('word')
        .order('word')
      if (data && data.length > 0) {
        setFilterWords(data.map(d => d.word))
      }
    }
    loadFilterWords()
  }, [])

  // Add a filter word
  const addFilterWord = async () => {
    const word = newFilterWord.trim().toLowerCase()
    if (!word || filterWords.includes(word)) return
    
    const { error } = await supabase
      .from('filter_words')
      .insert([{ word }])
    
    if (!error) {
      setFilterWords(prev => [...prev, word].sort())
      setNewFilterWord('')
      fetchAppliances() // Refresh to apply new filter
    }
  }

  // Remove a filter word
  const removeFilterWord = async (word: string) => {
    const { error } = await supabase
      .from('filter_words')
      .delete()
      .eq('word', word)
    
    if (!error) {
      setFilterWords(prev => prev.filter(w => w !== word))
      fetchAppliances() // Refresh to apply new filter
    }
  }

  // Get unique brands from appliances
  const brands = useMemo(() => {
    const brandSet = new Set(appliances.map(a => a.brand).filter(Boolean))
    const allBrands = Array.from(brandSet).sort()
    const priorityBrands = PRIORITY_BRANDS.filter(b => brandSet.has(b))
    const otherBrands = allBrands.filter(b => !PRIORITY_BRANDS.includes(b))
    return [...priorityBrands, ...otherBrands]
  }, [appliances])

  // Get unique colors from appliances
  const colors = useMemo(() => {
    const colorSet = new Set(appliances.map(a => a.color).filter(Boolean))
    return Array.from(colorSet).sort()
  }, [appliances])

  // Count items per filter value
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(a => {
      if (a.type) counts[a.type] = (counts[a.type] || 0) + 1
    })
    return counts
  }, [appliances])

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(a => {
      if (a.brand) counts[a.brand] = (counts[a.brand] || 0) + 1
    })
    return counts
  }, [appliances])

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(a => {
      if (a.color) counts[a.color] = (counts[a.color] || 0) + 1
    })
    return counts
  }, [appliances])

  // Filter appliances
  const filteredAppliances = useMemo(() => {
    return appliances.filter(item => {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false
      if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) return false
      if (filters.colors.length > 0 && !filters.colors.includes(item.color)) return false
      return true
    })
  }, [appliances, filters])

  const toggleFilter = (filterType: 'types' | 'brands' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setFilters({ types: [], brands: [], colors: [] })
    setCurrentPage(0)
  }

  const fetchCounts = useCallback(async () => {
    const newCounts: Record<string, number> = {}
    for (const cat of allCategories) {
      const { count } = await supabase
        .from('appliances')
        .select('*', { count: 'exact', head: true })
        .eq('category', cat)
      newCounts[cat] = count || 0
    }
    setCounts(newCounts)
  }, [])

  const fetchAppliances = useCallback(async () => {
    setIsLoading(true)
    setSelectedIds(new Set()) // Clear selections when fetching
    
    // Get deleted ASINs first
    const { data: deletedData } = await supabase
      .from('deleted_asins')
      .select('asin')
    const deletedAsins = new Set(deletedData?.map(d => d.asin) || [])
    
    // Fetch all products in batches of 1000 to overcome Supabase limit
    let allData: any[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data: batchData, error } = await supabase
        .from('appliances')
        .select('*')
        .eq('category', selectedCategory)
        .gte('price', MINIMUM_PRICE)
        .not('price', 'is', null)
        .order('price', { ascending: true })
        .range(from, from + batchSize - 1)
      
      if (error) {
        setIsLoading(false)
        return
      }
      
      if (batchData && batchData.length > 0) {
        allData = [...allData, ...batchData]
        from += batchSize
        hasMore = batchData.length === batchSize
      } else {
        hasMore = false
      }
    }
    
    // Filter out deleted ASINs and parts/accessories (same as homepage)
    const filtered = allData.filter(item => {
      if (deletedAsins.has(item.asin)) return false
      if (isPartOrAccessory(item.title, filterWords)) return false
      return true
    })
    
    setAllFilteredAppliances(filtered)
    setTotalCount(filtered.length)
    setIsLoading(false)
  }, [selectedCategory, filterWords])

  // Update displayed appliances when page changes or data changes
  useEffect(() => {
    const pageFrom = currentPage * PAGE_SIZE
    const pageTo = pageFrom + PAGE_SIZE
    setAppliances(allFilteredAppliances.slice(pageFrom, pageTo))
  }, [allFilteredAppliances, currentPage])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  useEffect(() => {
    fetchAppliances()
  }, [fetchAppliances])

  useEffect(() => {
    setCurrentPage(0)
  }, [selectedCategory])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Select all on current page
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAppliances.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAppliances.map(a => a.id)))
    }
  }

  // Bulk delete selected items
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} selected products and block their ASINs?`)) return
    
    setBulkDeleting(true)
    try {
      // Get ASINs for selected items - search in allFilteredAppliances (not just current page)
      const selectedAppliances = allFilteredAppliances.filter(a => selectedIds.has(a.id))
      const asinsToBlock = selectedAppliances.map(a => a.asin).filter(Boolean)
      
      console.log('Deleting items:', Array.from(selectedIds))
      console.log('ASINs to block:', asinsToBlock)
      
      // Add to deleted_asins
      if (asinsToBlock.length > 0) {
        const { error: upsertError } = await supabase.from('deleted_asins').upsert(
          asinsToBlock.map(asin => ({ asin })),
          { onConflict: 'asin' }
        )
        if (upsertError) {
          console.error('Error adding to deleted_asins:', upsertError)
        }
      }
      
      // Delete from appliances
      const idsArray = Array.from(selectedIds)
      for (let i = 0; i < idsArray.length; i += 100) {
        const batch = idsArray.slice(i, i + 100)
        const { error: deleteError, count } = await supabase
          .from('appliances')
          .delete()
          .in('id', batch)
        
        if (deleteError) {
          console.error('Error deleting batch:', deleteError)
          alert(`Error deleting: ${deleteError.message}`)
        } else {
          console.log(`Deleted batch of ${batch.length} items`)
        }
      }
      
      // Refresh
      await fetchAppliances()
      await fetchCounts()
      setSelectedIds(new Set())
    } catch (err: any) {
      console.error('Bulk delete error:', err)
      alert(`Delete failed: ${err.message}`)
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ALL ${selectedCategory}? This will also block all ASINs.`)) return
    if (!confirm('Are you absolutely sure?')) return
    
    // Get all ASINs first
    const { data: allProducts } = await supabase
      .from('appliances')
      .select('asin')
      .eq('category', selectedCategory)
    
    const asins = allProducts?.map(p => p.asin).filter(Boolean) || []
    
    // Block all ASINs
    if (asins.length > 0) {
      for (let i = 0; i < asins.length; i += 100) {
        const batch = asins.slice(i, i + 100)
        await supabase.from('deleted_asins').upsert(
          batch.map(asin => ({ asin })),
          { onConflict: 'asin' }
        )
      }
    }
    
    // Delete all
    const { error } = await supabase.from('appliances').delete().eq('category', selectedCategory)
    if (!error) {
      setAppliances([])
      setCounts(prev => ({ ...prev, [selectedCategory]: 0 }))
      setTotalCount(0)
    }
  }

  const handleCleanupDatabase = async () => {
    if (!confirm(`This will delete all parts/accessories and items under $${MINIMUM_PRICE} from ${selectedCategory}. Continue?`)) return
    
    setCleaning(true)
    setCleanupResult(null)
    
    try {
      // Get ALL products in category (not just current page)
      let allProducts: Appliance[] = []
      let page = 0
      const batchSize = 1000
      
      while (true) {
        const { data, error } = await supabase
          .from('appliances')
          .select('id, asin, title, price')
          .eq('category', selectedCategory)
          .range(page * batchSize, (page + 1) * batchSize - 1)
        
        if (error) throw error
        if (!data || data.length === 0) break
        
        allProducts = [...allProducts, ...data]
        if (data.length < batchSize) break
        page++
      }
      
      let partsDeleted = 0
      let lowPriceDeleted = 0
      const idsToDelete: string[] = []
      const asinsToBlock: string[] = []
      
      for (const product of allProducts) {
        let shouldDelete = false
        
        if (isPartOrAccessory(product.title, filterWords)) {
          partsDeleted++
          shouldDelete = true
        } else if (product.price !== null && product.price < MINIMUM_PRICE) {
          lowPriceDeleted++
          shouldDelete = true
        }
        
        if (shouldDelete) {
          idsToDelete.push(product.id)
          if (product.asin) asinsToBlock.push(product.asin)
        }
      }
      
      // Add ASINs to blocked list
      if (asinsToBlock.length > 0) {
        for (let i = 0; i < asinsToBlock.length; i += 100) {
          const batch = asinsToBlock.slice(i, i + 100)
          await supabase.from('deleted_asins').upsert(
            batch.map(asin => ({ asin })),
            { onConflict: 'asin' }
          )
        }
      }
      
      // Delete products in batches
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const batch = idsToDelete.slice(i, i + 100)
        await supabase.from('appliances').delete().in('id', batch)
      }
      
      setCleanupResult({
        success: true,
        partsDeleted,
        lowPriceDeleted,
        total: idsToDelete.length
      })
      
      // Refresh data
      await fetchCounts()
      await fetchAppliances()
      
    } catch (error: any) {
      setCleanupResult({ success: false, error: error.message })
    } finally {
      setCleaning(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    const { error } = await supabase.from('appliances').insert([{
      ...newProduct,
      price: parseFloat(newProduct.price) || null,
    }])
    if (!error) {
      setShowAddForm(false)
      setNewProduct({ category: 'Refrigerators', brand: '', model: '', title: '', price: '', product_url: '', image_url: '', type: '' })
      await fetchAppliances()
      await fetchCounts()
    }
    setAdding(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      let added = 0, errors = 0
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, any> = {}
        headers.forEach((header, index) => { row[header] = values[index] || null })
        if (row.price) row.price = parseFloat(row.price) || null
        if (row.list_price) row.list_price = parseFloat(row.list_price) || null
        if (row.rating) row.rating = parseFloat(row.rating) || null
        if (!row.category) row.category = selectedCategory
        const { error } = await supabase.from('appliances').insert([row])
        if (error) errors++
        else added++
      }
      setImportResult({ success: true, added, errors })
      await fetchAppliances()
      await fetchCounts()
    } catch {
      setImportResult({ success: false, added: 0, errors: 1 })
    }
    setImporting(false)
  }

  const handleDiscover = async () => {
    setDiscovering(true)
    setDiscoverResult(null)
    try {
      const res = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover', category: selectedCategory })
      })
      const data = await res.json()
      
      if (data.asins && data.asins.length > 0) {
        setFetchingDetails(true)
        const detailsRes = await fetch('/api/keepa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch-details', category: selectedCategory, asins: data.asins })
        })
        const detailsData = await detailsRes.json()
        setDiscoverResult({ ...data, details: detailsData })
        await fetchAppliances()
        await fetchCounts()
      } else {
        setDiscoverResult(data)
      }
    } catch (error: any) {
      setDiscoverResult({ success: false, error: error.message })
    }
    setDiscovering(false)
    setFetchingDetails(false)
  }

  const handleRefreshPrices = async () => {
    setRefreshingPrices(true)
    setRefreshResult(null)
    try {
      const res = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-prices', category: selectedCategory })
      })
      const data = await res.json()
      setRefreshResult(data)
      await fetchAppliances()
    } catch (error: any) {
      setRefreshResult({ success: false, error: error.message })
    }
    setRefreshingPrices(false)
  }

  const handleFullSync = async () => {
    setFullSyncing(true)
    setFullSyncResult(null)
    try {
      const res = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full-sync' })
      })
      const data = await res.json()
      setFullSyncResult(data)
      await fetchCounts()
      await fetchAppliances()
    } catch (error: any) {
      setFullSyncResult({ success: false, error: error.message })
    }
    setFullSyncing(false)
  }

  // Home Depot functions
  const handleHdSearch = async () => {
    if (!hdSearchQuery.trim()) return
    setHdSearching(true)
    setHdSearchResults([])
    try {
      const res = await fetch('/api/homedepot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: hdSearchQuery, zip: '36608' })
      })
      const data = await res.json()
      if (data.success && data.products) {
        setHdSearchResults(data.products)
      }
    } catch (error) {
      console.error('Home Depot search error:', error)
    }
    setHdSearching(false)
  }

  const handleHdLinkProduct = async (hdProductId: string) => {
    if (!hdSelectedAsin) return
    try {
      const res = await fetch('/api/homedepot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link-product', asin: hdSelectedAsin, productId: hdProductId, zip: '36608' })
      })
      const data = await res.json()
      if (data.success) {
        setHdMatchResult({ success: true, message: `Linked to Home Depot product` })
        setHdSelectedAsin(null)
        setHdSearchResults([])
        setHdSearchQuery('')
        await fetchAppliances()
      } else {
        setHdMatchResult({ success: false, error: data.error })
      }
    } catch (error: any) {
      setHdMatchResult({ success: false, error: error.message })
    }
  }

  const handleHdAutoMatch = async (asin: string) => {
    setHdMatching(true)
    setHdMatchResult(null)
    try {
      const res = await fetch('/api/homedepot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto-match', asin, zip: '36608' })
      })
      const data = await res.json()
      setHdMatchResult(data)
      if (data.matched) {
        await fetchAppliances()
      }
    } catch (error: any) {
      setHdMatchResult({ success: false, error: error.message })
    }
    setHdMatching(false)
  }

  const handleHdBulkMatch = async () => {
    setHdMatching(true)
    setHdMatchResult(null)
    try {
      const res = await fetch('/api/homedepot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-match', category: selectedCategory, limit: 10, zip: '36608' })
      })
      const data = await res.json()
      setHdMatchResult(data)
      await fetchAppliances()
    } catch (error: any) {
      setHdMatchResult({ success: false, error: error.message })
    }
    setHdMatching(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Manage appliance database</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Site</Link>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 text-sm flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Full Sync */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-2 text-white">Full Sync (All Categories)</h2>
          <p className="text-sm text-slate-400 mb-4">Discovers new products and refreshes prices for ALL categories.</p>
          <button onClick={handleFullSync} disabled={fullSyncing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {fullSyncing ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</> : <><RefreshCw className="w-4 h-4" />Run Full Sync</>}
          </button>
          {fullSyncResult && (
            <div className={`mt-4 p-4 rounded-lg ${fullSyncResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {fullSyncResult.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-400 mb-2"><CheckCircle className="w-5 h-5" />Full Sync Complete</div>
                  <div className="text-sm space-y-1">
                    {fullSyncResult.results?.map((r: any, i: number) => (
                      <div key={i} className="flex justify-between text-slate-300">
                        <span>{r.category}</span>
                        <span>{r.error ? `Error: ${r.error}` : `+${r.created} new, ${r.updated} updated`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{fullSyncResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-white">Products by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`p-4 rounded-lg text-center transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                <div className="text-2xl font-bold">{counts[cat] || 0}</div>
                <div className="text-sm">{cat}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Keepa Actions */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-white">Keepa Actions for {selectedCategory}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleDiscover} disabled={discovering || fetchingDetails} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {discovering || fetchingDetails ? <><Loader2 className="w-4 h-4 animate-spin" />{fetchingDetails ? 'Fetching...' : 'Discovering...'}</> : <><Search className="w-4 h-4" />Discover New</>}
            </button>
            <button onClick={handleRefreshPrices} disabled={refreshingPrices} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {refreshingPrices ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching Details...</> : <><RefreshCw className="w-4 h-4" />Refresh All Details</>}
            </button>
          </div>
          
          {discoverResult && (
            <div className={`mt-4 p-4 rounded-lg ${discoverResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {discoverResult.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />
                    Pages {discoverResult.pagesScanned}, found {discoverResult.totalFound}, {discoverResult.newAsins} new
                  </div>
                  {discoverResult.details && <div className="text-sm text-slate-400 mt-1">Added {discoverResult.details.created}, filtered {discoverResult.details.filteredOut || 0}</div>}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{discoverResult.error}</div>
              )}
            </div>
          )}
          
          {refreshResult && (
            <div className={`mt-4 p-4 rounded-lg ${refreshResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {refreshResult.success ? (
                <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />Updated {refreshResult.updated} prices</div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{refreshResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Manual Actions */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-white">Manual Actions for {selectedCategory}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" />Add Product
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4" />Import CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={importing} />
            </label>
            <button onClick={handleCleanupDatabase} disabled={cleaning} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">
              {cleaning ? <><Loader2 className="w-4 h-4 animate-spin" />Cleaning...</> : <><Sparkles className="w-4 h-4" />Cleanup Parts & Low Price</>}
            </button>
            <button onClick={() => setShowFilterWordsPanel(!showFilterWordsPanel)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Filter className="w-4 h-4" />Filter Words ({filterWords.length})
            </button>
            <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Trash2 className="w-4 h-4" />Delete All
            </button>
          </div>
          
          {/* Filter Words Panel */}
          {showFilterWordsPanel && (
            <div className="mt-4 bg-slate-800 rounded-lg border border-slate-600 p-4">
              <h3 className="text-white font-semibold mb-3">Filter Words (products with these words in title are hidden)</h3>
              
              {/* Add new word */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newFilterWord}
                  onChange={(e) => setNewFilterWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFilterWord()}
                  placeholder="Add new filter word..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={addFilterWord}
                  disabled={!newFilterWord.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  Add
                </button>
              </div>
              
              {/* Word list */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {filterWords.map(word => (
                  <span 
                    key={word} 
                    className="inline-flex items-center gap-1 bg-slate-700 text-slate-200 px-2 py-1 rounded text-sm"
                  >
                    {word}
                    <button
                      onClick={() => removeFilterWord(word)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <p className="text-xs text-slate-500 mt-3">
                Note: Filter words are stored in database and sync across homepage/admin. Adding a word will hide matching products.
              </p>
            </div>
          )}
          
          {importing && <div className="mt-4 flex items-center gap-2 text-blue-400"><Loader2 className="w-4 h-4 animate-spin" />Importing...</div>}
          
          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${importResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {importResult.success ? (
                <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />Imported {importResult.added} ({importResult.errors} errors)</div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />Import failed</div>
              )}
            </div>
          )}
          
          {cleanupResult && (
            <div className={`mt-4 p-4 rounded-lg ${cleanupResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {cleanupResult.success ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Removed {cleanupResult.total} items ({cleanupResult.partsDeleted} parts, {cleanupResult.lowPriceDeleted} under ${MINIMUM_PRICE})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{cleanupResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Home Depot Integration */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">HOME DEPOT</span>
              Price Comparison
            </h2>
            <button 
              onClick={() => setShowHomeDepotPanel(!showHomeDepotPanel)} 
              className="text-sm text-slate-400 hover:text-white"
            >
              {showHomeDepotPanel ? 'Hide' : 'Show'} Panel
            </button>
          </div>

          {showHomeDepotPanel && (
            <div className="space-y-4">
              {/* Bulk Match */}
              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={handleHdBulkMatch} 
                  disabled={hdMatching} 
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {hdMatching ? <><Loader2 className="w-4 h-4 animate-spin" />Matching...</> : <><Search className="w-4 h-4" />Auto-Match 10 Products</>}
                </button>
                <span className="text-sm text-slate-400">
                  Automatically find Home Depot matches for {selectedCategory} products
                </span>
              </div>

              {/* Search & Manual Link */}
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Manual Search & Link</h3>
                
                {/* Select Amazon Product */}
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">1. Select Amazon product to link:</label>
                  <select 
                    value={hdSelectedAsin || ''} 
                    onChange={(e) => setHdSelectedAsin(e.target.value || null)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">-- Select a product --</option>
                    {appliances.filter(a => !a.homedepot_product_id).slice(0, 50).map(a => (
                      <option key={a.asin} value={a.asin}>
                        {a.brand} {a.model} - ${a.price} ({a.asin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Home Depot */}
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">2. Search Home Depot:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hdSearchQuery}
                      onChange={(e) => setHdSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleHdSearch()}
                      placeholder="Search by brand, model, or keyword..."
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <button
                      onClick={handleHdSearch}
                      disabled={hdSearching || !hdSearchQuery.trim()}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
                    >
                      {hdSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {hdSearchResults.length > 0 && (
                  <div className="bg-slate-800 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                    <div className="text-xs text-slate-400 px-3 py-2 border-b border-slate-600">
                      3. Select Home Depot product to link:
                    </div>
                    {hdSearchResults.map((product, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3 border-b border-slate-700 hover:bg-slate-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{product.name}</div>
                          <div className="text-xs text-slate-400">
                            {product.brand} | ${product.price} | ID: {product.productId}
                          </div>
                        </div>
                        <button
                          onClick={() => handleHdLinkProduct(product.productId)}
                          disabled={!hdSelectedAsin}
                          className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Link
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Result */}
              {hdMatchResult && (
                <div className={`p-4 rounded-lg ${hdMatchResult.success || hdMatchResult.matched ? 'bg-green-900/50 border border-green-700' : 'bg-yellow-900/50 border border-yellow-700'}`}>
                  {hdMatchResult.matched ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      Matched! {hdMatchResult.homedepot?.name} - ${hdMatchResult.homedepot?.price}
                    </div>
                  ) : hdMatchResult.success ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      {hdMatchResult.message || `Processed: ${hdMatchResult.matched} matched, ${hdMatchResult.failed} failed`}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <AlertCircle className="w-5 h-5" />
                      {hdMatchResult.message || hdMatchResult.error || 'No match found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="font-semibold mb-4 text-white">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Brand</label>
                <input type="text" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Model</label>
                <input type="text" value={newProduct.model} onChange={e => setNewProduct({ ...newProduct, model: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Title</label>
                <input type="text" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Price</label>
                <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Type</label>
                <input type="text" value={newProduct.type} onChange={e => setNewProduct({ ...newProduct, type: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Product URL</label>
                <input type="url" value={newProduct.product_url} onChange={e => setNewProduct({ ...newProduct, product_url: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Image URL</label>
                <input type="url" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={adding} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{adding ? 'Adding...' : 'Add Product'}</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Products Section with Sidebar */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <div className="w-56 flex-shrink-0">
            {/* Category dropdown */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({counts[cat] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            {config?.types && config.types.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Type</label>
                <div className="space-y-1">
                  {config.types.map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => toggleFilter('types', type)}
                        className="rounded border-slate-500 bg-slate-700"
                      />
                      <span className="text-slate-300">{type} ({typeCounts[type] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brand filter */}
            {brands.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Brand</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleFilter('brands', brand)}
                        className="rounded border-slate-500 bg-slate-700"
                      />
                      <span className="text-slate-300">{brand} ({brandCounts[brand] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Color filter */}
            {colors.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Color</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {colors.map(color => (
                    <label key={color} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={() => toggleFilter('colors', color)}
                        className="rounded border-slate-500 bg-slate-700"
                      />
                      <span className="text-slate-300">{color} ({colorCounts[color] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear filters */}
            {(filters.types.length > 0 || filters.brands.length > 0 || filters.colors.length > 0) && (
              <button
                onClick={() => setFilters({ types: [], brands: [], colors: [] })}
                className="w-full text-sm text-red-400 hover:text-red-300 py-2 border border-red-400/30 rounded hover:bg-red-400/10 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Products Table */}
          <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-white">{selectedCategory} ({filteredAppliances.length} of {totalCount})</h2>
                {selectedIds.size > 0 && (
                  <button 
                    onClick={handleBulkDelete} 
                    disabled={bulkDeleting}
                    className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete {selectedIds.size} Selected
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                  disabled={currentPage === 0}
                  className="p-2 rounded hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-slate-300">Page {currentPage + 1} of {totalPages || 1}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 rounded hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : filteredAppliances.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No products match your filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-left px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.size === filteredAppliances.length && filteredAppliances.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-slate-300">Image</th>
                    <th className="text-left px-4 py-3 text-slate-300">Brand</th>
                    <th className="text-left px-4 py-3 text-slate-300">Title</th>
                    <th className="text-left px-4 py-3 text-slate-300">Price</th>
                    <th className="text-left px-4 py-3 text-slate-300">HD Price</th>
                    <th className="text-left px-4 py-3 text-slate-300">Type</th>
                    <th className="text-left px-4 py-3 text-slate-300">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppliances.map(item => (
                    <tr key={item.id} className={`border-t border-slate-700 hover:bg-slate-800 ${selectedIds.has(item.id) ? 'bg-slate-800' : ''}`}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <ProductImage src={item.image_url} alt={item.title || ''} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">{item.brand || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-md">{item.title || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{item.price ? `$${item.price}` : '—'}</td>
                      <td className="px-4 py-3">
                        {item.homedepot_price ? (
                          <span className={`font-medium ${item.homedepot_price < item.price ? 'text-green-400' : 'text-orange-400'}`}>
                            ${item.homedepot_price}
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleHdAutoMatch(item.asin)}
                            disabled={hdMatching}
                            className="text-xs text-slate-500 hover:text-orange-400"
                            title="Find Home Depot match"
                          >
                            Find
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{item.type || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{item.rating ? `${item.rating}★` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Bottom pagination and delete button */}
          <div className="p-4 border-t border-slate-700 flex flex-wrap justify-between items-center gap-4">
            {selectedIds.size > 0 && (
              <button 
                onClick={handleBulkDelete} 
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete {selectedIds.size} Selected
              </button>
            )}
            
            {/* Pagination controls */}
            <div className="flex items-center gap-4 ml-auto flex-wrap">
              {/* Showing range */}
              <span className="text-sm text-slate-400">
                Showing {currentPage * PAGE_SIZE + 1} - {Math.min((currentPage + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </span>
              
              {totalPages > 1 && (
                <>
                  {/* Navigation buttons */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">First</button>
                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Page input */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-slate-400">Page</span>
                      <input 
                        type="number" 
                        min={1} 
                        max={totalPages}
                        value={currentPage + 1}
                        onChange={(e) => {
                          const page = parseInt(e.target.value) - 1
                          if (page >= 0 && page < totalPages) {
                            setCurrentPage(page)
                          }
                        }}
                        className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-center text-slate-300"
                      />
                      <span className="text-sm text-slate-400">of {totalPages}</span>
                    </div>
                    
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">Last</button>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}