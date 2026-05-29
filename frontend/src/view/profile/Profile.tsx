import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import request from '../../utils/request'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import type { MyProduct, AppointmentItem, FavoriteItem, PaginatedRes } from '../../types'

type Tab = 'products' | 'appointments-buyer' | 'appointments-seller' | 'favorites'

const STATUS_MAP: Record<string, string> = {
  pending: '待审核',
  active: '已上架',
  rejected: '已驳回',
  offline: '已下架',
  sold: '已售出',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  offline: 'bg-gray-100 text-gray-500',
  sold: 'bg-blue-100 text-blue-700',
}

export default function Profile() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<MyProduct[]>([])
  const [buyerAppts, setBuyerAppts] = useState<AppointmentItem[]>([])
  const [sellerAppts, setSellerAppts] = useState<AppointmentItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const res: PaginatedRes<MyProduct> = await request.get('/my-products/', { params })
      setProducts(res.results)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [statusFilter])

  const loadBuyerAppts = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<AppointmentItem> = await request.get('/my-appointments/as-buyer/')
      setBuyerAppts(res.results)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  const loadSellerAppts = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<AppointmentItem> = await request.get('/my-appointments/as-seller/')
      setSellerAppts(res.results)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<FavoriteItem> = await request.get('/my-favorites/')
      setFavorites(res.results)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (tab === 'products') loadProducts()
    else if (tab === 'appointments-buyer') loadBuyerAppts()
    else if (tab === 'appointments-seller') loadSellerAppts()
    else if (tab === 'favorites') loadFavorites()
  }, [tab, loadProducts, loadBuyerAppts, loadSellerAppts, loadFavorites])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'products', label: '我发布的' },
    { key: 'appointments-buyer', label: '我预约的' },
    { key: 'appointments-seller', label: '收到的预约' },
    { key: 'favorites', label: '我的收藏' },
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">个人中心</h1>
        <p className="text-gray-500 text-sm">欢迎，{user?.username}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-gray-500">加载中...</div>}

      {/* My Products */}
      {!loading && tab === 'products' && (
        <>
          <div className="flex gap-2 mb-4">
            {['', 'pending', 'active', 'rejected', 'offline', 'sold'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded text-xs ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              >
                {s ? STATUS_MAP[s] : '全部'}
              </button>
            ))}
          </div>
          {products.length === 0 ? (
            <p className="text-gray-400">暂无商品</p>
          ) : (
            <div className="space-y-3">
              {products.map(p => (
                <Link key={p.id} to={`/products/${p.id}`} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {p.images[0] ? (
                      <img src={p.images[0].image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">无图</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{p.title}</h3>
                    <p className="text-sm text-gray-500">{p.category_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-red-500 font-bold">¥{p.price}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${STATUS_COLOR[p.status] || 'bg-gray-100'}`}>
                      {STATUS_MAP[p.status] || p.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">预约: {p.appointment_count}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Buyer Appointments */}
      {!loading && tab === 'appointments-buyer' && (
        buyerAppts.length === 0 ? (
          <p className="text-gray-400">暂无预约</p>
        ) : (
          <div className="space-y-3">
            {buyerAppts.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                <div>
                  <Link to={`/products/${a.product_id}`} className="font-medium text-blue-600 hover:underline">{a.product_title}</Link>
                  <p className="text-sm text-gray-500">¥{a.product_price}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )
      )}

      {/* Seller Appointments */}
      {!loading && tab === 'appointments-seller' && (
        sellerAppts.length === 0 ? (
          <p className="text-gray-400">暂无预约</p>
        ) : (
          <div className="space-y-3">
            {sellerAppts.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                <div>
                  <Link to={`/products/${a.product_id}`} className="font-medium text-blue-600 hover:underline">{a.product_title}</Link>
                  <p className="text-sm text-gray-500">预约者: {a.buyer_username}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )
      )}

      {/* Favorites */}
      {!loading && tab === 'favorites' && (
        favorites.length === 0 ? (
          <p className="text-gray-400">暂无收藏</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map(f => (
              <Link key={f.id} to={`/products/${f.product_id}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {f.product_image ? (
                    <img src={f.product_image} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">暂无图片</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate">{f.product_title}</h3>
                  <span className="text-red-500 font-bold text-sm">¥{f.product_price}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </Layout>
  )
}
