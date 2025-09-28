import { TestBed } from '@angular/core/testing';

import { UserServieService } from './user-servie.service';

describe('UserServieService', () => {
  let service: UserServieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserServieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
