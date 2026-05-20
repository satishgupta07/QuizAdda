import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import baseUrl from './helper';

/**
 * Admin-only file upload. Returns the absolute URL the {@code <img>} tag should
 * use; the backend returns a relative path and this service prepends the
 * configured API base so it works whether the API is on the same origin or not.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {

  private readonly http = inject(HttpClient);
  private readonly path = `${baseUrl}/api/v1/uploads/image`;

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(this.path, formData).pipe(
      map(r => `${baseUrl}${r.url}`)
    );
  }
}
