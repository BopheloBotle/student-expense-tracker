import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiCreateCategory, apiDeleteCategory, apiListCategories, apiUpdateCategoryBucket, type BudgetBucket } from '../lib/api'
import type { Category } from '../lib/api'

export default function CategoriesPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    setError(null)
    try {
      setItems(await apiListCategories(token))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load categories')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    try {
      await apiCreateCategory(token, name)
      setName('')
      await load()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create category')
    }
  }

  const onDelete = async (id: number) => {
    if (!token) return
    setError(null)
    try {
      await apiDeleteCategory(token, id)
      await load()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete category')
    }
  }

  const onBucketChange = async (id: number, bucket: BudgetBucket) => {
    if (!token) return
    setError(null)
    try {
      const updated = await apiUpdateCategoryBucket(token, id, bucket)
      setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update category mapping')
    }
  }

  return (
    <div className="row">
      <div className="card" style={{ flex: '1 1 360px' }}>
        <h2>New category</h2>
        <form className="row" onSubmit={onCreate}>
          <div className="field" style={{ flex: '1 1 240px' }}>
            <div className="label">Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="btn primary" type="submit">
            Add
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
      <div className="card" style={{ flex: '1 1 520px' }}>
        <h2>Categories</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Bucket</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td style={{ minWidth: 220 }}>
                    <select
                      className="input"
                      value={c.bucket}
                      onChange={(e) => onBucketChange(c.id, e.target.value as BudgetBucket)}
                    >
                      <option value="NEEDS">Needs</option>
                      <option value="WANTS">Wants</option>
                      <option value="SAVINGS_INVESTING">Savings/Investing</option>
                      <option value="DEBT_GIVING">Debt/Giving</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </td>
                  <td className="table-actions">
                    <button className="btn danger" type="button" onClick={() => onDelete(c.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="muted" colSpan={3}>
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

