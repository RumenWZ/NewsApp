import { Component, Input } from '@angular/core';
import { NewsArticle } from '../models/news';
import { CommonModule } from '@angular/common';
import { DateService } from '../services/date.service';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.css'
})
export class NewsCardComponent {
  @Input() article!: NewsArticle;
  postedTimeAgo!: string;
  formattedDate!: string;

  constructor(
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.postedTimeAgo = this.dateService.calculateTimeAgo(this.article.publishedAt);
    this.formattedDate = this.dateService.formatDate(this.article.publishedAt);
  }
}
