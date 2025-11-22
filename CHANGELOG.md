# CHANGELOG

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
