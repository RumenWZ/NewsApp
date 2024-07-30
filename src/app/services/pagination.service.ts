import { Injectable } from '@angular/core';
import { of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  paginateData(data: any[], page: number, pageSize: number) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return of(data.slice(start, end));
  }
}
