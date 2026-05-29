import { useState, useEffect } from 'react'
import request from '../../utils/request'
import type { AdminUser, PaginatedRes } from '../../types'

export default function UserManage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res: PaginatedRes<AdminUser> = await request.get('/admin/users/')
      setUsers(res.results)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  async function toggleUser(id: number, currentActive: boolean) {
    if (!confirm(`确定要${currentActive ? '禁用' : '启用'}该用户？`)) return
    try {
      await request.put(`/admin/users/${id}/`, { is_active: !currentActive })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentActive } : u))
    } catch (e: any) {
      alert(e?.message || '操作失败')
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-500">加载中...</div>

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">用户名</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">注册时间</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{u.id}</td>
              <td className="px-4 py-3">{u.username}</td>
              <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? '正常' : '已禁用'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleUser(u.id, u.is_active)}
                  className={`text-xs px-3 py-1 rounded ${u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {u.is_active ? '禁用' : '启用'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="text-center py-10 text-gray-400">暂无用户</p>}
    </div>
  )
}
