import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Admin.css'

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Erreur:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      shipped: '#10b981'
    }
    return colors[status] || '#6b7280'
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🏪 Dashboard Administrateur</h1>
        <p>Gérez vos commandes et produits</p>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-number">{orders.length}</span>
          <span className="stat-label">Commandes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalRevenue.toFixed(2)}€</span>
          <span className="stat-label">Revenu total</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Commandes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🛍️ Produits
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="orders-section">
          {loading ? (
            <p>Chargement...</p>
          ) : orders.length === 0 ? (
            <p className="empty-message">Aucune commande pour le moment</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">#{order.id.slice(0, 8)}</span>
                    <span 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-info">
                    <p><strong>Client:</strong> {order.customer_name}</p>
                    <p><strong>Email:</strong> {order.customer_email}</p>
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Total:</strong> {order.total_amount?.toFixed(2)}€</p>
                  </div>

                  <div className="order-items">
                    <h4>Articles:</h4>
                    {order.order_items?.map(item => (
                      <div key={item.id} className="order-item">
                        <span>{item.product?.name || 'Produit'}</span>
                        <span>x{item.quantity}</span>
                        <span>{(item.unit_price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-actions">
                    <label>Statut:</label>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="shipped">Expédié</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <ProductsManager />
      )}
    </div>
  )
}

function ProductsManager() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock: '',
    category_id: '',
    featured: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ])
      setProducts(productsRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Erreur:', error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      stock: product.stock,
      category_id: product.category_id || '',
      featured: product.featured
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        stock: parseInt(formData.stock),
        category_id: formData.category_id || null,
        featured: formData.featured
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])
        if (error) throw error
      }

      setShowForm(false)
      setEditingProduct(null)
      setFormData({ name: '', description: '', price: '', image_url: '', stock: '', category_id: '', featured: false })
      fetchData()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Voulez-vous supprimer ce produit?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      alert('Erreur: ' + error.message)
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="products-section">
      <button className="add-btn" onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: '', description: '', price: '', image_url: '', stock: '', category_id: '', featured: false }) }}>
        + Ajouter un produit
      </button>

      {showForm && (
        <div className="product-form-overlay">
          <form className="product-form" onSubmit={handleSubmit}>
            <h3>{editingProduct ? 'Modifier' : 'Ajouter'} un produit</h3>
            <input 
              type="text" 
              placeholder="Nom du produit" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
            />
            <textarea 
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <div className="form-row">
              <input 
                type="number" 
                placeholder="Prix (€)" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                step="0.01"
                required 
              />
              <input 
                type="number" 
                placeholder="Stock" 
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                required 
              />
            </div>
            <input 
              type="url" 
              placeholder="URL de l'image" 
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
            <select 
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <label className="checkbox-label">
              <input 
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData({...formData, featured: e.target.checked})}
              />
              Produit en vedette
            </label>
            <div className="form-actions">
              <button type="submit">{editingProduct ? 'Mettre à jour' : 'Ajouter'}</button>
              <button type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card-admin">
            <img src={product.image_url || 'https://via.placeholder.com/150'} alt={product.name} />
            <div className="product-info">
              <h4>{product.name}</h4>
              <p className="price">{product.price?.toFixed(2)}€</p>
              <p className="stock">Stock: {product.stock}</p>
              <p className="category">{product.category?.name}</p>
            </div>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)}>Modifier</button>
              <button onClick={() => handleDelete(product.id)} className="delete-btn">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}