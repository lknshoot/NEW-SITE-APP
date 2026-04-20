import { useLocation, Link } from 'react-router-dom'
import './OrderSuccess.css'

export default function OrderSuccess() {
  const { state } = useLocation()

  return (
    <div className="success-page">
      <div className="success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h1>Commande confirmée !</h1>
      <p>Merci pour votre achat. Vous recevrez un email de confirmation sous peu.</p>
      {state?.orderId && (
        <p className="order-id">Numéro de commande : <strong>{state.orderId.slice(0, 8).toUpperCase()}</strong></p>
      )}
      <div className="success-actions">
        <Link to="/products" className="btn-primary">Continuer les achats</Link>
        <Link to="/" className="btn-ghost">Retour à l'accueil</Link>
      </div>
    </div>
  )
}
