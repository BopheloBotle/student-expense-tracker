import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../auth/AuthContext'
import { apiDashboardSummaryWithRange, apiListCategories } from '../lib/api'
import type { BudgetBucket, Category, DashboardSummary } from '../lib/api'
import { formatZAR } from '../lib/formatMoney'

type PieDatum = { name: string; value: number }

type SpendBuckets = {
  needs: number
  wants: number
  savingsInvesting: number
  debtGiving: number
  other: number
}

type MonthReport = {
  startDate: string
  endDate: string
  label: string
  totalSpent: number
  byCategory: Array<{ category: string; total: number }>
}

type BudgetPresetId = '50-30-20' | '70-20-10' | '60-20-20'

type PlanAmounts = {
  needs?: number
  wants?: number
  needsWants?: number
  savingsInvesting?: number
  debtGiving?: number
}

const PASTEL_COLORS = [
  '#A7C7E7', // light blue
  '#F6C3A0', // peach
  '#BDE7C7', // mint
  '#E7C7F5', // lavender
  '#FFD6A5', // light orange
  '#FFB3BA', // light red/pink
  '#B5EAD7', // aqua
  '#C7D3F5', // periwinkle
  '#FDE2E4', // rose
  '#D7F3F8', // icy
]

function parseZarInput(input: string): number | null {
  const s = input.replace(',', '.').trim()
  if (!s) return null
  const n = Number(s)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeSpendBuckets(byCategory: MonthReport['byCategory'], bucketByName: Map<string, BudgetBucket>): SpendBuckets {
  const buckets: SpendBuckets = { needs: 0, wants: 0, savingsInvesting: 0, debtGiving: 0, other: 0 }
  for (const row of byCategory) {
    const name = row.category ?? ''
    const amount = Number(row.total) || 0
    const bucket = bucketByName.get(name.toLowerCase()) ?? 'OTHER'

    if (bucket === 'NEEDS') buckets.needs += amount
    else if (bucket === 'WANTS') buckets.wants += amount
    else if (bucket === 'SAVINGS_INVESTING') buckets.savingsInvesting += amount
    else if (bucket === 'DEBT_GIVING') buckets.debtGiving += amount
    else buckets.other += amount
  }
  return buckets
}

function getPlanAmounts(salary: number, presetId: BudgetPresetId): PlanAmounts {
  switch (presetId) {
    case '50-30-20':
      return {
        needs: salary * 0.5,
        wants: salary * 0.3,
        savingsInvesting: salary * 0.2,
      }
    case '70-20-10':
      return {
        needsWants: salary * 0.7,
        savingsInvesting: salary * 0.2,
        debtGiving: salary * 0.1,
      }
    case '60-20-20':
      return {
        needs: salary * 0.6,
        wants: salary * 0.2,
        savingsInvesting: salary * 0.2,
      }
  }
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<MonthReport[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const [salaryInput, setSalaryInput] = useState('')
  const salary = useMemo(() => parseZarInput(salaryInput), [salaryInput])
  const [presetId, setPresetId] = useState<BudgetPresetId>('50-30-20')
  const plan = useMemo(() => (salary ? getPlanAmounts(salary, presetId) : null), [salary, presetId])
  const bucketByName = useMemo(() => {
    const m = new Map<string, BudgetBucket>()
    for (const c of categories) m.set(c.name.toLowerCase(), c.bucket)
    return m
  }, [categories])

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setError(null)
      try {
        setLoading(true)

        const now = new Date()
        const monthIndex = now.getMonth()
        const year = now.getFullYear()

        const monthDefs = [2, 1, 0].map((back) => {
          const monthStart = new Date(year, monthIndex - back, 1)
          const monthEnd = back === 0 ? now : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
          const startDate = formatLocalDate(monthStart)
          const endDate = formatLocalDate(monthEnd)
          const label = monthStart.toLocaleString(undefined, { month: 'short', year: 'numeric' })
          return { startDate, endDate, label }
        })

        const [summaries, cats] = await Promise.all([
          Promise.all(monthDefs.map((d) => apiDashboardSummaryWithRange(token, { start: d.startDate, end: d.endDate }))),
          apiListCategories(token),
        ])

        // Current month is the last element because we build [2, 1, 0]
        setData(summaries[2])
        setCategories(cats)
        setReport(
          monthDefs.map((d, idx) => ({
            startDate: d.startDate,
            endDate: d.endDate,
            label: d.label,
            totalSpent: Number(summaries[idx].totalSpent),
            byCategory: summaries[idx].byCategory.map((x) => ({ category: x.category, total: Number(x.total) })),
          })),
        )
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const pieData = useMemo<PieDatum[]>(() => {
    if (!data) return []
    return data.byCategory.map((x) => ({ name: x.category, value: Number(x.total) }))
  }, [data])

  return (
    <div className="row">
      <div className="card" style={{ flex: '1 1 340px' }}>
        <h2>Summary</h2>
        {error && <div className="error">{error}</div>}
        {!data && !error && <div className="muted">{loading ? 'Loading…' : ' '}</div>}
        {data && (
          <>
            <div className="row">
              <div className="card" style={{ flex: '1 1 220px' }}>
                <div className="label">Date range</div>
                <div style={{ fontWeight: 600 }}>
                  {data.startDate} → {data.endDate}
                </div>
              </div>
              <div className="card" style={{ flex: '1 1 220px' }}>
                <div className="label">Total spent</div>
                <div style={{ fontWeight: 700, fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>
                  {formatZAR(data.totalSpent)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: '0 0 10px' }}>Budget Planner</h3>

              <div className="row" style={{ marginBottom: 10 }}>
                <div className="field" style={{ flex: '1 1 220px' }}>
                  <div className="label">Your salary (monthly)</div>
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="e.g. 10000"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="label">Choose a preset</div>
                <div className="row" style={{ marginTop: 6 }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="budgetPreset"
                      checked={presetId === '50-30-20'}
                      onChange={() => setPresetId('50-30-20')}
                    />
                    50% needs, 30% wants, 20% savings
                  </label>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="budgetPreset"
                      checked={presetId === '70-20-10'}
                      onChange={() => setPresetId('70-20-10')}
                    />
                    70% needs+wants, 20% savings/investing, 10% debt/giving
                  </label>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="budgetPreset"
                      checked={presetId === '60-20-20'}
                      onChange={() => setPresetId('60-20-20')}
                    />
                    60% needs, 20% savings, 20% wants
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                {plan ? (
                  <div>
                    <div className="label">Your plan (per month)</div>
                    <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                      {plan.needs != null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted">Needs</span>
                          <span style={{ fontWeight: 700 }}>{formatZAR(plan.needs)}</span>
                        </div>
                      )}
                      {plan.needsWants != null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted">Needs + Wants</span>
                          <span style={{ fontWeight: 700 }}>{formatZAR(plan.needsWants)}</span>
                        </div>
                      )}
                      {plan.wants != null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted">Wants</span>
                          <span style={{ fontWeight: 700 }}>{formatZAR(plan.wants)}</span>
                        </div>
                      )}
                      {plan.savingsInvesting != null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted">Savings / Investing</span>
                          <span style={{ fontWeight: 700 }}>{formatZAR(plan.savingsInvesting)}</span>
                        </div>
                      )}
                      {plan.debtGiving != null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted">Debt / Giving</span>
                          <span style={{ fontWeight: 700 }}>{formatZAR(plan.debtGiving)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="muted">Enter your salary to see your plan.</div>
                )}

                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  Tip: map your categories on the `Categories` page to control the Needs/Wants/Savings/Debt breakdown.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="card" style={{ flex: '1 1 520px', minHeight: 360 }}>
        <h2>By category</h2>
        {data && pieData.length === 0 && <div className="muted">No expenses in range.</div>}
        {data && pieData.length > 0 && (
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="75%">
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${entry.name}-${idx}`} fill={PASTEL_COLORS[idx % PASTEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatZAR(Number(value ?? 0))}
                  labelFormatter={(name) => String(name)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/** 3-month report */}
      <div className="card" style={{ flex: '1 1 100%', marginTop: 12 }}>
        <h2>3-Month Report</h2>
        {!report && !error && <div className="muted">{loading ? 'Loading…' : ' '}</div>}
        {report && (
          <div className="row" style={{ alignItems: 'stretch' }}>
            {report.map((m) => {
              const buckets = computeSpendBuckets(m.byCategory, bucketByName)
              const needsWantsActual = buckets.needs + buckets.wants
              const top = m.byCategory.slice(0, 3)

              const planLines: Array<{ label: string; actual: number; planned?: number }> = []
              if (plan) {
                if (plan.needsWants != null) planLines.push({ label: 'Needs + Wants', actual: needsWantsActual, planned: plan.needsWants })
                if (plan.needs != null) planLines.push({ label: 'Needs', actual: buckets.needs, planned: plan.needs })
                if (plan.wants != null) planLines.push({ label: 'Wants', actual: buckets.wants, planned: plan.wants })
                if (plan.savingsInvesting != null) planLines.push({ label: 'Savings / Investing', actual: buckets.savingsInvesting, planned: plan.savingsInvesting })
                if (plan.debtGiving != null) planLines.push({ label: 'Debt / Giving', actual: buckets.debtGiving, planned: plan.debtGiving })

                // Show remaining buckets that aren't part of the preset as "actual only"
                if (plan.debtGiving == null && buckets.debtGiving > 0) planLines.push({ label: 'Debt / Giving', actual: buckets.debtGiving })
                if (buckets.other > 0) planLines.push({ label: 'Other', actual: buckets.other })
              } else {
                planLines.push({ label: 'Needs', actual: buckets.needs })
                planLines.push({ label: 'Wants', actual: buckets.wants })
                planLines.push({ label: 'Savings / Investing', actual: buckets.savingsInvesting })
                planLines.push({ label: 'Debt / Giving', actual: buckets.debtGiving })
                if (buckets.other > 0) planLines.push({ label: 'Other', actual: buckets.other })
              }

              return (
                <div
                  key={m.startDate}
                  className="card"
                  style={{
                    flex: '1 1 260px',
                    padding: 14,
                    boxShadow: 'none',
                    background: 'rgba(255,255,255,0.55)',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{m.label}</div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    Total spent: {formatZAR(m.totalSpent)}
                  </div>

                  <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                    {planLines.map((line) => {
                      const pct =
                        line.planned != null && line.planned > 0 ? Math.round((line.actual / line.planned) * 100) : null
                      return (
                        <div key={line.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted">{line.label}</span>
                          <span style={{ fontWeight: 700 }}>
                            {formatZAR(line.actual)}
                            {line.planned != null && (
                              <span style={{ fontWeight: 500, color: '#a78b91' }}>
                                {' '}
                                / {formatZAR(line.planned)}
                                {pct != null ? ` (${pct}%)` : ''}
                              </span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className="label" style={{ marginBottom: 6 }}>
                      Top categories
                    </div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {top.length === 0 && <div className="muted">No expenses.</div>}
                      {top.map((x) => (
                        <div key={x.category} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span className="muted" style={{ fontSize: 12 }}>
                            {x.category}
                          </span>
                          <span style={{ fontWeight: 600 }}>{formatZAR(x.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

