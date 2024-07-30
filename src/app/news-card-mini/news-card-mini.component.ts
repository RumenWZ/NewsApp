import { Component, Input } from '@angular/core';
import { NewsArticle } from '../models/news';
import { CommonModule } from '@angular/common';
import { DateService } from '../services/date.service';

@Component({
  selector: 'app-news-card-mini',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-card-mini.component.html',
  styleUrl: './news-card-mini.component.css'
})
export class NewsCardMiniComponent {
  @Input() article!: NewsArticle;
  publishedOn!: string;
  publishedTimeAgo!: string;

  constructor(
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.publishedOn = this.dateService.formatDate(this.article.publishedAt);
    this.publishedTimeAgo = this.dateService.calculateTimeAgo(this.article.publishedAt);
  }
}
