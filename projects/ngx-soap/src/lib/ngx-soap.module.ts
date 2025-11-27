import { NgModule, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxSoapService } from './ngx-soap.service';

/**
 * Provides NgxSoap services for standalone applications (Angular 14+)
 * 
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNgxSoap()
 *   ]
 * });
 * ```
 */
export function provideNgxSoap(): EnvironmentProviders {
  return makeEnvironmentProviders([
    NgxSoapService
  ]);
}

/**
 * NgxSoapModule for traditional NgModule-based applications
 * 
 * @deprecated Use `provideNgxSoap()` for standalone applications instead
 * 
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [NgxSoapModule],
 *   providers: [provideHttpClient()]
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({ 
  exports: [], 
  imports: [], 
  providers: [
    NgxSoapService,
    provideHttpClient(withInterceptorsFromDi())
  ] 
})
export class NgxSoapModule { }
