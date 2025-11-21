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
});
