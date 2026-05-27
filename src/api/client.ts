import type {
  Customer,
  CustomerPayload,
  Order,
  OrderPayload,
  Product,
  ProductPayload,
  User,
  UserPayload,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RequestOptions = {
  body?: unknown
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  getUsers: () => request<User[]>('/users'),
  getUser: (id: number) => request<User | User[]>(`/users/${id}`),
  createUser: (payload: UserPayload) =>
    request<User>('/users', { method: 'POST', body: payload }),
  updateUser: (id: number, payload: Partial<UserPayload>) =>
    request<User>(`/users/${id}`, { method: 'PATCH', body: payload }),
  deleteUser: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),

  getCustomers: () => request<Customer[]>('/customers'),
  getCustomer: (id: number) => request<Customer>(`/customers/${id}`),
  createCustomer: (payload: CustomerPayload) =>
    request<Customer>('/customers', { method: 'POST', body: payload }),
  updateCustomer: (id: number, payload: Partial<CustomerPayload>) =>
    request<Customer>(`/customers/${id}`, { method: 'PATCH', body: payload }),
  deleteCustomer: (id: number) => request<void>(`/customers/${id}`, { method: 'DELETE' }),

  getProducts: () => request<Product[]>('/products'),
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createProduct: (payload: ProductPayload) =>
    request<Product>('/products', { method: 'POST', body: payload }),
  updateProduct: (id: number, payload: Partial<ProductPayload>) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: payload }),
  deleteProduct: (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' }),

  getOrders: () => request<Order[]>('/orders'),
  getOrder: (id: number) => request<Order>(`/orders/${id}`),
  createOrder: (payload: OrderPayload) =>
    request<Order>('/orders', { method: 'POST', body: payload }),
  updateOrder: (id: number, payload: Partial<OrderPayload>) =>
    request<Order>(`/orders/${id}`, { method: 'PATCH', body: payload }),
  deleteOrder: (id: number) => request<void>(`/orders/${id}`, { method: 'DELETE' }),
}
