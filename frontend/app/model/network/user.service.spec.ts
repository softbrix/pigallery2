import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NetworkService} from './network.service';
import {UserService} from './user.service';
import {LoginCredential} from '../../../../common/entities/LoginCredential';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import {ShareService} from '../../ui/gallery/share.service';
import {VersionService} from '../version.service';

class MockShareService {
  wait() {
    return Promise.resolve(true);
  }

  isSharing() {
    return false;
  }
}

describe('UserService', () => {


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VersionService,
        UserService,
        SlimLoadingBarService,
        NetworkService,
        {provide: ShareService, useClass: MockShareService}
      ]
    });
  });

  it('should call postJson at login', inject([UserService, NetworkService],
    async (userService: UserService, networkService: NetworkService) => {
      spyOn(networkService, 'postJson');
      const credential = new LoginCredential('name', 'pass');
      await userService.login(credential);
      expect(networkService.postJson).toHaveBeenCalled();
      expect((<any>networkService.postJson).calls.argsFor(0)).toEqual(['/user/login', {'loginCredential': credential}]);
    }));

  it('should call getJson at getSessionUser', inject([UserService, NetworkService],
    async (userService: UserService, networkService: NetworkService) => {
      spyOn(networkService, 'getJson');
      await userService.getSessionUser();
      expect(networkService.getJson).toHaveBeenCalled();
      expect((<any>networkService.getJson).calls.argsFor(0)).toEqual(['/user/login']);
    }));


});

