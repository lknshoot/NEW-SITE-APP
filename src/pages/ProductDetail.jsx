import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .maybeSingle()
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  function handleAdd() {
    if (!product) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return <div className="detail-loading"><div className="skeleton-detail" /></div>
  }

  if (!product) {
    return (
      <div className="detail-not-found">
        <p>Produit introuvable.</p>
        <Link to="/products" className="back-link">← Retour à la boutique</Link>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <Link to="/products" className="back-link">← Retour à la boutique</Link>
      <div className="detail-grid">
        <div className="detail-img-wrap">
          <img src={product.image_url} alt={product.name} className="detail-img" />
        </div>
        <div className="detail-content">
          <span className="detail-category">{product.categories?.name}</span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">{product.price.toFixed(2)} €</p>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-meta">
            <div className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
              <span>Livraison 2-4 jours</span>
            </div>
            <div className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Retour gratuit 30 jours</span>
            </div>
          </div>

          <div className="detail-stock">
            {product.stock > 5 ? (
              <span className="in-stock">En stock ({product.stock} disponibles)</span>
            ) : product.stock > 0 ? (
              <span className="low-stock">Derniers articles ({product.stock} restants)</span>
            ) : (
              <span className="out-stock">Épuisé</span>
            )}
          </div>

          <button
            className={`detail-add-btn ${added ? 'added' : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {added ? '✓ Ajouté au panier !' : product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </div>
  )
}
