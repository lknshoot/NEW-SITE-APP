import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Header.css'

export default function Header() {
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">Maison LILAK</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/products" className="nav-link">Boutique</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </nav>
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span className="cart-label">Panier</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
      </div>
    </header>
  )
}
