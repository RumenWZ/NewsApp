import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
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
import { queriedNews } from '../misc/query-news-objects';
import { NewsQueriedComponent } from "../news-queried/news-queried.component";
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, NewsCardComponent, NewsCardMiniComponent, MatPaginatorModule, NewsQueriedComponent, MatTabsModule],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent {
  newsArticles: NewsArticle[] = [];
  topHeadlineArticles: NewsArticle[] = [];
  rightSideArticles: NewsArticle[] = [];
  paginatedRightSideArticles: NewsArticle[] = [];
  paginatedQueriedArticles: NewsArticle[] = [];
  queriedArticles: NewsArticle[] = [];
  private destroy$ = new Subject<void>();
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  @ViewChild('carouselData') carouselData!: ElementRef;
  @ViewChild('inputField') searchInput!: ElementRef;
  @ViewChild('pagButton1') pagButton1!: ElementRef;
  @ViewChild('pagButton2') pagButton2!: ElementRef;
  @ViewChild('pagButton3') pagButton3!: ElementRef;
  @ViewChild('pagButton4') pagButton4!: ElementRef;
  @ViewChild('pagButton5') pagButton5!: ElementRef;
  @ViewChildren('pagButton1, pagButton2, pagButton3, pagButton4, pagButton5') buttons!: QueryList<ElementRef>;
  private currentOffset = 0;
  currentCarouselIndex = 1;
  countryList = countryList;
  rPage = 1;
  rPageSize = 7;
  rPageLength = 0;
  qPage = 1;
  qPageSize = 10;
  qPageLength = 0;

  constructor(
    readonly newsService: NewsService,
    readonly imageService: ImageService,
    readonly paginationService: PaginationService,
    private render: Renderer2
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

  onSubmitSearch(event: Event) {
    event.preventDefault();
    const searchValue = this.searchInput.nativeElement.value;
    this.newsService.getEverything(searchValue).pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.queriedArticles = response.articles;
        this.queriedArticles = this.queriedArticles.filter(a => a.title != '[Removed]');

        this.queriedArticles.sort((a: NewsArticle, b: NewsArticle) => {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        this.qPage = 1;

        this.paginateQueriedArticles();
        this.updatePaginationButtons();
        this.qPageLength = this.queriedArticles.length;
      });
  }

  cleanArticles() {
    this.newsArticles = this.newsArticles.filter(a => a.title != '[Removed]');

  }

  ngOnInit() {
    // DELETE LATER
    this.newsArticles = news;
    this.queriedArticles = queriedNews;
    this.qPageLength = this.queriedArticles.length;
    this.paginateQueriedArticles();

    this.cleanArticles();
    this.rightSideArticles = this.newsArticles;
    this.rPageLength = this.rightSideArticles.length;

    this.loadRightColNews();
    this.getTopHeadlinesList();

  }

  test() {

  }

  paginateQueriedArticles(): void {
    this.paginationService.paginateData(this.queriedArticles, this.qPage, this.qPageSize).subscribe(
      (data: NewsArticle[]) => {
        this.paginatedQueriedArticles = data;
      }
    );
  }

  loadRightColNews() {
    this.paginationService.paginateData(this.rightSideArticles, this.rPage, this.rPageSize)
    .subscribe((data: NewsArticle[]) => {
      this.paginatedRightSideArticles = data;
    })
  }

  ngAfterViewInit() {
    this.updatePaginationButtons();
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

  updatePaginationButtons() {
    if(this.qPage < 3) {
      this.pagButton1.nativeElement.innerHTML = 1;
      this.pagButton2.nativeElement.innerHTML = 2;
      this.pagButton3.nativeElement.innerHTML = 3;
      this.pagButton4.nativeElement.innerHTML = 4;
      this.pagButton5.nativeElement.innerHTML = 5;
    } else if (this.qPage > this.qPageSize - 2) {
      this.pagButton1.nativeElement.innerHTML = this.qPageSize-4;
      this.pagButton2.nativeElement.innerHTML = this.qPageSize-3;
      this.pagButton3.nativeElement.innerHTML = this.qPageSize-2;
      this.pagButton4.nativeElement.innerHTML = this.qPageSize-1;
      this.pagButton5.nativeElement.innerHTML = this.qPageSize;
    }
     else {
      this.pagButton1.nativeElement.innerHTML = this.qPage - 2;
      this.pagButton2.nativeElement.innerHTML = this.qPage - 1;
      this.pagButton3.nativeElement.innerHTML = this.qPage;
      this.pagButton4.nativeElement.innerHTML = this.qPage + 1;
      this.pagButton5.nativeElement.innerHTML = this.qPage + 2;
    }

    this.buttons.forEach(button => {
      this.render.removeClass(button.nativeElement, 'pag-highlight');
    })
    this.buttons.forEach(button => {
      const buttonText = button.nativeElement.innerHTML.trim();
      if (buttonText == this.qPage) {
        this.render.addClass(button.nativeElement, 'pag-highlight')
      }
    });

  }


  onPageChange(event: PageEvent) {
    this.rPage = event.pageIndex + 1;
    this.loadRightColNews();
  }

  onQueriedPageChange(goToPage: number) {
    this.qPage += Math.ceil(goToPage);
    this.paginateQueriedArticles();
    this.updatePaginationButtons();
  }

  onQueriedPageNumberChange(event: Event) {
    const buttonClicked = event.target as HTMLButtonElement;
    this.qPage = parseInt(buttonClicked.innerHTML, 10);
    this.paginateQueriedArticles();
    this.updatePaginationButtons();
  }
}
