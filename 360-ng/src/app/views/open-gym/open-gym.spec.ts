import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenGym } from './open-gym';

describe('OpenGym', () => {
  let component: OpenGym;
  let fixture: ComponentFixture<OpenGym>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenGym]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenGym);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
