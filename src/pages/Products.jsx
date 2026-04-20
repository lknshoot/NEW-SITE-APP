import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const activeCategory = searchParams.get('category') || ''
  const search = searchParams.get('q') || ''

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at')

      if (activeCategory) {
        const cat = categories.find(c => c.slug === activeCategory)
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data } = await query
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [activeCategory, search, categories])

  function setCategory(slug) {
    const params = new URLSearchParams(searchParams)
    if (slug) params.set('category', slug)
    else params.delete('category')
    setSearchParams(params)
  }

  function handleSearch(e) {
    const params = new URLSearchParams(searchParams)
    if (e.target.value) params.set('q', e.target.value)
    else params.delete('q')
    setSearchParams(params)
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Boutique</h1>
        <p>{products.length} produit{products.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="products-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="search-input"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="filters">
          <button
            className={`filter-btn ${!activeCategory ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="products-grid loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty">
          <p>Aucun produit trouvé.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
