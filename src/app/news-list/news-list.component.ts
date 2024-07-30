import { Component, ElementRef, ViewChild } from '@angular/core';
import { NewsService } from '../services/news-service.service';
import { NewsArticle } from '../models/news';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { news } from '../misc/news-objects';
import { NewsCardComponent } from "../news-card/news-card.component";
import { ImageService } from '../services/image.service';
import { NewsCardMiniComponent } from "../news-card-mini/news-card-mini.component";
import { countryList } from '../misc/countries';
import { PaginationService } from '../services/pagination.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, NewsCardComponent, NewsCardMiniComponent, MatPaginatorModule],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent {
  newsArticles: NewsArticle[] = [];
  topHeadlineArticles: NewsArticle[] = [];
  rightSideArticles: NewsArticle[] = [];
  paginatedRightSideArticles: NewsArticle[] = [];
  private destroy$ = new Subject<void>();
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  @ViewChild('carouselData') carouselData!: ElementRef;
  private currentOffset = 0;
  currentCarouselIndex = 1;
  countryList = countryList;
  rPage = 1;
  rPageSize = 7;
  rPageLength = 0;


  constructor(
    readonly newsService: NewsService,
    readonly imageService: ImageService,
    readonly paginationService: PaginationService
  ) {

  }

  getArticles() {
    this.newsService.getTopHeadlines('us').pipe(takeUntil(this.destroy$))
    .subscribe((response: any) => {
      this.newsArticles = response.articles;
      this.cleanArticles();
      this.getTopHeadlinesList();
    });
  }

  translate() {
    console.log(this.carouselContainer)
  }

  cleanArticles() {
    this.newsArticles = this.newsArticles.filter(a => a.title != '[Removed]');
  }

  ngOnInit() {
    this.newsArticles = news;
    this.cleanArticles();
    this.rightSideArticles = this.newsArticles;
    this.rPageLength = this.rightSideArticles.length;
    this.loadRightColNews();
    this.getTopHeadlinesList();

  }

  test() {

  }

  loadRightColNews() {
    this.paginationService.paginateData(this.rightSideArticles, this.rPage, this.rPageSize)
    .subscribe(data => {
      this.paginatedRightSideArticles = data;
      console.log(data);
    })
  }

  ngAfterViewInit() {
    if (!this.carouselContainer) {
      console.error('Carousel container not found!');
    }
  }

  getImage() {
    this.imageService.getUnsplashImage('Japan').pipe(takeUntil(this.destroy$))
    .subscribe(response => {
      console.log(response);
    });
  }

  getTopHeadlinesList() {
    this.topHeadlineArticles = this.newsArticles.filter(article => article.urlToImage);
  }

  getAuthors() {
    this.newsService.getSources().pipe(takeUntil(this.destroy$))
    .subscribe((response: any) => {
      console.log(response);
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete;
  }

  moveLeft() {
    if (this.carouselData) {
      const container = this.carouselData.nativeElement;
      const containerWidth = container.clientWidth;
      this.currentOffset += containerWidth ;
      if (this.currentCarouselIndex > 1) this.currentCarouselIndex--;
      const offsetAmount = -this.currentCarouselIndex * containerWidth + containerWidth;
      container.style.transform = `translateX(${offsetAmount}px)`;
    }
  }

  moveRight() {
    if (this.carouselData) {
      const container = this.carouselData.nativeElement;
      const containerWidth = container.clientWidth
      const maxIndex = this.topHeadlineArticles.length;
      if (this.currentCarouselIndex < maxIndex) this.currentCarouselIndex++;
      const offsetAmount = -this.currentCarouselIndex * containerWidth + containerWidth;
      container.style.transform = `translateX(${offsetAmount}px)`;
    }
  }

  onSelectChanges(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.newsService.getTopHeadlines(value).pipe(takeUntil(this.destroy$))
    .subscribe((response: any) => {
      this.rightSideArticles = response.articles;
      this.loadRightColNews();
    });
  }

  autoScroll() {

  }

  onPageChange(event: PageEvent) {
    this.rPage = event.pageIndex + 1;
    this.loadRightColNews();
  }

}
