import { Component, Input } from '@angular/core';
import { Mediastack } from '../models/mediastackNews';
import { DateService } from '../services/date.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-card-mediastack-mini',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-card-mediastack-mini.component.html',
  styleUrl: './news-card-mediastack-mini.component.css'
})
export class NewsCardMediastackMiniComponent {
  @Input() article!: Mediastack;
  publishedOn!: string;
  publishedTimeAgo!: string;

  constructor(
    private dateService: DateService
  ) {}

  ngOnInit() {
    console.log(this.article);
    this.publishedOn = this.dateService.formatDate(this.article.published_at);
    this.publishedTimeAgo = this.dateService.calculateTimeAgo(this.article.published_at);
  }
}
