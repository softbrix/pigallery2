import {expect} from 'chai';
import {AuthenticationMWs} from '../../../../../backend/middlewares/user/AuthenticationMWs';
import {ErrorCodes, ErrorDTO} from '../../../../../common/entities/Error';
import {UserDTO, UserRoles} from '../../../../../common/entities/UserDTO';
import {ObjectManagers} from '../../../../../backend/model/ObjectManagers';
import {UserManager} from '../../../../../backend/model/memory/UserManager';
import {Config} from '../../../../../common/config/private/Config';
import {IUserManager} from '../../../../../backend/model/interfaces/IUserManager';
import * as path from 'path';


declare const describe: any;
declare const it: any;
declare const beforeEach: any;

describe('Authentication middleware', () => {

  beforeEach(() => {
    ObjectManagers.reset();
  });

  describe('authenticate', () => {
    it('should call next on authenticated', (done: () => void) => {
      const req: any = {
        session: {
          user: 'A user'
        },
        sessionOptions: {},
        query: {},
        params: {}
      };
      const next = (err: ErrorDTO) => {
        expect(err).to.be.undefined;
        done();
      };
      AuthenticationMWs.authenticate(req, null, next);

    });

    it('should call next with error on not authenticated', (done: () => void) => {
      const req: any = {
        session: {},
        sessionOptions: {},
        query: {},
        params: {}
      };
      Config.Client.authenticationRequired = true;
      const next = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.NOT_AUTHENTICATED);
        done();
      };
      AuthenticationMWs.authenticate(req, null, next);

    });
  });


  describe('authorisePath', () => {

    const req = {
      session: {
        user: {permissions: <string[]>null}
      },
      sessionOptions: {},
      query: {},
      params: {
        path: '/test'
      }
    };


    const authoriseDirPath = AuthenticationMWs.authorisePath('path', true);
    const test = (relativePath: string): Promise<string | number> => {
      return new Promise((resolve) => {
        req.params.path = path.normalize(relativePath);
        authoriseDirPath(<any>req, <any>{sendStatus: resolve}, () => {
          resolve('ok');
        });
        resolve();
      });
    };

    it('should catch unauthorized path usage', async () => {
      req.session.user.permissions = [path.normalize('/sub/subsub')];
      expect(await test('/sub/subsub')).to.be.eql('ok');
      expect(await test('/test')).to.be.eql(403);
      expect(await test('/')).to.be.eql(403);
      expect(await test('/sub/test')).to.be.eql(403);
      expect(await test('/sub/subsub/test')).to.be.eql(403);
      expect(await test('/sub/subsub/test/test2')).to.be.eql(403);
      req.session.user.permissions = [path.normalize('/sub/subsub'), path.normalize('/sub/subsub2')];
      expect(await test('/sub/subsub2')).to.be.eql('ok');
      expect(await test('/sub/subsub')).to.be.eql('ok');
      expect(await test('/test')).to.be.eql(403);
      expect(await test('/')).to.be.eql(403);
      expect(await test('/sub/test')).to.be.eql(403);
      expect(await test('/sub/subsub/test')).to.be.eql(403);
      expect(await test('/sub/subsub2/test')).to.be.eql(403);
      req.session.user.permissions = [path.normalize('/sub/subsub*')];
      expect(await test('/b')).to.be.eql(403);
      expect(await test('/sub')).to.be.eql(403);
      expect(await test('/sub/subsub2')).to.be.eql(403);
      expect(await test('/sub/subsub2/test')).to.be.eql(403);
      expect(await test('/sub/subsub')).to.be.eql('ok');
      expect(await test('/sub/subsub/test')).to.be.eql('ok');
      expect(await test('/sub/subsub/test/two')).to.be.eql('ok');
    });

  });

  describe('inverseAuthenticate', () => {

    it('should call next with error on authenticated', (done: () => void) => {
      const req: any = {
        session: {},
        sessionOptions: {},
      };
      const res: any = {};
      const next: any = (err: ErrorDTO) => {
        expect(err).to.be.undefined;
        done();
      };
      AuthenticationMWs.inverseAuthenticate(req, null, next);

    });


    it('should call next error on authenticated', (done: () => void) => {
      const req: any = {
        session: {
          user: 'A user'
        },
        sessionOptions: {},
      };
      const next = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.ALREADY_AUTHENTICATED);
        done();
      };
      AuthenticationMWs.inverseAuthenticate(req, null, next);

    });
  });

  describe('authorise', () => {
    it('should call next on authorised', (done: () => void) => {
      const req: any = {
        session: {
          user: {
            role: UserRoles.LimitedGuest
          }
        },
        sessionOptions: {}
      };
      const next = (err: ErrorDTO) => {
        expect(err).to.be.undefined;
        done();
      };
      AuthenticationMWs.authorise(UserRoles.LimitedGuest)(req, null, next);

    });

    it('should call next with error on not authorised', (done: () => void) => {
      const req: any = {
        session: {
          user: {
            role: UserRoles.LimitedGuest
          }
        },
        sessionOptions: {}
      };
      const next = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.NOT_AUTHORISED);
        done();
      };
      AuthenticationMWs.authorise(UserRoles.Developer)(req, null, next);

    });
  });

  describe('login', () => {
    beforeEach(() => {
      ObjectManagers.reset();
    });

    describe('should call input ErrorDTO next on missing...', () => {
      it('body', (done: () => void) => {
        const req: any = {
          query: {},
          params: {}
        };
        const next = (err: ErrorDTO) => {
          expect(err).not.to.be.undefined;
          expect(err.code).to.be.eql(ErrorCodes.INPUT_ERROR);
          done();
        };
        AuthenticationMWs.login(req, null, next);

      });

      it('loginCredential', (done: () => void) => {
        const req: any = {
          body: {},
          query: {},
          params: {}
        };
        const next = (err: ErrorDTO) => {
          expect(err).not.to.be.undefined;
          expect(err.code).to.be.eql(ErrorCodes.INPUT_ERROR);
          done();
        };
        AuthenticationMWs.login(req, null, next);


      });


      it('loginCredential content', (done: () => void) => {
        const req: any = {
          body: {loginCredential: {}},
          query: {},
          params: {}
        };
        const next = (err: ErrorDTO) => {
          expect(err).not.to.be.undefined;
          expect(err.code).to.be.eql(ErrorCodes.INPUT_ERROR);
          done();
        };
        AuthenticationMWs.login(req, null, next);


      });

    });
    it('should call next with error on not finding user', (done: () => void) => {
      const req: any = {
        body: {
          loginCredential: {
            username: 'aa',
            password: 'bb'
          }
        },
        query: {},
        params: {}
      };
      const next = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.CREDENTIAL_NOT_FOUND);
        done();
      };
      ObjectManagers.getInstance().UserManager = <UserManager>{
        findOne: (filter): Promise<UserDTO> => {
          return Promise.reject(null);
        }
      };
      AuthenticationMWs.login(req, null, next);


    });

    it('should call next with user on the session on  finding user', (done: () => void) => {
      const req: any = {
        session: {},
        body: {
          loginCredential: {
            username: 'aa',
            password: 'bb'
          }
        },
        query: {},
        params: {}
      };
      const next = (err: ErrorDTO) => {
        expect(err).to.be.undefined;
        expect(req.session.user).to.be.eql('test user');
        done();
      };
      ObjectManagers.getInstance().UserManager = <IUserManager>{
        findOne: (filter) => {
          return Promise.resolve(<any>'test user');
        }
      };
      AuthenticationMWs.login(req, null, next);


    });
  });


  describe('logout', () => {
    it('should call next on logout', (done: () => void) => {
      const req: any = {
        session: {
          user: {
            role: UserRoles.LimitedGuest
          }
        }
      };
      const next: any = (err: ErrorDTO) => {
        expect(err).to.be.undefined;
        expect(req.session.user).to.be.undefined;
        done();
      };
      AuthenticationMWs.logout(req, null, next);

    });

  });

});
