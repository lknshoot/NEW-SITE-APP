import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h2>Votre panier est vide</h2>
        <p>Découvrez notre boutique et ajoutez des produits.</p>
        <Link to="/products" className="btn-primary">Continuer mes achats</Link>
      </div>
    )
  }

  const shipping = total >= 60 ? 0 : 4.99

  return (
    <div className="cart-page">
      <h1>Mon panier</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image_url} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">{item.price.toFixed(2)} €</p>
              </div>
              <div className="qty-control">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <p className="cart-item-subtotal">{(item.price * item.quantity).toFixed(2)} €</p>
              <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Supprimer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Récapitulatif</h2>
          <div className="summary-line">
            <span>Sous-total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <div className="summary-line">
            <span>Livraison</span>
            <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} €`}</span>
          </div>
          {shipping > 0 && (
            <p className="shipping-hint">Plus que {(60 - total).toFixed(2)} € pour la livraison gratuite</p>
          )}
          <div className="summary-total">
            <span>Total</span>
            <span>{(total + shipping).toFixed(2)} €</span>
          </div>
          <Link to="/checkout" className="checkout-btn">Passer à la caisse</Link>
          <Link to="/products" className="continue-btn">← Continuer mes achats</Link>
        </div>
      </div>
    </div>
  )
}
