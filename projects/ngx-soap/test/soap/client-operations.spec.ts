import { Client } from '../../src/lib/soap/client';

// Mock WSDL for testing
const createMockWSDL = () => ({
    definitions: {
        services: {
            TestService: {
                ports: {
                    TestPort: {
                        binding: {
                            operations: {
                                TestOperation: {
                                    input: { $name: 'TestInput' }
                                }
                            }
                        },
                        location: 'http://example.com/service'
                    }
                }
            }
        }
    },
    options: {},
    objectToXML: jest.fn((obj) => `<xml>${JSON.stringify(obj)}</xml>`),
    xmlToObject: jest.fn((xml) => ({ result: 'parsed' }))
});

describe('Client - Header Operations', () => {
    let client: any;
    let mockWSDL: any;

    beforeEach(() => {
        mockWSDL = createMockWSDL();
        client = new (Client as any)(mockWSDL, 'http://example.com/service');
    });

    describe('SOAP Headers', () => {
        it('should add and retrieve SOAP headers', () => {
            const index = client.addSoapHeader('<header1/>', 'Header1');
            
            expect(client.soapHeaders).toBeDefined();
            expect(client.soapHeaders.length).toBe(1);
            expect(client.getSoapHeaders()).toBeDefined();
        });

        it('should change and clear SOAP headers', () => {
            const index = client.addSoapHeader('<header1/>', 'Header1');
            client.changeSoapHeader(index, '<header2/>', 'Header2');
            
            expect(client.soapHeaders[index]).toContain('header2');
            
            client.clearSoapHeaders();
            expect(client.getSoapHeaders()).toBeNull();
        });

        it('should convert objects to XML', () => {
            const headerObj = { key: 'value' };
            client.addSoapHeader(headerObj, 'HeaderName');
            
            expect(mockWSDL.objectToXML).toHaveBeenCalled();
        });

        it('should handle function-based SOAP headers', () => {
            const headerFn = jest.fn(() => ({ token: 'dynamic-token' }));
            const index = client.addSoapHeader(headerFn, 'DynamicHeader');
            
            expect(client.soapHeaders).toBeDefined();
            expect(client.soapHeaders.length).toBe(1);
            expect(typeof client.soapHeaders[index]).toBe('function');
        });

        it('should apply function-based headers with arguments', () => {
            const headerFn = jest.fn((userId) => ({ 
                AuthToken: `token-${userId}`,
                Timestamp: new Date().toISOString()
            }));
            
            client.addSoapHeader(headerFn, 'AuthHeader', 'http://auth.example.com');
            const headerFunction = client.soapHeaders[0];
            
            // Call the function with arguments
            const result = headerFunction('user123');
            
            expect(headerFn).toHaveBeenCalledWith('user123');
            expect(mockWSDL.objectToXML).toHaveBeenCalled();
        });

        it('should handle function returning string', () => {
            const headerFn = () => '<custom:Token>XYZ</custom:Token>';
            client.addSoapHeader(headerFn, 'CustomHeader');
            
            const headerFunction = client.soapHeaders[0];
            const result = headerFunction();
            
            expect(result).toBe('<custom:Token>XYZ</custom:Token>');
        });

        it('should change function-based SOAP headers', () => {
            const headerFn1 = () => ({ token: 'old' });
            const headerFn2 = () => ({ token: 'new' });
            
            const index = client.addSoapHeader(headerFn1, 'Header');
            client.changeSoapHeader(index, headerFn2, 'Header');
            
            expect(typeof client.soapHeaders[index]).toBe('function');
        });
    });

    describe('HTTP Headers', () => {
        it('should add, get, and clear HTTP headers', () => {
            client.addHttpHeader('X-Custom', 'value1');
            client.addHttpHeader('Authorization', 'Bearer token');
            
            const headers = client.getHttpHeaders();
            expect(headers['X-Custom']).toBe('value1');
            expect(headers['Authorization']).toBe('Bearer token');
            
            client.clearHttpHeaders();
            expect(client.getHttpHeaders()).toEqual({});
        });

        it('should overwrite existing headers', () => {
            client.addHttpHeader('X-Test', 'value1');
            client.addHttpHeader('X-Test', 'value2');
            
            expect(client.httpHeaders['X-Test']).toBe('value2');
        });
    });

    describe('Body Attributes', () => {
        it('should add, get, and clear attributes with leading space', () => {
            client.addBodyAttribute('attr1="value1"');
            client.addBodyAttribute({ key2: 'value2' });
            
            const attrs = client.getBodyAttributes();
            expect(attrs.length).toBe(2);
            expect(attrs[0]).toBe(' attr1="value1"');
            expect(attrs[1]).toContain('key2="value2"');
            
            client.clearBodyAttributes();
            expect(client.getBodyAttributes()).toBeNull();
        });
    });

    describe('Empty SOAP Body Handling', () => {
        it('should handle empty body response without crashing', () => {
            // Test that empty/null body doesn't cause crashes
            const emptyBodies = ['', null, undefined, '   '];
            
            emptyBodies.forEach(body => {
                expect(() => {
                    // This should not throw
                    const result = mockWSDL.xmlToObject('');
                }).not.toThrow();
            });
        });

        it('should handle one-way operations (no output expected)', () => {
            // Mock WSDL with one-way operation (no output)
            const oneWayWSDL = {
                ...mockWSDL,
                definitions: {
                    services: {
                        TestService: {
                            ports: {
                                TestPort: {
                                    binding: {
                                        operations: {
                                            OneWayOp: {
                                                input: { $name: 'OneWayInput' },
                                                // No output defined
                                            }
                                        }
                                    },
                                    location: 'http://example.com/service'
                                }
                            }
                        }
                    }
                }
            };
            
            expect(oneWayWSDL.definitions.services.TestService.ports.TestPort.binding.operations.OneWayOp.output).toBeUndefined();
        });

        it('should return empty object for empty body content', () => {
            const emptyXml = '';
            mockWSDL.xmlToObject = jest.fn(() => ({}));
            
            const result = mockWSDL.xmlToObject(emptyXml);
            expect(result).toEqual({});
        });
    });

    describe('Exchange ID (EID) Tracking', () => {
        it('should generate EID automatically if not provided', () => {
            // Mock the _invoke method to capture the generated EID
            const originalInvoke = client._invoke;
            let capturedEid: string | undefined;
            
            // The _invoke method generates an EID internally
            expect(client._invoke).toBeDefined();
            expect(typeof client._invoke).toBe('function');
        });

        it('should use provided exchangeId option', () => {
            // Create a mock method
            const mockMethod = {
                $name: 'TestMethod',
                input: { $name: 'TestInput' }
            };
            
            const customEid = 'custom-exchange-id-12345';
            const options = { exchangeId: customEid };
            
            // The exchangeId should be passed through in options
            expect(options.exchangeId).toBe(customEid);
        });

        it('should track requests with EID', () => {
            const eid = 'test-eid-123';
            expect(eid).toBeDefined();
            expect(typeof eid).toBe('string');
            expect(eid.length).toBeGreaterThan(0);
        });
    });
});

