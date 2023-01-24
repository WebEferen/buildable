import { Readiness } from '../../lib/modules/readiness.js';

describe('Readiness', () => {
    it('should check default listeners', () => {
        const readiness = new Readiness();

        expect(readiness.check('Watching for file changes')).toBeTruthy();
        expect(readiness.check('Some Custom Output')).toBeFalsy();
    });
});
