import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-img-wrap">
        <img src={product.image_url} alt={product.name} className="product-img" loading="lazy" />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="stock-badge">Plus que {product.stock}</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge sold-out">Épuisé</span>
        )}
      </Link>
      <div className="product-info">
        <p className="product-category">{product.categories?.name}</p>
        <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
        <div className="product-footer">
          <span className="product-price">{product.price.toFixed(2)} €</span>
          <button
            className="add-btn"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Épuisé' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
