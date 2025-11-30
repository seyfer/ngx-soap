import { AppComponent } from './app.component';
import { NgxSoapService, ISoapMethodResponse } from '../../projects/ngx-soap/src/public_api';
import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

// Mock NgxSoapService
const createMockSoapService = (): Partial<NgxSoapService> => ({
    createClient: jest.fn().mockResolvedValue({})
});

describe('AppComponent', () => {
    let component: AppComponent;
    let mockSoapService: Partial<NgxSoapService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideHttpClient(),
                { provide: NgxSoapService, useValue: createMockSoapService() }
            ]
        });

        mockSoapService = TestBed.inject(NgxSoapService);
        component = TestBed.createComponent(AppComponent).componentInstance;
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
        expect(component).toBeInstanceOf(AppComponent);
    });

    it('should have title property', () => {
        expect(component.title).toBeDefined();
    });

    it('title should contain "SOAP"', () => {
        expect(component.title).toContain('SOAP');
    });

    it('should have createClient method available through service', () => {
        expect(mockSoapService.createClient).toBeDefined();
        expect(typeof mockSoapService.createClient).toBe('function');
    });

    describe('Component Initialization', () => {
        it('should initialize soapClient resource', () => {
            // Resource API is lazy-loaded, not called on construction
            expect(component.soapClient).toBeDefined();
            expect(typeof component.soapClient.isLoading).toBe('function');
            expect(typeof component.soapClient.value).toBe('function');
        });

    it('should initialize properties with signals and models', () => {
        expect(component.title).toBe('SOAP Calculator app');
        expect(component.intA()).toBeUndefined();
        expect(component.intB()).toBeUndefined();
        expect(component.loading()).toBe(false);
        expect(component.message()).toBe('');
    });

    it('should have computed signals', () => {
        expect(component.hasValidInputs()).toBe(false);
        expect(component.isReadyToCalculate()).toBe(false);
        
        // Set valid inputs
        component.intA.set(5);
        component.intB.set(3);
        expect(component.hasValidInputs()).toBe(true);
    });

    it('should initialize soapClient resource', () => {
        expect(component.soapClient).toBeDefined();
        expect(typeof component.soapClient.isLoading).toBe('function');
        expect(typeof component.soapClient.hasValue).toBe('function');
        expect(typeof component.soapClient.value).toBe('function');
    });
    });

    describe('sum() method', () => {
        let mockClient: any;

        beforeEach(() => {
            mockClient = {
                Add: jest.fn()
            };
            // Mock the resource value
            jest.spyOn(component.soapClient, 'value').mockReturnValue(mockClient as any);
            component.intA.set(3);
            component.intB.set(2);
        });

        it('should set loading to false after successful response', (done) => {
            mockClient.Add.mockReturnValue(of({
                err: null,
                header: {},
                responseBody: '<soap>...</soap>',
                xml: '<soap>...</soap>',
                result: { AddResult: 5 }
            } as ISoapMethodResponse));
            
            component.sum();
            
            setTimeout(() => {
                expect(component.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should call Add method with correct parameters', () => {
            mockClient.Add.mockReturnValue(of({
                err: null,
                header: {},
                responseBody: '<soap>...</soap>',
                xml: '<soap>...</soap>',
                result: { AddResult: 5 }
            } as ISoapMethodResponse));
            
            component.sum();
            
            expect(mockClient.Add).toHaveBeenCalledWith({
                intA: 3,
                intB: 2
            });
        });

        it('should process successful response', (done) => {
            const response: ISoapMethodResponse = {
                err: null,
                header: {},
                responseBody: '<soap:Envelope>...</soap:Envelope>',
                xml: '<soap:Envelope>...</soap:Envelope>',
                result: { AddResult: 5 }
            };
            mockClient.Add.mockReturnValue(of(response));
            
            component.sum();
            
            setTimeout(() => {
                expect(component.message()).toBe(5);
                expect(component.xmlResponse()).toBe(response.xml);
                expect(component.jsonResponse()).toBe(JSON.stringify(response.result, null, 2));
                expect(component.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should handle errors', (done) => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const error = new Error('SOAP error');
            mockClient.Add.mockReturnValue(throwError(() => error));
            
            component.sum();
            
            setTimeout(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Error calling Add method:', error);
                expect(component.loading()).toBe(false);
                consoleSpy.mockRestore();
                done();
            }, 0);
        });

        it('should handle different input values', () => {
            mockClient.Add.mockReturnValue(of({
                err: null,
                header: {},
                responseBody: '<soap>...</soap>',
                xml: '<soap>...</soap>',
                result: { AddResult: 100 }
            } as ISoapMethodResponse));
            
            component.intA.set(50);
            component.intB.set(50);
            component.sum();
            
            expect(mockClient.Add).toHaveBeenCalledWith({
                intA: 50,
                intB: 50
            });
        });
    });

    describe('subtract() method', () => {
        let mockClient: any;

        beforeEach(() => {
            mockClient = {
                Subtract: jest.fn()
            };
            // Mock the resource value
            jest.spyOn(component.soapClient, 'value').mockReturnValue(mockClient as any);
            component.intA.set(10);
            component.intB.set(3);
        });

        it('should set loading to false after successful response', (done) => {
            mockClient.Subtract.mockReturnValue(of({
                err: null,
                header: {},
                responseBody: '<soap>...</soap>',
                xml: '<soap>...</soap>',
                result: { SubtractResult: 7 }
            } as ISoapMethodResponse));
            
            component.subtract();
            
            setTimeout(() => {
                expect(component.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should call Subtract method with correct parameters', () => {
            mockClient.Subtract.mockReturnValue(of({
                err: null,
                header: {},
                responseBody: '<soap>...</soap>',
                xml: '<soap>...</soap>',
                result: { SubtractResult: 7 }
            } as ISoapMethodResponse));
            
            component.subtract();
            
            expect(mockClient.Subtract).toHaveBeenCalledWith({
                intA: 10,
                intB: 3
            });
        });

        it('should process successful response', (done) => {
            const response: ISoapMethodResponse = {
                err: null,
                header: {},
                responseBody: '<soap:Envelope>...</soap:Envelope>',
                xml: '<soap:Envelope>...</soap:Envelope>',
                result: { SubtractResult: 7 }
            };
            mockClient.Subtract.mockReturnValue(of(response));
            
            component.subtract();
            
            setTimeout(() => {
                expect(component.message()).toBe(7);
                expect(component.xmlResponse()).toBe(response.xml);
                expect(component.jsonResponse()).toBe(JSON.stringify(response.result, null, 2));
                expect(component.loading()).toBe(false);
                done();
            }, 0);
        });

        it('should handle errors', (done) => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const error = new Error('SOAP error');
            mockClient.Subtract.mockReturnValue(throwError(() => error));
            
            component.subtract();
            
            setTimeout(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Error calling Subtract method:', error);
                expect(component.loading()).toBe(false);
                consoleSpy.mockRestore();
                done();
            }, 0);
        });

        it('should handle different input values', () => {
            mockClient.Subtract.mockReturnValue(of({
                err: null,
                header: {},
                responseBody: '<soap>...</soap>',
                xml: '<soap>...</soap>',
                result: { SubtractResult: 25 }
            } as ISoapMethodResponse));
            
            component.intA.set(100);
            component.intB.set(75);
            component.subtract();
            
            expect(mockClient.Subtract).toHaveBeenCalledWith({
                intA: 100,
                intB: 75
            });
        });

        it('should handle negative results', (done) => {
            const response: ISoapMethodResponse = {
                err: null,
                header: {},
                responseBody: '<soap:Envelope>...</soap:Envelope>',
                xml: '<soap:Envelope>...</soap:Envelope>',
                result: { SubtractResult: -5 }
            };
            mockClient.Subtract.mockReturnValue(of(response));
            
            component.intA.set(3);
            component.intB.set(8);
            component.subtract();
            
            setTimeout(() => {
                expect(component.message()).toBe(-5);
                done();
            }, 0);
        });
    });

    describe('toggleDiagnostic() using signal.update()', () => {
        it('should toggle showDiagnostic from false to true', () => {
            expect(component.showDiagnostic()).toBe(false);
            
            component.toggleDiagnostic();
            
            expect(component.showDiagnostic()).toBe(true);
        });

        it('should toggle showDiagnostic from true to false', () => {
            component.showDiagnostic.set(true);
            
            component.toggleDiagnostic();
            
            expect(component.showDiagnostic()).toBe(false);
        });

        it('should toggle multiple times correctly', () => {
            const initial = component.showDiagnostic();
            
            component.toggleDiagnostic();
            expect(component.showDiagnostic()).toBe(!initial);
            
            component.toggleDiagnostic();
            expect(component.showDiagnostic()).toBe(initial);
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero values in sum', () => {
            const mockClient = {
                Add: jest.fn().mockReturnValue(of({
                    err: null,
                    header: {},
                    responseBody: '<soap>...</soap>',
                    xml: '<soap>...</soap>',
                    result: { AddResult: 0 }
                } as ISoapMethodResponse))
            };
            
            // Mock resource value
            jest.spyOn(component.soapClient, 'value').mockReturnValue(mockClient as any);
            jest.spyOn(component.soapClient, 'hasValue').mockReturnValue(true);
            component.intA.set(0);
            component.intB.set(0);
            
            component.sum();
            
            expect(mockClient.Add).toHaveBeenCalledWith({
                intA: 0,
                intB: 0
            });
        });

        it('should handle null client (resource not ready) in sum gracefully', () => {
            jest.spyOn(component.soapClient, 'value').mockReturnValue(null as any);
            
            // Should not throw, just return early
            expect(() => component.sum()).not.toThrow();
        });

        it('should handle null client (resource not ready) in subtract gracefully', () => {
            jest.spyOn(component.soapClient, 'value').mockReturnValue(null as any);
            
            // Should not throw, just return early
            expect(() => component.subtract()).not.toThrow();
        });

        it('should not calculate when hasValidInputs is false', () => {
            const mockClient = {
                Add: jest.fn()
            };
            jest.spyOn(component.soapClient, 'value').mockReturnValue(mockClient as any);
            jest.spyOn(component.soapClient, 'hasValue').mockReturnValue(true);
            
            // Invalid inputs
            component.intA.set(undefined);
            component.intB.set(undefined);
            
            component.sum();
            
            // Should not call Add because inputs are invalid
            expect(mockClient.Add).not.toHaveBeenCalled();
        });
    });
});
