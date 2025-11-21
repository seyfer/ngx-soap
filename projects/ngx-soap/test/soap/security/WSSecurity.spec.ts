import { WSSecurity } from '../../../src/lib/soap/security/WSSecurity';
import { 
    xmlContainsElement, 
    extractElementContent, 
    extractAttribute,
    isWellFormedXml,
    isBase64
} from '../../setup/test-helpers';

describe('WSSecurity', () => {
    describe('Constructor', () => {
        it('should create instance with username and password', () => {
            const security = new (WSSecurity as any)('testuser', 'testpass');
            
            expect(security._username).toBe('testuser');
            expect(security._password).toBe('testpass');
            expect(security._passwordType).toBe('PasswordText');
            expect(security._hasTimeStamp).toBe(true);
            expect(security._hasTokenCreated).toBe(true);
        });

        it('should accept PasswordText as password type', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            expect(security._passwordType).toBe('PasswordText');
        });

        it('should accept PasswordDigest as password type', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            expect(security._passwordType).toBe('PasswordDigest');
        });

        it('should default to PasswordText for invalid password type', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'InvalidType');
            
            expect(security._passwordType).toBe('PasswordText');
        });

        it('should accept options object', () => {
            const options = {
                passwordType: 'PasswordDigest',
                hasTimeStamp: false,
                hasNonce: true,
                hasTokenCreated: false
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            
            expect(security._passwordType).toBe('PasswordDigest');
            expect(security._hasTimeStamp).toBe(false);
            expect(security._hasNonce).toBe(true);
            expect(security._hasTokenCreated).toBe(false);
        });

        it('should handle backward compatibility with string password type', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            expect(security._passwordType).toBe('PasswordDigest');
        });

        it('should handle empty string password type', () => {
            const security = new (WSSecurity as any)('user', 'pass', '');
            
            expect(security._passwordType).toBe('PasswordText');
        });

        it('should set actor if provided', () => {
            const options = { actor: 'http://example.com/actor' };
            const security = new (WSSecurity as any)('user', 'pass', options);
            
            expect(security._actor).toBe('http://example.com/actor');
        });

        it('should set mustUnderstand if provided', () => {
            const options = { mustUnderstand: true };
            const security = new (WSSecurity as any)('user', 'pass', options);
            
            expect(security._mustUnderstand).toBe(true);
        });

        it('should handle all options together', () => {
            const options = {
                passwordType: 'PasswordDigest',
                hasTimeStamp: true,
                hasNonce: true,
                hasTokenCreated: true,
                actor: 'http://example.com/actor',
                mustUnderstand: true
            };
            const security = new (WSSecurity as any)('user', 'pass', options);
            
            expect(security._passwordType).toBe('PasswordDigest');
            expect(security._hasTimeStamp).toBe(true);
            expect(security._hasNonce).toBe(true);
            expect(security._hasTokenCreated).toBe(true);
            expect(security._actor).toBe('http://example.com/actor');
            expect(security._mustUnderstand).toBe(true);
        });
    });

    describe('toXML - PasswordText Mode', () => {
        it('should generate valid XML with PasswordText', () => {
            const security = new (WSSecurity as any)('testuser', 'testpass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('<wsse:Security');
            expect(xml).toContain('</wsse:Security>');
        });

        it('should include username in XML', () => {
            const security = new (WSSecurity as any)('myusername', 'mypassword', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:Username>myusername</wsse:Username>');
        });

        it('should include plain text password', () => {
            const security = new (WSSecurity as any)('user', 'plainpassword', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('plainpassword');
            expect(xml).toContain('PasswordText');
        });

        it('should include timestamp by default', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(true);
            expect(xmlContainsElement(xml, 'wsu:Created')).toBe(true);
            expect(xmlContainsElement(xml, 'wsu:Expires')).toBe(true);
        });

        it('should not include timestamp when disabled', () => {
            const security = new (WSSecurity as any)('user', 'pass', { 
                passwordType: 'PasswordText',
                hasTimeStamp: false 
            });
            
            const xml = security.toXML();
            
            expect(xmlContainsElement(xml, 'wsu:Timestamp')).toBe(false);
        });

        it('should include token created timestamp by default', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml = security.toXML();
            
            const usernameTokenMatch = xml.match(/<wsse:UsernameToken[^>]*>[\s\S]*?<\/wsse:UsernameToken>/);
            expect(usernameTokenMatch).toBeTruthy();
            if (usernameTokenMatch) {
                expect(usernameTokenMatch[0]).toContain('<wsu:Created>');
            }
        });

        it('should not include token created when disabled', () => {
            const security = new (WSSecurity as any)('user', 'pass', {
                passwordType: 'PasswordText',
                hasTokenCreated: false
            });
            
            const xml = security.toXML();
            
            const usernameTokenMatch = xml.match(/<wsse:UsernameToken[^>]*>[\s\S]*?<\/wsse:UsernameToken>/);
            expect(usernameTokenMatch).toBeTruthy();
            if (usernameTokenMatch) {
                expect(usernameTokenMatch[0]).not.toContain('<wsu:Created>');
            }
        });

        it('should include nonce when specified for PasswordText', () => {
            const security = new (WSSecurity as any)('user', 'pass', {
                passwordType: 'PasswordText',
                hasNonce: true
            });
            
            const xml = security.toXML();
            
            expect(xmlContainsElement(xml, 'wsse:Nonce')).toBe(true);
        });

        it('should include proper WSSE namespace', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"');
        });

        it('should include proper WSU namespace', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"');
        });

        it('should include actor attribute when specified', () => {
            const security = new (WSSecurity as any)('user', 'pass', {
                passwordType: 'PasswordText',
                actor: 'http://example.com/actor'
            });
            
            const xml = security.toXML();
            
            expect(xml).toContain('soap:actor="http://example.com/actor"');
        });

        it('should include mustUnderstand attribute when specified', () => {
            const security = new (WSSecurity as any)('user', 'pass', {
                passwordType: 'PasswordText',
                mustUnderstand: true
            });
            
            const xml = security.toXML();
            
            expect(xml).toContain('soap:mustUnderstand="1"');
        });

        it('should not include actor when not specified', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).not.toContain('soap:actor=');
        });

        it('should not include mustUnderstand when not specified', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).not.toContain('soap:mustUnderstand=');
        });
    });

    describe('toXML - PasswordDigest Mode', () => {
        it('should generate valid XML with PasswordDigest', () => {
            const security = new (WSSecurity as any)('testuser', 'testpass', 'PasswordDigest');
            
            const xml = security.toXML();
            
            expect(isWellFormedXml(xml)).toBe(true);
            expect(xml).toContain('PasswordDigest');
        });

        it('should always include nonce with PasswordDigest', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            const xml = security.toXML();
            
            expect(xmlContainsElement(xml, 'wsse:Nonce')).toBe(true);
        });

        it('should include Base64 encoded nonce', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            const xml = security.toXML();
            
            const nonceMatch = xml.match(/<wsse:Nonce[^>]*>([^<]+)<\/wsse:Nonce>/);
            expect(nonceMatch).toBeTruthy();
            
            if (nonceMatch) {
                const nonce = nonceMatch[1];
                expect(isBase64(nonce)).toBe(true);
            }
        });

        it('should not include plain text password with PasswordDigest', () => {
            const security = new (WSSecurity as any)('user', 'plainpassword', 'PasswordDigest');
            
            const xml = security.toXML();
            
            // Password should be digested, not plain text
            expect(xml).not.toContain('plainpassword');
            expect(xml).toContain('PasswordDigest');
        });

        it('should include digested password', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            const xml = security.toXML();
            
            const passwordMatch = xml.match(/<wsse:Password[^>]*>([^<]+)<\/wsse:Password>/);
            expect(passwordMatch).toBeTruthy();
            
            if (passwordMatch) {
                const digestedPassword = passwordMatch[1];
                expect(isBase64(digestedPassword)).toBe(true);
                expect(digestedPassword).not.toBe('pass'); // Should be digested
            }
        });

        it('should generate different nonces on each call', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            const xml1 = security.toXML();
            const xml2 = security.toXML();
            
            const nonceMatch1 = xml1.match(/<wsse:Nonce[^>]*>([^<]+)<\/wsse:Nonce>/);
            const nonceMatch2 = xml2.match(/<wsse:Nonce[^>]*>([^<]+)<\/wsse:Nonce>/);
            
            expect(nonceMatch1).toBeTruthy();
            expect(nonceMatch2).toBeTruthy();
            
            if (nonceMatch1 && nonceMatch2) {
                expect(nonceMatch1[1]).not.toBe(nonceMatch2[1]);
            }
        });

        it('should generate different timestamps on each call', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordDigest');
            
            const xml1 = security.toXML();
            // Small delay to ensure different timestamp
            const now = Date.now();
            while (Date.now() - now < 10) { }
            const xml2 = security.toXML();
            
            // Timestamps should be different
            expect(xml1).not.toBe(xml2);
        });
    });

    describe('Timestamp Handling', () => {
        it('should generate ISO 8601 formatted timestamp', () => {
            const security = new (WSSecurity as any)('user', 'pass');
            
            const xml = security.toXML();
            
            const createdMatch = xml.match(/<wsu:Created>([^<]+)<\/wsu:Created>/);
            expect(createdMatch).toBeTruthy();
            
            if (createdMatch) {
                const timestamp = createdMatch[1];
                // Check ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
                expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
            }
        });

        it('should generate expires timestamp 10 minutes after created', () => {
            const security = new (WSSecurity as any)('user', 'pass');
            
            const xml = security.toXML();
            
            const createdMatch = xml.match(/<wsu:Created>([^<]+)<\/wsu:Created>/);
            const expiresMatch = xml.match(/<wsu:Expires>([^<]+)<\/wsu:Expires>/);
            
            expect(createdMatch).toBeTruthy();
            expect(expiresMatch).toBeTruthy();
            
            if (createdMatch && expiresMatch) {
                const created = new Date(createdMatch[1]);
                const expires = new Date(expiresMatch[1]);
                
                const diffMinutes = (expires.getTime() - created.getTime()) / (1000 * 60);
                expect(diffMinutes).toBeCloseTo(10, 0);
            }
        });

        it('should have timestamp ID format', () => {
            const security = new (WSSecurity as any)('user', 'pass');
            
            const xml = security.toXML();
            
            const idMatch = xml.match(/<wsu:Timestamp wsu:Id="([^"]+)"/);
            
            expect(idMatch).toBeTruthy();
            if (idMatch) {
                expect(idMatch[1]).toMatch(/^Timestamp-/);
            }
        });
    });

    describe('Username Token Handling', () => {
        it('should have UsernameToken ID format', () => {
            const security = new (WSSecurity as any)('user', 'pass');
            
            const xml = security.toXML();
            
            const idMatch = xml.match(/<wsse:UsernameToken[^>]*wsu:Id="([^"]+)"/);
            
            expect(idMatch).toBeTruthy();
            if (idMatch) {
                expect(idMatch[1]).toMatch(/^SecurityToken-/);
            }
        });

        it('should include all required elements in UsernameToken', () => {
            const security = new (WSSecurity as any)('testuser', 'testpass', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:UsernameToken');
            expect(xml).toContain('<wsse:Username>testuser</wsse:Username>');
            expect(xml).toContain('<wsse:Password');
            expect(xml).toContain('</wsse:UsernameToken>');
        });
    });

    describe('Special Characters and Edge Cases', () => {
        it('should handle special characters in username', () => {
            const security = new (WSSecurity as any)('user@domain.com', 'pass');
            
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:Username>user@domain.com</wsse:Username>');
        });

        it('should handle special characters in password', () => {
            const security = new (WSSecurity as any)('user', 'p@ssw0rd!<>&"', 'PasswordText');
            
            const xml = security.toXML();
            
            // For PasswordText, password should be in XML (though ideally escaped)
            expect(xml).toContain('p@ssw0rd!<>&"');
        });

        it('should handle empty username', () => {
            const security = new (WSSecurity as any)('', 'pass');
            
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:Username></wsse:Username>');
        });

        it('should handle empty password', () => {
            const security = new (WSSecurity as any)('user', '', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:Password');
        });

        it('should handle unicode characters', () => {
            const security = new (WSSecurity as any)('用户', '密码', 'PasswordText');
            
            const xml = security.toXML();
            
            expect(xml).toContain('<wsse:Username>用户</wsse:Username>');
        });

        it('should handle very long username', () => {
            const longUsername = 'a'.repeat(1000);
            const security = new (WSSecurity as any)(longUsername, 'pass');
            
            const xml = security.toXML();
            
            expect(xml).toContain(`<wsse:Username>${longUsername}</wsse:Username>`);
        });
    });

    describe('Integration Scenarios', () => {
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

        it('should generate consistent structure across multiple calls', () => {
            const security = new (WSSecurity as any)('user', 'pass', 'PasswordText');
            
            const xml1 = security.toXML();
            const xml2 = security.toXML();
            
            // Structure should be the same, even if values differ
            expect(xml1).toContain('<wsse:Security');
            expect(xml2).toContain('<wsse:Security');
            expect(xml1).toContain('<wsse:UsernameToken');
            expect(xml2).toContain('<wsse:UsernameToken');
        });
    });
});

