import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">校园二手商品交易平台</h1>
        <p className="text-gray-500 mb-8">浏览或发布二手商品，线下交易更放心</p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
        >
          浏览商品
        </Link>
      </div>
    </Layout>
  )
}
