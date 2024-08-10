import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsArticle } from '../models/news';



@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  paginateData(data: any[], page: number, pageSize: number): Observable<NewsArticle[]> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return of(data.slice(start, end));
  }
}
