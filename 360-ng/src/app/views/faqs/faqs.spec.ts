import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Faqs } from './faqs';
import { ApiService } from '../../services/api.service';
import { ViewHeader } from '../../components/view-header/view-header';

describe('Faqs', () => {
  let component: Faqs;
  let fixture: ComponentFixture<Faqs>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockFaqs = [
    {
      id: 1,
      question: 'What are your hours?',
      answer: 'We are open Monday-Friday 9am-8pm',
      category: 'General',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      question: 'Do you offer birthday parties?',
      answer: 'Yes, we offer birthday party packages',
      category: 'Parties',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getFaqs', 'getFaqCategories']);

    await TestBed.configureTestingModule({
      imports: [
        Faqs,
        ReactiveFormsModule,
        NoopAnimationsModule,
        ViewHeader
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Faqs);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    mockApiService.getFaqs.and.returnValue(of(mockFaqs));
    mockApiService.getFaqCategories.and.returnValue(of({ data: ['General', 'Parties'] }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load FAQs on init', () => {
    component.ngOnInit();
    expect(mockApiService.getFaqs).toHaveBeenCalled();
    expect(component.faqs).toEqual(mockFaqs);
    expect(component.isLoading).toBeFalse();
  });

  it('should load categories on init', () => {
    component.ngOnInit();
    expect(mockApiService.getFaqCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(['General', 'Parties']);
  });

  it('should handle FAQ loading error', () => {
    mockApiService.getFaqs.and.returnValue(throwError(() => new Error('Network error')));
    
    component.ngOnInit();
    expect(component.error).toBe('Network error');
    expect(component.isLoading).toBeFalse();
    expect(component.faqs).toEqual([]);
  });

  it('should toggle FAQ expansion', () => {
    component.toggleFaq(1);
    expect(component.isFaqExpanded(1)).toBeTrue();
    
    component.toggleFaq(1);
    expect(component.isFaqExpanded(1)).toBeFalse();
  });

  it('should group FAQs by category', () => {
    component.faqs = mockFaqs;
    const grouped = component.getFaqsByCategory();
    
    expect(grouped['General']).toBeDefined();
    expect(grouped['Parties']).toBeDefined();
    expect(grouped['General'].length).toBe(1);
    expect(grouped['Parties'].length).toBe(1);
  });

  it('should filter categories based on selection', () => {
    component.faqs = mockFaqs;
    component.filterForm.patchValue({ category: 'General' });
    
    const filteredCategories = component.getFilteredCategories();
    expect(filteredCategories).toEqual(['General']);
  });

  it('should clear filters', () => {
    component.filterForm.patchValue({ category: 'General', search: 'test' });
    component.clearFilters();
    
    expect(component.filterForm.value.category).toBe('');
    expect(component.filterForm.value.search).toBe('');
    expect(mockApiService.getFaqs).toHaveBeenCalled();
  });
});