import { BearerSecurity } from '../../../src/lib/soap/security/BearerSecurity';

describe('BearerSecurity', () => {
    describe('Constructor', () => {
        it('should create instance with token', () => {
            const security = new (BearerSecurity as any)('test-token-123');
            
            expect(security._token).toBe('test-token-123');
            expect(security.defaults).toEqual({});
        });

        it('should create instance with defaults', () => {
            const defaults = { timeout: 5000, headers: { 'X-Custom': 'value' } };
            const security = new (BearerSecurity as any)('token', defaults);
            
            expect(security.defaults).toEqual(defaults);
        });

        it('should handle undefined defaults', () => {
            const security = new (BearerSecurity as any)('token', undefined);
            
            expect(security.defaults).toEqual({});
        });

        it('should handle JWT tokens', () => {
            const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            const security = new (BearerSecurity as any)(jwtToken);
            
            expect(security._token).toBe(jwtToken);
        });

        it('should handle empty token', () => {
            const security = new (BearerSecurity as any)('');
            
            expect(security._token).toBe('');
        });

        it('should merge nested defaults', () => {
            const defaults = {
                headers: { 'X-Custom-1': 'value1' },
                options: { retry: true }
            };
            const security = new (BearerSecurity as any)('token', defaults);
            
            expect(security.defaults.headers).toEqual({ 'X-Custom-1': 'value1' });
            expect(security.defaults.options).toEqual({ retry: true });
        });
    });

    describe('addHeaders', () => {
        it('should add Bearer Authorization header', () => {
            const security = new (BearerSecurity as any)('my-access-token');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe('Bearer my-access-token');
        });

        it('should handle JWT token format', () => {
            const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            const security = new (BearerSecurity as any)(jwtToken);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe(`Bearer ${jwtToken}`);
        });

        it('should handle empty token', () => {
            const security = new (BearerSecurity as any)('');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe('Bearer ');
        });

        it('should handle token with special characters', () => {
            const token = 'token-with_special.chars+123=';
            const security = new (BearerSecurity as any)(token);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe(`Bearer ${token}`);
        });

        it('should not modify existing headers', () => {
            const security = new (BearerSecurity as any)('token');
            const headers: any = {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'value',
                'Accept': 'application/xml'
            };
            
            security.addHeaders(headers);
            
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['X-Custom-Header']).toBe('value');
            expect(headers['Accept']).toBe('application/xml');
            expect(headers.Authorization).toBe('Bearer token');
        });

        it('should overwrite existing Authorization header', () => {
            const security = new (BearerSecurity as any)('new-token');
            const headers: any = {
                Authorization: 'Basic dXNlcjpwYXNz'
            };
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe('Bearer new-token');
        });

        it('should handle very long tokens', () => {
            const longToken = 'a'.repeat(1000);
            const security = new (BearerSecurity as any)(longToken);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe(`Bearer ${longToken}`);
        });

        it('should handle tokens with spaces (though invalid)', () => {
            const tokenWithSpaces = 'token with spaces';
            const security = new (BearerSecurity as any)(tokenWithSpaces);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe('Bearer token with spaces');
        });
    });

    describe('toXML', () => {
        it('should return empty string', () => {
            const security = new (BearerSecurity as any)('token');
            
            const xml = security.toXML();
            
            expect(xml).toBe('');
        });

        it('should always return empty string regardless of token', () => {
            const security1 = new (BearerSecurity as any)('');
            const security2 = new (BearerSecurity as any)('short-token');
            const security3 = new (BearerSecurity as any)('very-long-token-' + 'x'.repeat(500));
            
            expect(security1.toXML()).toBe('');
            expect(security2.toXML()).toBe('');
            expect(security3.toXML()).toBe('');
        });
    });

    describe('addOptions', () => {
        it('should merge defaults into options', () => {
            const defaults = { timeout: 5000, retry: true };
            const security = new (BearerSecurity as any)('token', defaults);
            const options: any = {};
            
            security.addOptions(options);
            
            expect(options.timeout).toBe(5000);
            expect(options.retry).toBe(true);
        });

        it('should merge with existing options', () => {
            const defaults = { timeout: 5000, newProp: 'fromDefaults' };
            const security = new (BearerSecurity as any)('token', defaults);
            const options: any = { timeout: 10000, custom: 'value' };
            
            security.addOptions(options);
            
            // Lodash merge will overwrite with defaults
            expect(options.timeout).toBe(5000);
            expect(options.custom).toBe('value');
            expect(options.newProp).toBe('fromDefaults');
        });

        it('should handle empty defaults', () => {
            const security = new (BearerSecurity as any)('token', {});
            const options: any = { existing: 'value' };
            
            security.addOptions(options);
            
            expect(options.existing).toBe('value');
        });

        it('should deep merge nested defaults', () => {
            const defaults = {
                headers: { 'X-API-Key': 'key123' },
                config: { nested: { deep: 'value' } }
            };
            const security = new (BearerSecurity as any)('token', defaults);
            const options: any = {
                headers: { 'Content-Type': 'application/json' }
            };
            
            security.addOptions(options);
            
            expect(options.headers['X-API-Key']).toBe('key123');
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(options.config.nested.deep).toBe('value');
        });

        it('should handle multiple option merges', () => {
            const defaults = { prop1: 'value1', prop2: 'value2' };
            const security = new (BearerSecurity as any)('token', defaults);
            const options1: any = {};
            const options2: any = { prop2: 'override', prop3: 'new' };
            
            security.addOptions(options1);
            security.addOptions(options2);
            
            expect(options1.prop1).toBe('value1');
            expect(options1.prop2).toBe('value2');
            expect(options2.prop1).toBe('value1');
            expect(options2.prop2).toBe('value2'); // Defaults overwrite
            expect(options2.prop3).toBe('new');
        });
    });

    describe('Integration', () => {
        it('should work in typical OAuth2 API scenario', () => {
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            const security = new (BearerSecurity as any)(accessToken, {
                timeout: 30000,
                strictSSL: true
            });
            
            const headers: any = {};
            const options: any = {};
            
            security.addHeaders(headers);
            security.addOptions(options);
            
            expect(headers.Authorization).toBe(`Bearer ${accessToken}`);
            expect(options.timeout).toBe(30000);
            expect(options.strictSSL).toBe(true);
            expect(security.toXML()).toBe('');
        });

        it('should create multiple instances with different tokens', () => {
            const token1 = 'user1-token';
            const token2 = 'user2-token';
            
            const security1 = new (BearerSecurity as any)(token1);
            const security2 = new (BearerSecurity as any)(token2);
            
            const headers1: any = {};
            const headers2: any = {};
            
            security1.addHeaders(headers1);
            security2.addHeaders(headers2);
            
            expect(headers1.Authorization).toBe('Bearer user1-token');
            expect(headers2.Authorization).toBe('Bearer user2-token');
            expect(headers1.Authorization).not.toBe(headers2.Authorization);
        });

        it('should support token refresh workflow', () => {
            let currentToken = 'initial-token';
            const security = new (BearerSecurity as any)(currentToken);
            
            const headers1: any = {};
            security.addHeaders(headers1);
            expect(headers1.Authorization).toBe('Bearer initial-token');
            
            // Simulate token refresh
            currentToken = 'refreshed-token';
            const security2 = new (BearerSecurity as any)(currentToken);
            
            const headers2: any = {};
            security2.addHeaders(headers2);
            expect(headers2.Authorization).toBe('Bearer refreshed-token');
        });

        it('should work with different default configurations', () => {
            const security1 = new (BearerSecurity as any)('token', { timeout: 5000 });
            const security2 = new (BearerSecurity as any)('token', { timeout: 10000, retry: true });
            
            const options1: any = {};
            const options2: any = {};
            
            security1.addOptions(options1);
            security2.addOptions(options2);
            
            expect(options1.timeout).toBe(5000);
            expect(options1.retry).toBeUndefined();
            expect(options2.timeout).toBe(10000);
            expect(options2.retry).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null token (converted to string)', () => {
            const security = new (BearerSecurity as any)(null);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBeDefined();
        });

        it('should handle undefined token (converted to string)', () => {
            const security = new (BearerSecurity as any)(undefined);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBeDefined();
        });

        it('should handle numeric token', () => {
            const security = new (BearerSecurity as any)(12345);
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBe('Bearer 12345');
        });
    });
});

