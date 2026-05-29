import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './view/login/Login'
import Home from './view/home/Home'
import ProductList from './view/products/ProductList'
import ProductDetail from './view/products/ProductDetail'
import PublishProduct from './view/products/PublishProduct'
import Profile from './view/profile/Profile'
import AdminLayout from './view/admin/AdminLayout'
import { AdminRoute, GuestRoute, ProtectedRoute } from './components/common/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/publish" element={<ProtectedRoute><PublishProduct /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
