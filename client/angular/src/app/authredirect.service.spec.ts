import { TestBed } from '@angular/core/testing';

import { AuthRedirectService } from './authredirect.service';

describe('AuthredirectService', () => {
  let service: AuthRedirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthRedirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
