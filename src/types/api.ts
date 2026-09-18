export interface AuthorShort {
  id: number
  full_name: string
}

export interface Book {
  id: number
  title: string
  year: number
  description: string | null
  isbn: string | null
  cover_url: string | null
  authors: AuthorShort[]
}

export interface Pagination {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface BookListResponse {
  items: Book[]
  pagination: Pagination
}

export interface Author {
  id: number
  full_name: string
  books: {
    id: number
    title: string
    year: number
  }[]
}

export interface AuthorListResponse {
  items: AuthorShort[]
  pagination: Pagination
}

export interface User {
  id: number
  username: string
  role: string
}

export interface LoginResponse {
  token: string
  expires_at: string
  user: User
}

export interface TopAuthor {
  rank: number
  author_id: number
  full_name: string
  books_count: number
}

export interface TopAuthorsResponse {
  year: number
  items: TopAuthor[]
}
