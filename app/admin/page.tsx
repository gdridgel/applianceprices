'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { allCategories } from '@/lib/categoryConfig'
import { ArrowLeft, Trash2, Plus, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Search, Zap, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

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

type Appliance = {
  id: string
  [key: string]: any
}

const PAGE_SIZE = 50

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] = useState('Refrigerators')
  const [appliances, setAppliances] = useState<Appliance[]>([])
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

  useEffect(() => {
    fetchCounts()
  }, [])

  async function fetchCounts() {
    const newCounts: Record<string, number> = {}
    for (const cat of allCategories) {
      const { count } = await supabase
        .from('appliances')
        .select('*', { count: 'exact', head: true })
        .eq('category', cat)
      newCounts[cat] = count || 0
    }
    setCounts(newCounts)
  }

  useEffect(() => {
    async function fetchAppliances() {
      setIsLoading(true)
      
      // Get total count for category
      const { count } = await supabase
        .from('appliances')
        .select('*', { count: 'exact', head: true })
        .eq('category', selectedCategory)
      setTotalCount(count || 0)
      
      // Get paginated data
      const from = currentPage * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      
      const { data, error } = await supabase
        .from('appliances')
        .select('*')
        .eq('category', selectedCategory)
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (!error) setAppliances(data || [])
      setIsLoading(false)
    }
    fetchAppliances()
  }, [selectedCategory, currentPage])

  // Reset to page 0 when category changes
  useEffect(() => {
    setCurrentPage(0)
  }, [selectedCategory])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleDelete = async (id: string, asin: string) => {
    if (!confirm('Delete this product?')) return
    
    // Add to deleted_asins table
    if (asin) {
      await supabase.from('deleted_asins').upsert({ asin }, { onConflict: 'asin' })
    }
    
    const { error } = await supabase.from('appliances').delete().eq('id', id)
    if (!error) {
      setAppliances(prev => prev.filter(a => a.id !== id))
      setCounts(prev => ({ ...prev, [selectedCategory]: (prev[selectedCategory] || 1) - 1 }))
      setTotalCount(prev => prev - 1)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ALL ${selectedCategory}?`)) return
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('appliances').delete().eq('category', selectedCategory)
    if (!error) {
      setAppliances([])
      setCounts(prev => ({ ...prev, [selectedCategory]: 0 }))
    }
  }

  const handleCleanupDatabase = async () => {
    if (!confirm(`This will delete all parts/accessories and items under $${MINIMUM_PRICE} from ${selectedCategory}. Continue?`)) return
    
    setCleaning(true)
    setCleanupResult(null)
    
    try {
      // Get all products in category
      const { data: allProducts, error } = await supabase
        .from('appliances')
        .select('id, asin, title, price')
        .eq('category', selectedCategory)
      
      if (error) throw error
      
      let partsDeleted = 0
      let lowPriceDeleted = 0
      const idsToDelete: string[] = []
      const asinsToBlock: string[] = []
      
      for (const product of allProducts || []) {
        let shouldDelete = false
        
        // Check if it's a part/accessory
        if (isPartOrAccessory(product.title)) {
          partsDeleted++
          shouldDelete = true
        }
        // Check if price is too low
        else if (product.price !== null && product.price < MINIMUM_PRICE) {
          lowPriceDeleted++
          shouldDelete = true
        }
        
        if (shouldDelete) {
          idsToDelete.push(product.id)
          if (product.asin) asinsToBlock.push(product.asin)
        }
      }
      
      // Add ASINs to deleted_asins table
      if (asinsToBlock.length > 0) {
        const asinsToInsert = asinsToBlock.map(asin => ({ asin }))
        await supabase.from('deleted_asins').upsert(asinsToInsert, { onConflict: 'asin' })
      }
      
      // Delete the products in batches
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
      
      // Refresh counts and list
      fetchCounts()
      setCurrentPage(0)
      
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
      const { data } = await supabase.from('appliances').select('*').eq('category', selectedCategory).order('created_at', { ascending: false }).limit(100)
      setAppliances(data || [])
      setCounts(prev => ({ ...prev, [selectedCategory]: (prev[selectedCategory] || 0) + 1 }))
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
      const { data } = await supabase.from('appliances').select('*').eq('category', selectedCategory).order('created_at', { ascending: false }).limit(100)
      setAppliances(data || [])
      fetchCounts()
    } catch (err) {
      setImportResult({ success: false, added: 0, errors: 1 })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleDiscover = async () => {
    setDiscovering(true)
    setDiscoverResult(null)
    try {
      const response = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover', category: selectedCategory })
      })
      const data = await response.json()
      setDiscoverResult(data)
      
      if (data.success && data.asins && data.asins.length > 0) {
        setFetchingDetails(true)
        const detailsResponse = await fetch('/api/keepa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch-details', category: selectedCategory, asins: data.asins })
        })
        const detailsData = await detailsResponse.json()
        setDiscoverResult({ ...data, details: detailsData })
        setFetchingDetails(false)
        
        const { data: products } = await supabase.from('appliances').select('*').eq('category', selectedCategory).order('created_at', { ascending: false }).limit(100)
        setAppliances(products || [])
        fetchCounts()
      }
    } catch (error) {
      setDiscoverResult({ success: false, error: 'Failed to connect to Keepa' })
    } finally {
      setDiscovering(false)
      setFetchingDetails(false)
    }
  }

  const handleRefreshPrices = async () => {
    setRefreshingPrices(true)
    setRefreshResult(null)
    try {
      const response = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-prices', category: selectedCategory })
      })
      const data = await response.json()
      setRefreshResult(data)
      
      if (data.success) {
        const { data: products } = await supabase.from('appliances').select('*').eq('category', selectedCategory).order('created_at', { ascending: false }).limit(100)
        setAppliances(products || [])
      }
    } catch (error) {
      setRefreshResult({ success: false, error: 'Failed to refresh prices' })
    } finally {
      setRefreshingPrices(false)
    }
  }

  const handleFullSync = async () => {
    if (!confirm('Run full sync for ALL categories? This may take several minutes and use API credits.')) return
    setFullSyncing(true)
    setFullSyncResult(null)
    try {
      const response = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full-sync' })
      })
      const data = await response.json()
      setFullSyncResult(data)
      fetchCounts()
      const { data: products } = await supabase.from('appliances').select('*').eq('category', selectedCategory).order('created_at', { ascending: false }).limit(100)
      setAppliances(products || [])
    } catch (error) {
      setFullSyncResult({ success: false, error: 'Full sync failed' })
    } finally {
      setFullSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Full Daily Sync (All Categories)</h2>
          <p className="text-sm text-slate-600 mb-4">Discovers new products and refreshes prices for ALL categories. Run this daily.</p>
          <button onClick={handleFullSync} disabled={fullSyncing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {fullSyncing ? <><Loader2 className="w-4 h-4 animate-spin" />Running Full Sync...</> : <><RefreshCw className="w-4 h-4" />Run Full Sync</>}
          </button>
          {fullSyncResult && (
            <div className={`mt-4 p-4 rounded-lg ${fullSyncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {fullSyncResult.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-700 mb-2"><CheckCircle className="w-5 h-5" />Full Sync Complete</div>
                  <div className="text-sm space-y-1">
                    {fullSyncResult.results?.map((r: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{r.category}</span>
                        <span className="text-slate-500">{r.error ? `Error: ${r.error}` : `+${r.created} new, ${r.updated} updated`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" />{fullSyncResult.error}</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">Products by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`p-4 rounded-lg text-center transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
                <div className="text-2xl font-bold">{counts[cat] || 0}</div>
                <div className="text-sm">{cat}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">Keepa Actions for {selectedCategory}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleDiscover} disabled={discovering || fetchingDetails} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {discovering || fetchingDetails ? <><Loader2 className="w-4 h-4 animate-spin" />{fetchingDetails ? 'Fetching Details...' : 'Discovering...'}</> : <><Search className="w-4 h-4" />Discover New Products</>}
            </button>
            <button onClick={handleRefreshPrices} disabled={refreshingPrices} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {refreshingPrices ? <><Loader2 className="w-4 h-4 animate-spin" />Refreshing...</> : <><RefreshCw className="w-4 h-4" />Refresh Prices</>}
            </button>
          </div>
          
          {discoverResult && (
            <div className={`mt-4 p-4 rounded-lg ${discoverResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {discoverResult.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-700"><CheckCircle className="w-5 h-5" />Found {discoverResult.totalFound} products, {discoverResult.newAsins} new</div>
                  {discoverResult.details && <div className="text-sm text-slate-600 mt-1">Added {discoverResult.details.created} new, updated {discoverResult.details.updated}</div>}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" />{discoverResult.error}</div>
              )}
            </div>
          )}
          
          {refreshResult && (
            <div className={`mt-4 p-4 rounded-lg ${refreshResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {refreshResult.success ? (
                <div className="flex items-center gap-2 text-green-700"><CheckCircle className="w-5 h-5" />Updated {refreshResult.updated} prices</div>
              ) : (
                <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" />{refreshResult.error}</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">Manual Actions for {selectedCategory}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" />Add Product</button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"><Upload className="w-4 h-4" />Import CSV<input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={importing} /></label>
            <button onClick={handleCleanupDatabase} disabled={cleaning} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">
              {cleaning ? <><Loader2 className="w-4 h-4 animate-spin" />Cleaning...</> : <><Sparkles className="w-4 h-4" />Cleanup Parts & Low Price</>}
            </button>
            <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 className="w-4 h-4" />Delete All</button>
          </div>
          {importing && <div className="mt-4 flex items-center gap-2 text-blue-600"><Loader2 className="w-4 h-4 animate-spin" />Importing...</div>}
          {importResult && <div className={`mt-4 p-4 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>{importResult.success ? <div className="flex items-center gap-2 text-green-700"><CheckCircle className="w-5 h-5" />Imported {importResult.added} products ({importResult.errors} errors)</div> : <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" />Import failed</div>}</div>}
          {cleanupResult && (
            <div className={`mt-4 p-4 rounded-lg ${cleanupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {cleanupResult.success ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Cleaned up {cleanupResult.total} items ({cleanupResult.partsDeleted} parts, {cleanupResult.lowPriceDeleted} under ${MINIMUM_PRICE})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-5 h-5" />{cleanupResult.error}</div>
              )}
            </div>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="font-semibold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Category</label><select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full border rounded-lg px-3 py-2">{allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Brand</label><input type="text" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Model</label><input type="text" value={newProduct.model} onChange={e => setNewProduct({ ...newProduct, model: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Price</label><input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Type</label><input type="text" value={newProduct.type} onChange={e => setNewProduct({ ...newProduct, type: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Product URL</label><input type="url" value={newProduct.product_url} onChange={e => setNewProduct({ ...newProduct, product_url: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Image URL</label><input type="url" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={adding} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{adding ? 'Adding...' : 'Add Product'}</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">{selectedCategory} ({totalCount} total, showing {appliances.length})</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                disabled={currentPage === 0}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm">Page {currentPage + 1} of {totalPages || 1}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {isLoading ? <div className="p-8 text-center text-slate-500">Loading...</div> : appliances.length === 0 ? <div className="p-8 text-center text-slate-500">No products. Use Keepa to discover products or import a CSV!</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50"><tr><th className="text-left px-4 py-3">Image</th><th className="text-left px-4 py-3">Brand</th><th className="text-left px-4 py-3">Title</th><th className="text-left px-4 py-3">Price</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Rating</th><th className="text-left px-4 py-3">Actions</th></tr></thead>
                <tbody>
                  {appliances.map(item => (
                    <tr key={item.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3">{item.image_url ? <img src={item.image_url} alt="" className="w-12 h-12 object-contain" /> : <div className="w-12 h-12 bg-slate-200 rounded" />}</td>
                      <td className="px-4 py-3">{item.brand || '—'}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={item.title}>{item.title || '—'}</td>
                      <td className="px-4 py-3">{item.price ? `$${item.price}` : '—'}</td>
                      <td className="px-4 py-3">{item.type || '—'}</td>
                      <td className="px-4 py-3">{item.rating ? `${item.rating}★` : '—'}</td>
                      <td className="px-4 py-3"><button onClick={() => handleDelete(item.id, item.asin)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-center items-center gap-2">
              <button 
                onClick={() => setCurrentPage(0)} 
                disabled={currentPage === 0}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-sm"
              >
                First
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                disabled={currentPage === 0}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-sm"
              >
                Prev
              </button>
              <span className="text-sm px-4">Page {currentPage + 1} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-sm"
              >
                Next
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages - 1)} 
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-sm"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}