import { BasicAuthSecurity } from '../../../src/lib/soap/security/BasicAuthSecurity';
import { decodeBase64, isBase64 } from '../../setup/test-helpers';

describe('BasicAuthSecurity', () => {
    describe('Constructor', () => {
        it('should create instance with credentials and defaults', () => {
            const defaults = { timeout: 5000, headers: { 'X-Custom': 'value' } };
            const security = new (BasicAuthSecurity as any)('testuser', 'testpass', defaults);
            
            expect(security._username).toBe('testuser');
            expect(security._password).toBe('testpass');
            expect(security.defaults).toEqual(defaults);
        });
    });

    describe('addHeaders', () => {
        it('should add Base64 encoded Basic Authorization header', () => {
            const security = new (BasicAuthSecurity as any)('myuser', 'mypassword');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            expect(isBase64(base64Part)).toBe(true);
            expect(decodeBase64(base64Part)).toBe('myuser:mypassword');
        });

        it('should handle special characters', () => {
            const security = new (BasicAuthSecurity as any)('user@domain.com', 'p@ssw0rd:special');
            const headers: any = {};
            
            security.addHeaders(headers);
            
            const base64Part = headers.Authorization.replace('Basic ', '');
            expect(decodeBase64(base64Part)).toBe('user@domain.com:p@ssw0rd:special');
        });

        it('should preserve existing headers', () => {
            const security = new (BasicAuthSecurity as any)('user', 'pass');
            const headers: any = { 'Content-Type': 'application/json', Authorization: 'Bearer old' };
            
            security.addHeaders(headers);
            
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers.Authorization).toMatch(/^Basic /);
        });
    });

    describe('toXML', () => {
        it('should return empty string', () => {
            const security = new (BasicAuthSecurity as any)('user', 'pass');
            expect(security.toXML()).toBe('');
        });
    });

    describe('addOptions', () => {
        it('should deep merge defaults with existing options', () => {
            const defaults = {
                timeout: 5000,
                headers: { 'X-Custom': 'value1' },
                config: { nested: { deep: 'value' } }
            };
            const security = new (BasicAuthSecurity as any)('user', 'pass', defaults);
            const options: any = {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' },
                custom: 'value'
            };
            
            security.addOptions(options);
            
            expect(options.timeout).toBe(5000); // Defaults overwrite
            expect(options.custom).toBe('value');
            expect(options.headers['X-Custom']).toBe('value1');
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(options.config.nested.deep).toBe('value');
        });
    });

    describe('Integration', () => {
        it('should work in typical SOAP client scenario', () => {
            const security = new (BasicAuthSecurity as any)('api-user', 'api-secret', { timeout: 30000 });
            const headers: any = {};
            const options: any = {};
            
            security.addHeaders(headers);
            security.addOptions(options);
            
            const decoded = decodeBase64(headers.Authorization.replace('Basic ', ''));
            expect(decoded).toBe('api-user:api-secret');
            expect(options.timeout).toBe(30000);
            expect(security.toXML()).toBe('');
        });
    });
});

