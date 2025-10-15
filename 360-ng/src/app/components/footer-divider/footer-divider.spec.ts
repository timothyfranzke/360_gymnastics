import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterDivider } from './footer-divider';

describe('FooterDivider', () => {
  let component: FooterDivider;
  let fixture: ComponentFixture<FooterDivider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterDivider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterDivider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
