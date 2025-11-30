import { Injectable } from '@angular/core';
import { createClient } from './soap/soap';
import { HttpClient } from '@angular/common/http';
import { Client } from './soap/interfaces';

export {
  Client,
  WSDL,
  ISoapMethod,
  ISoapMethodResponse,
  BasicAuthSecurity,
  BearerSecurity,
  // WSSecurityCert,
  WSSecurity,
  NTLMSecurity
} from './soap/interfaces';

export { security } from './soap/security/security'

/**
 * NgxSoapService - SOAP client service for Angular
 * 
 * **Backwards Compatible:** Works with Angular 10+ (NgModule or standalone)
 * 
 * This service creates SOAP clients from WSDL files and returns Promises for compatibility.
 * The returned Promise can be wrapped in Angular 20+ resource() or used directly.
 * 
 * @example Basic usage (works in all Angular versions)
 * ```typescript
 * constructor(private soap: NgxSoapService) {
 *   this.soap.createClient('assets/service.wsdl')
 *     .then(client => this.client = client)
 *     .catch(err => console.error(err));
 * }
 * ```
 * 
 * @example Angular 20+ with resource() API
 * ```typescript
 * import { inject, resource } from '@angular/core';
 * 
 * private soap = inject(NgxSoapService);
 * 
 * soapClient = resource({
 *   loader: () => this.soap.createClient('assets/service.wsdl')
 * });
 * ```
 * 
 * @example Angular 16+ with signals
 * ```typescript
 * import { inject, signal } from '@angular/core';
 * 
 * private soap = inject(NgxSoapService);
 * client = signal<Client | null>(null);
 * 
 * constructor() {
 *   this.soap.createClient('assets/service.wsdl')
 *     .then(client => this.client.set(client));
 * }
 * ```
 * 
 * @since 0.10.0
 */
@Injectable({
  providedIn: 'root'
})
export class NgxSoapService {

  constructor(private http: HttpClient) { }

  /**
   * Creates a SOAP client from a WSDL URL
   * 
   * @param wsdlUrl - URL to the WSDL file (can be relative or absolute)
   * @param options - Optional SOAP client configuration options
   * @param endpoint - Optional endpoint override (overrides WSDL endpoint)
   * @returns Promise that resolves to a SOAP Client
   * 
   * @example
   * ```typescript
   * const client = await this.soap.createClient('assets/calculator.wsdl');
   * (client as any).Add({ intA: 1, intB: 2 }).subscribe(result => {
   *   console.log(result.AddResult);
   * });
   * ```
   */
  createClient(wsdlUrl: string, options: any = {}, endpoint?: string): Promise<Client> {
    options.httpClient = this.http;
    return createClient(wsdlUrl, options, endpoint);
  }
}
