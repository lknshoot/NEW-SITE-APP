import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <main className="main-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2026 Maison LILAK — Tous droits réservés</p>
        </footer>
      </CartProvider>
    </BrowserRouter>
  )
}
export default App
