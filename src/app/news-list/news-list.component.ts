import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { NewsService } from '../services/news-service.service';
import { NewsArticle } from '../models/news';
import { CommonModule } from '@angular/common';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
import { NewsCardComponent } from "../news-card/news-card.component";
import { ImageService } from '../services/image.service';
import { NewsCardMiniComponent } from "../news-card-mini/news-card-mini.component";
import { countryList } from '../misc/countries';
import { PaginationService } from '../services/pagination.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { queriedNews } from '../misc/query-news-objects';
import { NewsQueriedComponent } from "../news-queried/news-queried.component";
import { MatTabsModule } from '@angular/material/tabs';
import { Mediastack } from '../models/mediastackNews';
import { NewsCardMediastackMiniComponent } from "../news-card-mediastack-mini/news-card-mediastack-mini.component";
import { NewsCardMediastackComponent } from "../news-card-mediastack/news-card-mediastack.component";
import { news2 } from '../misc/news-objects2';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, NewsCardComponent, NewsCardMiniComponent, MatPaginatorModule, NewsQueriedComponent, MatTabsModule, NewsCardMediastackMiniComponent, NewsCardMediastackComponent, FormsModule],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent {
  topHeadlineArticles: NewsArticle[] = [];
  articlesByCountry: Mediastack[] = [];
  paginatedArticlesByCountry: Mediastack[] = [];
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
  @ViewChild(MatPaginator) matPaginator!: MatPaginator;
  private currentOffset = 0;
  currentCarouselIndex = 1;
  countryList = countryList;
  rPage = 1;
  rPageSize = 10;
  rPageLength = 0;
  qPage = 1;
  qPageSize = 10;
  qPageLength = 0;
  private autoScrollSubscription: Subscription | undefined;
  private autoScrollDelayTimer: any;
  private counterStarted: boolean = false;
  private isInCooldown: boolean = false;
  private cooldownTimer: any;
  private mouseMoveListener!: () => void;
  selectedCountry = 'bg';
  queryValue = 'Tesla';

  constructor(
    readonly newsService: NewsService,
    readonly imageService: ImageService,
    readonly paginationService: PaginationService,
    private renderer: Renderer2
  ) {

  }

  // #region ngFunctions
  ngOnInit() {

    this.sortCountriesList();
    this.getTopHeadlinesList();
    this.getNewsByCountry('bg');
  }

  ngAfterViewInit() {
    this.updatePaginationButtons();
    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.onMouseMove.bind(this));
    this.getNewsByQuery(this.queryValue);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete;
    this.autoScrollSubscription?.unsubscribe();
    clearTimeout(this.autoScrollDelayTimer);
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
    }
  }

  // #endregion

  onMouseMove(event: MouseEvent): void {
    this.activateCounter();
  }

  onSubmitSearch(event: Event) {
    event.preventDefault();
    var searchValue = this.searchInput.nativeElement.value;
    searchValue = searchValue.trim();
    if (!searchValue || searchValue == '') {
      return;
    }
    this.getNewsByQuery(searchValue);
  }

  getNewsByQuery(value: string) {
    this.newsService.getEverything(value).pipe(takeUntil(this.destroy$))
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

  getNewsByCountry(value: string) {
    this.newsService.getMediastackNewsByCountry(value).pipe(takeUntil(this.destroy$))
    .subscribe((response: any) => {
      this.articlesByCountry = response.data;
      this.loadRightColNews();

      if(this.matPaginator) {
        this.matPaginator.pageIndex! = 0;
        this.matPaginator.page.next({
          pageIndex: this.matPaginator.pageIndex,
          pageSize: this.matPaginator.pageSize,
          length: this.matPaginator.length
        });
      }
    });
  }

  sortCountriesList() {
    this.countryList = this.countryList.sort((a, b) => {
      if (a.country < b.country) return -1;
      if (a.country > b.country) return 1;
      return 0;
    });
  }

  loadRightColNews() {
    this.articlesByCountry = this.articlesByCountry.filter(a => a.title != '[Removed]');
    this.articlesByCountry = this.articlesByCountry.filter((obj, index, self) => {
      const isFirstInstance = index === self.findIndex((o) => o.title === obj.title);
      return isFirstInstance;
    });
    this.paginationService.paginateData(this.articlesByCountry, this.rPage, this.rPageSize)
    .subscribe((data: Mediastack[]) => {
      this.paginatedArticlesByCountry = data;
      this.rPageLength = this.articlesByCountry.length;
    })
  }



  getTopHeadlinesList() {
    this.newsService.getTopHeadlines('us').pipe(takeUntil(this.destroy$))
    .subscribe((response: any) => {
      this.topHeadlineArticles = response.articles;
      this.topHeadlineArticles = this.topHeadlineArticles.filter(a => a.title != '[Removed]');
      this.topHeadlineArticles = this.topHeadlineArticles.filter(article => article.urlToImage);
    });
  }

  onSelectChanges(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.getNewsByCountry(value);
  }

  removeArticleTopHeadlines(index: number) {
    this.topHeadlineArticles = this.topHeadlineArticles.splice(index, 1);
  }

  // #region Carousel Stuff
  moveLeft(manualClick: boolean) {
    if (this.carouselData) {
      const container = this.carouselData.nativeElement;
      const containerWidth = container.clientWidth;
      this.currentOffset += containerWidth ;
      if (this.currentCarouselIndex > 1) this.currentCarouselIndex--;
      const offsetAmount = -this.currentCarouselIndex * containerWidth + containerWidth;
      container.style.transform = `translateX(${offsetAmount}px)`;
    }
    if (manualClick) this.resetAutoScrollTimer();
  }

  moveRight(manualClick: boolean) {
    if (this.carouselData) {
      const container = this.carouselData.nativeElement;
      const containerWidth = container.clientWidth
      const maxIndex = this.topHeadlineArticles.length;
      if (this.currentCarouselIndex < maxIndex) this.currentCarouselIndex++;
      const offsetAmount = -this.currentCarouselIndex * containerWidth + containerWidth;
      container.style.transform = `translateX(${offsetAmount}px)`;
    }
    if (manualClick) this.resetAutoScrollTimer();
  }

  resetCarousel() {
    if (this.carouselData) {
      const container = this.carouselData.nativeElement;
      this.currentCarouselIndex = 1;
      container.style.transform = `translateX(0px)`;
    }
  }

  activateCounter() {
    if (!this.counterStarted) {
      this.startAutoScroll();
      this.counterStarted = true;
    }
  }

  private startAutoScroll() {
    this.autoScrollSubscription = interval(5000).subscribe(() => this.autoScrollFunction());
  }

  autoScrollFunction() {
    if (this.currentCarouselIndex < this.topHeadlineArticles.length) {
      this.moveRight(false);
    } else {
      this.resetCarousel();
    }
  }

  private resetAutoScrollTimer(delay: number = 10000) {
    clearTimeout(this.cooldownTimer);

    this.isInCooldown = true;
    this.cooldownTimer = setTimeout(() => {
        this.isInCooldown = false;
    }, 2000);

    this.pauseAutoScroll();
    clearTimeout(this.autoScrollDelayTimer);
    this.autoScrollDelayTimer = setTimeout(() => {
        this.resumeAutoScroll();
    }, delay);
  }

  resumeAutoScroll() {
    if (!this.autoScrollSubscription || this.autoScrollSubscription.closed) {
      this.startAutoScroll()
    }
  }

  onMouseLeave() {
    if (!this.isInCooldown) {
        this.resumeAutoScroll();
    }
  }

  pauseAutoScroll() {
    this.autoScrollSubscription?.unsubscribe();
  }

  // #endregion


  // #region Pagination Stuff

  paginateQueriedArticles(): void {
    this.paginationService.paginateData(this.queriedArticles, this.qPage, this.qPageSize).subscribe(
      (data: NewsArticle[]) => {
        this.paginatedQueriedArticles = data;
      }
    );
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
      this.renderer.removeClass(button.nativeElement, 'pag-highlight');
    })
    this.buttons.forEach(button => {
      const buttonText = button.nativeElement.innerHTML.trim();
      if (buttonText == this.qPage) {
        this.renderer.addClass(button.nativeElement, 'pag-highlight')
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
  // #endregion



}
