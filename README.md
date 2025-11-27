# ngx-soap-next

Simple SOAP client for Angular based on amazing [node-soap](https://github.com/vpulim/node-soap).

✨ **Now with Angular 19 support!** Featuring modern standalone components, signals, and improved developer experience.

Project has been recreated from scratch with Angular CLI.

Please be aware, this package version number will be equal to the corresponding Angular version:
0.10.x = v10, 0.11.x = v11, ... 0.17.x = v17, 0.18.x = v18, **0.19.x = v19**

## Installation

```bash
npm install --save ngx-soap-next
npm install --save buffer concat-stream core-js crypto-js events lodash sax stream debug
```

## Usage

### 🆕 Modern Approach (Angular 14+, Standalone Components)

**Recommended for new applications using Angular 14+ standalone components**

#### 1. Configure providers in `main.ts` or `app.config.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxSoap } from 'ngx-soap-next';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNgxSoap()  // 🆕 Modern provider function
  ]
});
```

#### 2. Use in your standalone component with signals and inject():

```typescript
import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxSoapService, Client, ISoapMethodResponse } from 'ngx-soap-next';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Modern signals for reactive state (Angular 16+)
  intA = signal(2);
  intB = signal(3);
  result = signal('');
  
  // Modern inject() for DI (Angular 14+)
  private soap = inject(NgxSoapService);
  private destroyRef = inject(DestroyRef);
  
  client: Client | null = null;

  constructor() {
    this.soap.createClient('assets/calculator.wsdl')
      .then(client => this.client = client)
      .catch(err => console.error('Error creating SOAP client:', err));
  }

  sum() {
    if (!this.client) return;
    
    const body = {
      intA: this.intA(),  // Read signal value
      intB: this.intB()
    };
    
    (<any>this.client).Add(body)
      .pipe(takeUntilDestroyed(this.destroyRef))  // Automatic cleanup (Angular 16+)
      .subscribe({
        next: (res: ISoapMethodResponse) => {
          this.result.set(res.result.AddResult);  // Update signal
        },
        error: (err) => console.error('Error calling Add:', err)
      });
  }
}
```

#### 3. Use modern control flow in your template:

```html
<!-- Modern @if syntax (Angular 17+) -->
@if (result()) {
  <p>Result: {{ result() }}</p>
}

<!-- Modern @for syntax (Angular 17+) -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

---

### 📦 Traditional Approach (NgModule-based)

**For existing applications using NgModules**

#### 1. Add NgxSoapModule to your app module:

