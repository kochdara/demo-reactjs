import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { useResource } from '../api/useResource'
import { ResourceState } from '../components/ResourceState'
import type { Order, OrderPayload } from '../types'
import { formatCurrency, formatDate } from '../utils/format'

type OrderItemFormData = {
  productId: string
  quantity: string
}

type OrderFormData = {
  customerId: string
  items: OrderItemFormData[]
  status: string
}

const emptyOrderForm: OrderFormData = {
  customerId: '',
  status: 'pending',
  items: [{ productId: '', quantity: '1' }],
}

export function OrdersPage() {
  const { data: orders, error, isLoading, reload } = useResource(api.getOrders)
  const { data: customers } = useResource(api.getCustomers)
  const { data: products } = useResource(api.getProducts)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<OrderFormData>(emptyOrderForm)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setEditingId(null)
    setFormData({
      customerId: customers?.[0] ? String(customers[0].id) : '',
      status: 'pending',
      items: [{ productId: products?.[0] ? String(products[0].id) : '', quantity: '1' }],
    })
    setActionError(null)
  }

  function editOrder(order: Order) {
    setEditingId(order.id)
    setFormData({
      customerId: String(order.customerId),
      status: order.status,
      items:
        order.items && order.items.length > 0
          ? order.items.map((item) => ({
              productId: String(item.productId),
              quantity: String(item.quantity),
            }))
          : [{ productId: products?.[0] ? String(products[0].id) : '', quantity: '1' }],
    })
    setActionError(null)
  }

  function updateOrderItem(index: number, item: OrderItemFormData) {
    setFormData((current) => ({
      ...current,
      items: current.items.map((currentItem, currentIndex) =>
        currentIndex === index ? item : currentItem,
      ),
    }))
  }

  function addOrderItem() {
    setFormData((current) => ({
      ...current,
      items: [
        ...current.items,
        { productId: products?.[0] ? String(products[0].id) : '', quantity: '1' },
      ],
    }))
  }

  function removeOrderItem(index: number) {
    setFormData((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setActionError(null)

    const payload: OrderPayload = {
      customerId: Number(formData.customerId || customers?.[0]?.id),
      status: formData.status,
      items: formData.items.map((item) => ({
        productId: Number(item.productId || products?.[0]?.id),
        quantity: Number(item.quantity),
      })),
    }

    try {
      if (editingId) {
        await api.updateOrder(editingId, payload)
      } else {
        await api.createOrder(payload)
      }

      resetForm()
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to save order',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteOrder(order: Order) {
    if (!window.confirm(`Delete ${order.orderNo}?`)) {
      return
    }

    setActionError(null)

    try {
      await api.deleteOrder(order.id)
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to delete order',
      )
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h1>Orders</h1>
        </div>
        <span className="count-pill">{orders?.length ?? 0} records</span>
      </div>

      <form className="panel form-panel" onSubmit={submitOrder}>
        <div className="panel-header">
          <h2>{editingId ? 'Update order' : 'Create order'}</h2>
          {editingId && (
            <button className="ghost-button" onClick={resetForm} type="button">
              Cancel
            </button>
          )}
        </div>

        <div className="form-grid">
          <label>
            <span>Customer</span>
            <select
              onChange={(event) =>
                setFormData({ ...formData, customerId: event.target.value })
              }
              required
              value={formData.customerId || customers?.[0]?.id || ''}
            >
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.user?.name ?? `Customer #${customer.id}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value })
              }
              value={formData.status}
            >
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
        </div>

        <div className="order-form-items">
          <div className="panel-header">
            <h2>Items</h2>
            <button className="ghost-button" onClick={addOrderItem} type="button">
              Add item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div className="item-form-row" key={`${index}-${item.productId}`}>
              <label>
                <span>Product</span>
                <select
                  onChange={(event) =>
                    updateOrderItem(index, { ...item, productId: event.target.value })
                  }
                  required
                  value={item.productId || products?.[0]?.id || ''}
                >
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Quantity</span>
                <input
                  min="1"
                  onChange={(event) =>
                    updateOrderItem(index, { ...item, quantity: event.target.value })
                  }
                  required
                  type="number"
                  value={item.quantity}
                />
              </label>
              <button
                className="danger-button"
                disabled={formData.items.length === 1}
                onClick={() => removeOrderItem(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {actionError && <div className="form-error">{actionError}</div>}

        <div className="form-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : editingId ? 'Update order' : 'Create order'}
          </button>
        </div>
      </form>

      <ResourceState
        emptyMessage="No orders found."
        error={error}
        isEmpty={orders?.length === 0}
        isLoading={isLoading}
      />

      {orders && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-summary">
                <div>
                  <h2>{order.orderNo}</h2>
                  <p>
                    {order.customer?.user?.name ?? `Customer #${order.customerId}`} -{' '}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="order-total">
                  <span className="status-badge">{order.status}</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              </div>

              <div className="items-list">
                {(order.items ?? []).map((item) => (
                  <div className="item-row" key={item.id}>
                    <span>{item.product?.name ?? `Product #${item.productId}`}</span>
                    <span>
                      {item.quantity} x {formatCurrency(item.price)}
                    </span>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="card-actions">
                <button onClick={() => editOrder(order)} type="button">
                  Edit
                </button>
                <button
                  className="danger-button"
                  onClick={() => void deleteOrder(order)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
