import { HttpClient as SoapHttpClient } from '../../src/lib/soap/http';

describe('HttpClient', () => {
    describe('Constructor', () => {
        it('should create instance with default options', () => {
            const client = new (SoapHttpClient as any)();
            
            expect(client).toBeDefined();
            expect(client._request).toBeNull();
        });

        it('should create instance with custom request', () => {
            const customRequest = jest.fn();
            const client = new (SoapHttpClient as any)({ request: customRequest });
            
            expect(client._request).toBe(customRequest);
        });

        it('should create instance with empty options object', () => {
            const client = new (SoapHttpClient as any)({});
            
            expect(client).toBeDefined();
            expect(client._request).toBeNull();
        });

        it('should handle undefined options', () => {
            const client = new (SoapHttpClient as any)(undefined);
            
            expect(client).toBeDefined();
            expect(client._request).toBeNull();
        });

        it('should handle null options', () => {
            const client = new (SoapHttpClient as any)(null);
            
            expect(client).toBeDefined();
            expect(client._request).toBeNull();
        });
    });

    describe('buildRequest', () => {
        let client: any;

        beforeEach(() => {
            client = new (SoapHttpClient as any)();
            // Suppress console.log in tests
            jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should build GET request without data', () => {
            const request = client.buildRequest('http://example.com/service', null);
            
            expect(request.method).toBe('GET');
            expect(request.body).toBeNull();
        });

        it('should build POST request with data', () => {
            const data = '<soap:Envelope>test</soap:Envelope>';
            const request = client.buildRequest('http://example.com/service', data);
            
            expect(request.method).toBe('POST');
            expect(request.body).toBe(data);
        });

        it('should set default headers', () => {
            const request = client.buildRequest('http://example.com/service', null);
            
            expect(request.headers).toBeDefined();
            expect(request.headers['User-Agent']).toContain('node-soap');
            expect(request.headers['Accept']).toContain('application/xml');
            expect(request.headers['Accept-Encoding']).toBe('none');
            expect(request.headers['Accept-Charset']).toBe('utf-8');
        });

        it('should set Host header with hostname', () => {
            const request = client.buildRequest('http://example.com/service', null);
            
            expect(request.headers['Host']).toBe('example.com');
        });

        it('should set Host header with hostname and port', () => {
            const request = client.buildRequest('http://example.com:8080/service', null);
            
            expect(request.headers['Host']).toBe('example.com:8080');
        });

        it('should set Content-Length for string data', () => {
            const data = 'test data';
            const request = client.buildRequest('http://example.com/service', data);
            
            expect(request.headers['Content-Length']).toBe(Buffer.byteLength(data, 'utf8'));
        });

        it('should set Content-Type for string data', () => {
            const data = 'test data';
            const request = client.buildRequest('http://example.com/service', data);
            
            expect(request.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
        });

        it('should merge extra headers', () => {
            const exheaders = {
                'X-Custom-Header': 'custom-value',
                'Authorization': 'Bearer token123'
            };
            const request = client.buildRequest('http://example.com/service', null, exheaders);
            
            expect(request.headers['X-Custom-Header']).toBe('custom-value');
            expect(request.headers['Authorization']).toBe('Bearer token123');
        });

        it('should override default headers with extra headers', () => {
            const exheaders = {
                'Accept': 'application/json'
            };
            const request = client.buildRequest('http://example.com/service', null, exheaders);
            
            expect(request.headers['Accept']).toBe('application/json');
        });

        it('should set Connection to close by default', () => {
            const request = client.buildRequest('http://example.com/service', null);
            
            expect(request.headers['Connection']).toBe('close');
        });

        it('should set Connection to keep-alive when forever option is true', () => {
            const exoptions = { forever: true };
            const request = client.buildRequest('http://example.com/service', null, null, exoptions);
            
            expect(request.headers['Connection']).toBe('keep-alive');
        });

        it('should set followAllRedirects to true', () => {
            const request = client.buildRequest('http://example.com/service', null);
            
            expect(request.followAllRedirects).toBe(true);
        });

        it('should parse and include URL path', () => {
            const request = client.buildRequest('http://example.com/path/to/service', null);
            
            expect(request.uri.pathname).toBe('/path/to/service');
        });

        it('should parse and include URL query string', () => {
            const request = client.buildRequest('http://example.com/service?param=value', null);
            
            expect(request.uri.search).toBe('?param=value');
        });

        it('should parse and include URL hash', () => {
            const request = client.buildRequest('http://example.com/service#anchor', null);
            
            expect(request.uri.hash).toBe('#anchor');
        });

        it('should handle HTTPS URLs', () => {
            const request = client.buildRequest('https://secure.example.com/service', null);
            
            expect(request.uri.protocol).toBe('https:');
        });

        it('should merge extra options', () => {
            const exoptions = {
                timeout: 5000,
                strictSSL: false
            };
            const request = client.buildRequest('http://example.com/service', null, null, exoptions);
            
            expect(request.timeout).toBe(5000);
            expect(request.strictSSL).toBe(false);
        });

        it('should deep merge headers from extra options', () => {
            const exheaders = { 'X-Header-1': 'value1' };
            const exoptions = {
                headers: { 'X-Header-2': 'value2' }
            };
            const request = client.buildRequest('http://example.com/service', null, exheaders, exoptions);
            
            expect(request.headers['X-Header-1']).toBe('value1');
            expect(request.headers['X-Header-2']).toBe('value2');
        });

        it('should handle empty URL path', () => {
            const request = client.buildRequest('http://example.com', null);
            
            expect(request.uri.pathname).toBe('/');
        });

        it('should handle unicode in data', () => {
            const data = '<?xml version="1.0"?><message>こんにちは</message>';
            const request = client.buildRequest('http://example.com/service', data);
            
            expect(request.body).toBe(data);
            expect(request.headers['Content-Length']).toBe(Buffer.byteLength(data, 'utf8'));
        });

        it('should handle very long URLs', () => {
            const longPath = '/path/' + 'segment/'.repeat(100);
            const url = 'http://example.com' + longPath;
            const request = client.buildRequest(url, null);
            
            expect(request.uri.pathname).toBe(longPath);
        });

        it('should handle URLs with authentication', () => {
            const request = client.buildRequest('http://user:pass@example.com/service', null);
            
            expect(request.uri.hostname).toBe('example.com');
            expect(request.uri.auth).toBe('user:pass');
        });

        it('should handle special characters in query parameters', () => {
            const request = client.buildRequest('http://example.com/service?key=value%20with%20spaces', null);
            
            expect(request.uri.search).toBe('?key=value%20with%20spaces');
        });

        it('should not modify original options objects', () => {
            const exheaders = { 'X-Original': 'value' };
            const exoptions = { timeout: 1000 };
            
            client.buildRequest('http://example.com/service', null, exheaders, exoptions);
            
            expect(Object.keys(exheaders)).toEqual(['X-Original']);
            expect(Object.keys(exoptions)).toEqual(['timeout']);
        });
    });

    describe('handleResponse', () => {
        let client: any;

        beforeEach(() => {
            client = new (SoapHttpClient as any)();
            // Suppress console.log in tests
            jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should extract SOAP envelope from response', () => {
            const body = '<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Response>test</Response></soap:Body></soap:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('<soap:Envelope');
            expect(result).toContain('</soap:Envelope>');
        });

        it('should remove content before SOAP envelope', () => {
            const body = 'Some garbage\n<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>test</soap:Body></soap:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).not.toContain('Some garbage');
            expect(result).toContain('<soap:Envelope');
        });

        it('should remove content after SOAP envelope', () => {
            const body = '<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>test</soap:Body></soap:Envelope>trailing content';
            const result = client.handleResponse(null, null, body);
            
            expect(result).not.toContain('trailing content');
            expect(result).toContain('</soap:Envelope>');
        });

        it('should remove XML comments', () => {
            const body = '<!-- Comment --><?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>test</soap:Body></soap:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).not.toContain('<!-- Comment -->');
            expect(result).toContain('<soap:Envelope');
        });

        it('should handle SOAP12 envelope', () => {
            const body = '<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope"><env:Body>test</env:Body></env:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('<env:Envelope');
            expect(result).toContain('</env:Envelope>');
        });

        it('should handle envelope with different namespace prefix', () => {
            const body = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>test</s:Body></s:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('<s:Envelope');
            expect(result).toContain('</s:Envelope>');
        });

        it('should return body as-is when envelope not found', () => {
            const body = '<xml>not a soap envelope</xml>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toBe(body);
        });

        it('should handle non-string body', () => {
            const body = { data: 'test' };
            const result = client.handleResponse(null, null, body);
            
            expect(result).toBe(body);
        });

        it('should handle null body', () => {
            const result = client.handleResponse(null, null, null);
            
            expect(result).toBeNull();
        });

        it('should handle undefined body', () => {
            const result = client.handleResponse(null, null, undefined);
            
            expect(result).toBeUndefined();
        });

        it('should handle empty string body', () => {
            const result = client.handleResponse(null, null, '');
            
            expect(result).toBe('');
        });

        it('should handle multiline SOAP envelope', () => {
            const body = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <Response>test</Response>
  </soap:Body>
</soap:Envelope>`;
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('<soap:Envelope');
            expect(result).toContain('</soap:Envelope>');
        });

        it('should handle SOAP envelope with attributes', () => {
            const body = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soap:Body>test</soap:Body></soap:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('xmlns:soap');
            expect(result).toContain('xmlns:xsi');
        });

        it('should handle nested XML comments', () => {
            const body = '<!-- outer <!-- inner --> comment --><?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>test</soap:Body></soap:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('<soap:Envelope');
        });

        it('should preserve envelope content exactly', () => {
            const envelope = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Data attr="value">content</Data></soap:Body></soap:Envelope>';
            const body = 'prefix' + envelope + 'suffix';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toBe(envelope);
        });

        it('should handle case-insensitive envelope matching', () => {
            const body = '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body>test</SOAP:Body></SOAP:Envelope>';
            const result = client.handleResponse(null, null, body);
            
            expect(result).toContain('Envelope');
        });
    });

    describe('request', () => {
        let client: any;
        let mockRequest: jest.Mock;

        beforeEach(() => {
            mockRequest = jest.fn();
            client = new (SoapHttpClient as any)({ request: mockRequest });
            jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should call _request with built request options', () => {
            const callback = jest.fn();
            
            client.request('http://example.com/service', 'data', callback);
            
            expect(mockRequest).toHaveBeenCalled();
            const callArgs = mockRequest.mock.calls[0][0];
            expect(callArgs.method).toBe('POST');
            expect(callArgs.body).toBe('data');
        });

        it('should handle successful response', () => {
            const callback = jest.fn();
            const mockResponse = { statusCode: 200 };
            const mockBody = '<soap:Envelope>response</soap:Envelope>';
            
            mockRequest.mockImplementation((options, cb) => {
                cb(null, mockResponse, mockBody);
                return {};
            });
            
            client.request('http://example.com/service', 'data', callback);
            
            expect(callback).toHaveBeenCalledWith(null, mockResponse, expect.any(String));
        });

        it('should handle request error', () => {
            const callback = jest.fn();
            const mockError = new Error('Network error');
            
            mockRequest.mockImplementation((options, cb) => {
                cb(mockError);
                return {};
            });
            
            client.request('http://example.com/service', 'data', callback);
            
            expect(callback).toHaveBeenCalledWith(mockError);
        });

        it('should pass extra headers to buildRequest', () => {
            const callback = jest.fn();
            const exheaders = { 'X-Custom': 'value' };
            
            mockRequest.mockImplementation((options, cb) => {
                expect(options.headers['X-Custom']).toBe('value');
                cb(null, {}, '');
                return {};
            });
            
            client.request('http://example.com/service', 'data', callback, exheaders);
            
            expect(mockRequest).toHaveBeenCalled();
        });

        it('should pass extra options to buildRequest', () => {
            const callback = jest.fn();
            const exoptions = { timeout: 5000 };
            
            mockRequest.mockImplementation((options, cb) => {
                expect(options.timeout).toBe(5000);
                cb(null, {}, '');
                return {};
            });
            
            client.request('http://example.com/service', 'data', callback, null, exoptions);
            
            expect(mockRequest).toHaveBeenCalled();
        });

        it('should process response body through handleResponse', () => {
            const callback = jest.fn();
            const rawBody = 'prefix<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>test</soap:Body></soap:Envelope>suffix';
            
            mockRequest.mockImplementation((options, cb) => {
                cb(null, {}, rawBody);
                return {};
            });
            
            client.request('http://example.com/service', 'data', callback);
            
            const processedBody = callback.mock.calls[0][2];
            expect(processedBody).not.toContain('prefix');
            expect(processedBody).not.toContain('suffix');
            expect(processedBody).toContain('<soap:Envelope');
        });

        it('should return request object', () => {
            const callback = jest.fn();
            const mockReqObject = { abort: jest.fn() };
            
            mockRequest.mockReturnValue(mockReqObject);
            
            const result = client.request('http://example.com/service', 'data', callback);
            
            expect(result).toBe(mockReqObject);
        });

        it('should handle NTLM authentication when specified', () => {
            const callback = jest.fn();
            const exoptions = { 
                ntlm: {
                    username: 'user',
                    password: 'pass',
                    domain: 'DOMAIN'
                }
            };
            
            // For NTLM, the request method is null, so we need to mock httpNtlm instead
            // This test verifies the code path exists
            client.request('http://example.com/service', 'data', callback, null, exoptions);
            
            // NTLM path doesn't call _request
            expect(mockRequest).not.toHaveBeenCalled();
        });
    });

    describe('requestStream', () => {
        let client: any;
        let mockRequest: jest.Mock;

        beforeEach(() => {
            mockRequest = jest.fn();
            client = new (SoapHttpClient as any)({ request: mockRequest });
            jest.spyOn(console, 'log').mockImplementation();
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should call _request and return stream', () => {
            const mockStream = { pipe: jest.fn() };
            mockRequest.mockReturnValue(mockStream);
            
            const result = client.requestStream('http://example.com/service', 'data');
            
            expect(mockRequest).toHaveBeenCalled();
            expect(result).toBe(mockStream);
        });

        it('should build request with provided data', () => {
            const data = '<soap>test</soap>';
            
            client.requestStream('http://example.com/service', data);
            
            const callArgs = mockRequest.mock.calls[0][0];
            expect(callArgs.body).toBe(data);
            expect(callArgs.method).toBe('POST');
        });

        it('should pass extra headers to buildRequest', () => {
            const exheaders = { 'X-Stream-Header': 'value' };
            
            client.requestStream('http://example.com/service', 'data', exheaders);
            
            const callArgs = mockRequest.mock.calls[0][0];
            expect(callArgs.headers['X-Stream-Header']).toBe('value');
        });

        it('should pass extra options to buildRequest', () => {
            const exoptions = { timeout: 10000 };
            
            client.requestStream('http://example.com/service', 'data', null, exoptions);
            
            const callArgs = mockRequest.mock.calls[0][0];
            expect(callArgs.timeout).toBe(10000);
        });

        it('should handle GET request for stream without data', () => {
            client.requestStream('http://example.com/service', null);
            
            const callArgs = mockRequest.mock.calls[0][0];
            expect(callArgs.method).toBe('GET');
        });
    });

    describe('Integration', () => {
        it('should handle complete request/response cycle', () => {
            const mockRequest = jest.fn((options, callback) => {
                const response = { statusCode: 200, headers: {} };
                const body = '<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Response>Success</Response></soap:Body></soap:Envelope>';
                callback(null, response, body);
                return {};
            });
            
            const client = new (SoapHttpClient as any)({ request: mockRequest });
            jest.spyOn(console, 'log').mockImplementation();
            
            const callback = jest.fn();
            client.request(
                'http://api.example.com/soap',
                '<Request>test</Request>',
                callback,
                { 'Authorization': 'Bearer token' },
                { timeout: 5000 }
            );
            
            expect(callback).toHaveBeenCalledWith(
                null,
                expect.objectContaining({ statusCode: 200 }),
                expect.stringContaining('<soap:Envelope')
            );
            
            jest.restoreAllMocks();
        });

        it('should handle network timeout error', () => {
            const mockRequest = jest.fn((options, callback) => {
                callback(new Error('ETIMEDOUT'));
                return {};
            });
            
            const client = new (SoapHttpClient as any)({ request: mockRequest });
            jest.spyOn(console, 'log').mockImplementation();
            
            const callback = jest.fn();
            client.request('http://example.com/service', 'data', callback);
            
            expect(callback).toHaveBeenCalledWith(expect.objectContaining({
                message: 'ETIMEDOUT'
            }));
            
            jest.restoreAllMocks();
        });

        it('should handle multiple sequential requests', () => {
            let callCount = 0;
            const mockRequest = jest.fn((options, callback) => {
                callCount++;
                callback(null, { statusCode: 200 }, `<soap:Envelope>Response ${callCount}</soap:Envelope>`);
                return {};
            });
            
            const client = new (SoapHttpClient as any)({ request: mockRequest });
            jest.spyOn(console, 'log').mockImplementation();
            
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            client.request('http://example.com/service1', 'data1', callback1);
            client.request('http://example.com/service2', 'data2', callback2);
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
            expect(mockRequest).toHaveBeenCalledTimes(2);
            
            jest.restoreAllMocks();
        });
    });
});

