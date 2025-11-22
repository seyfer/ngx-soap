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

    describe('WSDL Parsing Robustness', () => {
        describe('Handle Missing Message Definitions', () => {
            it('should handle WSDL with missing message definitions gracefully', () => {
                const wsdlWithMissingMessage = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test" 
             name="TestService">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:element name="TestRequest" type="xsd:string"/>
      <xsd:element name="TestResponse" type="xsd:string"/>
    </xsd:schema>
  </types>
  
  <!-- Message for request is defined, but response message is missing -->
  <message name="TestRequestMessage">
    <part name="parameters" element="tns:TestRequest"/>
  </message>
  <!-- TestResponseMessage is NOT defined - this should be handled gracefully -->
  
  <portType name="TestPortType">
    <operation name="TestOperation">
      <input message="tns:TestRequestMessage"/>
      <output message="tns:TestResponseMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="TestOperation">
      <soap:operation soapAction="TestOperation"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                // Should not throw an error
                expect(() => {
                    const wsdl = new (WSDL as any)(wsdlWithMissingMessage, 'http://example.com/test.wsdl', {});
                }).not.toThrow();
            });

            it('should create valid WSDL even with partial message definitions', (done) => {
                const wsdlWithPartialMessages = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test" 
             name="TestService">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:element name="ValidRequest" type="xsd:string"/>
      <xsd:element name="ValidResponse" type="xsd:string"/>
    </xsd:schema>
  </types>
  
  <message name="ValidRequestMessage">
    <part name="parameters" element="tns:ValidRequest"/>
  </message>
  <message name="ValidResponseMessage">
    <part name="parameters" element="tns:ValidResponse"/>
  </message>
  
  <portType name="TestPortType">
    <operation name="ValidOperation">
      <input message="tns:ValidRequestMessage"/>
      <output message="tns:ValidResponseMessage"/>
    </operation>
    <operation name="InvalidOperation">
      <input message="tns:UndefinedMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="ValidOperation">
      <soap:operation soapAction="ValidOperation"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlWithPartialMessages, 'http://example.com/test.wsdl', {});
                
                // WSDL should be created successfully
                expect(wsdl).toBeDefined();
                
                // Wait for WSDL to finish processing (it's async)
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    expect(wsdl.definitions).toBeDefined();
                    expect(wsdl.services).toBeDefined();
                    done();
                });
            });

            it('should continue processing valid operations despite missing messages', (done) => {
                const wsdlMixedMessages = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:element name="GoodRequest" type="xsd:string"/>
      <xsd:element name="GoodResponse" type="xsd:string"/>
    </xsd:schema>
  </types>
  
  <message name="GoodRequestMessage">
    <part name="parameters" element="tns:GoodRequest"/>
  </message>
  <message name="GoodResponseMessage">
    <part name="parameters" element="tns:GoodResponse"/>
  </message>
  
  <portType name="TestPortType">
    <operation name="GoodOperation">
      <input message="tns:GoodRequestMessage"/>
      <output message="tns:GoodResponseMessage"/>
    </operation>
    <operation name="BadOperation">
      <input message="tns:MissingMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GoodOperation">
      <soap:operation soapAction="GoodOperation"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlMixedMessages, 'http://example.com/test.wsdl', {});
                
                // WSDL should process without throwing
                expect(wsdl).toBeDefined();
                
                // Wait for WSDL processing and verify valid operations are available
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    expect(wsdl.services).toBeDefined();
                    expect(wsdl.services.TestService).toBeDefined();
                    done();
                });
            });
        });

        describe('Prevent $type Mutation', () => {
            it('should handle multiple sequential objectToDocumentXML calls without schema corruption', (done) => {
                const wsdlXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:complexType name="PersonType">
        <xsd:sequence>
          <xsd:element name="name" type="xsd:string"/>
          <xsd:element name="age" type="xsd:int"/>
        </xsd:sequence>
      </xsd:complexType>
      <xsd:element name="PersonRequest" type="tns:PersonType"/>
      <xsd:element name="PersonResponse" type="tns:PersonType"/>
    </xsd:schema>
  </types>
  
  <message name="PersonRequestMessage">
    <part name="parameters" element="tns:PersonRequest"/>
  </message>
  <message name="PersonResponseMessage">
    <part name="parameters" element="tns:PersonResponse"/>
  </message>
  
  <portType name="PersonPortType">
    <operation name="GetPerson">
      <input message="tns:PersonRequestMessage"/>
      <output message="tns:PersonResponseMessage"/>
    </operation>
  </portType>
  
  <binding name="PersonBinding" type="tns:PersonPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetPerson">
      <soap:operation soapAction="GetPerson"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>
  
  <service name="PersonService">
    <port name="PersonPort" binding="tns:PersonBinding">
      <soap:address location="http://example.com/person"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlXml, 'http://example.com/test.wsdl', {});
                
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    
                    // Make multiple calls with the same data
                    const testData = { name: 'John', age: 30 };
                    
                    const xml1 = wsdl.objectToDocumentXML('PersonRequest', testData, 'tns', 'http://example.com/test', 'tns:PersonType');
                    const xml2 = wsdl.objectToDocumentXML('PersonRequest', testData, 'tns', 'http://example.com/test', 'tns:PersonType');
                    
                    // Both calls should produce the same XML (schema not corrupted)
                    expect(xml1).toBe(xml2);
                    expect(xml1).toContain('<name>John</name>');
                    expect(xml1).toContain('<age>30</age>');
                    done();
                });
            });

            it('should not mutate original schema objects when processing with base types', (done) => {
                const wsdlXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:complexType name="BaseType">
        <xsd:sequence>
          <xsd:element name="baseField" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>
      <xsd:complexType name="ExtendedType">
        <xsd:complexContent>
          <xsd:extension base="tns:BaseType">
            <xsd:sequence>
              <xsd:element name="extraField" type="xsd:string"/>
            </xsd:sequence>
          </xsd:extension>
        </xsd:complexContent>
      </xsd:complexType>
      <xsd:element name="Request" type="tns:ExtendedType"/>
    </xsd:schema>
  </types>
  
  <message name="RequestMessage">
    <part name="parameters" element="tns:Request"/>
  </message>
  
  <portType name="TestPortType">
    <operation name="TestOp">
      <input message="tns:RequestMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="TestOp">
      <soap:operation soapAction="TestOp"/>
      <input><soap:body use="literal"/></input>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlXml, 'http://example.com/test.wsdl', {});
                
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    
                    // Get the original schema before any processing
                    const schema = wsdl.definitions.schemas['http://example.com/test'];
                    const originalBaseType = JSON.stringify(schema.complexTypes['BaseType']);
                    
                    // Make multiple calls
                    const testData = { baseField: 'test1', extraField: 'extra1' };
                    wsdl.objectToDocumentXML('Request', testData, 'tns', 'http://example.com/test', 'tns:ExtendedType');
                    wsdl.objectToDocumentXML('Request', testData, 'tns', 'http://example.com/test', 'tns:ExtendedType');
                    
                    // Original schema should remain unchanged
                    const currentBaseType = JSON.stringify(schema.complexTypes['BaseType']);
                    expect(currentBaseType).toBe(originalBaseType);
                    done();
                });
            });

            it('should create independent results for concurrent schema lookups', (done) => {
                const wsdlXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:element name="SimpleRequest" type="xsd:string"/>
    </xsd:schema>
  </types>
  
  <message name="SimpleRequestMessage">
    <part name="parameters" element="tns:SimpleRequest"/>
  </message>
  
  <portType name="TestPortType">
    <operation name="TestOp">
      <input message="tns:SimpleRequestMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="TestOp">
      <soap:operation soapAction="TestOp"/>
      <input><soap:body use="literal"/></input>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlXml, 'http://example.com/test.wsdl', {});
                
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    
                    // Multiple concurrent calls should not interfere with each other
                    const xml1 = wsdl.objectToDocumentXML('SimpleRequest', 'value1', 'tns', 'http://example.com/test');
                    const xml2 = wsdl.objectToDocumentXML('SimpleRequest', 'value2', 'tns', 'http://example.com/test');
                    const xml3 = wsdl.objectToDocumentXML('SimpleRequest', 'value3', 'tns', 'http://example.com/test');
                    
                    // Each should have its own value
                    expect(xml1).toContain('value1');
                    expect(xml2).toContain('value2');
                    expect(xml3).toContain('value3');
                    
                    // Values should not bleed between calls
                    expect(xml1).not.toContain('value2');
                    expect(xml2).not.toContain('value3');
                    expect(xml3).not.toContain('value1');
                    done();
                });
            });
        });

        describe('Multi-Service/Multi-Port Support', () => {
            it('should store serviceName option correctly', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { serviceName: 'MyService' });
                expect(wsdl.options.serviceName).toBe('MyService');
            });

            it('should store portName option correctly', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { portName: 'MyPort' });
                expect(wsdl.options.portName).toBe('MyPort');
            });

            it('should store both serviceName and portName options', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    serviceName: 'MyService',
                    portName: 'MyPort'
                });
                expect(wsdl.options.serviceName).toBe('MyService');
                expect(wsdl.options.portName).toBe('MyPort');
            });

            it('should have undefined serviceName when not specified (backward compatible)', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
                expect(wsdl.options.serviceName).toBeUndefined();
                expect(wsdl.options.portName).toBeUndefined();
            });
        });

        describe('ComplexContent with RestrictionElement', () => {
            it('should handle ComplexContent with restriction base', (done) => {
                const wsdlWithRestriction = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:complexType name="BaseType">
        <xsd:sequence>
          <xsd:element name="field1" type="xsd:string"/>
          <xsd:element name="field2" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>
      
      <xsd:complexType name="RestrictedType">
        <xsd:complexContent>
          <xsd:restriction base="tns:BaseType">
            <xsd:sequence>
              <xsd:element name="field1" type="xsd:string"/>
            </xsd:sequence>
          </xsd:restriction>
        </xsd:complexContent>
      </xsd:complexType>
      
      <xsd:element name="Request" type="tns:RestrictedType"/>
    </xsd:schema>
  </types>
  
  <message name="RequestMessage">
    <part name="parameters" element="tns:Request"/>
  </message>
  
  <portType name="TestPortType">
    <operation name="TestOp">
      <input message="tns:RequestMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="TestOp">
      <soap:operation soapAction="TestOp"/>
      <input><soap:body use="literal"/></input>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlWithRestriction, 'http://example.com/test.wsdl', {});
                
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    expect(wsdl.definitions).toBeDefined();
                    
                    // Should have properly parsed the restricted complex type
                    const schema = wsdl.definitions.schemas['http://example.com/test'];
                    expect(schema).toBeDefined();
                    expect(schema.complexTypes).toBeDefined();
                    expect(schema.complexTypes['RestrictedType']).toBeDefined();
                    
                    done();
                });
            });

            it('should handle extension in ComplexContent (existing functionality)', (done) => {
                const wsdlWithExtension = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
             xmlns:tns="http://example.com/test" 
             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
             targetNamespace="http://example.com/test">
  
  <types>
    <xsd:schema targetNamespace="http://example.com/test">
      <xsd:complexType name="BaseType">
        <xsd:sequence>
          <xsd:element name="baseField" type="xsd:string"/>
        </xsd:sequence>
      </xsd:complexType>
      
      <xsd:complexType name="ExtendedType">
        <xsd:complexContent>
          <xsd:extension base="tns:BaseType">
            <xsd:sequence>
              <xsd:element name="extendedField" type="xsd:string"/>
            </xsd:sequence>
          </xsd:extension>
        </xsd:complexContent>
      </xsd:complexType>
      
      <xsd:element name="Request" type="tns:ExtendedType"/>
    </xsd:schema>
  </types>
  
  <message name="RequestMessage">
    <part name="parameters" element="tns:Request"/>
  </message>
  
  <portType name="TestPortType">
    <operation name="TestOp">
      <input message="tns:RequestMessage"/>
    </operation>
  </portType>
  
  <binding name="TestBinding" type="tns:TestPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="TestOp">
      <soap:operation soapAction="TestOp"/>
      <input><soap:body use="literal"/></input>
    </operation>
  </binding>
  
  <service name="TestService">
    <port name="TestPort" binding="tns:TestBinding">
      <soap:address location="http://example.com/test"/>
    </port>
  </service>
</definitions>`;
                
                const wsdl = new (WSDL as any)(wsdlWithExtension, 'http://example.com/test.wsdl', {});
                
                wsdl.onReady((err: Error) => {
                    expect(err).toBeFalsy();
                    expect(wsdl.definitions).toBeDefined();
                    
                    // Should have properly parsed the extended complex type
                    const schema = wsdl.definitions.schemas['http://example.com/test'];
                    expect(schema).toBeDefined();
                    expect(schema.complexTypes).toBeDefined();
                    expect(schema.complexTypes['ExtendedType']).toBeDefined();
                    
                    done();
                });
            });
        });

        describe('Element Key Override (overrideElementKey)', () => {
            it('should store overrideElementKey option correctly', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    overrideElementKey: { 'OldName': 'NewName' }
                });
                expect(wsdl.options.overrideElementKey).toBeDefined();
                expect(wsdl.options.overrideElementKey['OldName']).toBe('NewName');
            });

            it('should allow multiple element key overrides', () => {
                const overrides = {
                    'Element1': 'RenamedElement1',
                    'Element2': 'RenamedElement2',
                    'Element3': 'RenamedElement3'
                };
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    overrideElementKey: overrides
                });
                expect(wsdl.options.overrideElementKey).toEqual(overrides);
            });

            it('should have undefined overrideElementKey when not specified', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
                expect(wsdl.options.overrideElementKey).toBeUndefined();
            });
        });

        describe('Custom Envelope URL (envelopeSoapUrl)', () => {
            it('should store envelopeSoapUrl option correctly', () => {
                const customUrl = 'http://custom.soap.namespace.com/envelope/';
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    envelopeSoapUrl: customUrl
                });
                expect(wsdl.options.envelopeSoapUrl).toBe(customUrl);
            });

            it('should have undefined envelopeSoapUrl when not specified', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
                expect(wsdl.options.envelopeSoapUrl).toBeUndefined();
            });

            it('should allow standard SOAP envelope URLs', () => {
                const soap11Url = 'http://schemas.xmlsoap.org/soap/envelope/';
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    envelopeSoapUrl: soap11Url
                });
                expect(wsdl.options.envelopeSoapUrl).toBe(soap11Url);
            });
        });

        describe('Response Encoding (encoding)', () => {
            it('should use default encoding utf-8 when not specified', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
                expect(wsdl.options.encoding).toBe('utf-8');
            });

            it('should store custom encoding option', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    encoding: 'latin1'
                });
                expect(wsdl.options.encoding).toBe('latin1');
            });

            it('should support various encoding formats', () => {
                const encodings = ['utf-8', 'utf-16', 'latin1', 'iso-8859-1', 'ascii'];
                
                encodings.forEach(encoding => {
                    const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                        encoding
                    });
                    expect(wsdl.options.encoding).toBe(encoding);
                });
            });
        });

        describe('Custom WSDL Cache (wsdlCache)', () => {
            it('should accept custom wsdlCache implementation', () => {
                // Create a simple custom cache
                const customCache = {
                    has: jest.fn((key: string) => false),
                    get: jest.fn((key: string) => undefined),
                    set: jest.fn((key: string, value: any) => {})
                };

                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    wsdlCache: customCache
                });
                
                expect(wsdl.options.wsdlCache).toBe(customCache);
                expect(wsdl.options.wsdlCache.has).toBeDefined();
                expect(wsdl.options.wsdlCache.get).toBeDefined();
                expect(wsdl.options.wsdlCache.set).toBeDefined();
            });

            it('should have undefined wsdlCache when not specified', () => {
                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', {});
                expect(wsdl.options.wsdlCache).toBeUndefined();
            });

            it('should support IWSDLCache interface methods', () => {
                const cache = {
                    has: (key: string) => key === 'test',
                    get: (key: string) => key === 'test' ? 'value' : undefined,
                    set: (key: string, value: any) => {}
                };

                const wsdl = new (WSDL as any)(loadFixture('minimal.wsdl'), 'http://example.com/test.wsdl', { 
                    wsdlCache: cache
                });
                
                expect(wsdl.options.wsdlCache.has('test')).toBe(true);
                expect(wsdl.options.wsdlCache.has('other')).toBe(false);
                expect(wsdl.options.wsdlCache.get('test')).toBe('value');
                expect(wsdl.options.wsdlCache.get('other')).toBeUndefined();
            });
        });
    });

    // Function-based SOAP headers are tested in client-operations.spec.ts
    // Schema merge and namespace fallback are tested implicitly through existing WSDL parsing tests
});
