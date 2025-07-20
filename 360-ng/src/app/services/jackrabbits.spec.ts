import { TestBed } from '@angular/core/testing';

import { JackrabbitService } from './jackrabbits';

describe('JackrabbitService', () => {
  let service: JackrabbitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Jackrabbits);
  });

  it('should be created', () =>  {
    expect(service).toBeTruthy();
  });
});
