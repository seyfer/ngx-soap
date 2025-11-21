import { BearerSecurity } from '../../../src/lib/soap/security/BearerSecurity';

describe('BearerSecurity', () => {
    describe('Constructor', () => {
        it('should create instance with token and defaults', () => {
            const defaults = { timeout: 5000 };
            const security = new (BearerSecurity as any)('test-token-123', defaults);
            
            expect(security._token).toBe('test-token-123');
            expect(security.defaults).toEqual(defaults);
        });

        it('should handle JWT tokens', () => {
            const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            const security = new (BearerSecurity as any)(jwtToken);
            
            expect(security._token).toBe(jwtToken);
        });
    });

    describe('addHeaders', () => {
        it('should add Bearer Authorization header', () => {
            const security = new (BearerSecurity as any)('my-access-token');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe('Bearer my-access-token');
        });

        it('should preserve existing headers and overwrite Authorization', () => {
            const security = new (BearerSecurity as any)('new-token');
            const headers: any = {
                'Content-Type': 'application/json',
                Authorization: 'Basic dXNlcjpwYXNz'
            };
            
            security.addHeaders(headers);
            
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers.Authorization).toBe('Bearer new-token');
        });
    });

    describe('toXML', () => {
        it('should return empty string', () => {
            const security = new (BearerSecurity as any)('token');
            expect(security.toXML()).toBe('');
        });
    });

    describe('addOptions', () => {
        it('should deep merge defaults with existing options', () => {
            const defaults = {
                timeout: 5000,
                headers: { 'X-API-Key': 'key123' },
                config: { nested: { deep: 'value' } }
            };
            const security = new (BearerSecurity as any)('token', defaults);
            const options: any = {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' },
                custom: 'value'
            };
            
            security.addOptions(options);
            
            expect(options.timeout).toBe(5000); // Defaults overwrite
            expect(options.custom).toBe('value');
            expect(options.headers['X-API-Key']).toBe('key123');
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(options.config.nested.deep).toBe('value');
        });
    });

    describe('Integration', () => {
        it('should work in typical OAuth2 API scenario', () => {
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test';
            const security = new (BearerSecurity as any)(accessToken, { timeout: 30000 });
            const headers: any = {};
            const options: any = {};
            
            security.addHeaders(headers);
            security.addOptions(options);
            
            expect(headers.Authorization).toBe(`Bearer ${accessToken}`);
            expect(options.timeout).toBe(30000);
            expect(security.toXML()).toBe('');
        });
    });
});
