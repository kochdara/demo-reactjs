export type User = {
  id: number
  name: string
  email: string
  password: string
  role: string
  createdAt: string
  updatedAt: string
}

export type UserPayload = {
  name: string
  email: string
  password: string
  role: string
}

export type Product = {
  id: number
  name: string
  description: string
  price: string
  stock: number
  image: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export type ProductPayload = {
  name: string
  description: string
  price: string
  stock: number
  image: string | null
  status: string
}

export type OrderItem = {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: string
  subtotal: string
  createdAt: string
  updatedAt: string
  product?: Product
}

export type Order = {
  id: number
  customerId: number
  orderNo: string
  status: string
  totalAmount: string
  createdAt: string
  updatedAt: string
  customer?: Customer
  items?: OrderItem[]
}

export type OrderItemPayload = {
  productId: number
  quantity: number
}

export type OrderPayload = {
  customerId: number
  status?: string
  items: OrderItemPayload[]
}

export type Customer = {
  id: number
  userId: number
  phone: string
  address: string
  city: string
  province: string
  country: string
  gender: string
  dob: string
  photo: string | null
  createdAt: string
  updatedAt: string
  user?: User
  orders?: Order[]
}

export type CustomerPayload = {
  userId: number
  phone: string
  address: string
  city: string
  province: string
  country: string
  gender: string
  dob: string
  photo: string | null
}
