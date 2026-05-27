import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { useResource } from '../api/useResource'
import { ResourceState } from '../components/ResourceState'
import type { Product, ProductPayload } from '../types'
import { formatCurrency } from '../utils/format'

type ProductFormData = Omit<ProductPayload, 'stock'> & {
  stock: string
}

const emptyProductForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image: '',
  status: 'active',
}

export function ProductsPage() {
  const { data: products, error, isLoading, reload } = useResource(api.getProducts)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setEditingId(null)
    setFormData(emptyProductForm)
    setActionError(null)
  }

  function editProduct(product: Product) {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: String(product.stock),
      image: product.image ?? '',
      status: product.status,
    })
    setActionError(null)
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setActionError(null)

    const payload: ProductPayload = {
      ...formData,
      stock: Number(formData.stock),
      image: formData.image?.trim() || null,
    }

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload)
      } else {
        await api.createProduct(payload)
      }

      resetForm()
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to save product',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return
    }

    setActionError(null)

    try {
      await api.deleteProduct(product.id)
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to delete product',
      )
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Products</h1>
        </div>
        <span className="count-pill">{products?.length ?? 0} records</span>
      </div>

      <form className="panel form-panel" onSubmit={submitProduct}>
        <div className="panel-header">
          <h2>{editingId ? 'Update product' : 'Create product'}</h2>
          {editingId && (
            <button className="ghost-button" onClick={resetForm} type="button">
              Cancel
            </button>
          )}
        </div>

        <div className="form-grid">
          <label>
            <span>Name</span>
            <input
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
              type="text"
              value={formData.name}
            />
          </label>
          <label>
            <span>Description</span>
            <input
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              required
              type="text"
              value={formData.description}
            />
          </label>
          <label>
            <span>Price</span>
            <input
              min="0"
              onChange={(event) => setFormData({ ...formData, price: event.target.value })}
              required
              type="number"
              value={formData.price}
            />
          </label>
          <label>
            <span>Stock</span>
            <input
              min="0"
              onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
              required
              type="number"
              value={formData.stock}
            />
          </label>
          <label>
            <span>Image</span>
            <input
              onChange={(event) => setFormData({ ...formData, image: event.target.value })}
              placeholder="iphone.jpg"
              type="text"
              value={formData.image ?? ''}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value })
              }
              value={formData.status}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
        </div>

        {actionError && <div className="form-error">{actionError}</div>}

        <div className="form-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : editingId ? 'Update product' : 'Create product'}
          </button>
        </div>
      </form>

      <ResourceState
        emptyMessage="No products found."
        error={error}
        isEmpty={products?.length === 0}
        isLoading={isLoading}
      />

      {products && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">{product.name.slice(0, 2).toUpperCase()}</div>
              <div className="product-body">
                <div className="product-title">
                  <h2>{product.name}</h2>
                  <span className="status-badge">{product.status}</span>
                </div>
                <p>{product.description}</p>
                <div className="product-meta">
                  <strong>{formatCurrency(product.price)}</strong>
                  <span>{product.stock} in stock</span>
                </div>
                <div className="card-actions">
                  <button onClick={() => editProduct(product)} type="button">
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => void deleteProduct(product)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
