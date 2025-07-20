import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursQuickLinks } from './hours-quick-links';

describe('HoursQuickLinks', () => {
  let component: HoursQuickLinks;
  let fixture: ComponentFixture<HoursQuickLinks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursQuickLinks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursQuickLinks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
