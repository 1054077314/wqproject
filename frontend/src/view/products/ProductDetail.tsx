import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import request from '../../utils/request'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../context/AuthContext'
import type { ProductDetail as ProductDetailType, CommentItem, ApiRes } from '../../types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
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
      alert('预约成功')
    } catch (e: any) {
      alert(e?.message || '预约失败')
    } finally {
      setApptLoading(false)
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      const res: ApiRes<CommentItem> = await request.post('/comments/', { product_id: Number(id), content: commentText })
      setProduct(prev => prev ? { ...prev, comments: [...prev.comments, res.data] } : prev)
      setCommentText('')
    } catch (e: any) {
      alert(e?.message || '留言失败')
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-20 text-gray-500">加载中...</div></Layout>
  }

  if (!product) return null

  const images = product.images || []

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {images.length > 0 ? (
                <img src={images[currentImg].image} alt={product.title} className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400">暂无图片</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImg(i)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 ${i === currentImg ? 'border-blue-500' : 'border-gray-200'}`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
            <div className="text-red-500 text-3xl font-bold mb-4">¥{product.price}</div>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>分类：{product.category_name}</p>
              <p>卖家：{product.seller_username}</p>
              <p>预约数：{product.appointment_count}</p>
              {user && <p>联系方式：{product.contact_info}</p>}
              {!user && <p className="text-orange-500">登录后可查看联系方式</p>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAppointment}
                disabled={apptLoading || !user || product.seller_username === user?.username}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {apptLoading ? '预约中...' : '预约交易'}
              </button>
              <button
                onClick={handleFavorite}
                disabled={favLoading || !user || product.seller_username === user?.username}
                className={`px-4 py-2 rounded border ${product.is_favorited ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {product.is_favorited ? '已收藏' : '收藏'}
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-bold mb-3">商品描述</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
        </div>

        {/* Comments */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-bold mb-4">留言 ({product.comments.length})</h2>

          {user && (
            <form onSubmit={handleComment} className="mb-6 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                maxLength={500}
                placeholder="说点什么..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                发送
              </button>
            </form>
          )}

          {product.comments.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无留言</p>
          ) : (
            <div className="space-y-4">
              {product.comments.map(c => (
                <div key={c.id} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-blue-600">{c.username}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
