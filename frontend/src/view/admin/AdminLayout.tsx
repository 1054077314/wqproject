import { useState } from 'react'
import Layout from '../../components/layout/Layout'
import Statistics from './Statistics'
import UserManage from './UserManage'
import ProductReview from './ProductReview'
import CategoryManage from './CategoryManage'

type AdminTab = 'stats' | 'users' | 'review' | 'categories'

export default function AdminLayout() {
  const [tab, setTab] = useState<AdminTab>('stats')

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'stats', label: '数据统计' },
    { key: 'users', label: '用户管理' },
    { key: 'review', label: '商品审核' },
    { key: 'categories', label: '分类管理' },
  ]

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>
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
      {tab === 'stats' && <Statistics />}
      {tab === 'users' && <UserManage />}
      {tab === 'review' && <ProductReview />}
      {tab === 'categories' && <CategoryManage />}
    </Layout>
  )
}
