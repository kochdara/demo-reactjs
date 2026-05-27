import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { useResource } from '../api/useResource'
import { ResourceState } from '../components/ResourceState'
import type { Customer } from '../types'
import { formatDate } from '../utils/format'

type CustomerFormData = {
  address: string
  city: string
  country: string
  dob: string
  gender: string
  phone: string
  photo: string
  province: string
  userId: string
}

const emptyCustomerForm: CustomerFormData = {
  userId: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  country: 'Cambodia',
  gender: 'male',
  dob: '',
  photo: '',
}

export function CustomersPage() {
  const {
    data: customers,
    error,
    isLoading,
    reload,
  } = useResource(api.getCustomers)
  const { data: userOptions } = useResource(api.getUsers)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(emptyCustomerForm)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setEditingId(null)
    setFormData({
      ...emptyCustomerForm,
      userId: userOptions?.[0] ? String(userOptions[0].id) : '',
    })
    setActionError(null)
  }

  function editCustomer(customer: Customer) {
    setEditingId(customer.id)
    setFormData({
      userId: String(customer.userId),
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      province: customer.province,
      country: customer.country,
      gender: customer.gender,
      dob: customer.dob.slice(0, 10),
      photo: customer.photo ?? '',
    })
    setActionError(null)
  }

  async function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setActionError(null)

    const payload = {
      ...formData,
      userId: Number(formData.userId || userOptions?.[0]?.id),
      photo: formData.photo.trim() || null,
    }

    try {
      if (editingId) {
        await api.updateCustomer(editingId, payload)
      } else {
        await api.createCustomer(payload)
      }

      resetForm()
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to save customer',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (!window.confirm(`Delete customer ${customer.user?.name ?? customer.id}?`)) {
      return
    }

    setActionError(null)

    try {
      await api.deleteCustomer(customer.id)
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to delete customer',
      )
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profiles</p>
          <h1>Customers</h1>
        </div>
        <span className="count-pill">{customers?.length ?? 0} records</span>
      </div>

      <form className="panel form-panel" onSubmit={submitCustomer}>
        <div className="panel-header">
          <h2>{editingId ? 'Update customer' : 'Create customer'}</h2>
          {editingId && (
            <button className="ghost-button" onClick={resetForm} type="button">
              Cancel
            </button>
          )}
        </div>

        <div className="form-grid">
          <label>
            <span>User</span>
            <select
              onChange={(event) =>
                setFormData({ ...formData, userId: event.target.value })
              }
              required
              value={formData.userId || userOptions?.[0]?.id || ''}
            >
              {userOptions?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Phone</span>
            <input
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              required
              type="tel"
              value={formData.phone}
            />
          </label>
          <label>
            <span>Address</span>
            <input
              onChange={(event) =>
                setFormData({ ...formData, address: event.target.value })
              }
              required
              type="text"
              value={formData.address}
            />
          </label>
          <label>
            <span>City</span>
            <input
              onChange={(event) => setFormData({ ...formData, city: event.target.value })}
              required
              type="text"
              value={formData.city}
            />
          </label>
          <label>
            <span>Province</span>
            <input
              onChange={(event) =>
                setFormData({ ...formData, province: event.target.value })
              }
              required
              type="text"
              value={formData.province}
            />
          </label>
          <label>
            <span>Country</span>
            <input
              onChange={(event) =>
                setFormData({ ...formData, country: event.target.value })
              }
              required
              type="text"
              value={formData.country}
            />
          </label>
          <label>
            <span>Gender</span>
            <select
              onChange={(event) =>
                setFormData({ ...formData, gender: event.target.value })
              }
              value={formData.gender}
            >
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </label>
          <label>
            <span>Date of birth</span>
            <input
              onChange={(event) => setFormData({ ...formData, dob: event.target.value })}
              required
              type="date"
              value={formData.dob}
            />
          </label>
          <label>
            <span>Photo</span>
            <input
              onChange={(event) => setFormData({ ...formData, photo: event.target.value })}
              placeholder="photo.jpg"
              type="text"
              value={formData.photo}
            />
          </label>
        </div>

        {actionError && <div className="form-error">{actionError}</div>}

        <div className="form-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : editingId ? 'Update customer' : 'Create customer'}
          </button>
        </div>
      </form>

      <ResourceState
        emptyMessage="No customers found."
        error={error}
        isEmpty={customers?.length === 0}
        isLoading={isLoading}
      />

      {customers && customers.length > 0 && (
        <div className="card-grid">
          {customers.map((customer) => (
            <article className="customer-card" key={customer.id}>
              <div className="avatar">
                {(customer.user?.name ?? 'C').slice(0, 1).toUpperCase()}
              </div>
              <div className="customer-main">
                <div>
                  <h2>{customer.user?.name ?? `Customer #${customer.id}`}</h2>
                  <p>{customer.user?.email ?? 'No email'}</p>
                </div>
                <span className="status-badge">{customer.gender}</span>
              </div>
              <dl className="detail-grid">
                <div>
                  <dt>Phone</dt>
                  <dd>{customer.phone}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>
                    {customer.city}, {customer.country}
                  </dd>
                </div>
                <div>
                  <dt>Orders</dt>
                  <dd>{customer.orders?.length ?? 0}</dd>
                </div>
                <div>
                  <dt>Date of birth</dt>
                  <dd>{formatDate(customer.dob)}</dd>
                </div>
              </dl>
              <div className="card-actions">
                <button onClick={() => editCustomer(customer)} type="button">
                  Edit
                </button>
                <button
                  className="danger-button"
                  onClick={() => void deleteCustomer(customer)}
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