```typescript
import { NgxSoapModule } from 'ngx-soap-next';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxSoapModule  // Import the module
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### 2. Inject NgxSoapService in your component:

```typescript
import { Component } from '@angular/core';
import { NgxSoapService, Client, ISoapMethodResponse } from 'ngx-soap-next';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent {
  client: Client;
  intA = 2;
  intB = 3;
  
  constructor(private soap: NgxSoapService) {
    this.soap.createClient('assets/calculator.wsdl')
      .then(client => this.client = client)
      .catch(err => console.error('Error:', err));
  }
  
  sum() {
    const body = {
      intA: this.intA,
      intB: this.intB
    };
    (<any>this.client).Add(body).subscribe(
      (res: ISoapMethodResponse) => this.message = res.result.AddResult
    );
  }
}
```

## 🆕 What's New in v0.19.0 (Angular 19)

### Framework Updates
- ✅ Angular 19.2.16 support
- ✅ TypeScript 5.8.3
- ✅ Jest 30 + jest-preset-angular 15
- ✅ Modern standalone components architecture

### Modern Angular Features
- **Signals**: Reactive state management with `signal()`
- **New Control Flow**: `@if`, `@else`, `@for`, `@defer` syntax
- **inject()**: Modern dependency injection
- **takeUntilDestroyed**: Automatic subscription cleanup
- **provideNgxSoap()**: Functional provider for standalone apps

### Migration from v0.18.0
No breaking changes! Both NgModule and standalone approaches are supported:
- Existing NgModule apps: continue using `NgxSoapModule`
- New standalone apps: use `provideNgxSoap()`

See [CHANGELOG.md](./CHANGELOG.md) for detailed migration notes.

---

## Build and publish the lib (for maintainers)

Switch branch to a branch named after Angular version, f.e. 0.17.0 for all v17 updates.
If branch doesn't exist - create it. Apply code changes in that branch.

### Version Bumping

Use the provided npm scripts to bump the version:

- `npm run bump:patch` - Bug fixes (0.17.0 → 0.17.1)
- `npm run bump:minor` - New features (0.17.0 → 0.18.0)
- `npm run bump:major` - Breaking changes (0.17.0 → 1.0.0)

Note: Also bump the version in `projects/ngx-soap/package.json` separately.

### Build and Publish

1. `npm run test:lib` - Run library tests
2. `npm run build:lib` - Build the library
3. `npm run publish:dry-run` - Verify package contents
4. `npm run publish` - Publish to npm

Or use the combined command:

```bash
npm run build:lib:publish
```

## Local development

### Setup

```bash
git clone -b angular-cli-ilb https://github.com/seyfer/ngx-soap.git
cd ngx-soap && npm install
```

### Testing (Jest)

```bash
npm test                    # Run all tests
npm run test:lib           # Run library tests only
npm run test:app           # Run app tests only
npm run test:coverage      # Run tests with coverage report
npm run test:watch         # Run tests in watch mode
```

### Building

```bash
npm run build:lib          # Build the library
npm run build              # Build the example app
npm run build:all          # Build both
```

### Development Server

```bash
npm start                  # Start dev server with proxy
# or
ng serve --proxy-config proxy.conf.json
```

See example app under `src/app`

## API Reference

### provideNgxSoap()

Modern provider function for standalone applications (Angular 14+).

```typescript
import { provideNgxSoap } from 'ngx-soap-next';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgxSoap()  // Provides NgxSoapService
  ]
});
```

### NgxSoapModule

Traditional NgModule for module-based applications (backward compatibility).

```typescript
import { NgxSoapModule } from 'ngx-soap-next';

@NgModule({
  imports: [NgxSoapModule]
})
export class AppModule { }
```

### NgxSoapService

Main service for creating SOAP clients.

**Methods:**
- `createClient(wsdlUrl: string, options?: any, endpoint?: string): Promise<Client>`

**Example:**
```typescript
this.soap.createClient('assets/calculator.wsdl', { /* options */ })
  .then(client => this.client = client);
```

---

## Configuration Options

ngx-soap supports various configuration options to customize SOAP client behavior:

### Basic Options

```typescript
this.soap.createClient('assets/calculator.wsdl', {
  endpoint: 'https://api.example.com/soap',  // Override service endpoint
  returnFault: true,                         // Return SOAP Faults as data instead of errors
  useEmptyTag: true,                         // Use <Tag /> instead of <Tag></Tag>
  envelopeKey: 'soap12',                     // Customize envelope prefix (default: 'soap')
  preserveWhitespace: true,                  // Keep leading/trailing whitespace
  normalizeNames: true,                      // Replace non-identifier chars with _
  suppressStack: true,                       // Hide stack traces in error messages
}).subscribe(client => this.client = client);
```

### Advanced Options

```typescript
{
  // XML Generation
  useEmptyTag: false,                        // Use self-closing tags for empty elements
  preserveWhitespace: false,                 // Preserve leading/trailing whitespace in text
  escapeXML: true,                           // Control XML escaping for special characters
  
  // Namespace Handling
  ignoredNamespaces: ['http://example.com'], // Namespaces to ignore during parsing
  namespaceArrayElements: true,              // Add namespace to array elements
  forceUseSchemaXmlns: false,                // Force schema xmlns usage
  
  // SOAP Configuration
  envelopeKey: 'soap',                       // Custom envelope key prefix
  forceSoap12Headers: false,                 // Force SOAP 1.2 headers
  
  // Error Handling
  returnFault: false,                        // Return SOAP Faults as data
  suppressStack: false,                      // Hide stack traces in errors
  
  // Method Names
  normalizeNames: false,                     // Replace non-identifier characters
  overridePromiseSuffix: 'Async',           // Override promise method suffix
  
  // Request Tracking
  exchangeId: 'custom-eid-123',             // Custom exchange ID for request tracking
}
```

## Security Protocols

ngx-soap supports multiple security protocols for SOAP authentication:

### Basic Authentication

```typescript
import { security } from 'ngx-soap';

