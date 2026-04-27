import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function NavLink({ to, label }: { to: string; label: string }) {
  const loc = useLocation()
  const active = loc.pathname === to
  return (
    <Link className={active ? 'navlink active' : 'navlink'} to={to}>
      {label}
    </Link>
  )
}

export default function Layout() {
  const { me, logout } = useAuth()
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">Expense Tracker</div>
        <nav className="nav">
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/expenses" label="Expenses" />
          <NavLink to="/categories" label="Categories" />
        </nav>
        <div className="right">
          <span className="muted user-email" title={me ? `${me.email} (${me.role})` : undefined}>
            {me ? `${me.email} (${me.role})` : ''}
          </span>
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

