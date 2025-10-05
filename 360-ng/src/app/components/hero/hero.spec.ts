import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Hero,
        BrowserAnimationsModule,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.animationState).toBe('in');
    expect(component.imageLoaded).toBe(false);
    expect(component.imageError).toBe(false);
    expect(component.showVideoModal).toBe(false);
  });

  it('should handle image load', () => {
    component.onImageLoad();
    expect(component.imageLoaded).toBe(true);
    expect(component.imageError).toBe(false);
  });

  it('should handle image error', () => {
    spyOn(console, 'warn');
    component.onImageError();
    expect(component.imageError).toBe(true);
    expect(component.imageLoaded).toBe(false);
    expect(console.warn).toHaveBeenCalledWith('Failed to load hero image: images/gym1.jpg');
  });

  it('should open video modal', () => {
    component.playVideo();
    expect(component.showVideoModal).toBe(true);
  });

  it('should close video modal', () => {
    component.showVideoModal = true;
    component.closeVideoModal();
    expect(component.showVideoModal).toBe(false);
  });

  it('should close modal on backdrop click', () => {
    component.showVideoModal = true;
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    } as any;
    
    // Same target as current target (backdrop click)
    mockEvent.target = mockEvent.currentTarget;
    component.onModalBackdropClick(mockEvent);
    expect(component.showVideoModal).toBe(false);
  });

  it('should not close modal on content click', () => {
    component.showVideoModal = true;
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    } as any;
    
    // Different target from current target (content click)
    component.onModalBackdropClick(mockEvent);
    expect(component.showVideoModal).toBe(true);
  });
});
