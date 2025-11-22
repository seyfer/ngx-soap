import { WSSecurityPlusCert } from '../../../src/lib/soap/security/WSSecurityPlusCert';
import { WSSecurity } from '../../../src/lib/soap/security/WSSecurity';
import { WSSecurityCert } from '../../../src/lib/soap/security/WSSecurityCert';

// Mock certificates for testing
const MOCK_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/FQPqGC9x2yPpDGcJH8hCTvV4xaqOFLQy
-----END RSA PRIVATE KEY-----`;

const MOCK_PUBLIC_CERT = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKfzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
-----END CERTIFICATE-----`;

describe('WSSecurityPlusCert', () => {
    let mockWSSecurity: any;
    let mockWSSecurityCert: any;

    beforeEach(() => {
        mockWSSecurity = new (WSSecurity as any)('username', 'password', 'PasswordText');
        mockWSSecurityCert = new (WSSecurityCert as any)(
            MOCK_PRIVATE_KEY,
            MOCK_PUBLIC_CERT,
            'cert-password'
        );
    });

    describe('Constructor', () => {
        it('should create instance with both WSSecurity and WSSecurityCert', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            expect(security).toBeDefined();
            expect(security.wsSecurity).toBe(mockWSSecurity);
            expect(security.wsSecurityCert).toBe(mockWSSecurityCert);
        });

        it('should throw error if WSSecurity is not provided', () => {
            expect(() => {
                new (WSSecurityPlusCert as any)(null, mockWSSecurityCert);
            }).toThrow('WSSecurity instance is required');
        });

        it('should throw error if WSSecurityCert is not provided', () => {
            expect(() => {
                new (WSSecurityPlusCert as any)(mockWSSecurity, null);
            }).toThrow('WSSecurityCert instance is required');
        });

        it('should throw error if both are not provided', () => {
            expect(() => {
                new (WSSecurityPlusCert as any)(null, null);
            }).toThrow('WSSecurity instance is required');
        });
    });

    describe('toXML', () => {
        it('should return username token XML (certificate via postProcess)', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            // Mock toXML method
            mockWSSecurity.toXML = jest.fn().mockReturnValue('<UsernameToken>user</UsernameToken>');

            const xml = security.toXML();

            expect(mockWSSecurity.toXML).toHaveBeenCalled();
            expect(xml).toBe('<UsernameToken>user</UsernameToken>');
            // Certificate is added via postProcess, not toXML
        });

        it('should return empty string when wsSecurity toXML is not available', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);
            
            mockWSSecurity.toXML = undefined;

            const xml = security.toXML();

            expect(xml).toBe('');
        });

        it('should return username token even if cert present', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);
            
            mockWSSecurity.toXML = jest.fn().mockReturnValue('<token>');

            const xml = security.toXML();

            expect(xml).toBe('<token>');
            // Cert is handled separately via postProcess
        });
    });

    describe('postProcess', () => {
        it('should call certificate postProcess when available', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            const mockXml = '<soap:Envelope></soap:Envelope>';
            const envelopeKey = 'soap';

            mockWSSecurityCert.postProcess = jest.fn().mockReturnValue(mockXml + '_signed');

            const result = security.postProcess(mockXml, envelopeKey);

            expect(mockWSSecurityCert.postProcess).toHaveBeenCalledWith(mockXml, envelopeKey);
            expect(result).toBe(mockXml + '_signed');
        });

        it('should return xml unchanged if certificate has no postProcess', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            mockWSSecurityCert.postProcess = undefined;

            const mockXml = '<soap:Envelope></soap:Envelope>';
            const result = security.postProcess(mockXml, 'soap');

            expect(result).toBe(mockXml);
        });
    });

    describe('addOptions', () => {
        it('should update WSSecurity credentials', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            security.addOptions({ username: 'newuser', password: 'newpass' });

            expect(mockWSSecurity._username).toBe('newuser');
            expect(mockWSSecurity._password).toBe('newpass');
        });

        it('should only update username if password not provided', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);
            
            const originalPassword = mockWSSecurity._password;
            security.addOptions({ username: 'newuser' });

            expect(mockWSSecurity._username).toBe('newuser');
            expect(mockWSSecurity._password).toBe(originalPassword);
        });

        it('should not error if wsSecurity is undefined', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);
            security.wsSecurity = undefined;

            expect(() => {
                security.addOptions({ username: 'newuser' });
            }).not.toThrow();
        });
    });

    describe('Integration', () => {
        it('should work with real WSSecurity and WSSecurityCert instances', () => {
            const wsSecurity = new (WSSecurity as any)('testuser', 'testpass', {
                passwordType: 'PasswordText',
                hasTimeStamp: true
            });

            const wsSecurityCert = new (WSSecurityCert as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'password'
            );

            const security = new (WSSecurityPlusCert as any)(wsSecurity, wsSecurityCert);

            expect(security).toBeDefined();
            expect(security.wsSecurity).toBe(wsSecurity);
            expect(security.wsSecurityCert).toBe(wsSecurityCert);
        });

        it('should generate combined XML from real instances', () => {
            const wsSecurity = new (WSSecurity as any)('testuser', 'testpass', 'PasswordText');
            const wsSecurityCert = new (WSSecurityCert as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'password'
            );

            const security = new (WSSecurityPlusCert as any)(wsSecurity, wsSecurityCert);
            const xml = security.toXML();

            expect(typeof xml).toBe('string');
            expect(xml.length).toBeGreaterThan(0);
        });
    });

    describe('Security Header Combination', () => {
        it('should return username token from toXML, certificate via postProcess', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            mockWSSecurity.toXML = jest.fn().mockReturnValue('<UsernameToken/>');

            const xml = security.toXML();

            expect(xml).toBe('<UsernameToken/>');
            // Certificate is added via postProcess
        });

        it('should handle empty username token', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            mockWSSecurity.toXML = jest.fn().mockReturnValue('');

            const xml = security.toXML();

            expect(xml).toBe('');
        });

        it('should combine via postProcess', () => {
            const security = new (WSSecurityPlusCert as any)(mockWSSecurity, mockWSSecurityCert);

            const mockEnvelope = '<soap:Envelope><soap:Body>test</soap:Body></soap:Envelope>';
            mockWSSecurityCert.postProcess = jest.fn().mockReturnValue(mockEnvelope + '_signed');

            const result = security.postProcess(mockEnvelope, 'soap');

            expect(mockWSSecurityCert.postProcess).toHaveBeenCalled();
            expect(result).toContain('_signed');
        });
    });
});

