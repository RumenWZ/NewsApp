import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class DateService {


  constructor() { }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  calculateTimeAgo(dateString: string): string {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInMs = now.getTime() - publishedDate.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      if (days == 1) {
        return `${days} day ago`;
      } else {
        return `${days} days ago`;
      }
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return `${seconds} seconds ago`;
    }
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

}
