import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewsArticle } from '../models/news';
import { Mediastack } from '../models/mediastackNews';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  newsApiUrl = 'https://newsapi.org/v2';
  mediastackApiUrl = 'http://api.mediastack.com/v1/news';

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

  getMediastackNewsByCountry(country: string = 'bg'): Observable<any> {
    return this.http.get<Mediastack[]>(`${this.mediastackApiUrl}?access_key=${environment.mediaStackApiKey}&countries=${country}`);
  }
}
