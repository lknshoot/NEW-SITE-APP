import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import './Checkout.css'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const shipping = total >= 60 ? 0 : 4.99

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Nom requis'
    if (!form.email.includes('@')) e.email = 'Email invalide'
    if (!form.address.trim()) e.address = 'Adresse requise'
    if (!form.city.trim()) e.city = 'Ville requise'
    if (!/^\d{5}$/.test(form.zip)) e.zip = 'Code postal invalide'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_email: form.email,
          total_amount: total + shipping,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        }))
      )

      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Votre panier est vide.</p>
        <Link to="/products" className="back-link">← Retour à la boutique</Link>
      </div>
    )
  }

  function field(key, label, type = 'text', placeholder = '') {
    return (
      <div className="form-group">
        <label htmlFor={key}>{label}</label>
        <input
          id={key}
          type={type}
          value={form[key]}
          placeholder={placeholder}
          className={errors[key] ? 'error' : ''}
          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) }}
        />
        {errors[key] && <span className="field-error">{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <Link to="/cart" className="back-link">← Retour au panier</Link>
      <h1>Finaliser la commande</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Informations personnelles</h2>
            {field('name', 'Nom complet', 'text', 'Jean Dupont')}
            {field('email', 'Email', 'email', 'jean@example.com')}
          </section>

          <section className="form-section">
            <h2>Adresse de livraison</h2>
            {field('address', 'Adresse', 'text', '12 rue de la Paix')}
            <div className="form-row">
              {field('city', 'Ville', 'text', 'Paris')}
              {field('zip', 'Code postal', 'text', '75001')}
            </div>
          </section>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Traitement...' : `Confirmer — ${(total + shipping).toFixed(2)} €`}
          </button>
        </form>

        <div className="order-summary">
          <h2>Votre commande</h2>
          {items.map(item => (
            <div key={item.id} className="order-line">
              <img src={item.image_url} alt={item.name} />
              <div className="order-line-info">
                <span className="order-line-name">{item.name}</span>
                <span className="order-line-qty">× {item.quantity}</span>
              </div>
              <span className="order-line-price">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="order-divider" />
          <div className="order-total-line">
            <span>Livraison</span>
            <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} €`}</span>
          </div>
          <div className="order-total-line bold">
            <span>Total</span>
            <span>{(total + shipping).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  )
}
