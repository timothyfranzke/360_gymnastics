import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PagesService } from '../../services/pages.service';
import { Page, PageBlock } from '../../interfaces/page';
import { ViewHeader } from '../../components/view-header/view-header';
import { PageBlockRenderer } from '../../components/page-block-renderer/page-block-renderer';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-dynamic-page',
  templateUrl: './dynamic-page.html',
  styleUrls: ['./dynamic-page.scss'],
  imports: [CommonModule, ViewHeader, PageBlockRenderer, Header, Footer]
})
export class DynamicPage implements OnInit, OnDestroy {
  page: Page | null = null;
  isLoading = true;
  notFound = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagesService: PagesService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadPage(slug);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPage(slug: string): void {
    this.pagesService.getPageBySlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.page = page;
          this.isLoading = false;
        },
        error: () => {
          this.notFound = true;
          this.isLoading = false;
        }
      });
  }
}
