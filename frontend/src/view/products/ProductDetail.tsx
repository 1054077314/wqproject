import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import request from '../../utils/request'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { ProductDetail as ProductDetailType, CommentItem, ApiRes } from '../../types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [apptLoading, setApptLoading] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)

  const loadProduct = async () => {
    try {
      const res: ApiRes<ProductDetailType> = await request.get(`/products/${id}/`)
      setProduct(res.data)
    } catch {
      navigate('/products', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  async function handleFavorite() {
    if (!user) { navigate('/login'); return }
    setFavLoading(true)
    try {
      await request.post('/favorites/', { product_id: Number(id) })
      setProduct(prev => prev ? { ...prev, is_favorited: !prev.is_favorited } : prev)
      toast(product?.is_favorited ? '已取消收藏' : '已成功加入收藏夹', 'info')
    } catch {
      // ignore
    } finally {
      setFavLoading(false)
    }
  }

  async function handleAppointment() {
    if (!user) { navigate('/login'); return }
    setApptLoading(true)
    try {
      await request.post('/appointments/', { product_id: Number(id) })
      setProduct(prev => prev ? { ...prev, appointment_count: prev.appointment_count + 1 } : prev)
      toast('预约成功！可以到个人中心查看', 'success')
    } catch (e: any) {
      toast(e?.message || '预约失败', 'error')
    } finally {
      setApptLoading(false)
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      const res: ApiRes<CommentItem> = await request.post('/comments/', {
        product_id: Number(id),
        content: commentText
      })
      setProduct(prev => prev ? { ...prev, comments: [...prev.comments, res.data] } : prev)
      setCommentText('')
      toast('您的留言提问已成功发送！', 'success')
    } catch (e: any) {
      toast(e?.message || '留言失败', 'error')
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-neutral-500 text-xs font-semibold">加载中...</div>
      </Layout>
    )
  }

  if (!product) return null

  const images = product.images || []

  return (
    <Layout>
      <div className="bg-white rounded-xl border border-primary-faint p-6 md:p-8 card-float">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* Images Gallery */}
          <div>
            <div className="aspect-square bg-primary-subtle border border-primary-faint rounded-xl overflow-hidden flex items-center justify-center relative">
              {images.length > 0 ? (
                <img
                  src={images[currentImg].image}
                  alt={product.title}
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <span className="text-neutral-400 text-xs font-mono">NO_IMAGE</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImg(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border transition-all flex-shrink-0 cursor-pointer ${
                      i === currentImg ? 'border-primary' : 'border-primary-faint hover:border-primary-muted'
                    }`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover pointer-events-none" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold bg-accent text-neutral-800 px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                  {product.category_name}
                </span>
                <span className="text-[10px] font-bold bg-primary-subtle text-neutral-500 px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                  ID: #{product.id}
                </span>
              </div>

              <h1 className="text-xl font-black text-neutral-900 mb-2 tracking-tight leading-snug">{product.title}</h1>
              <div className="text-neutral-900 text-2xl font-black tracking-tight mb-6">¥{product.price}</div>

              <div className="space-y-3.5 border-t border-b border-primary-faint py-5 text-xs text-neutral-500 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">发布商家 // SELLER</span>
                  <span className="text-neutral-900 font-bold">@{product.seller_username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">预约人数 // APPOINTMENTS</span>
                  <span className="text-neutral-900 font-bold">{product.appointment_count} 人预约</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">上架时间 // RELEASED AT</span>
                  <span className="text-neutral-900 font-bold">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider">联系信息 // CONTACT</span>
                  {user ? (
                    <span className="text-neutral-900 font-black tracking-wider bg-primary-subtle px-2.5 py-1 rounded-md text-xs">{product.contact_info}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-neutral-500 bg-primary-subtle px-2.5 py-1 rounded-sm uppercase tracking-wider">登录后可查看</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {!(product.seller_username === user?.username || user?.is_staff) && (
                <button
                  onClick={handleAppointment}
                  disabled={apptLoading || product.is_appointed}
                  className="flex-1 bg-primary hover:bg-primary-light text-white font-bold text-xs py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs ripple-container"
                >
                  {apptLoading ? '请稍候...' : product.is_appointed ? '已预约 · 等待卖家确认' : '立即发起预约面交'}
                </button>
              )}
              {product.seller_username !== user?.username && (
                <button
                  onClick={handleFavorite}
                  disabled={favLoading}
                  className={`px-4 py-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ripple-container ${
                    product.is_favorited
                      ? 'bg-accent border-accent-dark text-neutral-800'
                      : 'bg-white border-primary-faint text-neutral-500 hover:text-neutral-900 hover:border-primary-muted'
                  }`}
                >
                  <span>{product.is_favorited ? '★ 已加入收藏' : '☆ 收藏宝贝'}</span>
                </button>
              )}
              {product.seller_username === user?.username && (
                <Link
                  to="/profile"
                  className="flex-1 bg-primary-subtle text-neutral-700 font-bold text-xs py-3 rounded-xl text-center transition-all cursor-pointer hover:bg-primary-faint"
                >
                  查看收到的预约
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-10 border-t border-primary-faint pt-8">
          <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">商品详细描述 // DETAILS</h4>
          <p className="text-neutral-500 text-xs leading-relaxed font-medium whitespace-pre-wrap">{product.description}</p>
        </div>

        {/* Comments Section */}
        <div className="mt-10 border-t border-primary-faint pt-8">
          <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-5">留言咨询与答疑 // QUESTIONS ({product.comments.length})</h4>

          {user ? (
            <form onSubmit={handleComment} className="mb-6 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                maxLength={500}
                placeholder="直接向发布商家进行提问咨询..."
                className="flex-1 px-3 py-2 border border-primary-faint rounded-xl focus:outline-hidden focus:border-primary text-xs text-neutral-800 font-semibold"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="bg-primary hover:bg-primary-light text-white px-5 py-2 rounded-xl font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shrink-0 ripple-container"
              >
                发送提问
              </button>
            </form>
          ) : (
            <div className="bg-primary-subtle border border-dashed border-primary-faint text-center py-5 rounded-xl text-xs text-neutral-500 mb-6 font-semibold">
              请先 <Link to="/login" className="text-neutral-900 font-bold underline">登录</Link> 后才能发表提问咨询
            </div>
          )}

          {product.comments.length === 0 ? (
            <p className="text-neutral-500 text-[11px] text-center py-6 font-medium">该宝贝暂无买家留言讨论。</p>
          ) : (
            <div className="divide-y divide-primary-subtle">
              {product.comments.map(c => (
                <div key={c.id} className="py-4">
                  <div className="flex justify-between items-center mb-1 select-none">
                    <span className="font-extrabold text-[11px] text-neutral-900">@{c.username}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-neutral-500 text-xs font-semibold leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
