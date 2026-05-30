import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Calendar,
  Heart,
  User,
  ChevronRight,
  ArrowUpRight,
  Filter
} from 'lucide-react'
import request from '../../utils/request'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { MyProduct, AppointmentItem, FavoriteItem, PaginatedRes } from '../../types'

type Tab = 'products' | 'appointments-buyer' | 'appointments-seller' | 'favorites'

const STATUS_MAP: Record<string, string> = {
  pending: '待审核',
  active: '已上架',
  rejected: '已拒绝',
  offline: '已下架',
  sold: '已售出',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-250/50',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  offline: 'bg-primary-subtle text-neutral-500 border-primary-faint',
  sold: 'bg-primary text-white border-primary',
}

const APPT_STATUS_MAP: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  rejected: '已拒绝',
}

const APPT_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
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
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const loadBuyerAppts = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<AppointmentItem> = await request.get('/my-appointments/as-buyer/')
      setBuyerAppts(res.results)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSellerAppts = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<AppointmentItem> = await request.get('/my-appointments/as-seller/')
      setSellerAppts(res.results)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<FavoriteItem> = await request.get('/my-favorites/')
      setFavorites(res.results)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleApptAction(id: number, action: 'confirm' | 'reject') {
    try {
      await request.patch(`/appointments/${id}/`, { action })
      setSellerAppts(prev => prev.map(a => a.id === id ? { ...a, status: action === 'confirm' ? 'confirmed' : 'rejected' } : a))
      toast(action === 'confirm' ? '已确认预约' : '已拒绝预约', 'success')
    } catch (e: any) {
      toast(e?.message || '操作失败', 'error')
    }
  }

  useEffect(() => {
    if (tab === 'products') loadProducts()
    else if (tab === 'appointments-buyer') loadBuyerAppts()
    else if (tab === 'appointments-seller') loadSellerAppts()
    else if (tab === 'favorites') loadFavorites()
  }, [tab, loadProducts, loadBuyerAppts, loadSellerAppts, loadFavorites])

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'products', label: '我发布的商品', icon: Package },
    { key: 'appointments-buyer', label: '我预约的买单', icon: Calendar },
    { key: 'appointments-seller', label: '我收到的预约', icon: ArrowUpRight },
    { key: 'favorites', label: '我的收藏夹', icon: Heart },
  ]

  return (
    <Layout>
      {/* Dynamic Profile Header card */}
      <div className="bg-white border border-primary-faint rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between select-none card-float">
        <div className="flex items-center gap-4.5">
          <div className="w-14 h-14 rounded-2xl bg-primary border border-primary-light text-white flex items-center justify-center">
            <User className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-neutral-900">@{user?.username}</h1>
              {user?.is_staff && (
                <span className="text-[9px] font-bold bg-accent text-neutral-800 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                  STAFF
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1 font-semibold">
              校友实名身份核验成功 // 纯净校园流转成员
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t border-primary-subtle md:border-0 flex gap-6 text-left">
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">身份状态</span>
            <span className="text-xs text-neutral-900 font-extrabold mt-0.5 block">正常激活活跃</span>
          </div>
          <div className="h-8 w-[1px] bg-primary-faint self-center" />
          <div>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">安全凭证等级</span>
            <span className="text-xs text-neutral-900 font-extrabold mt-0.5 block">100% 官方免中介</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex flex-wrap gap-2 border-b border-primary-faint pb-4 mb-6 select-none">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setStatusFilter('') }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ripple-container ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-primary-faint text-neutral-500 hover:text-neutral-900 hover:border-primary-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content listing */}
      <div className="min-h-72">
        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-xs font-semibold">加载中...</div>
        ) : (
          <>
            {/* My Products Section */}
            {tab === 'products' && (
              <>
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 select-none">
                  <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 font-bold uppercase tracking-widest mr-2 shrink-0">
                    <Filter className="h-3 w-3" />
                     状态过滤:
                  </span>
                  {['', 'pending', 'active', 'rejected', 'offline', 'sold'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border shrink-0 select-none ripple-container ${
                        statusFilter === s
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-neutral-500 border-primary-faint hover:text-neutral-900'
                      }`}
                    >
                      {s ? STATUS_MAP[s] : '全部我发布的宝贝'}
                    </button>
                  ))}
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-xl border border-primary-faint p-12 text-center">
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">暂无该状态下的宝贝 // NO LISTINGS</p>
                    <p className="text-xs text-neutral-500 mt-1">您可以随时点击导航栏"发布商品"来推出您的首个流转好物。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(p => (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        className="group bg-white border border-primary-faint p-4 rounded-xl hover:border-primary transition-all flex gap-4 select-none card-float"
                      >
                        <div className="w-16 h-16 bg-primary-subtle rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-primary-faint">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0].image} alt="" className="w-full h-full object-cover pointer-events-none" />
                          ) : (
                            <span className="text-neutral-400 text-[10px] font-mono">NO_IMG</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-xs text-neutral-900 group-hover:text-neutral-800 group-hover:underline transition-all truncate leading-relaxed">
                              {p.title}
                            </h3>
                            <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">{p.category_name}</p>
                          </div>
                          <div className="flex gap-2 items-center text-[10px] text-neutral-500 font-semibold">
                            <span>预约数: <strong className="text-neutral-900">{p.appointment_count}</strong></span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col justify-between items-end">
                          <p className="text-neutral-900 font-black text-xs">¥{p.price}</p>
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase border rounded-md ${STATUS_COLOR[p.status] || 'bg-gray-100'}`}>
                            {STATUS_MAP[p.status] || p.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Buyer Appointments Section */}
            {tab === 'appointments-buyer' && (
              buyerAppts.length === 0 ? (
                <div className="bg-white rounded-xl border border-primary-faint p-12 text-center select-none">
                  <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">暂无预约记录 // NO RESERVATIONS</p>
                  <p className="text-xs text-neutral-500 mt-1">当您遇到喜欢的商品并点击"立即发起预约"后，对方会收到通知并在线下发起面交。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {buyerAppts.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-white border border-primary-faint p-4 rounded-xl select-none card-float">
                      <div className="min-w-0 flex-1 pr-4">
                        <Link to={`/products/${a.product_id}`} className="font-extrabold text-xs text-neutral-900 hover:text-neutral-800 hover:underline inline-flex items-center gap-1 group">
                          <span>{a.product_title}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <p className="text-[10px] text-neutral-500 font-semibold mt-1">
                          意向价格: <span className="font-bold text-neutral-900">¥{a.product_price}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase border rounded-md ${APPT_STATUS_COLOR[a.status] || 'bg-gray-100'}`}>
                          {APPT_STATUS_MAP[a.status] || a.status}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 font-medium">
                          {new Date(a.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Seller Appointments Section */}
            {tab === 'appointments-seller' && (
              sellerAppts.length === 0 ? (
                <div className="bg-white rounded-xl border border-primary-faint p-12 text-center select-none">
                  <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">暂无收到任何预约 // NO APPLICANTS</p>
                  <p className="text-xs text-neutral-500 mt-1">其他在校师生在商品详情页快捷发起预约后，您的闲置宝贝就会在这里获得面交代办清单。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerAppts.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-white border border-primary-faint p-4 rounded-xl select-none card-float">
                      <div className="min-w-0 flex-1 pr-4">
                        <Link to={`/products/${a.product_id}`} className="font-extrabold text-xs text-neutral-900 hover:text-neutral-800 hover:underline inline-flex items-center gap-1 group">
                          <span>{a.product_title}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <p className="text-[10px] text-neutral-500 font-semibold mt-1">
                          预约校友: <span className="font-bold text-neutral-900">@{a.buyer_username}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase border rounded-md ${APPT_STATUS_COLOR[a.status] || 'bg-gray-100'}`}>
                          {APPT_STATUS_MAP[a.status] || a.status}
                        </span>
                        {a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApptAction(a.id, 'confirm')}
                              className="bg-primary hover:bg-primary-light text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => handleApptAction(a.id, 'reject')}
                              className="bg-white border border-primary-faint hover:border-red-500 hover:text-red-500 text-neutral-500 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Favorites Section */}
            {tab === 'favorites' && (
              favorites.length === 0 ? (
                <div className="bg-white rounded-xl border border-primary-faint p-12 text-center select-none">
                  <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">暂无收藏好物 // EMPTY FAVORITE LIST</p>
                  <p className="text-xs text-neutral-500 mt-1">浏览商品详情页时，随时点击"☆ 收藏宝贝"可以将它收藏至此，方便随时追踪流转状态。</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {favorites.map(f => (
                    <Link
                      key={f.id}
                      to={`/products/${f.product_id}`}
                      className="group bg-white rounded-xl border border-primary-faint hover:border-primary transition-all overflow-hidden flex flex-col select-none card-float"
                    >
                      <div className="aspect-square bg-primary-subtle flex items-center justify-center overflow-hidden relative">
                        {f.product_image ? (
                          <img src={f.product_image} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 pointer-events-none" />
                        ) : (
                          <span className="text-neutral-400 text-xs font-mono">NO_IMG</span>
                        )}
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <h3 className="text-xs font-bold text-neutral-900 line-clamp-1 group-hover:text-neutral-800 group-hover:underline transition-colors leading-relaxed">
                          {f.product_title}
                        </h3>
                        <div className="flex justify-between items-end mt-3 pt-2 border-t border-primary-subtle">
                          <span className="text-neutral-900 font-extrabold text-xs">¥{f.product_price}</span>
                          <span className="text-[9px] text-accent font-bold uppercase tracking-wider">详情 &rarr;</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
