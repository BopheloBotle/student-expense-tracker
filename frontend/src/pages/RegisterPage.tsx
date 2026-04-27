import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { apiRegister } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

export default function RegisterPage() {
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
      const res = await apiRegister(email, password)
      setToken(res.accessToken)
      nav('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2>Register</h2>
        <form onSubmit={onSubmit} className="row">
          <div className="field" style={{ width: '100%' }}>
            <div className="label">Email (used to sign in)</div>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: '100%' }}>
            <div className="label">Password (min 8 chars)</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn primary" disabled={loading} type="submit">
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <Link className="navlink" to="/login">
            Already have an account? Login
          </Link>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}

