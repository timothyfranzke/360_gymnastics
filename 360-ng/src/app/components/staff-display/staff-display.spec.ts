import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StaffDisplay } from './staff-display';
import { ApiService } from '../../services/api.service';
import { HomepageStaff } from '../../interfaces/api';

describe('StaffDisplay', () => {
  let component: StaffDisplay;
  let fixture: ComponentFixture<StaffDisplay>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockStaff: HomepageStaff[] = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      position: 'Head Trainer',
      avatar_url: 'https://example.com/avatar1.jpg',
      description: '<p>Experienced trainer with 5+ years...</p>',
      hire_date: '2019-01-15',
      years_at_gym: 5,
      display_order: 1
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      position: 'Assistant Coach',
      avatar_url: null,
      description: '<p>Passionate about helping young gymnasts...</p>',
      hire_date: '2021-06-01',
      years_at_gym: 2,
      display_order: 2
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getHomepageStaff']);

    await TestBed.configureTestingModule({
      imports: [StaffDisplay, BrowserAnimationsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StaffDisplay);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should create', () => {
    mockApiService.getHomepageStaff.and.returnValue(of(mockStaff));
    expect(component).toBeTruthy();
  });

  it('should load staff on init', () => {
    mockApiService.getHomepageStaff.and.returnValue(of(mockStaff));
    
    component.ngOnInit();
    
    expect(mockApiService.getHomepageStaff).toHaveBeenCalled();
    expect(component.staff).toEqual(mockStaff);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle API error', () => {
    const errorMessage = 'API Error';
    mockApiService.getHomepageStaff.and.returnValue(throwError(() => new Error(errorMessage)));
    
    component.ngOnInit();
    
    expect(component.loading).toBeFalse();
    expect(component.error).toBeTruthy();
    expect(component.staff).toEqual([]);
  });

  it('should sort staff by display_order', () => {
    const unsortedStaff = [...mockStaff].reverse();
    mockApiService.getHomepageStaff.and.returnValue(of(unsortedStaff));
    
    component.ngOnInit();
    
    expect(component.staff[0].display_order).toBe(1);
    expect(component.staff[1].display_order).toBe(2);
  });

  it('should get full name correctly', () => {
    const fullName = component.getStaffFullName(mockStaff[0]);
    expect(fullName).toBe('John Doe');
  });

  it('should format years text correctly', () => {
    expect(component.getYearsText(1)).toBe('1 year with us');
    expect(component.getYearsText(5)).toBe('5 years with us');
  });

  it('should generate avatar fallback correctly', () => {
    const fallback = component.getAvatarFallback(mockStaff[0]);
    expect(fallback).toBe('JD');
  });

  it('should validate avatar URL correctly', () => {
    expect(component.hasValidAvatar(mockStaff[0])).toBeTrue();
    expect(component.hasValidAvatar(mockStaff[1])).toBeFalse();
  });

  it('should retry loading staff', () => {
    mockApiService.getHomepageStaff.and.returnValue(of(mockStaff));
    spyOn(component, 'loadStaff' as any);
    
    component.retryLoad();
    
    expect((component as any).loadStaff).toHaveBeenCalled();
  });

  it('should track staff by id', () => {
    const trackResult = component.trackByStaffId(0, mockStaff[0]);
    expect(trackResult).toBe(1);
  });
});