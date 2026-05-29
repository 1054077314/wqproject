import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../../utils/request'
import { useAuth } from '../../context/AuthContext'
import type { ApiRes, User } from '../../types'

function getErrorMessage(error: any, fallback: string) {
  if (typeof error?.message === 'string') return error.message
  if (error?.data && typeof error.data === 'object') {
    const messages = Object.values(error.data)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter(Boolean)
      .map(String)
    if (messages.length > 0) return messages.join('; ')
  }
  return fallback
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isRegister) {
        await request.post('/register', { username, password })
        // register success, switch to login
        setIsRegister(false)
        setError('')
        setLoading(false)
        return
      }

      const res: ApiRes<{ token: string; user: User }> = await request.post('/login', { username, password })
      login(res.data.token, res.data.user)
      navigate('/', { replace: true })
    } catch (e: any) {
      setError(getErrorMessage(e, isRegister ? '注册失败' : '登录失败'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? '注册' : '登录'}
        </h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">用户名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="3-50个字符"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="至少8个字符"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '请稍候...' : isRegister ? '注册' : '登录'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button
            type="button"
            className="text-blue-600 hover:underline ml-1"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
          >
            {isRegister ? '去登录' : '去注册'}
          </button>
        </p>
      </form>
    </div>
  )
}
