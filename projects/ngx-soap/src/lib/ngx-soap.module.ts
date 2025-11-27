import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ exports: [], imports: [], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class NgxSoapModule { }
