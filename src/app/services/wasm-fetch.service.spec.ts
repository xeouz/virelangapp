import { TestBed } from '@angular/core/testing';

import { WasmFetchService } from './wasm-fetch.service';

describe('WasmFetchService', () => {
  let service: WasmFetchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasmFetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
