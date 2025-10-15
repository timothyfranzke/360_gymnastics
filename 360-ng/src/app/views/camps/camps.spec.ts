import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Camps } from './camps';

describe('Camps', () => {
  let component: Camps;
  let fixture: ComponentFixture<Camps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Camps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Camps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
