/**
 * Mirror of the backend's {@code PageResponse<T>}. Use this whenever an endpoint
 * paginates rather than returning a raw list.
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
