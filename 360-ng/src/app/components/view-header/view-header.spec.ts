import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ViewHeader, ViewHeaderAction } from './view-header';

describe('ViewHeader', () => {
  let component: ViewHeader;
  let fixture: ComponentFixture<ViewHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHeader, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and description', () => {
    component.title = 'Test Title';
    component.description = 'Test Description';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Test Title');
    expect(compiled.querySelector('p').textContent).toContain('Test Description');
  });

  it('should emit action when button clicked', () => {
    spyOn(component.actionClicked, 'emit');
    
    const testAction: ViewHeaderAction = {
      label: 'Test Action',
      action: 'test-action'
    };
    
    component.actions = [testAction];
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.actionClicked.emit).toHaveBeenCalledWith('test-action');
  });

  it('should not display actions section when no actions provided', () => {
    component.actions = [];
    fixture.detectChanges();

    const actionsSection = fixture.nativeElement.querySelector('.flex.flex-wrap.gap-4');
    expect(actionsSection).toBeFalsy();
  });
});
