import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewsArticle } from '../models/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  newsApiUrl = 'https://newsapi.org/v2';

  constructor(private http: HttpClient) { }

  getTopHeadlines(country: string = 'us'): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(`${this.newsApiUrl}/top-headlines?country=${country}&apiKey=${environment.newsApiKey}`);
  }

  getEverything(query: string): Observable<any> {
    return this.http.get<any>(`${this.newsApiUrl}/everything?q=${query}&apiKey=${environment.newsApiKey}`);
  }

  getSources(country: string = 'us'): Observable<any> {
    return this.http.get<any>(`${this.newsApiUrl}/sources?country=${country}&apiKey=${environment.newsApiKey}`);
  }
}
