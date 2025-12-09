# CHANGELOG

## 0.20.2

### Type Exports & Developer Experience

**New Type Exports**
- Exported `IOptions` interface for SOAP client configuration
- Exported `IWsdlBaseOptions` interface for WSDL base options
- Improved type safety for `createClient()` method signature (`options: any` → `options: IOptions`)

**Bug Fixes**
- Fixed `core-js@3` polyfills compatibility in `src/polyfills.ts`
  - Removed deprecated `core-js/es7/reflect` import (not needed for Angular 20+ with AOT)

**Developer Experience**
- Users now get full autocomplete and compile-time checking for options like `disableCache`, `endpoint`, `forceSoap12Headers`, etc.

**Breaking Changes**: None ✅

---

## 0.20.1

### Dependency Compatibility Fix

**Bug Fixes**
- Fixed `core-js` peer dependency conflict
  - Updated library peerDependency to accept both core-js v2 and v3: `"^2.5.4 || ^3.0.0"`
  - Allows users to use modern `core-js@3.x` without npm resolution errors

**Dependency Updates**
- Updated root project to use `core-js@^3.47.0`
- Updated Angular packages to latest patch versions (20.3.14 → 20.3.15)
- Updated `@angular/build` and `@angular/cli` to 20.3.13
- Updated `ts-jest` to 29.4.6

**Breaking Changes**: None ✅

---

## 0.20.0

### Angular 20 Upgrade

**Framework Updates**
- Updated to Angular 20 compatibility

**TypeScript & Core Dependencies**
- TypeScript 5.8.3 (Angular 20 compatibility)
- zone.js 0.15.1 (Angular 20 requirement)

**Build Tools**
- Updated @angular-builders/custom-webpack to 19.0.1

**Type Definitions**
- @types/node 24.10.1
- @types/jest 30.0.0

**Library Package Updates**
- Updated peerDependencies to require Angular ^20.0.0
- Updated keywords from "Angular19" to "Angular20"

**Breaking Changes**: None ✅

**Migration Notes**
- No code changes required for migration from v0.19.0
- All existing APIs remain fully compatible
- Both NgModule and standalone approaches continue to be supported

---

## 0.19.0

### Angular 19 Upgrade

**Framework Updates**
- Updated to Angular 19 compatibility

**TypeScript & Core Dependencies**
- Updated TypeScript to 5.8.3 (Angular 19 compatibility requirement)
- Updated zone.js to 0.15.1 (Angular 19.2.16 requirement)

**Build Tools**
- Updated @angular-builders/custom-webpack from 18.0.0 to 19.0.1

**Type Definitions**
- Updated @types/node from 18.19.130 to 24.10.1
- Updated @types/jest to 30.0.0

**Dependency Updates**
- Updated stream: 0.0.2 → 0.0.3

**Library Package Updates**
- Updated peerDependencies to require Angular ^19.0.0
- Updated keywords from "Angular18" to "Angular19"
- Synchronized zone.js and stream versions between root and library packages

**Angular 19 Migrations Applied**
- Added `standalone: false` to non-standalone components (automatic migration)
- Verified compatibility with all Angular 19 migration requirements
- No manual code changes required ✅

**Breaking Changes**: None ✅

**Migration Notes**
- All Angular 19 optional migrations were reviewed and applied where necessary
- TypeScript version capped at 5.8.x due to Angular 19.2.16 peer dependency requirements
- zone.js version must remain at 0.15.x for Angular 19.2.16 compatibility

---

## 0.18.0

### Angular 18 Upgrade

**Framework Updates**
- Updated to Angular 18 compatibility
- Updated all @angular packages to version 18.2.14
- Updated @angular/cli to 18.2.21
- Updated @angular/material and @angular/cdk to 18.2.14

**Configuration Updates**
- Fixed `angular.json` tsconfig.spec.json path references
- Removed obsolete Karma test configurations (project uses Jest)
- Added custom webpack configuration for webpack 5 polyfills
- Integrated `@angular-builders/custom-webpack` for browser builds
- Updated `allowedCommonJsDependencies` to include `xml-crypto` and `debug`

**Webpack 5 Compatibility Fixes**
- Added Node.js core module polyfills for browser compatibility:
    - `crypto-browserify` for crypto operations (required by xml-crypto)
    - `stream-browserify` for stream operations
    - `vm-browserify` for VM operations (required by asn1.js)
    - `global` polyfill for global object
