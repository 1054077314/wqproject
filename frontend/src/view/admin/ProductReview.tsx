import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import request from '../../utils/request'
import type { ProductListItem, PaginatedRes } from '../../types'

export default function ProductReview() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<ProductListItem> = await request.get('/admin/pending-products/')
      setProducts(res.results)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { loadProducts() }, [])

  async function handleApprove(id: number) {
    try {
      await request.post(`/admin/products/${id}/review/`, { action: 'approve' })
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      alert(e?.message || '操作失败')
    }
  }

  async function handleReject() {
    if (!rejectId || !rejectReason.trim()) return
    try {
      await request.post(`/admin/products/${rejectId}/review/`, { action: 'reject', reject_reason: rejectReason })
      setProducts(prev => prev.filter(p => p.id !== rejectId))
      setRejectId(null)
      setRejectReason('')
    } catch (e: any) {
      alert(e?.message || '操作失败')
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-500">加载中...</div>

  return (
    <div>
      {products.length === 0 ? (
        <p className="text-center py-10 text-gray-400">暂无待审核商品</p>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {p.first_image ? (
                  <img src={p.first_image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">无图</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${p.id}`} className="font-medium text-blue-600 hover:underline truncate block">{p.title}</Link>
                <p className="text-sm text-gray-500">{p.category_name} · ¥{p.price}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(p.id)}
                  className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600"
                >
                  通过
                </button>
                <button
                  onClick={() => { setRejectId(p.id); setRejectReason('') }}
                  className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600"
                >
                  驳回
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">驳回原因</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入驳回原因"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
