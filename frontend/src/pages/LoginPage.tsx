import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { apiLogin } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const nav = useNavigate()
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await apiLogin(email, password)
      setToken(res.accessToken)
      nav('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2>Login</h2>
        <form onSubmit={onSubmit} className="row">
          <div className="field" style={{ width: '100%' }}>
            <div className="label">Email (your sign-in address)</div>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: '100%' }}>
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn primary" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <Link className="navlink" to="/register">
            Need an account? Register
          </Link>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}

