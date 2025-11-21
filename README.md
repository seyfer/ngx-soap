# ngx-soap-next

Simple SOAP client for Angular based on amazing [node-soap](https://github.com/vpulim/node-soap).

Project has been recreated from scratch with Angular CLI.

Please be aware, this package version number will be equal to the corresponding Angular version
0.10.x = v10, 0.11.x = v11, ... 0.16.x = v16, 0.17.x = v17

## npm

1. install ngx-soap and dependencies

    `npm install --save ngx-soap-next`

    `npm install --save buffer concat-stream core-js crypto-js events lodash sax stream uuid`

2. Add NgxSoapModule to your app module

    ```
    import { NgxSoapModule } from 'ngx-soap';
    ...
        @NgModule({
            imports: [ ..., NgxSoapModule, ... ]
        ...
    ```
    
3. Inject NgxSoapService in your component:

    ```
    ...
    import { NgxSoapService, Client, ISoapMethodResponse } from 'ngx-soap';
    ...
    
    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent {
        client: Client;
        intA = 2;
        intB = 3;
        
        constructor(private soap: NgxSoapService) {
            this.soap.createClient('assets/calculator.wsdl').subscribe(client => this.client = client);
        }
        
        sum() {
            const body = {
              intA: this.intA,
              intB: this.intB
            };
            (<any>this.client).Add(body).subscribe((res: ISoapMethodResponse) => this.message = res.result.AddResult);
        }
    }
    ```

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

## Testing

The library uses Jest for unit testing with the following test structure:
- Security tests (BasicAuth, Bearer, WSSecurity, WSSecurityCert)
- HTTP client tests
- WSDL parsing tests (with fixtures in `test/fixtures/`)
- Client operations tests

Tests are located in `projects/ngx-soap/test/` with real WSDL fixtures for comprehensive testing.

## Author
[Luca Lulani](https://github.com/lula)

## Contributors
[Oleg Abrazhaev](https://github.com/seyfer)
[markward](https://github.com/marcward)
[Andrei Bespamiatnov](https://github.com/AndreyBespamyatnov)
