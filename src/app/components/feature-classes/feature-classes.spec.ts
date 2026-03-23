import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureClasses } from './feature-classes';

describe('FeatureClasses', () => {
  let component: FeatureClasses;
  let fixture: ComponentFixture<FeatureClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureClasses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureClasses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
