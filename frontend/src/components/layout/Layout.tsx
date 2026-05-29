import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">校园二手</Link>
          <nav className="flex items-center gap-4">
            <Link to="/products" className="text-gray-600 hover:text-blue-600">商品列表</Link>
            {user ? (
              <>
                <Link to="/publish" className="text-gray-600 hover:text-blue-600">发布商品</Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600">个人中心</Link>
                <Link to="/admin" className="text-gray-600 hover:text-blue-600">管理后台</Link>
                <span className="text-gray-500 text-sm">{user.username}</span>
                <button onClick={logout} className="text-red-500 hover:text-red-700 text-sm">退出</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-blue-600">登录</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
