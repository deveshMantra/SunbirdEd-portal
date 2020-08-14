import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {RecaptchaService} from './recaptcha.service';
import {of} from 'rxjs';
import {ConfigService} from '@sunbird/shared';
import {configureTestSuite} from '@sunbird/test-util';

describe('RecaptchaService', () => {
  configureTestSuite();
  beforeEach(() => TestBed.configureTestingModule({
    providers: [HttpClient, ConfigService],
    imports: [HttpClientTestingModule]
  }));

  it('should be created', () => {
    const service: RecaptchaService = TestBed.get(RecaptchaService);
    const http = TestBed.get(HttpClient);
    const configService = TestBed.get(ConfigService);
    spyOn(http, 'post').and.returnValue(of({result: '123'}));
    const result = service.validateRecaptcha('mock token');
    expect(http.post).toHaveBeenCalled();
    expect(service).toBeTruthy();
    result.subscribe(res => {
      expect(res).toBeDefined();
      expect(res).toEqual({result: '123'});
    });

  });
});
