import {expect} from 'chai';
import {Utils} from '../../../common/Utils';

describe('Utils', () => {
  it('should concat urls', () => {
    expect(Utils.concatUrls('abc', 'cde')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc/', 'cde')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc\\', 'cde')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc/', 'cde/')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('./abc\\', 'cde/')).to.be.equal('./abc/cde');
    expect(Utils.concatUrls('abc/', '\\cde/')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc\\', '\\cde/')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc\\', '/cde/')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc/', '/cde/')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc\\/', '/cde/')).to.be.equal('abc/cde');
    expect(Utils.concatUrls('abc\\/', '/cde/', 'fgh')).to.be.equal('abc/cde/fgh');
  });
});
