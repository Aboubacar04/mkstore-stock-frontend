import { TestBed } from '@angular/core/testing';

import { ModeleServiceService } from './modele-service.service';

describe('ModeleServiceService', () => {
  let service: ModeleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModeleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
