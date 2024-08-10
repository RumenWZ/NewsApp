import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NewsArticle } from '../models/news';
import { DateService } from '../services/date.service';

@Component({
  selector: 'app-news-queried',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-queried.component.html',
  styleUrl: './news-queried.component.css'
})
export class NewsQueriedComponent {
  @Input() article!: NewsArticle;
  postedTimeAgo!: string;
  formattedDate!: string;

  constructor(
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.formattedDate = this.dateService.formatDate(this.article.publishedAt);
    this.postedTimeAgo = this.dateService.calculateTimeAgo(this.article.publishedAt);
  }
}
