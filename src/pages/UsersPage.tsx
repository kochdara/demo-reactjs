import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { useResource } from '../api/useResource'
import { ResourceState } from '../components/ResourceState'
import type { User, UserPayload } from '../types'
import { formatDate } from '../utils/format'

const emptyUserForm: UserPayload = {
  name: '',
  email: '',
  password: '',
  role: 'user',
}

export function UsersPage() {
  const { data: users, error, isLoading, reload } = useResource(api.getUsers)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<UserPayload>(emptyUserForm)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setEditingId(null)
    setFormData(emptyUserForm)
    setActionError(null)
  }

  function editUser(user: User) {
    setEditingId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    })
    setActionError(null)
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setActionError(null)

    try {
      const payload = editingId && !formData.password
        ? { name: formData.name, email: formData.email, role: formData.role }
        : formData

      if (editingId) {
        await api.updateUser(editingId, payload)
      } else {
        await api.createUser(formData)
      }

      resetForm()
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to save user',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteUser(user: User) {
    if (!window.confirm(`Delete ${user.name}?`)) {
      return
    }

    setActionError(null)

    try {
      await api.deleteUser(user.id)
      await reload()
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error ? caughtError.message : 'Unable to delete user',
      )
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">People</p>
          <h1>Users</h1>
        </div>
        <span className="count-pill">{users?.length ?? 0} records</span>
      </div>

      <form className="panel form-panel" onSubmit={submitUser}>
        <div className="panel-header">
          <h2>{editingId ? 'Update user' : 'Create user'}</h2>
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
            <span>Email</span>
            <input
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              required
              type="email"
              value={formData.email}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              placeholder={editingId ? 'Leave blank to keep current' : undefined}
              required={!editingId}
              type="password"
              value={formData.password}
            />
          </label>
          <label>
            <span>Role</span>
            <select
              onChange={(event) => setFormData({ ...formData, role: event.target.value })}
              value={formData.role}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="subadmin">subadmin</option>
            </select>
          </label>
        </div>

        {actionError && <div className="form-error">{actionError}</div>}

        <div className="form-actions">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : editingId ? 'Update user' : 'Create user'}
          </button>
        </div>
      </form>

      <ResourceState
        emptyMessage="No users found."
        error={error}
        isEmpty={users?.length === 0}
        isLoading={isLoading}
      />

      {users && users.length > 0 && (
        <section className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Password</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="status-badge">{user.role}</span>
                  </td>
                  <td>Hidden</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => editUser(user)} type="button">
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => void deleteUser(user)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </section>
  )
}
