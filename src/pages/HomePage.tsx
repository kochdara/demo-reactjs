import { api } from '../api/client'
import { useResource } from '../api/useResource'
import { ResourceState } from '../components/ResourceState'
import { formatCurrency } from '../utils/format'

async function loadDashboardData() {
  const [users, customers, products, orders] = await Promise.all([
    api.getUsers(),
    api.getCustomers(),
    api.getProducts(),
    api.getOrders(),
  ])

  return { users, customers, products, orders }
}

export function HomePage() {
  const { data, error, isLoading } = useResource(loadDashboardData)

  const totalRevenue =
    data?.orders.reduce((total, order) => total + Number(order.totalAmount), 0) ?? 0
  const pendingOrders =
    data?.orders.filter((order) => order.status.toLowerCase() === 'pending').length ?? 0

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Store dashboard</h1>
        </div>
        <span className="api-pill">API: localhost:3001</span>
      </div>

      <ResourceState
        emptyMessage="No dashboard data found."
        error={error}
        isEmpty={false}
        isLoading={isLoading}
      />

      {data && (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Users</span>
              <strong>{data.users.length}</strong>
            </article>
            <article className="stat-card">
              <span>Customers</span>
              <strong>{data.customers.length}</strong>
            </article>
            <article className="stat-card">
              <span>Products</span>
              <strong>{data.products.length}</strong>
            </article>
            <article className="stat-card">
              <span>Pending orders</span>
              <strong>{pendingOrders}</strong>
            </article>
          </div>

          <section className="panel">
            <div className="panel-header">
              <h2>Sales snapshot</h2>
              <span>{formatCurrency(totalRevenue)} total</span>
            </div>
            <div className="mini-list">
              {data.orders.slice(0, 3).map((order) => (
                <div className="mini-row" key={order.id}>
                  <span>{order.orderNo}</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}
