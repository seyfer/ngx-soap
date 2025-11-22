import { WSSecurity } from '../../../src/lib/soap/security/WSSecurity';
import { 
    xmlContainsElement, 
    isWellFormedXml,
    isBase64
} from '../../setup/test-helpers';

describe('WSSecurity', () => {
    describe('Constructor', () => {
        it('should create instance with username, password, and string password type', () => {
            const security = new (WSSecurity as any)('testuser', 'testpass', 'PasswordDigest');
            
            expect(security._username).toBe('testuser');
            expect(security._password).toBe('testpass');
            expect(security._passwordType).toBe('PasswordDigest');
            expect(security._hasTimeStamp).toBe(true);
            expect(security._hasTokenCreated).toBe(true);
        });

        it('should accept options object with all settings', () => {
            const options = {
                passwordType: 'PasswordDigest',
                hasTimeStamp: false,
                hasNonce: true,
                hasTokenCreated: false,
                actor: 'http://example.com/actor',
                mustUnderstand: true
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            
            expect(security._passwordType).toBe('PasswordDigest');
            expect(security._hasTimeStamp).toBe(false);
            expect(security._hasNonce).toBe(true);
            expect(security._hasTokenCreated).toBe(false);
            expect(security._actor).toBe('http://example.com/actor');
            expect(security._mustUnderstand).toBe(true);
        });

        it('should default to PasswordText for invalid types', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'InvalidType');
            expect(security._passwordType).toBe('PasswordText');
        });
    });

    describe('toXML - PasswordText Mode', () => {
        it('should generate valid XML with required elements', () => {
            const security = new (WSSecurity as any)('myusername', 'plainpassword', 'PasswordText');
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('<wsse:Security');
            expect(xml).toContain('<wsse:Username>myusername</wsse:Username>');
            expect(xml).toContain('plainpassword');
            expect(xml).toContain('PasswordText');
            expect(xml).toContain('xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"');
        });

        it('should include timestamp by default', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            const xml = security.toXML();
            
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(true);
            expect(xmlContainsElement(xml, 'wsu:Created')).toBe(true);
            expect(xmlContainsElement(xml, 'wsu:Expires')).toBe(true);
        });

        it('should respect hasTimeStamp and hasTokenCreated flags', () => {
            const security = new (WSSecurity as any)('user', 'pass', {
                passwordType: 'PasswordText',
                hasTimeStamp: false,
                hasTokenCreated: false
            });
            const xml = security.toXML();
            
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(false);
            
            const usernameTokenMatch = xml.match(/<wsse:UsernameToken[^>]*>[\s\S]*?<\/wsse:UsernameToken>/);
            expect(usernameTokenMatch).toBeTruthy();
            if (usernameTokenMatch) {
                expect(usernameTokenMatch[0]).not.toContain('<wsu:Created>');
            }
        });

        it('should include actor and mustUnderstand attributes when specified', () => {
            const security = new (WSSecurity as any)('user', 'pass', {
                passwordType: 'PasswordText',
                actor: 'http://example.com/actor',
                mustUnderstand: true
            });
            const xml = security.toXML();
            
            expect(xml).toContain('soap:actor="http://example.com/actor"');
            expect(xml).toContain('soap:mustUnderstand="1"');
        });
    });

    describe('toXML - PasswordDigest Mode', () => {
        it('should generate valid XML with digest and nonce', () => {
            const security = new (WSSecurity as any)('testuser', 'testpass', 'PasswordDigest');
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('PasswordDigest');
            expect(xml).not.toContain('testpass'); // Plain password should not appear
            expect(xmlContainsElement(xml, 'wsse:Nonce')).toBe(true);
        });

        it('should include Base64 encoded nonce and digested password', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            const xml = security.toXML();
            
            const nonceMatch = xml.match(/<wsse:Nonce[^>]*>([^<]+)<\/wsse:Nonce>/);
            const passwordMatch = xml.match(/<wsse:Password[^>]*>([^<]+)<\/wsse:Password>/);
            
            expect(nonceMatch).toBeTruthy();
            expect(passwordMatch).toBeTruthy();
            
            if (nonceMatch && passwordMatch) {
                expect(isBase64(nonceMatch[1])).toBe(true);
                expect(isBase64(passwordMatch[1])).toBe(true);
                expect(passwordMatch[1]).not.toBe('pass'); // Should be digested
            }
        });

        it('should generate different nonces on each call', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            const xml1 = security.toXML();
            const xml2 = security.toXML();
            
            const nonceMatch1 = xml1.match(/<wsse:Nonce[^>]*>([^<]+)<\/wsse:Nonce>/);
            const nonceMatch2 = xml2.match(/<wsse:Nonce[^>]*>([^<]+)<\/wsse:Nonce>/);
            
            expect(nonceMatch1?.[1]).not.toBe(nonceMatch2?.[1]);
        });
    });

    describe('Timestamp Handling', () => {
        it('should generate ISO 8601 timestamps with 10 minute expiry', () => {
            const security = new (WSSecurity as any)('user', 'pass');
            const xml = security.toXML();
            
            const createdMatch = xml.match(/<wsu:Created>([^<]+)<\/wsu:Created>/);
            const expiresMatch = xml.match(/<wsu:Expires>([^<]+)<\/wsu:Expires>/);
            
            expect(createdMatch).toBeTruthy();
            expect(expiresMatch).toBeTruthy();
            
            if (createdMatch && expiresMatch) {
                expect(createdMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
                
                const created = new Date(createdMatch[1]);
                const expires = new Date(expiresMatch[1]);
                const diffMinutes = (expires.getTime() - created.getTime()) / (1000 * 60);
                
                expect(diffMinutes).toBeCloseTo(10, 0);
            }
        });

        it('should have proper timestamp and token IDs', () => {
            const security = new (WSSecurity as any)('user', 'pass');
            const xml = security.toXML();
            
            const timestampIdMatch = xml.match(/<wsu:Timestamp wsu:Id="([^"]+)"/);
            const tokenIdMatch = xml.match(/<wsse:UsernameToken[^>]*wsu:Id="([^"]+)"/);
            
            expect(timestampIdMatch?.[1]).toMatch(/^Timestamp-/);
            expect(tokenIdMatch?.[1]).toMatch(/^SecurityToken-/);
        });
    });

    describe('Special Characters', () => {
        it('should handle special characters in credentials', () => {
            const security = new (WSSecurity as any)('user@domain.com', 'p@ssw0rd!<>&"', 'PasswordText');
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:Username>user@domain.com</wsse:Username>');
            expect(xml).toContain('p@ssw0rd!<>&"');
        });
    });

    describe('Integration', () => {
        it('should work with all options enabled', () => {
            const options = {
                passwordType: 'PasswordDigest',
                hasTimeStamp: true,
                hasNonce: true,
                hasTokenCreated: true,
                actor: 'http://example.com/actor',
                mustUnderstand: true
            };
            const security = new (WSSecurity as any)('apiuser', 'apipass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('PasswordDigest');
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(true);
            expect(xmlContainsElement(xml, 'wsse:Nonce')).toBe(true);
            expect(xml).toContain('soap:actor="http://example.com/actor"');
            expect(xml).toContain('soap:mustUnderstand="1"');
        });

        it('should work with minimal options', () => {
            const options = {
                passwordType: 'PasswordText',
                hasTimeStamp: false,
                hasTokenCreated: false
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('PasswordText');
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(false);
        });
    });

    describe('Custom XML Element (appendElement)', () => {
        it('should append custom XML element when specified', () => {
            const customElement = '<custom:Token xmlns:custom="http://example.com/custom">ABC123</custom:Token>';
            const options = {
                passwordType: 'PasswordText',
                appendElement: customElement
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain(customElement);
            // Verify it's before closing Security tag
            const customIndex = xml.indexOf(customElement);
            const securityCloseIndex = xml.indexOf('</wsse:Security>');
            expect(customIndex).toBeGreaterThan(-1);
            expect(customIndex).toBeLessThan(securityCloseIndex);
        });

        it('should work without appendElement (default empty string)', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('</wsse:UsernameToken>');
            expect(xml).toContain('</wsse:Security>');
        });

        it('should handle empty appendElement', () => {
            const options = {
                passwordType: 'PasswordText',
                appendElement: ''
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
        });

        it('should support complex custom XML elements', () => {
            const customElement = '<custom:Data><custom:Field1>Value1</custom:Field1><custom:Field2>Value2</custom:Field2></custom:Data>';
            const options = {
                passwordType: 'PasswordText',
                appendElement: customElement
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(xml).toContain('<custom:Field1>Value1</custom:Field1>');
            expect(xml).toContain('<custom:Field2>Value2</custom:Field2>');
        });
    });

    describe('Custom Envelope Prefix (envelopeKey)', () => {
        it('should use custom envelope key for actor and mustUnderstand', () => {
            const options = {
                passwordType: 'PasswordText',
                actor: 'http://example.com/actor',
                mustUnderstand: true,
                envelopeKey: 'SOAP-ENV'
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(xml).toContain('SOAP-ENV:actor="http://example.com/actor"');
            expect(xml).toContain('SOAP-ENV:mustUnderstand="1"');
            expect(xml).not.toContain('soap:actor');
            expect(xml).not.toContain('soap:mustUnderstand');
        });

        it('should default to "soap" prefix when envelopeKey not specified', () => {
            const options = {
                passwordType: 'PasswordText',
                actor: 'http://example.com/actor',
                mustUnderstand: true
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(xml).toContain('soap:actor="http://example.com/actor"');
            expect(xml).toContain('soap:mustUnderstand="1"');
        });

        it('should work with custom envelope key without actor/mustUnderstand', () => {
            const options = {
                passwordType: 'PasswordText',
                envelopeKey: 'env'
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            // Should not have actor/mustUnderstand at all
            expect(xml).not.toContain('env:actor');
            expect(xml).not.toContain('env:mustUnderstand');
        });
    });

    describe('Combined Features', () => {
        it('should work with both appendElement and envelopeKey', () => {
            const customElement = '<custom:Token>XYZ789</custom:Token>';
            const options = {
                passwordType: 'PasswordText',
                appendElement: customElement,
                envelopeKey: 'SOAP-ENV',
                actor: 'http://example.com/actor',
                mustUnderstand: true
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain(customElement);
            expect(xml).toContain('SOAP-ENV:actor="http://example.com/actor"');
            expect(xml).toContain('SOAP-ENV:mustUnderstand="1"');
        });

        it('should work with all features combined', () => {
            const customElement = '<custom:SessionId>SESSION-12345</custom:SessionId>';
            const options = {
                passwordType: 'PasswordDigest',
                hasTimeStamp: true,
                hasNonce: true,
                hasTokenCreated: true,
                actor: 'http://example.com/actor',
                mustUnderstand: true,
                appendElement: customElement,
                envelopeKey: 'soapenv'
            };
            const security = new (WSSecurity as any)('apiuser', 'secretpass', options);
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('PasswordDigest');
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(true);
            expect(xmlContainsElement(xml, 'wsse:Nonce')).toBe(true);
            expect(xml).toContain('soapenv:actor="http://example.com/actor"');
            expect(xml).toContain('soapenv:mustUnderstand="1"');
            expect(xml).toContain(customElement);
        });
    });
});
