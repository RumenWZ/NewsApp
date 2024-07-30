import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  apiUrl = 'https://api.unsplash.com/search/photos';

  constructor(
    private http: HttpClient
  ) { }

  getUnsplashImage(query: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Client-ID ${environment.unsplashApiKey}`
    });
    return this.http.get(`${this.apiUrl}?query=${query}`, { headers });
  }
}