- Configured webpack ProvidePlugin for automatic injection of `global`, `process`, and `Buffer`
- Updated `src/polyfills.ts` with explicit global polyfills
- Created `src/webpack.config.js` with fallback configuration

**Bug Fixes**
- Fixed `options` parameter handling in `Client._invoke()` method
    - Previously crashed when calling SOAP methods without options parameter
    - Now safely defaults to empty object `{}` when options not provided
    - Resolves "Cannot read properties of undefined (reading 'exchangeId')" error

**Dependency Updates**
- `tslib`: 2.6.3 → 2.8.1
- `url`: 0.11.3 → 0.11.4
- `eslint`: 8.56.0 → 8.57.1
- `@types/node`: 16.18.76 → 18.19.130 (upgraded to Node 18 LTS types)

**New Dev Dependencies**
- `@angular-builders/custom-webpack@18` - Custom webpack configuration support
- `crypto-browserify` - Browser polyfill for Node.js crypto module
- `stream-browserify` - Browser polyfill for Node.js stream module
- `vm-browserify` - Browser polyfill for Node.js vm module
- `global` - Browser polyfill for Node.js global object

**Breaking Changes**: None ✅

---

## 0.17.2

### Webpack 5 Compatibility Fixes

**Build Configuration**

- Added custom webpack configuration for Node.js polyfills (crypto, stream, vm, global)
- Integrated `@angular-builders/custom-webpack@17` for browser builds
- Updated CommonJS dependencies whitelist (xml-crypto, debug)

**Bug Fixes**

- Fixed `Client._invoke()` options parameter handling (prevents "undefined reading 'exchangeId'" error)

**Dependency Updates**

- `tslib`: 2.6.2 → 2.8.1
- `url`: 0.11.3 → 0.11.4

**New Dev Dependencies**

- `crypto-browserify`, `stream-browserify`, `vm-browserify`, `global` - Browser polyfills

**Breaking Changes**: None ✅

---

## 0.17.1

> **📊 Feature Parity**: 100% core features with node-soap v1.6.0 ✅  
> **Documentation**: See [soap-upgrade-plan/](./soap-upgrade-plan/) for complete analysis

### Major Backport from node-soap (v1.0.0 → v1.6.0)

**Security & Dependencies**

- **CRITICAL**: Updated `xml-crypto` v2.1.6 → v6.1.2
- Removed `uuid`, using native `crypto.randomUUID()` with fallback
- Updated `sax` v1.4.1, `lodash` v4.17.21, `debug` v4.4.3

**New Security Protocols**

- `WSSecurityCertWithToken` - Certificate + Username Token
- `WSSecurityPlusCert` - Combined WS-Security protocols
- `appendElement` option for WSSecurity & WSSecurityCert (custom XML injection)
- `envelopeKey` option for WSSecurity (custom SOAP prefixes)
- Custom `digestAlgorithm` (sha1/sha256/sha512) & `signatureAlgorithm`
- `excludeReferencesFromSigning` option

**Configuration Options** (13 new)

- `returnFault`, `namespaceArrayElements`, `useEmptyTag`, `preserveWhitespace`
- `normalizeNames`, `suppressStack`, `forceUseSchemaXmlns`, `envelopeKey`
- `overridePromiseSuffix`, `exchangeId`, `serviceName`, `portName`
- `overrideElementKey`, `envelopeSoapUrl`, `encoding`, `wsdlCache` (IWSDLCache)

**Bug Fixes**

- Empty SOAP body handling (null/undefined responses, one-way operations)
- SOAP Fault 1.1/1.2 support with `returnFault` option
- Element reference (`$ref`) resolution with maxOccurs/minOccurs
- Array namespace inheritance with `namespaceArrayElements`
- Prevent `$type` mutation (immutable cloning)
- Missing message definitions handling
- ComplexContent with RestrictionElement
- Dynamic timestamp IDs (no hardcoded values)
- `xmlns:wsu` spacing fix

**Performance**

- Map-based namespace lookups (faster than Object)
- Native `String.trim()` (2x faster)

**Advanced Features**

- Function-based SOAP headers with context (`_processSoapHeader`)
- Schema merge for duplicate namespaces (WSDL with multiple imports)
- Namespace fallback for schemas without targetNamespace

