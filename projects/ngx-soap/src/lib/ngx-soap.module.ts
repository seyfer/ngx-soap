import { NgModule, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxSoapService } from './ngx-soap.service';

/**
 * Provides NgxSoap services for standalone applications (Angular 14+)
 * 
 * **Recommended for Angular 14+ standalone applications**
 * 
 * This is the modern approach for Angular 14+ projects using standalone components.
 * Works seamlessly with Angular 20 features like signals, computed(), and resource().
 * 
 * @example
 * ```typescript
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { provideHttpClient } from '@angular/common/http';
 * import { provideNgxSoap } from 'ngx-soap-next';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideHttpClient(),
 *     provideNgxSoap()
 *   ]
 * });
 * ```
 * 
 * @since 0.17.0 (Angular 14+)
 */
export function provideNgxSoap(): EnvironmentProviders {
  return makeEnvironmentProviders([
    NgxSoapService
  ]);
}

/**
 * NgxSoapModule for traditional NgModule-based applications
 * 
 * **Fully supported for NgModule-based applications (Angular 10+)**
 * 
 * Use this module in traditional NgModule-based Angular applications.
 * Both NgModule and standalone approaches are fully supported for backwards compatibility.
 * 
 * For new standalone applications, consider using `provideNgxSoap()` instead.
 * 
 * @example NgModule-based application
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { NgxSoapModule } from 'ngx-soap-next';
 * import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
 * 
 * @NgModule({
 *   imports: [NgxSoapModule],
 *   // Or provide HttpClient separately:
 *   // providers: [provideHttpClient(withInterceptorsFromDi())]
 * })
 * export class AppModule { }
 * ```
 * 
 * @since 0.10.0 (Angular 10+)
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
