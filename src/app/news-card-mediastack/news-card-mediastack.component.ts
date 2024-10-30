import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Mediastack } from '../models/mediastackNews';
import { CommonModule } from '@angular/common';
import { DateService } from '../services/date.service';

@Component({
  selector: 'app-news-card-mediastack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-card-mediastack.component.html',
  styleUrl: './news-card-mediastack.component.css'
})
export class NewsCardMediastackComponent {
  @Input() article!: Mediastack;
  @Output() imageError = new EventEmitter<Mediastack>();
  postedTimeAgo!: string;
  formattedDate!: string;

  constructor(
    private dateService: DateService
  ) {}

  onImageError() {
    this.imageError.emit(this.article);
  }

  ngOnInit() {
    this.postedTimeAgo = this.dateService.calculateTimeAgo(this.article.published_at);
    this.formattedDate = this.dateService.formatDate(this.article.published_at);
  }
}
