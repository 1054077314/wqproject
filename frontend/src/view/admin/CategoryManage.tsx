import { useState, useEffect } from 'react'
import request from '../../utils/request'
import type { Category, ApiRes } from '../../types'

export default function CategoryManage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res: ApiRes<Category[]> = await request.get('/categories/')
      setCategories(res.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCategories() }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setError('')
    try {
      await request.post('/admin/categories/', { name: newName.trim() })
      setNewName('')
      loadCategories()
    } catch (e: any) {
      setError(e?.message || '创建失败')
    }
  }

  async function handleUpdate() {
    if (!editId || !editName.trim()) return
    setError('')
    try {
      await request.put(`/admin/categories/${editId}/`, { name: editName.trim() })
      setEditId(null)
      setEditName('')
      loadCategories()
    } catch (e: any) {
      setError(e?.message || '更新失败')
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`确定删除分类"${name}"？`)) return
    try {
      await request.delete(`/admin/categories/${id}/`)
      loadCategories()
    } catch (e: any) {
      alert(e?.message || '删除失败')
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-500">加载中...</div>

  return (
    <div>
      {/* Create */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-medium mb-3">添加分类</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="分类名称"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            添加
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">名称</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{c.id}</td>
                <td className="px-4 py-3">
                  {editId === c.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null) }}
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {editId === c.id ? (
                    <>
                      <button onClick={handleUpdate} className="text-xs text-green-600 hover:underline">保存</button>
                      <button onClick={() => setEditId(null)} className="text-xs text-gray-500 hover:underline">取消</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditId(c.id); setEditName(c.name) }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="text-center py-10 text-gray-400">暂无分类</p>}
      </div>
    </div>
  )
}
