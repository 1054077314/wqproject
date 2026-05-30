// Object definitions matching API responses

export interface ApiRes<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedRes<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface User {
  id: number
  username: string
  is_staff: boolean
}

export interface ProductImage {
  id: number
  image: string
  created_at: string
}

export interface ProductListItem {
  id: number
  title: string
  price: string
  first_image: string | null
  category_name: string
}

export interface ProductDetail {
  id: number
  title: string
  description: string
  price: string
  images: ProductImage[]
  category_name: string
  contact_info: string
  status: string
  created_at: string
  seller_username: string
  comments: CommentItem[]
  appointment_count: number
  is_favorited: boolean
  is_appointed: boolean
}

export interface MyProduct {
  id: number
  title: string
  price: string
  status: string
  images: ProductImage[]
  category_name: string
  appointment_count: number
  created_at: string
}

export interface Category {
  id: number
  name: string
}

export interface CommentItem {
  id: number
  content: string
  username: string
  created_at: string
}

export interface AppointmentItem {
  id: number
  product_id: number
  product_title: string
  product_price: string
  buyer_username: string
  status: string
  created_at: string
}

export interface FavoriteItem {
  id: number
  product_id: number
  product_title: string
  product_price: string
  product_image: string | null
  created_at: string
}

export interface AdminUser {
  id: number
  username: string
  is_active: boolean
  is_staff: boolean
  created_at: string
}

export interface Statistics {
  total_users: number
  total_products: number
  products_by_status: Record<string, number>
  today_new_products: number
  pending_products: number
}
