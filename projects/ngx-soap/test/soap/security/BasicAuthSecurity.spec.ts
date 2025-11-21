import { BasicAuthSecurity } from '../../../src/lib/soap/security/BasicAuthSecurity';
import { decodeBase64, isBase64 } from '../../setup/test-helpers';

describe('BasicAuthSecurity', () => {
    describe('Constructor', () => {
        it('should create instance with username and password', () => {
            const security = new (BasicAuthSecurity as any)('testuser', 'testpass');
            
            expect(security._username).toBe('testuser');
            expect(security._password).toBe('testpass');
            expect(security.defaults).toEqual({});
        });

        it('should create instance with defaults', () => {
            const defaults = { timeout: 5000, headers: { 'X-Custom': 'value' } };
            const security = new (BasicAuthSecurity as any)('user', 'pass', defaults);
            
            expect(security.defaults).toEqual(defaults);
        });

        it('should handle undefined defaults', () => {
            const security = new (BasicAuthSecurity as any)('user', 'pass', undefined);
            
            expect(security.defaults).toEqual({});
        });

        it('should merge nested defaults', () => {
            const defaults = { 
                headers: { 'X-Custom-1': 'value1' },
                options: { retry: true }
            };
            const security = new (BasicAuthSecurity as any)('user', 'pass', defaults);
            
            expect(security.defaults.headers).toEqual({ 'X-Custom-1': 'value1' });
            expect(security.defaults.options).toEqual({ retry: true });
        });
    });

    describe('addHeaders', () => {
        it('should add Basic Authorization header', () => {
            const security = new (BasicAuthSecurity as any)('testuser', 'testpass');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBeDefined();
            expect(headers.Authorization).toMatch(/^Basic /);
        });

        it('should encode credentials in Base64', () => {
            const security = new (BasicAuthSecurity as any)('myuser', 'mypassword');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            expect(isBase64(base64Part)).toBe(true);
            
            const decoded = decodeBase64(base64Part);
            expect(decoded).toBe('myuser:mypassword');
        });

        it('should handle special characters in credentials', () => {
            const security = new (BasicAuthSecurity as any)('user@domain.com', 'p@ssw0rd:special');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            const decoded = decodeBase64(base64Part);
            expect(decoded).toBe('user@domain.com:p@ssw0rd:special');
        });

        it('should handle empty username', () => {
            const security = new (BasicAuthSecurity as any)('', 'password');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            const decoded = decodeBase64(base64Part);
            expect(decoded).toBe(':password');
        });

        it('should handle empty password', () => {
            const security = new (BasicAuthSecurity as any)('username', '');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            const decoded = decodeBase64(base64Part);
            expect(decoded).toBe('username:');
        });

        it('should handle both empty credentials', () => {
            const security = new (BasicAuthSecurity as any)('', '');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            const decoded = decodeBase64(base64Part);
            expect(decoded).toBe(':');
        });

        it('should handle unicode characters', () => {
            const security = new (BasicAuthSecurity as any)('用户', '密码');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toBeDefined();
            expect(headers.Authorization).toMatch(/^Basic /);
        });

        it('should not modify existing headers', () => {
            const security = new (BasicAuthSecurity as any)('user', 'pass');
            const headers: any = {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'value'
            };
            
            security.addHeaders(headers);
            
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['X-Custom-Header']).toBe('value');
            expect(headers.Authorization).toBeDefined();
        });

        it('should overwrite existing Authorization header', () => {
            const security = new (BasicAuthSecurity as any)('newuser', 'newpass');
            const headers: any = {
                Authorization: 'Bearer old-token'
            };
            
            security.addHeaders(headers);
            
            expect(headers.Authorization).toMatch(/^Basic /);
            expect(headers.Authorization).not.toContain('Bearer');
        });
    });

    describe('toXML', () => {
        it('should return empty string', () => {
            const security = new (BasicAuthSecurity as any)('user', 'pass');
            
            const xml = security.toXML();
            
            expect(xml).toBe('');
        });

        it('should always return empty string regardless of credentials', () => {
            const security1 = new (BasicAuthSecurity as any)('', '');
            const security2 = new (BasicAuthSecurity as any)('user', 'pass');
            const security3 = new (BasicAuthSecurity as any)('admin', 'secret123');
            
            expect(security1.toXML()).toBe('');
            expect(security2.toXML()).toBe('');
            expect(security3.toXML()).toBe('');
        });
    });

    describe('addOptions', () => {
        it('should merge defaults into options', () => {
            const defaults = { timeout: 5000, retry: true };
            const security = new (BasicAuthSecurity as any)('user', 'pass', defaults);
            const options: any = {};
            
            security.addOptions(options);
            
            expect(options.timeout).toBe(5000);
            expect(options.retry).toBe(true);
        });

        it('should merge with existing options', () => {
            const defaults = { timeout: 5000, newProp: 'fromDefaults' };
            const security = new (BasicAuthSecurity as any)('user', 'pass', defaults);
            const options: any = { timeout: 10000, custom: 'value' };
            
            security.addOptions(options);
            
            // Lodash merge will overwrite with defaults
            expect(options.timeout).toBe(5000);
            expect(options.custom).toBe('value');
            expect(options.newProp).toBe('fromDefaults');
        });

        it('should handle empty defaults', () => {
            const security = new (BasicAuthSecurity as any)('user', 'pass', {});
            const options: any = { existing: 'value' };
            
            security.addOptions(options);
            
            expect(options.existing).toBe('value');
        });

        it('should deep merge nested defaults', () => {
            const defaults = {
                headers: { 'X-Custom': 'value1' },
                config: { nested: { deep: 'value' } }
            };
            const security = new (BasicAuthSecurity as any)('user', 'pass', defaults);
            const options: any = {
                headers: { 'Content-Type': 'application/json' }
            };
            
            security.addOptions(options);
            
            expect(options.headers['X-Custom']).toBe('value1');
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(options.config.nested.deep).toBe('value');
        });
    });

    describe('Integration', () => {
        it('should work in typical SOAP client scenario', () => {
            const security = new (BasicAuthSecurity as any)('api-user', 'api-secret', {
                timeout: 30000,
                strictSSL: false
            });
            
            const headers: any = {};
            const options: any = {};
            
            security.addHeaders(headers);
            security.addOptions(options);
            
            expect(headers.Authorization).toBeDefined();
            expect(headers.Authorization).toMatch(/^Basic /);
            expect(options.timeout).toBe(30000);
            expect(options.strictSSL).toBe(false);
            expect(security.toXML()).toBe('');
        });

        it('should create multiple instances with different credentials', () => {
            const security1 = new (BasicAuthSecurity as any)('user1', 'pass1');
            const security2 = new (BasicAuthSecurity as any)('user2', 'pass2');
            
            const headers1: any = {};
            const headers2: any = {};
            
            security1.addHeaders(headers1);
            security2.addHeaders(headers2);
            
            expect(headers1.Authorization).not.toBe(headers2.Authorization);
            
            const decoded1 = decodeBase64(headers1.Authorization.replace('Basic ', ''));
            const decoded2 = decodeBase64(headers2.Authorization.replace('Basic ', ''));
            
            expect(decoded1).toBe('user1:pass1');
            expect(decoded2).toBe('user2:pass2');
        });
    });
});

