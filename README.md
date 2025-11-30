# ngx-soap-next

[![npm version](https://img.shields.io/npm/v/ngx-soap-next.svg)](https://www.npmjs.com/package/ngx-soap-next)
[![Angular](https://img.shields.io/badge/Angular-20-red.svg)](https://angular.io)

Simple SOAP client for Angular based on [node-soap](https://github.com/vpulim/node-soap).

**✨ Angular 20 Ready** with full support for signals, standalone components, and modern features.

**🔄 Backwards Compatible** - Works with Angular 10+ (both NgModule and standalone).

## Installation

```bash
npm install ngx-soap-next
npm install buffer concat-stream core-js crypto-js events lodash sax stream debug
```

## Quick Start

### Standalone Components (Angular 14+)

**Recommended for new applications**

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxSoap } from 'ngx-soap-next';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNgxSoap()
  ]
});
```

### NgModule-based Applications

**For existing NgModule apps**

```typescript
import { NgModule } from '@angular/core';
import { NgxSoapModule } from 'ngx-soap-next';

@NgModule({
  imports: [NgxSoapModule]
})
export class AppModule { }
```

## Usage Examples

### Basic Usage (All Angular Versions)

```typescript
import { Component, inject } from '@angular/core';
import { NgxSoapService, Client, ISoapMethodResponse } from 'ngx-soap-next';

@Component({
  selector: 'app-calculator',
  standalone: true
})
export class CalculatorComponent {
  private soap = inject(NgxSoapService);
  client: Client | null = null;

  async ngOnInit() {
    this.client = await this.soap.createClient('assets/calculator.wsdl');
  }

  calculate(a: number, b: number) {
    if (!this.client) return;
    
    (this.client as any).Add({ intA: a, intB: b })
      .subscribe((res: ISoapMethodResponse) => {
        console.log('Result:', res.result.AddResult);
      });
  }
}
```

### Angular 20+ with Modern Features

```typescript
import { Component, computed, model, inject, resource } from '@angular/core';
import { NgxSoapService, ISoapMethodResponse } from 'ngx-soap-next';

@Component({
  selector: 'app-calculator',
  standalone: true,
  template: `
    @if (soapClient.isLoading()) {
      <p>Loading...</p>
    }
    @if (soapClient.error()) {
      <p>Error: {{ soapClient.error()?.message }}</p>
    }
    @if (soapClient.value()) {
      <input type="number" [(ngModel)]="intA">
      <input type="number" [(ngModel)]="intB">
      <button (click)="calculate()" [disabled]="!isValid()">Calculate</button>
      <p>Result: {{ result() }}</p>
    }
  `
})
export class CalculatorComponent {
  private soap = inject(NgxSoapService);
  
  // 🆕 Angular 20 features
  intA = model<number>(0);
  intB = model<number>(0);
  result = signal('');
  
  isValid = computed(() => !isNaN(this.intA()) && !isNaN(this.intB()));
  
  soapClient = resource({
    loader: () => this.soap.createClient('assets/calculator.wsdl')
  });

  calculate() {
    const client = this.soapClient.value();
    if (!client) return;
    
    (client as any).Add({ intA: this.intA(), intB: this.intB() })
      .subscribe((res: ISoapMethodResponse) => {
        this.result.set(res.result.AddResult);
      });
  }
}
```

## API Reference

### `provideNgxSoap()`

Provider function for standalone applications.

```typescript
provideNgxSoap(): EnvironmentProviders
```

### `NgxSoapModule`

NgModule for traditional applications. Includes `NgxSoapService` and `HttpClient`.

### `NgxSoapService`

Main service for creating SOAP clients.

#### `createClient(wsdlUrl, options?, endpoint?): Promise<Client>`

Creates a SOAP client from a WSDL URL.

**Parameters:**

- `wsdlUrl` - URL to WSDL file (relative or absolute)
- `options` - Optional configuration object
- `endpoint` - Optional endpoint override

**Returns:** Promise that resolves to a SOAP Client

**Example:**

```typescript
const client = await this.soap.createClient('assets/service.wsdl');
```

## Configuration Options

Common options for `createClient()`:

```typescript
{
  endpoint: 'https://api.example.com/soap',  // Override WSDL endpoint
  forceSoap12Headers: false,                  // Use SOAP 1.2
  returnFault: true,                          // Return faults as data
  envelopeKey: 'soap',                        // Envelope prefix
  disableCache: true,                         // Disable WSDL cache
  exchangeId: 'custom-id'                     // Request tracking ID
}
```

See [full options list](./docs/OPTIONS.md).

## Security

### Basic Authentication

```typescript
import { security } from 'ngx-soap-next';

const client = await this.soap.createClient('service.wsdl');
client.setSecurity(new security.BasicAuthSecurity('user', 'pass'));
```

### Bearer Token

```typescript
client.setSecurity(new security.BearerSecurity('your-token'));
```

### WS-Security

```typescript
const wsSecurity = new security.WSSecurity('user', 'pass', {
  passwordType: 'PasswordText',
  hasTimeStamp: true
});
client.setSecurity(wsSecurity);
```

See all security options: `BasicAuthSecurity`, `BearerSecurity`, `WSSecurity`, `WSSecurityCert`, `WSSecurityCertWithToken`, `WSSecurityPlusCert`.

## Version History

This package version follows Angular versions:

- `0.20.x` = Angular 20
- `0.19.x` = Angular 19
- `0.18.x` = Angular 18

See [CHANGELOG.md](./CHANGELOG.md) for details.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
npm run test:lib          # Library only
npm run test:coverage     # With coverage

# Build
npm run build:lib         # Build library
npm run build             # Build example app

# Dev server
npm start
```

See example app in `src/app/` for full working demos.

## Publishing (Maintainers)

```bash
# Version bump
npm run bump:patch        # 0.20.0 → 0.20.1
npm run bump:minor        # 0.20.0 → 0.21.0

# Build and publish
npm run build:lib:publish
# or
npm run build:lib:publish:dry-run
```

## License

MIT

## Links

- [GitHub Repository](https://github.com/seyfer/ngx-soap)
- [npm Package](https://www.npmjs.com/package/ngx-soap-next)
- [Issues](https://github.com/seyfer/ngx-soap/issues)
- [Example App](./src/app) - Working Angular 20 examples

## Credits

Based on [node-soap](https://github.com/vpulim/node-soap) by vpulim.

**Maintainers:**

- [Oleg Abrazhaev](https://github.com/seyfer)
- [Luca Lulani](https://github.com/lula)
- [Marc Ward](https://github.com/marcward)
