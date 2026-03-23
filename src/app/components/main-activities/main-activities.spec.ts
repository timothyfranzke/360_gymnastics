import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainActivities } from './main-activities';

describe('MainActivities', () => {
  let component: MainActivities;
  let fixture: ComponentFixture<MainActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainActivities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