const basicAuth = new security.BasicAuthSecurity('username', 'password');
client.setSecurity(basicAuth);
```

### Bearer Token Authentication

```typescript
import { security } from 'ngx-soap';

const bearerAuth = new security.BearerSecurity('your-token-here');
client.setSecurity(bearerAuth);
```

### WS-Security (Username Token)

```typescript
import { security } from 'ngx-soap';

const wsSecurity = new security.WSSecurity('username', 'password', {
  passwordType: 'PasswordText',  // or 'PasswordDigest'
  hasTimeStamp: true,
  hasNonce: true
});
client.setSecurity(wsSecurity);
```

### WS-Security with Certificate

```typescript
import { security } from 'ngx-soap';

const certSecurity = new security.WSSecurityCert(
  privatePEM,      // Private key in PEM format
  publicP12PEM,    // Public certificate in PEM format
  'password'       // Certificate password
);
client.setSecurity(certSecurity);
```

### Combined Security: Certificate + Username Token

```typescript
import { security } from 'ngx-soap';

const combinedSecurity = new security.WSSecurityCertWithToken(
  privatePEM,
  publicP12PEM,
  'cert-password',
  {
    username: 'user',
    password: 'pass',
    passwordType: 'PasswordText',
    hasTimeStamp: true
  }
);
client.setSecurity(combinedSecurity);
```

### Combined Security: WSSecurity + Certificate

```typescript
import { security } from 'ngx-soap';

const wsSec = new security.WSSecurity('username', 'password');
const certSec = new security.WSSecurityCert(privatePEM, publicP12PEM, 'password');

const combined = new security.WSSecurityPlusCert(wsSec, certSec);
client.setSecurity(combined);
```

## Event Tracking with Exchange IDs

Track requests and responses using Exchange IDs (EID):

```typescript
import { Client } from 'ngx-soap';

// Provide custom EID
const body = { intA: 2, intB: 3 };
(<any>this.client).Add(body, { exchangeId: 'my-request-123' })
  .subscribe(res => console.log(res));

// Or let the client auto-generate EID
// Listen to events (if client supports EventEmitter)
this.client.on('request', (xml: string, eid: string) => {
  console.log(`Request ${eid}:`, xml);
});

this.client.on('response', (body: any, response: any, eid: string) => {
  console.log(`Response ${eid}:`, body);
});

this.client.on('soapError', (error: any, eid: string) => {
  console.error(`Error ${eid}:`, error);
});
```

## Testing

The library uses Jest for unit testing with the following test structure:

- Security tests (BasicAuth, Bearer, WSSecurity, WSSecurityCert, WSSecurityCertWithToken, WSSecurityPlusCert)
- HTTP client tests
- WSDL parsing tests (with fixtures in `test/fixtures/`)
- Client operations tests
- Configuration options tests

Tests are located in `projects/ngx-soap/test/` with real WSDL fixtures for comprehensive testing.

## Author

[Luca Lulani](https://github.com/lula)

## Contributors

[Oleg Abrazhaev](https://github.com/seyfer)
[markward](https://github.com/marcward)
[Andrei Bespamiatnov](https://github.com/AndreyBespamyatnov)
