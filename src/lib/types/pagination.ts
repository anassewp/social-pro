/**
 * أنواع البيانات للـ Pagination
 */

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/**
 * Helper function لحساب pagination metadata
 */
export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize)
  
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Helper function لاستخراج pagination params من URL
 */
export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))
  
  return { page, pageSize }
}

