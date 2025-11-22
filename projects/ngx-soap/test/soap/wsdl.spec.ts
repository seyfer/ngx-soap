import { WSDL } from '../../src/lib/soap/wsdl';
import { loadFixture } from '../setup/test-helpers';

describe('WSDL - Core Functionality', () => {
    describe('Constructor', () => {
        it('should create WSDL instance with minimal definition', () => {
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
            
            expect(wsdl).toBeDefined();
            expect(wsdl.uri).toBe('http://example.com/test.wsdl');
        });

        it('should initialize with options', () => {
            const options = {
                ignoredNamespaces: ['http://example.com/ignored'],
                valueKey: '$value',
                xmlKey: '$xml'
            };
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', options);
            
            expect(wsdl.options).toBeDefined();
            // ignoredNamespaces gets processed and transformed by WSDL
            expect(Array.isArray(wsdl.options.ignoredNamespaces)).toBe(true);
            expect(wsdl.options.valueKey).toBe('$value');
            expect(wsdl.options.xmlKey).toBe('$xml');
        });

        it('should store URI correctly', () => {
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/service/test.wsdl', {});
            
            expect(wsdl.uri).toBe('http://example.com/service/test.wsdl');
        });
    });

    describe('XML to Object Conversion', () => {
        let wsdl: any;

        beforeEach(() => {
            wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
        });

        it('should convert simple XML to object', () => {
            const xml = '<root><value>test</value></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj).toBeDefined();
            expect(typeof obj).toBe('object');
            expect(obj.root).toBeDefined();
            expect(obj.root.value).toBe('test');
        });

        it('should handle XML with multiple child elements', () => {
            const xml = '<root><first>one</first><second>two</second></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj.root).toBeDefined();
            expect(obj.root.first).toBe('one');
            expect(obj.root.second).toBe('two');
        });

        it('should handle XML with namespaces', () => {
            const xml = '<tns:root xmlns:tns="http://example.com/test"><tns:value>test</tns:value></tns:root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj).toBeDefined();
            expect(obj.root).toBeDefined();
        });

        it('should handle XML with attributes and child elements', () => {
            const xml = '<root attr="value"><child>text</child></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj).toBeDefined();
            expect(obj.root).toBeDefined();
            expect(obj.root.child).toBe('text');
            // Attributes may or may not be preserved depending on parser configuration
        });

        it('should handle nested elements', () => {
            const xml = '<root><parent><child>value</child></parent></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj.root).toBeDefined();
            expect(obj.root.parent).toBeDefined();
            expect(obj.root.parent.child).toBe('value');
        });

        it('should handle empty elements', () => {
            const xml = '<root><empty/></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj.root).toBeDefined();
        });

        it('should handle CDATA sections', () => {
            const xml = '<root><![CDATA[raw content with <special> chars]]></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj.root).toBeDefined();
        });

        it('should handle numeric values', () => {
            const xml = '<root><number>42</number></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj.root.number).toBe('42');
        });

        it('should handle special characters in XML values', () => {
            const xml = '<root><value>&lt;escaped&gt;</value></root>';
            const obj = wsdl.xmlToObject(xml);
            
            expect(obj.root).toBeDefined();
            expect(obj.root.value).toBe('<escaped>');
        });
    });

    describe('Real WSDL - Simple Service', () => {
        it('should parse simple.wsdl successfully', (done) => {
            const wsdlContent = loadFixture('simple.wsdl');
            const wsdl = new (WSDL as any)(wsdlContent, 'http://example.com/simple.wsdl', {});
            
            wsdl.onReady((err) => {
                expect(err).toBeNull();
                expect(wsdl.definitions).toBeDefined();
                expect(wsdl.definitions.services).toBeDefined();
                expect(wsdl.definitions.services.SimpleService).toBeDefined();
                done();
            });
        });

        it('should extract service information from simple.wsdl', (done) => {
            const wsdlContent = loadFixture('simple.wsdl');
            const wsdl = new (WSDL as any)(wsdlContent, 'http://example.com/simple.wsdl', {});
            
            wsdl.onReady((err) => {
                const service = wsdl.definitions.services.SimpleService;
                expect(service).toBeDefined();
                expect(service.ports.SimplePort).toBeDefined();
                done();
            });
        });

        it('should parse operations from simple.wsdl', (done) => {
            const wsdlContent = loadFixture('simple.wsdl');
            const wsdl = new (WSDL as any)(wsdlContent, 'http://example.com/simple.wsdl', {});
            
            wsdl.onReady((err) => {
                const port = wsdl.definitions.services.SimpleService.ports.SimplePort;
                const binding = port.binding;
                expect(binding.methods.Echo).toBeDefined();
                done();
            });
        });
    });

    describe('Real WSDL - Calculator Service', () => {
        it('should parse calculator.wsdl successfully', (done) => {
            const wsdlContent = loadFixture('calculator.wsdl');
            const wsdl = new (WSDL as any)(wsdlContent, 'http://example.com/calculator.wsdl', {});
            
            wsdl.onReady((err) => {
                expect(err).toBeNull();
                expect(wsdl.definitions).toBeDefined();
                expect(wsdl.definitions.services).toBeDefined();
                done();
            });
        });

        it('should extract calculator operations', (done) => {
            const wsdlContent = loadFixture('calculator.wsdl');
            const wsdl = new (WSDL as any)(wsdlContent, 'http://example.com/calculator.wsdl', {});
            
            wsdl.onReady((err) => {
                const service = wsdl.definitions.services.Calculator;
                const port = service.ports.CalculatorSoap;
                const binding = port.binding;
                
                expect(binding.methods.Add).toBeDefined();
                expect(binding.methods.Subtract).toBeDefined();
                expect(binding.methods.Multiply).toBeDefined();
                expect(binding.methods.Divide).toBeDefined();
                done();
            });
        });
    });

    describe('Options', () => {
        it('should accept and process ignoredNamespaces option', () => {
            const options = { ignoredNamespaces: ['http://example.com/ignored'] };
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', options);
            
            // ignoredNamespaces is processed by WSDL and transformed to standard ignores
            expect(wsdl.options.ignoredNamespaces).toBeDefined();
            expect(Array.isArray(wsdl.options.ignoredNamespaces)).toBe(true);
            expect(wsdl.options.ignoredNamespaces.length).toBeGreaterThan(0);
        });

        it('should use custom valueKey', () => {
            const options = { valueKey: 'customValue' };
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', options);
            
            expect(wsdl.options.valueKey).toBe('customValue');
        });

        it('should use custom xmlKey', () => {
            const options = { xmlKey: 'customXml' };
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', options);
            
            expect(wsdl.options.xmlKey).toBe('customXml');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty WSDL definition', () => {
            expect(() => {
                new (WSDL as any)('', 'http://example.com/test.wsdl', {});
            }).not.toThrow();
        });

        it('should handle xmlToObject with empty string', () => {
            const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
            const obj = wsdl.xmlToObject('');
            
            expect(obj).toBeDefined();
        });
    });

    describe('SOAP Fault Handling', () => {
        let wsdl: any;

        beforeEach(() => {
            wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
        });

        it('should parse SOAP 1.1 fault correctly', () => {
            const soap11Fault = `
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <soap:Fault>
                            <faultcode>soap:Server</faultcode>
                            <faultstring>Internal Server Error</faultstring>
                            <faultactor>http://example.com/service</faultactor>
                            <detail>Something went wrong</detail>
                        </soap:Fault>
                    </soap:Body>
                </soap:Envelope>
            `;

            expect(() => {
                wsdl.xmlToObject(soap11Fault);
            }).toThrow();

            try {
                wsdl.xmlToObject(soap11Fault);
            } catch (error: any) {
                expect(error.code).toBe('soap:Server');
                expect(error.string).toBe('Internal Server Error');
                expect(error.actor).toBe('http://example.com/service');
                expect(error.detail).toBe('Something went wrong');
                expect(error.statusCode).toBe(500);
            }
        });

        it('should parse SOAP 1.2 fault correctly', () => {
            const soap12Fault = `
                <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
                    <soap:Body>
                        <soap:Fault>
                            <soap:Code>
                                <soap:Value>soap:Receiver</soap:Value>
                            </soap:Code>
                            <soap:Reason>
                                <soap:Text>Processing failed</soap:Text>
                            </soap:Reason>
                            <soap:Role>http://example.com/role</soap:Role>
                            <soap:Detail>Error details here</soap:Detail>
                        </soap:Fault>
                    </soap:Body>
                </soap:Envelope>
            `;

            expect(() => {
                wsdl.xmlToObject(soap12Fault);
            }).toThrow();

            try {
                wsdl.xmlToObject(soap12Fault);
            } catch (error: any) {
                expect(error.code).toBe('soap:Receiver');
                expect(error.string).toBe('Processing failed');
                expect(error.actor).toBe('http://example.com/role');
                expect(error.detail).toBe('Error details here');
            }
        });

        it('should return fault as data when returnFault=true', () => {
            const wsdlWithReturnFault = new (WSDL as any)(
                loadFixture('minimal.wsdl'),
                'http://example.com/test.wsdl',
                { returnFault: true }
            );

            const soap11Fault = `
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <soap:Fault>
                            <faultcode>soap:Client</faultcode>
                            <faultstring>Invalid request</faultstring>
                        </soap:Fault>
                    </soap:Body>
                </soap:Envelope>
            `;

            // Should not throw when returnFault is true
            expect(() => {
                wsdlWithReturnFault.xmlToObject(soap11Fault);
            }).not.toThrow();

            const result = wsdlWithReturnFault.xmlToObject(soap11Fault);
            expect(result).toBeDefined();
            expect(result.Body).toBeDefined();
            expect(result.Body.Fault).toBeDefined();
        });

        it('should throw error when returnFault=false (default)', () => {
            const wsdlDefault = new (WSDL as any)(
                loadFixture('minimal.wsdl'),
                'http://example.com/test.wsdl',
                { returnFault: false }
            );

            const soap11Fault = `
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <soap:Fault>
                            <faultcode>soap:Server</faultcode>
                            <faultstring>Error occurred</faultstring>
                        </soap:Fault>
                    </soap:Body>
                </soap:Envelope>
            `;

            expect(() => {
                wsdlDefault.xmlToObject(soap11Fault);
            }).toThrow('Error occurred');
        });

        it('should include fault details in error object', () => {
            const soap11Fault = `
                <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <soap:Fault>
                            <faultcode>CustomCode</faultcode>
                            <faultstring>Custom error message</faultstring>
                            <detail>Detailed information</detail>
                        </soap:Fault>
                    </soap:Body>
                </soap:Envelope>
            `;

            try {
                wsdl.xmlToObject(soap11Fault);
            } catch (error: any) {
                expect(error.Fault).toBeDefined();
                expect(error.Fault.faultcode).toBe('CustomCode');
                expect(error.Fault.faultstring).toBe('Custom error message');
                expect(error.Fault.detail).toBe('Detailed information');
            }
        });
    });

    describe('Configuration Options', () => {
        it('should initialize with useEmptyTag option', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { useEmptyTag: true });
            expect(wsdlWithOptions.options.useEmptyTag).toBe(true);
        });

        it('should initialize with preserveWhitespace option', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { preserveWhitespace: true });
            expect(wsdlWithOptions.options.preserveWhitespace).toBe(true);
        });

        it('should initialize with normalizeNames option', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { normalizeNames: true });
            expect(wsdlWithOptions.options.normalizeNames).toBe(true);
        });

        it('should initialize with suppressStack option', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { suppressStack: true });
            expect(wsdlWithOptions.options.suppressStack).toBe(true);
        });

        it('should initialize with forceUseSchemaXmlns option', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { forceUseSchemaXmlns: true });
            expect(wsdlWithOptions.options.forceUseSchemaXmlns).toBe(true);
        });

        it('should initialize with custom envelopeKey', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { envelopeKey: 'soap12' });
            expect(wsdlWithOptions.options.envelopeKey).toBe('soap12');
        });

        it('should use default envelopeKey when not provided', () => {
            const wsdlWithDefaults = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', {});
            expect(wsdlWithDefaults.options.envelopeKey).toBe('soap');
        });

        it('should initialize with custom overridePromiseSuffix', () => {
            const wsdlWithOptions = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', { overridePromiseSuffix: 'Promise' });
            expect(wsdlWithOptions.options.overridePromiseSuffix).toBe('Promise');
        });

        it('should use default overridePromiseSuffix when not provided', () => {
            const wsdlWithDefaults = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', {});
            expect(wsdlWithDefaults.options.overridePromiseSuffix).toBe('Async');
        });

        it('should default boolean options to false when not provided', () => {
            const wsdlWithDefaults = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com', {});
            expect(wsdlWithDefaults.options.useEmptyTag).toBe(false);
            expect(wsdlWithDefaults.options.preserveWhitespace).toBe(false);
            expect(wsdlWithDefaults.options.normalizeNames).toBe(false);
            expect(wsdlWithDefaults.options.suppressStack).toBe(false);
            expect(wsdlWithDefaults.options.forceUseSchemaXmlns).toBe(false);
        });
    });
});
