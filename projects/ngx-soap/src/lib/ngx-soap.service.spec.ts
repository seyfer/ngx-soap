import { NgxSoapService } from './ngx-soap.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';


// Mock HttpClient
const createMockHttpClient = (): jest.Mocked<HttpClient> => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  request: jest.fn(),
} as any);

const PROXIED_CALCULATOR_WSDL = `<?xml version="1.0" encoding="utf-8"?>
<wsdl:definitions 
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
    xmlns:tm="http://microsoft.com/wsdl/mime/textMatching/" 
    xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" 
    xmlns:mime="http://schemas.xmlsoap.org/wsdl/mime/" 
    xmlns:tns="http://tempuri.org/" 
    xmlns:s="http://www.w3.org/2001/XMLSchema" 
    xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/" 
    xmlns:http="http://schemas.xmlsoap.org/wsdl/http/" targetNamespace="http://tempuri.org/" 
    xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">
    <wsdl:types>
        <s:schema elementFormDefault="qualified" targetNamespace="http://tempuri.org/">
            <s:element name="Add">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="intA" type="s:int" />
                        <s:element minOccurs="1" maxOccurs="1" name="intB" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="AddResponse">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="AddResult" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="Subtract">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="intA" type="s:int" />
                        <s:element minOccurs="1" maxOccurs="1" name="intB" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="SubtractResponse">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="SubtractResult" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="Multiply">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="intA" type="s:int" />
                        <s:element minOccurs="1" maxOccurs="1" name="intB" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="MultiplyResponse">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="MultiplyResult" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="Divide">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="intA" type="s:int" />
                        <s:element minOccurs="1" maxOccurs="1" name="intB" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
            <s:element name="DivideResponse">
                <s:complexType>
                    <s:sequence>
                        <s:element minOccurs="1" maxOccurs="1" name="DivideResult" type="s:int" />
                    </s:sequence>
                </s:complexType>
            </s:element>
        </s:schema>
    </wsdl:types>
    <wsdl:message name="AddSoapIn">
        <wsdl:part name="parameters" element="tns:Add" />
    </wsdl:message>
    <wsdl:message name="AddSoapOut">
        <wsdl:part name="parameters" element="tns:AddResponse" />
    </wsdl:message>
    <wsdl:message name="SubtractSoapIn">
        <wsdl:part name="parameters" element="tns:Subtract" />
    </wsdl:message>
    <wsdl:message name="SubtractSoapOut">
        <wsdl:part name="parameters" element="tns:SubtractResponse" />
    </wsdl:message>
    <wsdl:message name="MultiplySoapIn">
        <wsdl:part name="parameters" element="tns:Multiply" />
    </wsdl:message>
    <wsdl:message name="MultiplySoapOut">
        <wsdl:part name="parameters" element="tns:MultiplyResponse" />
    </wsdl:message>
    <wsdl:message name="DivideSoapIn">
        <wsdl:part name="parameters" element="tns:Divide" />
    </wsdl:message>
    <wsdl:message name="DivideSoapOut">
        <wsdl:part name="parameters" element="tns:DivideResponse" />
    </wsdl:message>
    <wsdl:portType name="CalculatorSoap">
        <wsdl:operation name="Add">
            <wsdl:documentation 
                xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">Adds two integers. This is a test WebService. ©DNE Online
            </wsdl:documentation>
            <wsdl:input message="tns:AddSoapIn" />
            <wsdl:output message="tns:AddSoapOut" />
        </wsdl:operation>
        <wsdl:operation name="Subtract">
            <wsdl:input message="tns:SubtractSoapIn" />
            <wsdl:output message="tns:SubtractSoapOut" />
        </wsdl:operation>
        <wsdl:operation name="Multiply">
            <wsdl:input message="tns:MultiplySoapIn" />
            <wsdl:output message="tns:MultiplySoapOut" />
        </wsdl:operation>
        <wsdl:operation name="Divide">
            <wsdl:input message="tns:DivideSoapIn" />
            <wsdl:output message="tns:DivideSoapOut" />
        </wsdl:operation>
    </wsdl:portType>
    <wsdl:binding name="CalculatorSoap" type="tns:CalculatorSoap">
        <soap:binding transport="http://schemas.xmlsoap.org/soap/http" />
        <wsdl:operation name="Add">
            <soap:operation soapAction="http://tempuri.org/Add" style="document" />
            <wsdl:input>
                <soap:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="Subtract">
            <soap:operation soapAction="http://tempuri.org/Subtract" style="document" />
            <wsdl:input>
                <soap:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="Multiply">
            <soap:operation soapAction="http://tempuri.org/Multiply" style="document" />
            <wsdl:input>
                <soap:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="Divide">
            <soap:operation soapAction="http://tempuri.org/Divide" style="document" />
            <wsdl:input>
                <soap:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
    </wsdl:binding>
    <wsdl:binding name="CalculatorSoap12" type="tns:CalculatorSoap">
        <soap12:binding transport="http://schemas.xmlsoap.org/soap/http" />
        <wsdl:operation name="Add">
            <soap12:operation soapAction="http://tempuri.org/Add" style="document" />
            <wsdl:input>
                <soap12:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap12:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="Subtract">
            <soap12:operation soapAction="http://tempuri.org/Subtract" style="document" />
            <wsdl:input>
                <soap12:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap12:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="Multiply">
            <soap12:operation soapAction="http://tempuri.org/Multiply" style="document" />
            <wsdl:input>
                <soap12:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap12:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
        <wsdl:operation name="Divide">
            <soap12:operation soapAction="http://tempuri.org/Divide" style="document" />
            <wsdl:input>
                <soap12:body use="literal" />
            </wsdl:input>
            <wsdl:output>
                <soap12:body use="literal" />
            </wsdl:output>
        </wsdl:operation>
    </wsdl:binding>
    <wsdl:service name="Calculator">
        <wsdl:port name="CalculatorSoap" binding="tns:CalculatorSoap">
            <soap:address location="/calculator/calculator.asmx" />
        </wsdl:port>
        <wsdl:port name="CalculatorSoap12" binding="tns:CalculatorSoap12">
            <soap12:address location="/calculator/calculator.asmx" />
        </wsdl:port>
    </wsdl:service>
</wsdl:definitions>`;

