import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  apiCreateExpense,
  apiDeleteExpense,
  apiListCategories,
  apiListExpenses,
  apiUpdateExpense,
} from '../lib/api'
import type { Category, Expense } from '../lib/api'
import { formatZAR } from '../lib/formatMoney'

type FormState = { amount: string; date: string; categoryId: number | null; note: string }

export default function ExpensesPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Expense[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(() => ({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    categoryId: null,
    note: '',
  }))

  const load = async () => {
    if (!token) return
    setError(null)
    try {
      const [e, c] = await Promise.all([apiListExpenses(token), apiListCategories(token)])
      setItems(e)
      setCats(c)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    const amt = Number(String(form.amount).replace(',', '.'))
    if (!Number.isFinite(amt) || amt < 0.01) {
      setError('Enter a valid amount (at least R 0,01).')
      return
    }
    const payload = {
      amount: amt,
      date: form.date,
      categoryId: form.categoryId,
      note: form.note ? form.note : null,
    }
    try {
      if (editingId) await apiUpdateExpense(token, editingId, payload)
      else await apiCreateExpense(token, payload)
      setEditingId(null)
      setForm({ amount: '', date: new Date().toISOString().slice(0, 10), categoryId: null, note: '' })
      await load()
    } catch (err: any) {
      setError(err?.message ?? 'Save failed')
    }
  }

  const onEdit = (x: Expense) => {
    setEditingId(x.id)
    setForm({
      amount: String(x.amount),
      date: x.date,
      categoryId: x.categoryId,
      note: x.note ?? '',
    })
  }

  const onDelete = async (id: number) => {
    if (!token) return
    setError(null)
    try {
      await apiDeleteExpense(token, id)
      await load()
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed')
    }
  }

  const total = useMemo(() => items.reduce((sum, x) => sum + Number(x.amount), 0), [items])

  return (
    <div className="row">
      <div className="card" style={{ flex: '1 1 360px' }}>
        <h2>{editingId ? 'Edit expense' : 'New expense'}</h2>
        <form className="row" onSubmit={onSubmit}>
          <div className="field">
            <div className="label">Amount (ZAR)</div>
            <input
              className="input"
              inputMode="decimal"
              placeholder="e.g. 150,50"
              value={form.amount}
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
            />
          </div>
          <div className="field">
            <div className="label">Date</div>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
            />
          </div>
          <div className="field" style={{ minWidth: 260 }}>
            <div className="label">Category</div>
            <select
              className="input"
              value={form.categoryId ?? ''}
              onChange={(e) =>
                setForm((s) => ({ ...s, categoryId: e.target.value ? Number(e.target.value) : null }))
              }
            >
              <option value="">Uncategorized</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: '100%' }}>
            <div className="label">Note</div>
            <input
              className="input"
              value={form.note}
              onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
            />
          </div>
          <div className="row">
            <button className="btn primary" type="submit">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm({ amount: '', date: new Date().toISOString().slice(0, 10), categoryId: null, note: '' })
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
      <div className="card" style={{ flex: '1 1 680px' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Expenses</h2>
          <div className="muted">Total: {formatZAR(total)}</div>
        </div>
        <div className="table-wrap table-wrap--wide">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x.id}>
                  <td>{x.date}</td>
                  <td>{x.categoryName ?? 'Uncategorized'}</td>
                  <td>{x.note ?? ''}</td>
                  <td>{formatZAR(x.amount)}</td>
                  <td className="table-actions">
                    <button className="btn" type="button" onClick={() => onEdit(x)}>
                      Edit
                    </button>{' '}
                    <button className="btn danger" type="button" onClick={() => onDelete(x.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="muted" colSpan={5}>
                    No expenses yet.
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

