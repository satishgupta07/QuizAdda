import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsResponse } from '../models/analytics.interface';
import baseUrl from './helper';

/**
 * Admin-only analytics API. The backend gates the underlying endpoint with
 * {@code @PreAuthorize('hasAuthority(\\'ADMIN\\')')}, so a USER call returns 403
 * and the global error interceptor surfaces a Forbidden alert.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private readonly http = inject(HttpClient);

  getAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${baseUrl}/api/v1/admin/analytics`);
  }
}
