import { WSSecurityCertWithToken } from '../../../src/lib/soap/security/WSSecurityCertWithToken';

// Mock certificates for testing
const MOCK_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/FQPqGC9x2yPpDGcJH8hCTvV4xaqOFLQy
-----END RSA PRIVATE KEY-----`;

const MOCK_PUBLIC_CERT = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKfzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
-----END CERTIFICATE-----`;

describe('WSSecurityCertWithToken', () => {
    describe('Constructor', () => {
        it('should create instance with certificate and username token', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {
                    username: 'testuser',
                    password: 'testpass',
                    passwordType: 'PasswordText'
                }
            );

            expect(security).toBeDefined();
            expect(security.cert).toBeDefined();
            expect(security.token).toBeDefined();
        });

        it('should create instance without username token when credentials not provided', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {}
            );

            expect(security).toBeDefined();
            expect(security.cert).toBeDefined();
            expect(security.token).toBeUndefined();
        });

        it('should accept all WSSecurity options', () => {
            const options = {
                username: 'testuser',
                password: 'testpass',
                passwordType: 'PasswordDigest',
                hasTimeStamp: false,
                hasNonce: true,
                hasTokenCreated: true,
                actor: 'http://example.com/actor',
                mustUnderstand: true
            };

            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                options
            );

            expect(security).toBeDefined();
            expect(security.token).toBeDefined();
        });
    });

    describe('toXML', () => {
        it('should generate XML with username token (certificate via postProcess)', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {
                    username: 'testuser',
                    password: 'testpass'
                }
            );

            const xml = security.toXML();

            expect(typeof xml).toBe('string');
            expect(xml.length).toBeGreaterThan(0);
            // toXML only returns username token, certificate is in postProcess
        });

        it('should return empty string when no username token (certificate via postProcess)', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {}
            );

            const xml = security.toXML();

            expect(typeof xml).toBe('string');
            expect(xml).toBe('');
            // Certificate is added via postProcess, not toXML
        });
    });

    describe('postProcess', () => {
        it('should call certificate postProcess if available', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                { username: 'test', password: 'pass' }
            );

            const mockXml = '<soap:Envelope></soap:Envelope>';
            const envelopeKey = 'soap';

            // Mock the postProcess method
            security.cert.postProcess = jest.fn().mockReturnValue(mockXml + '_processed');

            const result = security.postProcess(mockXml, envelopeKey);

            expect(security.cert.postProcess).toHaveBeenCalledWith(mockXml, envelopeKey);
            expect(result).toBe(mockXml + '_processed');
        });

        it('should return xml unchanged if certificate has no postProcess', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {}
            );

            security.cert.postProcess = undefined;

            const mockXml = '<soap:Envelope></soap:Envelope>';
            const result = security.postProcess(mockXml, 'soap');

            expect(result).toBe(mockXml);
        });
    });

    describe('addOptions', () => {
        it('should update username token credentials', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                { username: 'olduser', password: 'oldpass' }
            );

            security.addOptions({ username: 'newuser', password: 'newpass' });

            expect(security.token._username).toBe('newuser');
            expect(security.token._password).toBe('newpass');
        });

        it('should not error if token is not defined', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {}
            );

            expect(() => {
                security.addOptions({ username: 'newuser' });
            }).not.toThrow();
        });
    });

    describe('Integration', () => {
        it('should work with PasswordDigest type', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {
                    username: 'digestuser',
                    password: 'digestpass',
                    passwordType: 'PasswordDigest'
                }
            );

            expect(security.token._passwordType).toBe('PasswordDigest');
            
            const xml = security.toXML();
            expect(typeof xml).toBe('string');
        });

        it('should respect hasTimeStamp option', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {
                    username: 'testuser',
                    password: 'testpass',
                    hasTimeStamp: false
                }
            );

            expect(security.token._hasTimeStamp).toBe(false);
        });

        it('should have postProcess method for certificate signing', () => {
            const security = new (WSSecurityCertWithToken as any)(
                MOCK_PRIVATE_KEY,
                MOCK_PUBLIC_CERT,
                'cert-password',
                {
                    username: 'testuser',
                    password: 'testpass'
                }
            );

            // postProcess delegates to cert.postProcess
            expect(security.postProcess).toBeDefined();
            expect(typeof security.postProcess).toBe('function');
        });
    });
});

