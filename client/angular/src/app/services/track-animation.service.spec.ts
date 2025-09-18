import { TestBed } from '@angular/core/testing';

import { TrackAnimationService } from './track-animation.service';

describe('TrackAnimationService', () => {
  let service: TrackAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackAnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
