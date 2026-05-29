import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../view/login/Login'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