**Testing**

- Added 98 new tests → 247 total (all passing)

**Breaking Changes**: None ✅

## 0.17.0

- Updated to Angular 17 compatibility
- Updated all @angular packages to version 17
- **Breaking Change**: Replaced Jasmine with Jest for testing
- Added comprehensive test coverage for SOAP client operations
- Removed deprecated e2e tests
- Updated all dependencies to latest versions
- Fixed deprecation warnings
- Example app: Replaced @angular/flex-layout with Tailwind CSS
- Updated README documentation
- Improved .gitignore configuration

## 0.16.4 / 0.16.0

- Updated to Angular 16 compatibility
- Updated all @angular packages to version 16
- Added headless test run capability
- Added publish shortcut
- Merged improvements from master and 0.15.0

## 0.15.1 / 0.15.0

- Updated to Angular 15 compatibility
- Updated all @angular packages to version 15
- Merged improvements from 0.14.0

## 0.14.1 / 0.14.0

- Updated to Angular 14 compatibility
- Updated all @angular packages to version 14
- Merged improvements from 0.13.0

## 0.13.1 / 0.13.0

- Updated to Angular 13 compatibility
- Updated all @angular packages to version 13
- Merged improvements from 0.12.0

## 0.12.1 / 0.12.0

- Updated to Angular 12 compatibility
- Fixed library build configuration
- Fixed example app build and tests
- Debugged and fixed library tests
- Build system improvements

## 0.11.0

- Updated to Angular 11 compatibility
- Updated all @angular packages to version 11
- Fixed build configuration
- README updates

## 0.10.0

- Release preparation for Angular 10
- Package renaming finalization (ngx-soap to ngx-soap-next)
- Build and dependency fixes

## 0.9.0

- Preparatory updates for Angular 12 migration
- Build system improvements

## 0.8.0

- Prepared for Angular 11 migration
- Updated build tooling and configuration
- Merged improvements from 0.7.0

## 0.7.0

- Updated to Angular 10 compatibility ([#87](https://github.com/seyfer/ngx-soap/pull/87))
- Fixed tests for Angular 10
- Renamed package from `ngx-soap` to `ngx-soap-next`
- Security updates:
  - Updated lodash from 4.17.15 to 4.17.19 ([#83](https://github.com/seyfer/ngx-soap/pull/83))
  - Updated http-proxy from 1.18.0 to 1.18.1 ([#85](https://github.com/seyfer/ngx-soap/pull/85))
- Updated dependencies and build configuration

## 0.5.0-beta.7

Client events have been removed due to problems with Angular prod bundle. See issue [#29](https://github.com/lula/ngx-soap/issues/29).

If you have used in your project you should remain on beta 6 release. Just remember to turn angular bundler optimization off if you want to bundle your project with --prod option. Also, in this case, please inform me so that I know events were actually used, and I'll consider to reintroduce them.

## 0.5.0-beta.6

Export security classes. ([commit 4b48395](https://github.com/lula/ngx-soap/commit/4b483952c31880ad837ae92f209f06666291ff90))

## 0.5.0-beta.5

Raise error in case of calling a non existing method ([commit 77cf177](https://github.com/lula/ngx-soap/commit/77cf1772c4d042872b3326b28993bcbb0a5182c4))

## 0.5.0-beta.4

Use Angular HttpClient.
Observables used wherever possible.

this.soap.createClient('assets/calculator.wsdl').subscribe(client => this.client = client);

(<any>this.client).Add(body).subscribe((res: ISoapMethodResponse) => this.message = res.result.AddResult);

this.client.call('Add', body).subscribe((res: ISoapMethodResponse) => this.message = res.result.AddResult);

## 0.3.0-beta1

Project recreated with Angualr 6 CLI.

...

## 0.2.2-beta6

Call operation with client method.

## 0.2.2-beta3

### Breaking Changes

Web Service operations have no callback anymore. Callback has been replaced by a Promise.

Before:

      (client as any).Add(input, (err, wsurl: string, headers: any, xml: string) => ... )

After:

      client.operation('Add', body).then((operation: Operation) => ... )
      // or
      (client as any).Add(body).then((operation: Operation) => ... )

## 0.2.1

AOT compilation fixes (issue #1)

## 0.1.4

Initial version
