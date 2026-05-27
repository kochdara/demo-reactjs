import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Users', path: '/users' },
  { label: 'Customers', path: '/customers' },
  { label: 'Products', path: '/products' },
  { label: 'Orders', path: '/orders' },
]

export function DashboardLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">DR</span>
          <div>
            <strong>Demo React</strong>
            <span>Nest API Admin</span>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end={item.path === '/'}
              key={item.path}
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
