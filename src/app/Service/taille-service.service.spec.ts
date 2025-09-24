import { TestBed } from '@angular/core/testing';

import { TailleServiceService } from './taille-service.service';

describe('TailleServiceService', () => {
  let service: TailleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TailleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
