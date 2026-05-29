import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import request from '../../utils/request'
import Layout from '../../components/layout/Layout'
import type { ProductListItem, Category, PaginatedRes } from '../../types'

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const page = Number(searchParams.get('page')) || 1
  const categoryId = searchParams.get('category_id') || ''
  const pageSize = 20

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), page_size: String(pageSize) }
      if (categoryId) params.category_id = categoryId
      const res: PaginatedRes<ProductListItem> = await request.get('/products/', { params })
      const nextProducts = Array.isArray(res.results) ? res.results : []
      setProducts(nextProducts)
      setTotal(typeof res.count === 'number' ? res.count : nextProducts.length)
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, categoryId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    request.get('/categories/').then((res: any) => {
      const nextCategories = Array.isArray(res) ? res : res.data
      setCategories(Array.isArray(nextCategories) ? nextCategories : [])
    }).catch(() => {})
  }, [])

  const totalPages = Math.ceil(total / pageSize)

  function handleCategoryChange(id: string) {
    const params: Record<string, string> = {}
    if (id) params.category_id = id
    params.page = '1'
    setSearchParams(params)
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">商品列表</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-3 py-1 rounded text-sm ${!categoryId ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            全部
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(String(c.id))}
              className={`px-3 py-1 rounded text-sm ${categoryId === String(c.id) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">加载中...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">暂无商品</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.first_image ? (
                    <img src={p.first_image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">暂无图片</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate">{p.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-red-500 font-bold">¥{p.price}</span>
                    <span className="text-xs text-gray-400">{p.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => {
                    const params: Record<string, string> = { page: String(p) }
                    if (categoryId) params.category_id = categoryId
                    setSearchParams(params)
                  }}
                  className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
