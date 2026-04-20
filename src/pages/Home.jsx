import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import './Home.css'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(name)')
          .eq('featured', true)
          .order('created_at'),
        supabase.from('categories').select('*'),
      ])
      setFeatured(prods || [])
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Nouvelle collection 2026</span>
          <h1 className="hero-title">Des produits<br />d'exception</h1>
          <p className="hero-desc">Découvrez notre sélection soigneusement choisie — qualité premium, prix accessibles.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">Découvrir la boutique</Link>
            <Link to="/products" className="btn-ghost">Voir les nouveautés</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Collection"
            className="hero-img"
          />
          <div className="hero-badge">
            <strong>+500</strong>
            <span>Clients satisfaits</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Parcourir par catégorie</h2>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
              <span className="category-name">{cat.name}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Produits phares</h2>
          <Link to="/products" className="see-all">Voir tout →</Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="banner">
        <div className="banner-content">
          <h2>Livraison offerte dès 60 €</h2>
          <p>Commandez avant 14h pour une livraison le lendemain en France métropolitaine.</p>
          <Link to="/products" className="btn-primary">Commander maintenant</Link>
        </div>
      </section>
    </div>
  )
}