describe('NgxSoapService', () => {
    let service: NgxSoapService;
    let mockHttpClient: jest.Mocked<HttpClient>;

    beforeEach(() => {
        mockHttpClient = createMockHttpClient();
        service = new NgxSoapService(mockHttpClient);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(NgxSoapService);
    });

    it('should have createClient method', () => {
        expect(service.createClient).toBeDefined();
        expect(typeof service.createClient).toBe('function');
    });

    it('should pass httpClient to options when createClient is called', () => {
        const wsdlUrl = '/calculator.wsdl';
        const options: any = { disableCache: true };
        
        // Call createClient (it will fail to actually create client without proper mocks, but that's ok)
        service.createClient(wsdlUrl, options).catch(() => {
            // Expected to fail without proper WSDL response
        });
        
        // Verify the httpClient was passed in options
        expect(options.httpClient).toBe(mockHttpClient);
    });

    it('should accept endpoint parameter in createClient', () => {
        const wsdlUrl = '/test.wsdl';
        const options: any = { disableCache: true };
        const endpoint = 'http://example.com/soap';
        
        service.createClient(wsdlUrl, options, endpoint).catch(() => {
            // Expected to fail without proper WSDL response
        });
        
        // The service should add httpClient to the options
        expect(options.httpClient).toBe(mockHttpClient);
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            const networkError = new Error('Network error');
            mockHttpClient.get.mockReturnValue(throwError(() => networkError) as any);
            
            await expect(service.createClient('/test.wsdl'))
                .rejects.toThrow();
        });

        it('should handle invalid WSDL XML', async () => {
            mockHttpClient.get.mockReturnValue(of('Invalid XML content') as any);
            
            await expect(service.createClient('/invalid.wsdl'))
                .rejects.toThrow();
        });

        it('should handle empty WSDL response', async () => {
            mockHttpClient.get.mockReturnValue(of('') as any);
            
            await expect(service.createClient('/empty.wsdl'))
                .rejects.toThrow();
        });

        it('should handle malformed WSDL structure', async () => {
            const malformedWsdl = '<?xml version="1.0"?><root></root>';
            mockHttpClient.get.mockReturnValue(of(malformedWsdl) as any);
            
            await expect(service.createClient('/malformed.wsdl'))
                .rejects.toThrow();
        });
    });

    describe('Options Handling', () => {
        it('should work with empty options object', () => {
            service.createClient('/test.wsdl', {}).catch(() => {
                // Expected to fail without proper WSDL response
            });
            
            expect(mockHttpClient.get).toHaveBeenCalled();
        });

        it('should work without options parameter', () => {
            service.createClient('/test.wsdl').catch(() => {
                // Expected to fail without proper WSDL response
            });
            
            expect(mockHttpClient.get).toHaveBeenCalled();
        });

        it('should preserve existing options while adding httpClient', () => {
            const options: any = { 
                disableCache: true,
                customOption: 'test',
                endpoint: 'http://example.com'
            };
            
            service.createClient('/test.wsdl', options).catch(() => {
                // Expected to fail without proper WSDL response
            });
            
            expect(options.httpClient).toBe(mockHttpClient);
            expect(options.disableCache).toBe(true);
            expect(options.customOption).toBe('test');
            expect(options.endpoint).toBe('http://example.com');
        });
    });

    describe('WSDL Client Creation', () => {
        it('should create client with valid WSDL', async () => {
            mockHttpClient.get.mockReturnValue(of(PROXIED_CALCULATOR_WSDL) as any);
            
            const client = await service.createClient('/calculator.wsdl', { disableCache: true });
            
            expect(client).toBeTruthy();
            expect(client).toHaveProperty('describe');
            expect(mockHttpClient.get).toHaveBeenCalledWith('/calculator.wsdl', { responseType: 'text' });
        });

        it('should create client with custom endpoint', async () => {
            mockHttpClient.get.mockReturnValue(of(PROXIED_CALCULATOR_WSDL) as any);
            const customEndpoint = 'http://custom.example.com/soap';
            
            const client = await service.createClient(
                '/calculator.wsdl',
                { disableCache: true },
                customEndpoint
            );
            
            expect(client).toBeTruthy();
        });

        it('should handle WSDL with multiple services', async () => {
            mockHttpClient.get.mockReturnValue(of(PROXIED_CALCULATOR_WSDL) as any);
            
            const client = await service.createClient('/calculator.wsdl', { disableCache: true });
            
            expect(client).toBeTruthy();
            const description = client.describe();
            expect(description).toBeTruthy();
        });
    });

    describe('HTTP Client Integration', () => {
        it('should make GET request for WSDL with correct parameters', async () => {
            mockHttpClient.get.mockReturnValue(of(PROXIED_CALCULATOR_WSDL) as any);
            const wsdlUrl = '/service.wsdl';
            
            await service.createClient(wsdlUrl, { disableCache: true });
            
            expect(mockHttpClient.get).toHaveBeenCalledWith(
                wsdlUrl,
                expect.objectContaining({ responseType: 'text' })
            );
        });

        it('should pass httpClient to SOAP client for operations', async () => {
            mockHttpClient.get.mockReturnValue(of(PROXIED_CALCULATOR_WSDL) as any);
            
            const options: any = { disableCache: true };
            await service.createClient('/calculator.wsdl', options);
            
            expect(options.httpClient).toBe(mockHttpClient);
        });
    });
});
