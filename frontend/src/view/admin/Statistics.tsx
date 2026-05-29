import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import request from '../../utils/request'
import type { Statistics as StatsType } from '../../types'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  active: '已上架',
  rejected: '已驳回',
  offline: '已下架',
  sold: '已售出',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  active: '#22c55e',
  rejected: '#ef4444',
  offline: '#9ca3af',
  sold: '#3b82f6',
}

export default function Statistics() {
  const [stats, setStats] = useState<StatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    request.get('/admin/statistics/').then((res: any) => {
      setStats(res.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10 text-gray-500">加载中...</div>
  if (!stats) return <div className="text-center py-10 text-red-500">加载失败</div>

  const statusEntries = Object.entries(stats.products_by_status)

  const pieData = {
    labels: statusEntries.map(([k]) => STATUS_LABELS[k] || k),
    datasets: [{
      data: statusEntries.map(([, v]) => v),
      backgroundColor: statusEntries.map(([k]) => STATUS_COLORS[k] || '#6b7280'),
    }],
  }

  const barData = {
    labels: statusEntries.map(([k]) => STATUS_LABELS[k] || k),
    datasets: [{
      label: '商品数量',
      data: statusEntries.map(([, v]) => v),
      backgroundColor: statusEntries.map(([k]) => STATUS_COLORS[k] || '#6b7280'),
    }],
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total_users}</p>
          <p className="text-sm text-gray-500">用户总数</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.total_products}</p>
          <p className="text-sm text-gray-500">商品总数</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.today_new_products}</p>
          <p className="text-sm text-gray-500">今日新增</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.pending_products}</p>
          <p className="text-sm text-gray-500">待审核</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">商品状态分布</h3>
          {statusEntries.length > 0 ? (
            <div className="max-w-xs mx-auto">
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">暂无数据</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">商品状态统计</h3>
          {statusEntries.length > 0 ? (
            <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  )
}
