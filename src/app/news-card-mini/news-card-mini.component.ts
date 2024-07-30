import { Component, Input } from '@angular/core';
import { NewsArticle } from '../models/news';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-card-mini',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-card-mini.component.html',
  styleUrl: './news-card-mini.component.css'
})
export class NewsCardMiniComponent {
  @Input() article!: NewsArticle;


  constructor() {}


}
