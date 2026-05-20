import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryRequest, CategoryResponse } from '../models/category.interface';
import baseUrl from './helper';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  private readonly http = inject(HttpClient);
  private readonly path = `${baseUrl}/api/v1/categories`;

  list(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.path);
  }

  create(category: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.path, category);
  }

  delete(catId: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${catId}`);
  }
}
